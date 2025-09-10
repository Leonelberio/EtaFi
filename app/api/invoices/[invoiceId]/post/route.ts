import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";

// POST /api/invoices/[invoiceId]/post - Post invoice (generate journal entries)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { invoiceId } = await params;

    // Get invoice with all details
    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      include: {
        customer: true,
        vendor: true,
        project: true,
        lines: {
          include: {
            project: { select: { code: true, name: true } },
            activity: { select: { code: true, name: true } },
            subActivity: { select: { code: true, name: true } },
            taxCode: { select: { code: true, name: true, rate: true } },
            revenueAccount: { select: { number: true, name: true } },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check if invoice is already posted
    if (invoice.postedAt) {
      return NextResponse.json(
        { error: "Invoice is already posted" },
        { status: 400 }
      );
    }

    // Check if invoice has lines
    if (!invoice.lines || invoice.lines.length === 0) {
      return NextResponse.json(
        { error: "Invoice must have at least one line item" },
        { status: 400 }
      );
    }

    // Generate journal entries in transaction
    const result = await db.$transaction(async (tx) => {
      // Create journal header
      const journal = await tx.journal.create({
        data: {
          organizationId,
          journalType: invoice.type === "SALES" ? "SALES" : "PURCHASE",
          entryDate: invoice.date,
          reference: invoice.number,
          description: `${invoice.type === "SALES" ? "Facture de vente" : "Facture d'achat"} - ${invoice.number}`,
          totalAmount: invoice.total,
          status: "POSTED",
          postedAt: new Date(),
          postedBy: session.user.id,
        },
      });

      // Create journal lines
      const journalLines = [];

      if (invoice.type === "SALES") {
        // Sales Invoice: Debit Accounts Receivable, Credit Revenue accounts

        // 1. Debit Accounts Receivable (or Cash if paid)
        const receivableAccount = await tx.chartAccount.findFirst({
          where: {
            organizationId,
            type: "ASSET",
            number: { startsWith: "1100" }, // Receivable accounts
            isActive: true,
          },
        });

        if (!receivableAccount) {
          throw new Error("Receivable account not found");
        }

        journalLines.push(
          await tx.journalLine.create({
            data: {
              organizationId,
              journalId: journal.id,
              accountId: receivableAccount.id,
              description: `Facture ${invoice.number} - ${invoice.customer?.name || "Client"}`,
              debitAmount: invoice.total,
              projectId: invoice.projectId,
              reference: invoice.number,
              entryDate: invoice.date,
            },
          })
        );

        // 2. Credit Revenue accounts for each line (using cost group's GL account)
        for (const line of invoice.lines) {
          if (!line.activityId || !line.costCategory) {
            throw new Error(
              `Activity and cost group must be specified for line: ${line.description}`
            );
          }

          // Get the GL account for this cost group in this activity
          const activityCostGroup = await tx.activityCostGroup.findFirst({
            where: {
              activityId: line.activityId,
              costGroup: line.costCategory,
              isActive: true,
            },
            include: {
              glAccount: true,
            },
          });

          if (!activityCostGroup?.glAccountId) {
            throw new Error(
              `No GL account configured for cost group ${line.costCategory} in activity ${line.activityId}`
            );
          }

          journalLines.push(
            await tx.journalLine.create({
              data: {
                organizationId,
                journalId: journal.id,
                accountId: activityCostGroup.glAccountId,
                description: line.description,
                creditAmount: line.totalAmount,
                projectId: line.projectId,
                activityId: line.activityId,
                subActivityId: line.subActivityId,
                costGroup: line.costCategory,
                reference: invoice.number,
                entryDate: invoice.date,
              },
            })
          );
        }

        // 3. Handle tax (if any)
        if (invoice.taxAmount && Number(invoice.taxAmount) > 0) {
          const taxAccount = await tx.chartAccount.findFirst({
            where: {
              organizationId,
              type: "LIABILITY",
              number: { startsWith: "2000" }, // Tax payable accounts
              isActive: true,
            },
          });

          if (taxAccount) {
            journalLines.push(
              await tx.journalLine.create({
                data: {
                  organizationId,
                  journalId: journal.id,
                  accountId: taxAccount.id,
                  description: `TPS/TVQ - Facture ${invoice.number}`,
                  creditAmount: invoice.taxAmount,
                  reference: invoice.number,
                  entryDate: invoice.date,
                },
              })
            );
          }
        }
      } else {
        // Purchase Invoice: Debit Expense accounts, Credit Accounts Payable

        // 1. Credit Accounts Payable
        const payableAccount = await tx.chartAccount.findFirst({
          where: {
            organizationId,
            type: "LIABILITY",
            number: { startsWith: "2000" }, // Payable accounts
            isActive: true,
          },
        });

        if (!payableAccount) {
          throw new Error("Payable account not found");
        }

        journalLines.push(
          await tx.journalLine.create({
            data: {
              organizationId,
              journalId: journal.id,
              accountId: payableAccount.id,
              description: `Facture ${invoice.number} - ${invoice.vendor?.name || "Fournisseur"}`,
              creditAmount: invoice.total,
              projectId: invoice.projectId,
              reference: invoice.number,
              entryDate: invoice.date,
            },
          })
        );

        // 2. Debit Expense accounts for each line
        for (const line of invoice.lines) {
          if (!line.revenueAccountId) {
            throw new Error(
              `Expense account not specified for line: ${line.description}`
            );
          }

          journalLines.push(
            await tx.journalLine.create({
              data: {
                organizationId,
                journalId: journal.id,
                accountId: line.revenueAccountId,
                description: line.description,
                debitAmount: line.totalAmount,
                projectId: line.projectId,
                activityId: line.activityId,
                subActivityId: line.subActivityId,
                costGroup: line.costCategory,
                reference: invoice.number,
                entryDate: invoice.date,
              },
            })
          );
        }

        // 3. Handle tax (if any)
        if (invoice.taxAmount && Number(invoice.taxAmount) > 0) {
          const taxAccount = await tx.chartAccount.findFirst({
            where: {
              organizationId,
              type: "ASSET",
              number: { startsWith: "1200" }, // Tax receivable accounts
              isActive: true,
            },
          });

          if (taxAccount) {
            journalLines.push(
              await tx.journalLine.create({
                data: {
                  organizationId,
                  journalId: journal.id,
                  accountId: taxAccount.id,
                  description: `TPS/TVQ - Facture ${invoice.number}`,
                  debitAmount: invoice.taxAmount,
                  reference: invoice.number,
                  entryDate: invoice.date,
                },
              })
            );
          }
        }
      }

      // Update invoice status
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "SENT",
          postedAt: new Date(),
          approvedBy: session.user.id,
        },
      });

      return { journal, journalLines, invoice: updatedInvoice };
    });

    return NextResponse.json({
      message: "Invoice posted successfully",
      journal: result.journal,
      journalLines: result.journalLines,
      invoice: result.invoice,
    });
  } catch (error) {
    console.error("Error posting invoice:", error);
    return NextResponse.json(
      { error: "Failed to post invoice" },
      { status: 500 }
    );
  }
}

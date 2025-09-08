import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createCustomer() {
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.log("No organization found");
    return;
  }

  const customer = await prisma.customer.create({
    data: {
      organizationId: org.id,
      name: "Client Test Construction",
      email: "client@test.com",
      phone: "514-123-4567",
      address: "123 Rue Test",
      city: "Montréal",
      postalCode: "H1A 1A1",
      country: "Canada",
    },
  });

  console.log("Created customer:", customer.name);
  await prisma.$disconnect();
}

createCustomer().catch(console.error);

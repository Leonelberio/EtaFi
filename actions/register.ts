"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  // Create user and default organization in a transaction
  const result = await db.$transaction(async (tx) => {
    // Create the user
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(), // Auto-verify for now
      },
    });

    // Create a default organization for the user
    const organization = await tx.organization.create({
      data: {
        name: `${name}'s Organization`,
        description: `Default organization for ${name}`,
        ownerId: user.id,
      },
    });

    // Add user as owner of the organization
    await tx.organizationMembership.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "OWNER",
      },
    });

    // Set the user's current organization
    await tx.user.update({
      where: { id: user.id },
      data: { currentOrganizationId: organization.id },
    });

    return { user, organization };
  });

  return { success: "Account created successfully!" };
};

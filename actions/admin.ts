"use server";

import { currentRole } from "@/lib/auth";
// UserRole enum values
const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export const admin = async () => {
  const role = await currentRole();

  if (role === UserRole.ADMIN) {
    return { success: "Allowed Server Action!" };
  }

  return { error: "Forbidden Server Action!" };
};

"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sanitizeTitle, sanitizeText } from "@/lib/sanitize";
import { z } from "zod/v4";

const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
});

const updateSettingsSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  emailNotifications: z.boolean(),
  notifyAssigned: z.boolean(),
  notifyApproval: z.boolean(),
  notifyDueSoon: z.boolean(),
  notifyMentioned: z.boolean(),
});

export async function updateProfile(data: { name: string; bio: string }) {
  const user = await requireUser();

  const parsed = updateProfileSchema.parse(data);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.name ? sanitizeTitle(parsed.name) : null,
      bio: parsed.bio ? sanitizeText(parsed.bio) : null,
    },
  });

  revalidatePath("/profile");
  return { success: true, error: null };
}

export async function updateSettings(data: {
  theme: string;
  emailNotifications: boolean;
  notifyAssigned: boolean;
  notifyApproval: boolean;
  notifyDueSoon: boolean;
  notifyMentioned: boolean;
}) {
  const user = await requireUser();

  const parsed = updateSettingsSchema.parse(data);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      theme: parsed.theme,
      emailNotifications: parsed.emailNotifications,
      notifyAssigned: parsed.notifyAssigned,
      notifyApproval: parsed.notifyApproval,
      notifyDueSoon: parsed.notifyDueSoon,
      notifyMentioned: parsed.notifyMentioned,
    },
  });

  revalidatePath("/settings");
  return { success: true, error: null };
}

"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string; bio: string }) {
  const user = await requireUser();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name || null,
      bio: data.bio || null,
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

  await prisma.user.update({
    where: { id: user.id },
    data: {
      theme: data.theme,
      emailNotifications: data.emailNotifications,
      notifyAssigned: data.notifyAssigned,
      notifyApproval: data.notifyApproval,
      notifyDueSoon: data.notifyDueSoon,
      notifyMentioned: data.notifyMentioned,
    },
  });

  revalidatePath("/settings");
  return { success: true, error: null };
}

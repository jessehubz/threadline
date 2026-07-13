"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sanitizeTitle, sanitizeText } from "@/lib/sanitize";
import { z } from "zod/v4";

const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  githubUrl: z.string().max(200).optional(),
  twitterUrl: z.string().max(200).optional(),
  linkedinUrl: z.string().max(200).optional(),
  websiteUrl: z.string().max(200).optional(),
});

const updateSettingsSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  emailNotifications: z.boolean(),
  notifyAssigned: z.boolean(),
  notifyApproval: z.boolean(),
  notifyDueSoon: z.boolean(),
  notifyMentioned: z.boolean(),
});

export async function updateProfile(data: {
  name?: string;
  bio?: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}) {
  const user = await requireUser();

  const parsed = updateProfileSchema.parse(data);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name:
        parsed.name !== undefined
          ? (parsed.name ? sanitizeTitle(parsed.name) : null)
          : undefined,
      bio:
        parsed.bio !== undefined
          ? (parsed.bio ? sanitizeText(parsed.bio) : null)
          : undefined,
      githubUrl:
        parsed.githubUrl !== undefined
          ? parsed.githubUrl.trim() || null
          : undefined,
      twitterUrl:
        parsed.twitterUrl !== undefined
          ? parsed.twitterUrl.trim() || null
          : undefined,
      linkedinUrl:
        parsed.linkedinUrl !== undefined
          ? parsed.linkedinUrl.trim() || null
          : undefined,
      websiteUrl:
        parsed.websiteUrl !== undefined
          ? parsed.websiteUrl.trim() || null
          : undefined,
    },
  });

  revalidatePath("/profile");
  return { success: true, error: null };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      bio: true,
      githubUrl: true,
      twitterUrl: true,
      linkedinUrl: true,
      websiteUrl: true,
      createdAt: true,
      memberships: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              visibility: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });
  return user;
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

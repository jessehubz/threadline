"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { broadcastProfileUpdate } from "@/lib/notifications";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { sanitizeTitle, sanitizeText } from "@/lib/sanitize";
import { z } from "zod/v4";

const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  username: z.string().max(30).optional(),
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

// Username validation: alphanumeric, underscores, hyphens, 3-30 chars
const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;

export async function updateProfile(data: {
  name?: string;
  username?: string;
  bio?: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}) {
  const user = await requireUser();

  const parsed = updateProfileSchema.parse(data);

  // Validate and check username uniqueness if provided
  if (parsed.username !== undefined && parsed.username) {
    const trimmedUsername = parsed.username.trim().toLowerCase();
    if (!usernameRegex.test(trimmedUsername)) {
      return { success: false, error: "Username must be 3-30 characters, using only letters, numbers, underscores, or hyphens." };
    }
    // Check uniqueness (excluding current user)
    const existing = await prisma.user.findFirst({
      where: {
        username: trimmedUsername,
        id: { not: user.id },
      },
    });
    if (existing) {
      return { success: false, error: "Username is already taken." };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name:
        parsed.name !== undefined
          ? (parsed.name ? sanitizeTitle(parsed.name) : null)
          : undefined,
      username:
        parsed.username !== undefined
          ? (parsed.username ? parsed.username.trim().toLowerCase() : null)
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

  // Sync the display name to Clerk so Clerk-sourced surfaces (e.g. the navbar
  // <UserButton>) reflect it and the Clerk `user.updated` webhook echoes the
  // same value back instead of reverting the DB. Best-effort: a Clerk failure
  // must not fail the profile save.
  if (parsed.name !== undefined) {
    try {
      const clean = parsed.name ? sanitizeTitle(parsed.name).trim() : "";
      const [firstName, ...rest] = clean.split(/\s+/);
      const client = await clerkClient();
      await client.users.updateUser(user.clerkId, {
        firstName: firstName || "",
        lastName: rest.join(" "),
      });
    } catch (error) {
      console.error("Failed to sync display name to Clerk:", error);
    }
  }

  // Live-propagate the name change to every account that renders this user.
  await broadcastProfileUpdate(user.id);

  revalidatePath("/profile");
  revalidatePath("/friends");
  revalidatePath("/team");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { success: true, error: null };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
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

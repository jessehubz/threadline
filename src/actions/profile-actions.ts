"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimiters } from "@/lib/rate-limit";
import { broadcastProfileUpdate } from "@/lib/notifications";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function uploadProfilePicture(imageUrl: string) {
  const user = await requireUser();

  // Rate limit
  const { success: rateLimitOk } = await rateLimiters.upload.check(user.id);
  if (!rateLimitOk) {
    return { error: "Too many uploads. Please wait." };
  }

  // Basic URL validation
  if (!imageUrl || !imageUrl.startsWith("http")) {
    return { error: "Invalid image URL" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { imageUrl },
  });

  // Keep Clerk's copy in sync so the navbar <UserButton> (which renders Clerk's
  // avatar, not the DB field) reflects the new picture, and so the Clerk
  // `user.updated` webhook echoes the same value back instead of reverting the
  // DB. Best-effort: a Clerk failure must not fail the upload the user just did.
  try {
    const res = await fetch(imageUrl);
    if (res.ok) {
      const file = await res.blob();
      const client = await clerkClient();
      await client.users.updateUserProfileImage(user.clerkId, { file });
    }
  } catch (error) {
    console.error("Failed to sync profile image to Clerk:", error);
  }

  // Live-propagate to every account that renders this user's avatar.
  await broadcastProfileUpdate(user.id);

  // Revalidate all paths where user avatar is displayed (this session).
  revalidatePath("/profile");
  revalidatePath("/friends");
  revalidatePath("/dashboard");
  revalidatePath("/messages");
  revalidatePath("/team");
  revalidatePath("/", "layout");
  return { success: true, imageUrl };
}

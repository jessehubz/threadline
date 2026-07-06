"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimiters } from "@/lib/rate-limit";
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

  revalidatePath("/profile");
  return { success: true, imageUrl };
}

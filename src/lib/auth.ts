import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  // Try to find existing user in database
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  // If user is authenticated with Clerk but not in our DB, create them
  // This handles the case where webhooks aren't set up or missed
  if (!user) {
    try {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;

      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) return null;

      const name = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ") || null;

      // NOTE: For username-based login, enable "Username" identifier in Clerk Dashboard
      user = await prisma.user.upsert({
        where: { clerkId: userId },
        update: {
          email,
          name,
          imageUrl: clerkUser.imageUrl,
          username: clerkUser.username || undefined,
        },
        create: {
          clerkId: userId,
          email,
          name,
          imageUrl: clerkUser.imageUrl,
          username: clerkUser.username || null,
        },
      });
    } catch (error) {
      // If there's a unique constraint violation on email, try to find by email
      console.error("Error creating user:", error);
      return null;
    }
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getClerkUser() {
  return await currentUser();
}

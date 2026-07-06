import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const { userId } = await auth();

  const invite = await prisma.invite.findUnique({ where: { token } });

  if (!invite || invite.accepted || invite.expiresAt < new Date()) {
    notFound();
  }

  if (!userId) {
    // Redirect to sign-up, then back here
    redirect(`/sign-up?redirect_url=/invite/${token}`);
  }

  // Find user by clerk ID
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    redirect(`/sign-up?redirect_url=/invite/${token}`);
  }

  // Accept invite
  await prisma.projectMember.upsert({
    where: { userId_projectId: { userId: user.id, projectId: invite.projectId } },
    update: { role: invite.role },
    create: {
      userId: user.id,
      projectId: invite.projectId,
      role: invite.role,
    },
  });

  await prisma.invite.update({
    where: { id: invite.id },
    data: { accepted: true },
  });

  redirect(`/graph/${invite.projectId}`);
}

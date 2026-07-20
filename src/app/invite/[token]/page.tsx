import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

function InviteStatusCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page">
      <div className="mx-auto max-w-md rounded-lg border border-themed bg-card p-8 text-center shadow-themed">
        <h1 className="text-xl font-bold text-heading">{title}</h1>
        <p className="mt-3 text-sm text-body">{message}</p>
      </div>
    </div>
  );
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const { userId } = await auth();

  const invite = await prisma.invite.findUnique({ where: { token } });

  if (!invite) {
    notFound();
  }

  if (invite.accepted) {
    return (
      <InviteStatusCard
        title="Invite already used"
        message="This invitation has already been accepted. If you're trying to join the project, ask an admin to invite you again."
      />
    );
  }

  if (invite.expiresAt < new Date()) {
    return (
      <InviteStatusCard
        title="Invite expired"
        message="This invitation link has expired. Ask a project admin to send you a new one."
      />
    );
  }

  if (!userId) {
    // Redirect to sign-up, then back here
    redirect(`/sign-up?redirect_url=/invite/${token}`);
  }

  // Resolve (and lazily create, if Clerk auth exists but our DB row hasn't
  // synced yet - e.g. webhook lag right after sign-up) the accepting user.
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/sign-up?redirect_url=/invite/${token}`);
  }

  // Security: verify the accepting user's email matches the invited email
  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="mx-auto max-w-md rounded-lg border border-themed bg-card p-8 text-center shadow-themed">
          <h1 className="text-xl font-bold text-heading">
            Email Mismatch
          </h1>
          <p className="mt-3 text-sm text-body">
            This invitation was sent to <strong>{invite.email}</strong>, but you are signed in as <strong>{user.email}</strong>.
          </p>
          <p className="mt-4 text-sm text-dim">
            Please sign in with the invited email address to accept this invitation.
          </p>
        </div>
      </div>
    );
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

"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/resend";

export async function inviteMember(projectId: string, email: string, role: string) {
  const user = await requireUser();

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (!member || member.role === "VIEWER") {
    return { error: "Not authorized to invite members" };
  }

  // Check if user already exists and is a member
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMember = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: existingUser.id, projectId } },
    });
    if (existingMember) {
      return { error: "User is already a member of this project" };
    }

    // Add directly
    await prisma.projectMember.create({
      data: {
        userId: existingUser.id,
        projectId,
        role: role as "EDITOR" | "VIEWER",
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: existingUser.id,
        type: "INVITED",
        message: `You've been added to a project`,
        relatedProjectId: projectId,
      },
    });
  } else {
    // Create an invite
    const invite = await prisma.invite.create({
      data: {
        email,
        projectId,
        role: role as "EDITOR" | "VIEWER",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send invite email
    try {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      await resend.emails.send({
        from: "Threadline <onboarding@resend.dev>",
        to: email,
        subject: `You've been invited to "${project?.name}" on Threadline`,
        html: `
          <h2>You've been invited!</h2>
          <p>${user.name || user.email} has invited you to collaborate on "${project?.name}" in Threadline.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}">Accept Invitation</a></p>
          <p>This invitation expires in 7 days.</p>
        `,
      });
    } catch {
      // Email sending is best-effort
    }
  }

  revalidatePath("/team");
  return { success: true };
}

export async function removeMember(projectId: string, memberId: string) {
  const user = await requireUser();

  const currentMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (!currentMember || currentMember.role !== "OWNER") {
    return { error: "Only the owner can remove members" };
  }

  const targetMember = await prisma.projectMember.findUnique({ where: { id: memberId } });
  if (!targetMember) return { error: "Member not found" };
  if (targetMember.role === "OWNER") return { error: "Cannot remove the owner" };

  await prisma.projectMember.delete({ where: { id: memberId } });
  revalidatePath("/team");
  return { success: true };
}

export async function updateMemberRole(projectId: string, memberId: string, newRole: string) {
  const user = await requireUser();

  const currentMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (!currentMember || currentMember.role !== "OWNER") {
    return { error: "Only the owner can change roles" };
  }

  await prisma.projectMember.update({
    where: { id: memberId },
    data: { role: newRole as "EDITOR" | "VIEWER" },
  });

  revalidatePath("/team");
  return { success: true };
}

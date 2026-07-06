"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/resend";
import { rateLimiters } from "@/lib/rate-limit";
import { generateSecureToken } from "@/lib/tokens";
import { z } from "zod/v4";

const inviteMemberSchema = z.object({
  projectId: z.string().min(1),
  email: z.string().email().max(254),
  role: z.enum(["EDITOR", "VIEWER"]), // Cannot invite as OWNER - prevents escalation
});

const updateRoleSchema = z.object({
  projectId: z.string().min(1),
  memberId: z.string().min(1),
  newRole: z.enum(["EDITOR", "VIEWER"]), // Cannot promote to OWNER - prevents escalation
});

/**
 * HTML-escape a string to prevent XSS in email templates.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function inviteMember(projectId: string, email: string, role: string) {
  const user = await requireUser();

  // Rate limiting
  const { success: rateLimitOk } = await rateLimiters.sensitive.check(user.id);
  if (!rateLimitOk) return { error: "Too many requests. Please wait." };

  // Validate input
  const parsed = inviteMemberSchema.safeParse({ projectId, email, role });
  if (!parsed.success) {
    return { error: "Invalid input: " + parsed.error.issues[0]?.message };
  }

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: parsed.data.projectId } },
  });

  if (!member || member.role === "VIEWER") {
    return { error: "Not authorized to invite members" };
  }

  // Check if user already exists and is a member
  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) {
    const existingMember = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: existingUser.id, projectId: parsed.data.projectId } },
    });
    if (existingMember) {
      return { error: "User is already a member of this project" };
    }

    // Add directly
    await prisma.projectMember.create({
      data: {
        userId: existingUser.id,
        projectId: parsed.data.projectId,
        role: parsed.data.role,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: existingUser.id,
        type: "INVITED",
        message: `You've been added to a project`,
        relatedProjectId: parsed.data.projectId,
      },
    });
  } else {
    // Create an invite
    const invite = await prisma.invite.create({
      data: {
        email: parsed.data.email,
        projectId: parsed.data.projectId,
        role: parsed.data.role,
        token: generateSecureToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send invite email with HTML-escaped values
    try {
      const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId } });
      const safeName = escapeHtml(user.name || user.email);
      const safeProjectName = escapeHtml(project?.name || "Unknown Project");

      await resend.emails.send({
        from: "Threadline <onboarding@resend.dev>",
        to: parsed.data.email,
        subject: `You've been invited to "${project?.name}" on Threadline`,
        html: `
          <h2>You&#39;ve been invited!</h2>
          <p>${safeName} has invited you to collaborate on &quot;${safeProjectName}&quot; in Threadline.</p>
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

  // IDOR fix: verify target member belongs to this project
  const targetMember = await prisma.projectMember.findUnique({
    where: { id: memberId },
  });
  if (!targetMember || targetMember.projectId !== projectId) {
    return { error: "Member not found" };
  }
  if (targetMember.role === "OWNER") return { error: "Cannot remove the owner" };

  await prisma.projectMember.delete({ where: { id: memberId } });
  revalidatePath("/team");
  return { success: true };
}

export async function updateMemberRole(projectId: string, memberId: string, newRole: string) {
  const user = await requireUser();

  // Validate role to prevent escalation
  const parsed = updateRoleSchema.safeParse({ projectId, memberId, newRole });
  if (!parsed.success) {
    return { error: "Invalid role. Must be EDITOR or VIEWER." };
  }

  const currentMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (!currentMember || currentMember.role !== "OWNER") {
    return { error: "Only the owner can change roles" };
  }

  // IDOR fix: verify target member belongs to this project
  const targetMember = await prisma.projectMember.findUnique({
    where: { id: memberId },
  });
  if (!targetMember || targetMember.projectId !== projectId) {
    return { error: "Member not found" };
  }

  await prisma.projectMember.update({
    where: { id: memberId },
    data: { role: parsed.data.newRole },
  });

  revalidatePath("/team");
  return { success: true };
}

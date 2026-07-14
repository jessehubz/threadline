"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { rateLimiters } from "@/lib/rate-limit";
import { z } from "zod/v4";

const inviteMemberSchema = z.object({
  projectId: z.string().min(1),
  email: z.string().email().max(254),
  role: z.enum(["CO_HEAD", "MEMBER"]), // Cannot invite as OWNER - prevents escalation
});

const updateRoleSchema = z.object({
  projectId: z.string().min(1),
  memberId: z.string().min(1),
  newRole: z.enum(["CO_HEAD", "MEMBER"]), // Cannot promote to OWNER - prevents escalation
});

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

  if (!member || member.role === "MEMBER") {
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
    // User doesn't exist - cannot invite. Only existing accounts can be added.
    return { error: "User not found. Only people with existing accounts can be invited." };
  }
  revalidatePath("/team");
  revalidatePath("/dashboard");
  revalidatePath("/overview");
  revalidatePath(`/graph/${parsed.data.projectId}`);
  return { success: true };
}

export async function removeMember(projectId: string, memberId: string) {
  const user = await requireUser();

  const currentMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (!currentMember || currentMember.role !== "HEAD") {
    return { error: "Only the owner can remove members" };
  }

  // IDOR fix: verify target member belongs to this project
  const targetMember = await prisma.projectMember.findUnique({
    where: { id: memberId },
  });
  if (!targetMember || targetMember.projectId !== projectId) {
    return { error: "Member not found" };
  }
  if (targetMember.role === "HEAD") return { error: "Cannot remove the head" };

  await prisma.projectMember.delete({ where: { id: memberId } });
  revalidatePath("/team");
  revalidatePath("/dashboard");
  revalidatePath("/overview");
  revalidatePath(`/graph/${projectId}`);
  return { success: true };
}

export async function updateMemberRole(projectId: string, memberId: string, newRole: string) {
  const user = await requireUser();

  // Validate role to prevent escalation
  const parsed = updateRoleSchema.safeParse({ projectId, memberId, newRole });
  if (!parsed.success) {
    return { error: "Invalid role. Must be CO_HEAD or MEMBER." };
  }

  const currentMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (!currentMember || currentMember.role !== "HEAD") {
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
  revalidatePath("/dashboard");
  revalidatePath(`/graph/${projectId}`);
  return { success: true };
}

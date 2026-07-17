"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification, triggerDataRefresh } from "@/lib/notifications";
import { getEffectivePermissions, requirePermission } from "@/lib/permissions";
import { resend } from "@/lib/resend";
import { generateSecureToken } from "@/lib/tokens";

import { rateLimiters } from "@/lib/rate-limit";
import { z } from "zod/v4";

const inviteMemberSchema = z.object({
  projectId: z.string().min(1),
  email: z.string().email().max(254),
  role: z.enum(["CO_HEAD", "MEMBER"]), // Cannot invite as HEAD - prevents escalation
});

const inviteByEmailSchema = z.object({
  projectId: z.string().min(1),
  email: z.string().email().max(254),
});

const updateRoleSchema = z.object({
  projectId: z.string().min(1),
  memberId: z.string().min(1),
  newRole: z.enum(["CO_HEAD", "MEMBER"]), // Cannot promote to HEAD - prevents escalation
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

  let perms;
  try {
    ({ perms } = await getEffectivePermissions(user.id, parsed.data.projectId));
  } catch {
    return { error: "Not authorized to invite members" };
  }
  if (!perms.canInviteMembers) {
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

    // Get project name for the notification message
    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
      select: { name: true },
    });

    // Add directly
    await prisma.projectMember.create({
      data: {
        userId: existingUser.id,
        projectId: parsed.data.projectId,
        role: parsed.data.role,
      },
    });

    // Create notification with inviter name and project name
    const inviterName = user.name || user.email.split("@")[0];
    const projectName = project?.name || "a project";
    await createNotification({
      userId: existingUser.id,
      type: "INVITED",
      title: `${inviterName} added you to ${projectName}`,
      relatedProjectId: parsed.data.projectId,
    });
    await triggerDataRefresh(existingUser.id, "projects");
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

// Unified with kickMember (project-permission-actions.ts): canKickMembers gates
// CO_HEAD, HEAD can always remove, nobody can remove HEAD, only HEAD can remove
// a CO_HEAD, and any non-HEAD member may remove themselves ("leave project").
export async function removeMember(projectId: string, memberId: string) {
  const user = await requireUser();

  const currentMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!currentMember) return { error: "Not a member" };

  // IDOR fix: verify target member belongs to this project
  const targetMember = await prisma.projectMember.findUnique({
    where: { id: memberId },
  });
  if (!targetMember || targetMember.projectId !== projectId) {
    return { error: "Member not found" };
  }

  const isSelfRemoval = targetMember.userId === user.id;

  if (!isSelfRemoval) {
    if (currentMember.role === "HEAD") {
      // HEAD can always remove others
    } else if (currentMember.role === "CO_HEAD") {
      const { perms } = await getEffectivePermissions(user.id, projectId);
      if (!perms.canKickMembers) return { error: "You don't have permission to remove members" };
    } else {
      return { error: "You don't have permission to remove members" };
    }
  }

  // Nobody can remove the HEAD (they must transfer ownership first)
  if (targetMember.role === "HEAD") return { error: "Cannot remove the head" };
  // Only the HEAD can remove a CO_HEAD (self-removal/"leave" is still allowed)
  if (!isSelfRemoval && targetMember.role === "CO_HEAD" && currentMember.role !== "HEAD") {
    return { error: "Only the HEAD can remove a Co-Head" };
  }

  // Remove the membership AND the user's task assignments in this project in
  // one transaction. TaskAssignment references User+TaskNode (not ProjectMember),
  // so nothing cascades on member removal — without this, a removed member
  // stays a ghost assignee on nodes and can remain a task's sole approver,
  // silently deadlocking its approval flow.
  await prisma.$transaction([
    prisma.taskAssignment.deleteMany({
      where: { userId: targetMember.userId, node: { graph: { projectId } } },
    }),
    prisma.projectMember.delete({ where: { id: memberId } }),
  ]);
  await triggerDataRefresh(targetMember.userId, "projects");
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
  await triggerDataRefresh(targetMember.userId, "projects");

  revalidatePath("/team");
  revalidatePath("/dashboard");
  revalidatePath(`/graph/${projectId}`);
  return { success: true };
}

const transferHeadSchema = z.object({
  projectId: z.string().min(1),
  memberId: z.string().min(1),
});

/**
 * Transfer HEAD role to another member. The current HEAD is demoted to CO_HEAD.
 * Only the current HEAD can perform this action. There must always be exactly
 * one HEAD per project — this action atomically swaps the roles.
 */
export async function transferHeadRole(projectId: string, memberId: string) {
  const user = await requireUser();

  const parsed = transferHeadSchema.safeParse({ projectId, memberId });
  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  // Rate limiting
  const { success: rateLimitOk } = await rateLimiters.sensitive.check(user.id);
  if (!rateLimitOk) return { error: "Too many requests. Please wait." };

  const currentMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: parsed.data.projectId } },
  });

  if (!currentMember || currentMember.role !== "HEAD") {
    return { error: "Only the current Head can transfer ownership" };
  }

  // Verify target member belongs to this project
  const targetMember = await prisma.projectMember.findUnique({
    where: { id: parsed.data.memberId },
  });
  if (!targetMember || targetMember.projectId !== parsed.data.projectId) {
    return { error: "Member not found" };
  }

  // Cannot transfer to yourself
  if (targetMember.userId === user.id) {
    return { error: "You are already the Head" };
  }

  // Atomically: promote target to HEAD, demote current HEAD to CO_HEAD
  await prisma.$transaction([
    prisma.projectMember.update({
      where: { id: parsed.data.memberId },
      data: { role: "HEAD" },
    }),
    prisma.projectMember.update({
      where: { id: currentMember.id },
      data: { role: "CO_HEAD" },
    }),
  ]);

  // Notify the new HEAD
  await createNotification({
    userId: targetMember.userId,
    type: "INVITED",
    title: `You are now the Head of this project`,
    relatedProjectId: parsed.data.projectId,
  });

  await triggerDataRefresh(targetMember.userId, "projects");
  await triggerDataRefresh(user.id, "projects");

  revalidatePath("/team");
  revalidatePath("/dashboard");
  revalidatePath("/overview");
  revalidatePath(`/graph/${parsed.data.projectId}`);
  return { success: true };
}

/**
 * Invite by email address. If an account already exists for that email, adds
 * them directly (same as inviteMember). Otherwise creates a 7-day Invite row
 * and emails a link to `/invite/[token]`. Always returns the invite URL (when
 * one was created) so the UI can offer copy-link even if the email fails to
 * send.
 */
export async function inviteByEmail(projectId: string, email: string) {
  const user = await requireUser();

  // Rate limiting
  const { success: rateLimitOk } = await rateLimiters.sensitive.check(user.id);
  if (!rateLimitOk) return { error: "Too many requests. Please wait." };

  const parsed = inviteByEmailSchema.safeParse({ projectId, email });
  if (!parsed.success) {
    return { error: "Invalid input: " + parsed.error.issues[0]?.message };
  }
  const normalizedEmail = parsed.data.email.toLowerCase();

  let perms;
  try {
    ({ perms } = await getEffectivePermissions(user.id, parsed.data.projectId));
  } catch {
    return { error: "Not authorized to invite members" };
  }
  if (!perms.canInviteMembers) {
    return { error: "Not authorized to invite members" };
  }

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    select: { name: true },
  });
  if (!project) return { error: "Project not found" };

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    const existingMember = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: existingUser.id, projectId: parsed.data.projectId } },
    });
    if (existingMember) {
      return { error: "This person is already a member of this project" };
    }

    await prisma.projectMember.create({
      data: { userId: existingUser.id, projectId: parsed.data.projectId, role: "MEMBER" },
    });

    const inviterName = user.name || user.email.split("@")[0];
    await createNotification({
      userId: existingUser.id,
      type: "INVITED",
      title: `${inviterName} added you to ${project.name}`,
      relatedProjectId: parsed.data.projectId,
    });
    await triggerDataRefresh(existingUser.id, "projects");

    revalidatePath("/team");
    revalidatePath("/dashboard");
    revalidatePath("/overview");
    revalidatePath(`/graph/${parsed.data.projectId}`);
    return { success: true, addedDirectly: true };
  }

  // No existing account - create an invite record and email a link
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.invite.create({
    data: {
      email: normalizedEmail,
      projectId: parsed.data.projectId,
      role: "MEMBER",
      token,
      expiresAt,
    },
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
  const inviterName = user.name || user.email.split("@")[0];

  let emailSent = true;
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: normalizedEmail,
      subject: `You've been invited to ${project.name} on Threadline`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <p>${inviterName} invited you to join <strong>${project.name}</strong> on Threadline.</p>
          <p style="margin: 24px 0;">
            <a href="${inviteUrl}" style="display: inline-block; padding: 10px 20px; background: #7c3aed; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Accept invite
            </a>
          </p>
          <p style="color: #6b7280; font-size: 13px;">Or copy this link: <a href="${inviteUrl}">${inviteUrl}</a></p>
          <p style="color: #6b7280; font-size: 13px;">This invite expires in 7 days.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send invite email:", error);
    emailSent = false;
  }

  revalidatePath("/team");
  revalidatePath(`/graph/${parsed.data.projectId}`);
  return { success: true, inviteUrl, emailSent };
}

/**
 * Pending (unaccepted, unexpired) invites for a project. Gated on
 * canInviteMembers so only people who can invite can see/manage them.
 */
export async function getPendingInvites(projectId: string) {
  const user = await requireUser();

  try {
    await requirePermission(user.id, projectId, "canInviteMembers");
  } catch {
    return [];
  }

  const invites = await prisma.invite.findMany({
    where: { projectId, accepted: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, createdAt: true, expiresAt: true },
  });

  return invites;
}

/** Revokes a pending invite by deleting the Invite row. */
export async function revokeInvite(inviteId: string) {
  const user = await requireUser();

  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
  if (!invite) return { error: "Invite not found" };

  try {
    await requirePermission(user.id, invite.projectId, "canInviteMembers");
  } catch {
    return { error: "Not authorized to manage invites" };
  }

  await prisma.invite.delete({ where: { id: inviteId } });
  revalidatePath("/team");
  revalidatePath(`/graph/${invite.projectId}`);
  return { success: true };
}

export interface ProjectSearchResult {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  imageUrl: string | null;
  isFriend: boolean;
}

/**
 * Search for users to add to a project, excluding the caller and existing
 * members. Mirrors the query shape of searchAllUsers (src/actions/search-actions.ts)
 * plus a Friendship join so the UI can group "Friends" above "Other people".
 */
export async function searchUsersForProject(projectId: string, query: string): Promise<ProjectSearchResult[]> {
  const user = await requireUser();

  const { success: rateLimitOk } = await rateLimiters.api.check(user.id);
  if (!rateLimitOk) return [];

  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const existingMembers = await prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });
  const excludeIds = new Set(existingMembers.map((m) => m.userId));
  excludeIds.add(user.id);

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { notIn: Array.from(excludeIds) } },
        {
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { email: { contains: trimmed, mode: "insensitive" } },
            { username: { contains: trimmed, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: { id: true, name: true, username: true, email: true, imageUrl: true },
    take: 8,
  });

  if (users.length === 0) return [];

  const friendships = await prisma.friendship.findMany({
    where: {
      userId: user.id,
      status: "ACCEPTED",
      friendId: { in: users.map((u) => u.id) },
    },
    select: { friendId: true },
  });
  const friendIds = new Set(friendships.map((f) => f.friendId));

  return users.map((u) => ({ ...u, isFriend: friendIds.has(u.id) }));
}

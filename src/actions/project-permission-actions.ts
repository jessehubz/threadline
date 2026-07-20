"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { triggerDataRefresh } from "@/lib/notifications";
import { getEffectivePermissions } from "@/lib/permissions";

export async function getProjectPermissions(projectId: string) {
  const user = await requireUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!member) return null;

  const permissions = await prisma.projectPermission.findMany({
    where: { projectId },
  });
  return permissions;
}

export async function updateProjectPermissions(
  projectId: string,
  role: "CO_HEAD" | "MEMBER",
  permissions: {
    canCreateNodes?: boolean;
    canEditNodes?: boolean;
    canDeleteNodes?: boolean;
    canCreateEdges?: boolean;
    canDeleteEdges?: boolean;
    canChangeSettings?: boolean;
    canInviteMembers?: boolean;
    canKickMembers?: boolean;
  }
) {
  const user = await requireUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!member || member.role !== "HEAD") {
    return { error: "Only the HEAD can change permissions" };
  }

  await prisma.projectPermission.upsert({
    where: { projectId_role: { projectId, role } },
    create: { projectId, role, ...permissions },
    update: permissions,
  });

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });
  await triggerDataRefresh(members.map((m) => m.userId), "permissions");

  revalidatePath(`/graph/${projectId}`);
  return { success: true };
}

export async function updateProjectVisibility(projectId: string, visibility: "PUBLIC" | "PRIVATE") {
  const user = await requireUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!member || member.role !== "HEAD") {
    return { error: "Only the HEAD can change project visibility" };
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { visibility },
  });

  revalidatePath(`/graph/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function initializeProjectPermissions(projectId: string) {
  // Create default permissions for CO_HEAD and MEMBER if they don't exist
  const existing = await prisma.projectPermission.findMany({ where: { projectId } });
  if (existing.length === 0) {
    await prisma.$transaction([
      prisma.projectPermission.create({
        data: {
          projectId,
          role: "CO_HEAD",
          canCreateNodes: true,
          canEditNodes: true,
          canDeleteNodes: true,
          canCreateEdges: true,
          canDeleteEdges: true,
          canChangeSettings: false,
          canInviteMembers: true,
          canKickMembers: false,
        },
      }),
      prisma.projectPermission.create({
        data: {
          projectId,
          role: "MEMBER",
          canCreateNodes: false,
          canEditNodes: false,
          canDeleteNodes: false,
          canCreateEdges: false,
          canDeleteEdges: false,
          canChangeSettings: false,
          canInviteMembers: false,
          canKickMembers: false,
        },
      }),
    ]);
  }
}

// Unified with removeMember (team-actions.ts): canKickMembers gates CO_HEAD,
// HEAD can always kick, nobody can kick HEAD, only HEAD can kick a CO_HEAD,
// and any non-HEAD member may remove themselves ("leave project").
export async function kickMember(projectId: string, memberId: string) {
  const user = await requireUser();
  const currentMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!currentMember) return { error: "Not a member" };

  const target = await prisma.projectMember.findUnique({ where: { id: memberId } });
  if (!target || target.projectId !== projectId) return { error: "Member not found" };

  const isSelfRemoval = target.userId === user.id;

  if (!isSelfRemoval) {
    // Check permissions
    if (currentMember.role === "HEAD") {
      // HEAD can always kick
    } else if (currentMember.role === "CO_HEAD") {
      const { perms } = await getEffectivePermissions(user.id, projectId);
      if (!perms.canKickMembers) return { error: "You don't have permission to kick members" };
    } else {
      return { error: "You don't have permission to kick members" };
    }
  }

  // Can't kick HEAD
  if (target.role === "HEAD") return { error: "Cannot kick the HEAD" };
  // CO_HEAD can't kick other CO_HEADs (self-removal/"leave" is still allowed)
  if (!isSelfRemoval && currentMember.role === "CO_HEAD" && target.role === "CO_HEAD") {
    return { error: "Cannot kick another CO_HEAD" };
  }

  // Remove membership + this user's task assignments in this project atomically
  // (TaskAssignment doesn't cascade from ProjectMember — see removeMember).
  await prisma.$transaction([
    prisma.taskAssignment.deleteMany({
      where: { userId: target.userId, node: { graph: { projectId } } },
    }),
    prisma.projectMember.delete({ where: { id: memberId } }),
  ]);
  await triggerDataRefresh(target.userId, "projects");
  revalidatePath(`/graph/${projectId}`);
  revalidatePath("/team");
  return { success: true };
}

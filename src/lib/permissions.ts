import { prisma } from "@/lib/prisma";
import type { MemberRole } from "@prisma/client";

export interface EffectivePermissions {
  canCreateNodes: boolean;
  canEditNodes: boolean;
  canDeleteNodes: boolean;
  canCreateEdges: boolean;
  canDeleteEdges: boolean;
  canChangeSettings: boolean;
  canInviteMembers: boolean;
  canKickMembers: boolean;
}

// HEAD always has full control, regardless of any ProjectPermission row.
const HEAD_PERMS: EffectivePermissions = {
  canCreateNodes: true,
  canEditNodes: true,
  canDeleteNodes: true,
  canCreateEdges: true,
  canDeleteEdges: true,
  canChangeSettings: true,
  canInviteMembers: true,
  canKickMembers: true,
};

// Defaults used when no ProjectPermission row exists yet for the role.
const CO_HEAD_DEFAULTS: EffectivePermissions = {
  canCreateNodes: true,
  canEditNodes: true,
  canDeleteNodes: true,
  canCreateEdges: true,
  canDeleteEdges: true,
  canChangeSettings: false,
  canInviteMembers: true,
  canKickMembers: false,
};

const MEMBER_DEFAULTS: EffectivePermissions = {
  canCreateNodes: false,
  canEditNodes: false,
  canDeleteNodes: false,
  canCreateEdges: false,
  canDeleteEdges: false,
  canChangeSettings: false,
  canInviteMembers: false,
  canKickMembers: false,
};

/**
 * Resolves the effective permission matrix for a user on a project.
 * HEAD is always fully-permissioned. CO_HEAD/MEMBER read the ProjectPermission
 * row for their role; when absent, sensible defaults are used (CO_HEAD can
 * create/edit/delete nodes+edges and invite members; MEMBER is view-only).
 *
 * Throws if the user is not a member of the project.
 */
export async function getEffectivePermissions(
  userId: string,
  projectId: string
): Promise<{ role: MemberRole; perms: EffectivePermissions }> {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (!member) throw new Error("Not a member of this project");

  if (member.role === "HEAD") {
    return { role: member.role, perms: { ...HEAD_PERMS } };
  }

  const defaults = member.role === "CO_HEAD" ? CO_HEAD_DEFAULTS : MEMBER_DEFAULTS;
  const override = await prisma.projectPermission.findUnique({
    where: { projectId_role: { projectId, role: member.role } },
  });

  const perms: EffectivePermissions = override
    ? {
        canCreateNodes: override.canCreateNodes,
        canEditNodes: override.canEditNodes,
        canDeleteNodes: override.canDeleteNodes,
        canCreateEdges: override.canCreateEdges,
        canDeleteEdges: override.canDeleteEdges,
        canChangeSettings: override.canChangeSettings,
        canInviteMembers: override.canInviteMembers,
        canKickMembers: override.canKickMembers,
      }
    : { ...defaults };

  return { role: member.role, perms };
}

/**
 * Resolves effective permissions and throws unless `key` is granted.
 * Use in server actions that mutate graph state to enforce the matrix.
 */
export async function requirePermission(
  userId: string,
  projectId: string,
  key: keyof EffectivePermissions
): Promise<{ role: MemberRole; perms: EffectivePermissions }> {
  const result = await getEffectivePermissions(userId, projectId);
  if (!result.perms[key]) {
    throw new Error("Insufficient permissions");
  }
  return result;
}

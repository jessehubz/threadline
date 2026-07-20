"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification, triggerDataRefresh } from "@/lib/notifications";
import { requirePermission } from "@/lib/permissions";
import { rateLimiters } from "@/lib/rate-limit";

export async function getTeams() {
  const user = await requireUser();
  const teams = await prisma.team.findMany({
    where: { ownerId: user.id },
    include: { members: { include: { user: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return teams;
}

export async function createTeam(name: string, emails: string[]) {
  const user = await requireUser();
  if (!name.trim()) return { error: "Team name is required" };
  if (emails.length === 0) return { error: "Add at least one member" };
  const team = await prisma.team.create({
    data: {
      name: name.trim(),
      ownerId: user.id,
      members: {
        create: emails.filter((e) => e.trim()).map((email) => ({ email: email.trim().toLowerCase() })),
      },
    },
    include: { members: true },
  });
  revalidatePath("/dashboard");
  revalidatePath("/team");
  return { success: true, team };
}

export async function deleteTeam(teamId: string) {
  const user = await requireUser();
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.ownerId !== user.id) return { error: "Team not found" };
  await prisma.team.delete({ where: { id: teamId } });
  revalidatePath("/dashboard");
  revalidatePath("/team");
  return { success: true };
}

export async function addTeamMember(teamId: string, email: string) {
  const user = await requireUser();
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.ownerId !== user.id) return { error: "Team not found" };

  const normalizedEmail = email.trim().toLowerCase();
  // Link the member to their account immediately when one exists, so they
  // can be added to projects later without a separate linking step.
  const matchedUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  try {
    await prisma.teamMember.create({
      data: { teamId, email: normalizedEmail, userId: matchedUser?.id },
    });
  } catch {
    return { error: "Member already in this team" };
  }
  revalidatePath("/team");
  return { success: true };
}

export interface TeamSearchResult {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  imageUrl: string | null;
}

/**
 * Search registered users to add to a team by name/username/email. Mirrors
 * the query idiom of searchAllUsers (src/actions/search-actions.ts). Results
 * are added via addTeamMember (by email), which links the account.
 */
export async function searchUsersToAddToTeam(query: string): Promise<TeamSearchResult[]> {
  const user = await requireUser();

  const { success: rateLimitOk } = await rateLimiters.api.check(user.id);
  if (!rateLimitOk) return [];

  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: user.id } },
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

  return users;
}

export async function removeTeamMember(teamId: string, memberId: string) {
  const user = await requireUser();
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.ownerId !== user.id) return { error: "Team not found" };

  // IDOR fix: verify target member belongs to this team
  const targetMember = await prisma.teamMember.findUnique({ where: { id: memberId } });
  if (!targetMember || targetMember.teamId !== teamId) return { error: "Member not found" };

  await prisma.teamMember.delete({ where: { id: memberId } });
  revalidatePath("/team");
  return { success: true };
}

export interface AddTeamToProjectResult {
  added: number;
  skippedExisting: number;
  skippedNoAccount: number;
}

/**
 * Adds every linked (has userId) member of a team to a project as MEMBER.
 * Caller must own the team and have canInviteMembers on the project.
 * Members without a linked account, or already on the project, are skipped
 * and reflected in the returned counts.
 */
export async function addTeamToProject(
  teamId: string,
  projectId: string
): Promise<AddTeamToProjectResult | { error: string }> {
  const user = await requireUser();

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });
  if (!team || team.ownerId !== user.id) return { error: "Team not found" };

  try {
    await requirePermission(user.id, projectId, "canInviteMembers");
  } catch {
    return { error: "Not authorized to invite members to this project" };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });
  if (!project) return { error: "Project not found" };

  const existingMembers = await prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });
  const existingMemberIds = new Set(existingMembers.map((m) => m.userId));

  const inviterName = user.name || user.email.split("@")[0];
  let added = 0;
  let skippedExisting = 0;
  let skippedNoAccount = 0;
  const notifiedIds: string[] = [];

  for (const member of team.members) {
    if (!member.userId) {
      skippedNoAccount++;
      continue;
    }
    if (existingMemberIds.has(member.userId)) {
      skippedExisting++;
      continue;
    }

    await prisma.projectMember.create({
      data: { userId: member.userId, projectId, role: "MEMBER" },
    });
    await createNotification({
      userId: member.userId,
      type: "INVITED",
      title: `${inviterName} added you to ${project.name}`,
      relatedProjectId: projectId,
    });
    notifiedIds.push(member.userId);
    added++;
  }

  if (notifiedIds.length > 0) {
    await triggerDataRefresh(notifiedIds, "projects");
  }

  revalidatePath("/team");
  revalidatePath("/dashboard");
  revalidatePath("/overview");
  revalidatePath(`/graph/${projectId}`);

  return { added, skippedExisting, skippedNoAccount };
}

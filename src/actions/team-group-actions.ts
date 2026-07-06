"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getTeams() {
  const user = await requireUser();
  const teams = await prisma.team.findMany({
    where: { ownerId: user.id },
    include: { members: true },
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
  try {
    await prisma.teamMember.create({ data: { teamId, email: email.trim().toLowerCase() } });
  } catch {
    return { error: "Member already in this team" };
  }
  revalidatePath("/team");
  return { success: true };
}

export async function removeTeamMember(teamId: string, memberId: string) {
  const user = await requireUser();
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.ownerId !== user.id) return { error: "Team not found" };
  await prisma.teamMember.delete({ where: { id: memberId } });
  revalidatePath("/team");
  return { success: true };
}

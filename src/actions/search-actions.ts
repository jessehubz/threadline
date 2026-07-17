"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimiters } from "@/lib/rate-limit";

export interface SearchPersonResult {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  imageUrl: string | null;
}

export async function searchAllUsers(query: string): Promise<SearchPersonResult[]> {
  const user = await requireUser();

  // Rate limiting
  const { success: rateLimitOk } = await rateLimiters.api.check(user.id);
  if (!rateLimitOk) return [];

  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Search ALL registered users by name, username, or email (case-insensitive), excluding current user
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
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      imageUrl: true,
    },
    take: 8,
  });

  return users;
}

// Shared core lookup: users who share a project with the current user,
// matching name, username, or email. Used by both searchPeople (standalone)
// and searchWorkspace (combined people + projects + tasks).
async function findPeopleForUser(userId: string, trimmed: string, projectIds: string[]): Promise<SearchPersonResult[]> {
  if (projectIds.length === 0) return [];

  return prisma.user.findMany({
    where: {
      AND: [
        { id: { not: userId } }, // exclude self
        {
          memberships: {
            some: {
              projectId: { in: projectIds },
            },
          },
        },
        {
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { email: { contains: trimmed, mode: "insensitive" } },
            { username: { contains: trimmed, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      imageUrl: true,
    },
    take: 5,
  });
}

export async function searchPeople(query: string): Promise<SearchPersonResult[]> {
  const user = await requireUser();

  // Rate limiting
  const { success: rateLimitOk } = await rateLimiters.api.check(user.id);
  if (!rateLimitOk) return [];

  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Find all project IDs the current user is a member of
  const userMemberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    select: { projectId: true },
  });

  const projectIds = userMemberships.map((m) => m.projectId);

  return findPeopleForUser(user.id, trimmed, projectIds);
}

export interface SearchProjectResult {
  id: string;
  name: string;
}

export interface SearchTaskResult {
  id: string;
  title: string;
  projectId: string;
  status: string;
}

export interface SearchWorkspaceResult {
  people: SearchPersonResult[];
  projects: SearchProjectResult[];
  tasks: SearchTaskResult[];
}

export async function searchWorkspace(query: string): Promise<SearchWorkspaceResult> {
  const user = await requireUser();

  // Rate limiting
  const { success: rateLimitOk } = await rateLimiters.api.check(user.id);
  if (!rateLimitOk) return { people: [], projects: [], tasks: [] };

  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return { people: [], projects: [], tasks: [] };

  // Find all project IDs the current user is a member of
  const userMemberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    select: { projectId: true },
  });
  const projectIds = userMemberships.map((m) => m.projectId);

  if (projectIds.length === 0) return { people: [], projects: [], tasks: [] };

  const [people, projects, tasks] = await Promise.all([
    findPeopleForUser(user.id, trimmed, projectIds),
    prisma.project.findMany({
      where: {
        id: { in: projectIds },
        deletedAt: null,
        name: { contains: trimmed, mode: "insensitive" },
      },
      select: { id: true, name: true },
      take: 5,
    }),
    prisma.taskNode.findMany({
      where: {
        deletedAt: null,
        title: { contains: trimmed, mode: "insensitive" },
        graph: { projectId: { in: projectIds } },
      },
      select: {
        id: true,
        title: true,
        status: true,
        graph: { select: { projectId: true } },
      },
      take: 7,
    }),
  ]);

  return {
    people,
    projects,
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      projectId: t.graph.projectId,
      status: t.status,
    })),
  };
}

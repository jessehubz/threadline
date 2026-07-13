"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimiters } from "@/lib/rate-limit";

export interface SearchPersonResult {
  id: string;
  name: string | null;
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

  // Search ALL registered users by name or email (case-insensitive), excluding current user
  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: user.id } },
        {
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { email: { contains: trimmed, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
    },
    take: 8,
  });

  return users;
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

  if (projectIds.length === 0) return [];

  // Find users who share a project with the current user, matching name or email
  const people = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: user.id } }, // exclude self
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
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
    },
    take: 5,
  });

  return people;
}

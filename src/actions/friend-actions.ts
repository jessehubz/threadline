"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function searchUsers(query: string) {
  const user = await requireUser();
  if (!query || query.length < 2) return [];

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: user.id } },
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: { id: true, name: true, email: true, imageUrl: true },
    take: 10,
  });

  return users;
}

export async function addFriend(friendId: string) {
  const user = await requireUser();
  if (friendId === user.id) throw new Error("Cannot add yourself as a friend");

  // Check if already friends
  const existing = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId: user.id, friendId } },
  });
  if (existing) throw new Error("Already friends");

  // Create bidirectional friendship
  await prisma.$transaction([
    prisma.friendship.create({ data: { userId: user.id, friendId } }),
    prisma.friendship.create({ data: { userId: friendId, friendId: user.id } }),
  ]);

  revalidatePath("/friends");
  return { success: true };
}

export async function removeFriend(friendId: string) {
  const user = await requireUser();

  await prisma.$transaction([
    prisma.friendship.deleteMany({ where: { userId: user.id, friendId } }),
    prisma.friendship.deleteMany({ where: { userId: friendId, friendId: user.id } }),
  ]);

  revalidatePath("/friends");
  return { success: true };
}

export async function getFriends() {
  const user = await requireUser();

  const friendships = await prisma.friendship.findMany({
    where: { userId: user.id },
    include: {
      friend: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          memberships: {
            include: { project: { select: { id: true, name: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return friendships.map((f) => ({
    id: f.id,
    friendId: f.friend.id,
    name: f.friend.name,
    email: f.friend.email,
    imageUrl: f.friend.imageUrl,
    projects: f.friend.memberships.map((m) => ({ id: m.project.id, name: m.project.name })),
  }));
}

export async function addFriendToProject(friendId: string, projectId: string) {
  const user = await requireUser();

  // Verify the current user owns/has access to the project
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!membership || membership.role === "MEMBER") {
    throw new Error("You don't have permission to add members to this project");
  }

  // Verify they are friends
  const friendship = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId: user.id, friendId } },
  });
  if (!friendship) throw new Error("User is not your friend");

  // Check if already a member
  const existingMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: friendId, projectId } },
  });
  if (existingMember) throw new Error("User is already a member of this project");

  await prisma.projectMember.create({
    data: { userId: friendId, projectId, role: "MEMBER" },
  });

  revalidatePath("/friends");
  revalidatePath(`/graph/${projectId}`);
  return { success: true };
}

"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification, triggerDataRefresh } from "@/lib/notifications";

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
            { username: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: { id: true, name: true, username: true, email: true, imageUrl: true },
    take: 10,
  });

  return users;
}

/**
 * Creates a DM conversation between two users with a 'now connected' first message.
 * Used when a friend request is accepted (either directly or via auto-accept).
 */
async function createConnectionConversation(userId: string, friendId: string) {
  // Check if a conversation already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: friendId } } },
      ],
    },
  });

  if (existingConversation) return; // Already have a conversation

  // Get friend's name for the system message
  const friendUser = await prisma.user.findUnique({
    where: { id: friendId },
    select: { name: true, email: true },
  });
  const friendDisplayName = friendUser?.name || friendUser?.email?.split("@")[0] || "your friend";

  // Create conversation and initial message
  const conversation = await prisma.conversation.create({
    data: {
      isGroup: false,
      participants: {
        create: [
          { userId },
          { userId: friendId },
        ],
      },
    },
  });

  await prisma.directMessage.create({
    data: {
      conversationId: conversation.id,
      userId,
      content: `You and ${friendDisplayName} are now connected! 🎉`,
      isSystem: true,
    },
  });
}

export async function addFriend(friendId: string) {
  const user = await requireUser();
  if (friendId === user.id) throw new Error("Cannot add yourself as a friend");

  // Check if already friends or pending
  const existing = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId: user.id, friendId } },
  });
  if (existing) throw new Error("Friend request already exists");

  // Check if the other user already sent us a request
  const reverseExisting = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId: friendId, friendId: user.id } },
  });
  if (reverseExisting && reverseExisting.status === "PENDING") {
    // Auto-accept: they already requested us, so accept both
    await prisma.$transaction([
      prisma.friendship.update({
        where: { id: reverseExisting.id },
        data: { status: "ACCEPTED" },
      }),
      prisma.friendship.create({
        data: { userId: user.id, friendId, status: "ACCEPTED" },
      }),
    ]);

    // Create a DM conversation with 'now connected' first message
    await createConnectionConversation(user.id, friendId);

    // Notify the original requester that their request was accepted
    const accepterName = user.name || user.email.split("@")[0];
    await createNotification({
      userId: friendId,
      type: "FRIEND_ACCEPTED",
      title: `${accepterName} accepted your friend request`,
    });
    await triggerDataRefresh([user.id, friendId], "friends");

    revalidatePath("/friends");
    revalidatePath("/messages");
    return { success: true };
  }
  if (reverseExisting && reverseExisting.status === "ACCEPTED") {
    throw new Error("Already friends");
  }

  // Create a pending friend request (one-directional until accepted)
  await prisma.friendship.create({
    data: { userId: user.id, friendId, status: "PENDING" },
  });

  // Notify the recipient of the new friend request
  const requesterName = user.name || user.email.split("@")[0];
  await createNotification({
    userId: friendId,
    type: "FRIEND_REQUEST",
    title: `${requesterName} sent you a friend request`,
  });
  await triggerDataRefresh([user.id, friendId], "friends");

  revalidatePath("/friends");
  return { success: true };
}

export async function acceptFriendRequest(requesterId: string) {
  const user = await requireUser();

  // Find the pending request from requester to current user
  const request = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId: requesterId, friendId: user.id } },
  });
  if (!request || request.status !== "PENDING") {
    throw new Error("No pending friend request found");
  }

  // Accept: update the existing request and create the reverse friendship
  await prisma.$transaction([
    prisma.friendship.update({
      where: { id: request.id },
      data: { status: "ACCEPTED" },
    }),
    prisma.friendship.upsert({
      where: { userId_friendId: { userId: user.id, friendId: requesterId } },
      create: { userId: user.id, friendId: requesterId, status: "ACCEPTED" },
      update: { status: "ACCEPTED" },
    }),
  ]);

  // Create a DM conversation with 'now connected' first message
  await createConnectionConversation(user.id, requesterId);

  // Notify the original requester that their request was accepted
  const accepterName = user.name || user.email.split("@")[0];
  await createNotification({
    userId: requesterId,
    type: "FRIEND_ACCEPTED",
    title: `${accepterName} accepted your friend request`,
  });
  await triggerDataRefresh([user.id, requesterId], "friends");

  revalidatePath("/friends");
  revalidatePath("/messages");
  return { success: true };
}

export async function declineFriendRequest(requesterId: string) {
  const user = await requireUser();

  // Find the pending request from requester to current user
  const request = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId: requesterId, friendId: user.id } },
  });
  if (!request || request.status !== "PENDING") {
    throw new Error("No pending friend request found");
  }

  // Delete the pending request
  await prisma.friendship.delete({
    where: { id: request.id },
  });

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
    where: { userId: user.id, status: "ACCEPTED" },
    include: {
      friend: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          imageUrl: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return friendships.map((f) => ({
    id: f.id,
    friendId: f.friend.id,
    name: f.friend.name,
    username: f.friend.username,
    email: f.friend.email,
    imageUrl: f.friend.imageUrl,
    bio: f.friend.bio,
  }));
}

export async function getPendingFriendRequests() {
  const user = await requireUser();

  // Requests where someone else sent a request TO the current user
  const requests = await prisma.friendship.findMany({
    where: { friendId: user.id, status: "PENDING" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((r) => ({
    id: r.id,
    requesterId: r.user.id,
    name: r.user.name,
    username: r.user.username,
    email: r.user.email,
    imageUrl: r.user.imageUrl,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getSentFriendRequests() {
  const user = await requireUser();

  // Requests the current user sent that are still awaiting a response
  const requests = await prisma.friendship.findMany({
    where: { userId: user.id, status: "PENDING" },
    include: {
      friend: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((r) => ({
    id: r.id,
    recipientId: r.friend.id,
    name: r.friend.name,
    username: r.friend.username,
    email: r.friend.email,
    imageUrl: r.friend.imageUrl,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function cancelFriendRequest(friendshipId: string) {
  const user = await requireUser();

  const request = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!request || request.userId !== user.id || request.status !== "PENDING") {
    return { error: "Friend request not found" };
  }

  await prisma.friendship.delete({ where: { id: friendshipId } });
  await triggerDataRefresh([request.userId, request.friendId], "friends");

  revalidatePath("/friends");
  return { success: true };
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

  // Verify they are friends (accepted)
  const friendship = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId: user.id, friendId } },
  });
  if (!friendship || friendship.status !== "ACCEPTED") {
    throw new Error("User is not your friend");
  }

  // Check if already a member
  const existingMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: friendId, projectId } },
  });
  if (existingMember) throw new Error("User is already a member of this project");

  // Get project name for the notification message
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });

  await prisma.projectMember.create({
    data: { userId: friendId, projectId, role: "MEMBER" },
  });

  // Route through the shared helper so this add behaves like every other add:
  // preference-gated notification + a realtime data-refresh so the added
  // friend's dashboard shows the project without a manual reload (T04).
  const adderName = user.name || user.email.split("@")[0];
  const projectName = project?.name || "a project";
  await createNotification({
    userId: friendId,
    type: "INVITED",
    title: `${adderName} added you to ${projectName}`,
    relatedProjectId: projectId,
  });
  await triggerDataRefresh(friendId, "projects");

  revalidatePath("/friends");
  revalidatePath(`/graph/${projectId}`);
  return { success: true };
}

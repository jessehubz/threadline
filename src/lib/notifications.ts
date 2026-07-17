import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import type { NotificationType } from "@prisma/client";

// Maps gated notification types to the User preference field that must be
// truthy for the notification to be created. Types not listed here (and
// INVITED) are always created.
const PREFERENCE_GATE: Partial<
  Record<NotificationType, "notifyAssigned" | "notifyApproval" | "notifyDueSoon" | "notifyMentioned">
> = {
  ASSIGNED: "notifyAssigned",
  APPROVAL_REQUESTED: "notifyApproval",
  APPROVED: "notifyApproval",
  REJECTED: "notifyApproval",
  DUE_SOON: "notifyDueSoon",
  MENTIONED: "notifyMentioned",
};

/**
 * Single choke point for creating a Notification row + firing the realtime
 * "notification-new" event on the recipient's private user channel.
 *
 * Respects per-user notification preferences for the gated types. Pusher
 * trigger failures never fail the parent action (already-created row stays).
 */
export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  relatedProjectId?: string;
  relatedNodeId?: string;
}) {
  const prefField = PREFERENCE_GATE[input.type];
  if (prefField) {
    const recipient = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { notifyAssigned: true, notifyApproval: true, notifyDueSoon: true, notifyMentioned: true },
    });
    if (!recipient || !recipient[prefField]) return null;
  }

  // The Notification model stores a single `message` string. Combine the
  // title (always present) with the optional detail message.
  const message = input.message ? `${input.title}: ${input.message}` : input.title;

  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      message,
      relatedNodeId: input.relatedNodeId,
      relatedProjectId: input.relatedProjectId,
    },
  });

  try {
    await pusherServer.trigger(`private-user-${input.userId}`, "notification-new", {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      relatedNodeId: notification.relatedNodeId,
      relatedProjectId: notification.relatedProjectId,
      createdAt: notification.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to trigger notification-new event:", error);
  }

  return notification;
}

/**
 * Fires a lightweight "data-refresh" event on each user's private channel so
 * client components can call router.refresh() and pick up server-side
 * changes (e.g. being added to a project) without a manual reload.
 */
export async function triggerDataRefresh(userIds: string | string[], scope: string) {
  const ids = Array.from(new Set(Array.isArray(userIds) ? userIds : [userIds])).filter(Boolean);
  if (ids.length === 0) return;

  try {
    if (ids.length > 1) {
      await pusherServer.triggerBatch(
        ids.map((id) => ({
          channel: `private-user-${id}`,
          name: "data-refresh",
          data: { scope },
        }))
      );
    } else {
      await pusherServer.trigger(`private-user-${ids[0]}`, "data-refresh", { scope });
    }
  } catch (error) {
    console.error("Failed to trigger data-refresh event:", error);
  }
}

/**
 * Broadcasts a profile change (name/avatar) to every other user who currently
 * renders this user somewhere in their UI — accepted friends, fellow members of
 * shared projects, and participants of shared DM conversations — plus the user's
 * own other tabs. Each recipient's `data-refresh` listener re-renders the
 * server components that show this user's name/avatar, so identity edits
 * propagate cross-account without a manual reload.
 *
 * This is a fan-out to potentially many channels; it is best-effort and never
 * throws (triggerDataRefresh swallows its own errors).
 */
export async function broadcastProfileUpdate(userId: string) {
  const [friendships, sharedMemberships, conversations] = await Promise.all([
    // Accepted friendships in either direction.
    prisma.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ userId }, { friendId: userId }] },
      select: { userId: true, friendId: true },
    }),
    // Other members of every project this user belongs to.
    prisma.projectMember.findMany({
      where: { project: { members: { some: { userId } } } },
      select: { userId: true },
    }),
    // Other participants of conversations this user is in.
    prisma.conversationParticipant.findMany({
      where: { conversation: { participants: { some: { userId } } } },
      select: { userId: true },
    }),
  ]);

  const recipients = new Set<string>([userId]);
  for (const f of friendships) {
    recipients.add(f.userId);
    recipients.add(f.friendId);
  }
  for (const m of sharedMemberships) recipients.add(m.userId);
  for (const p of conversations) recipients.add(p.userId);

  await triggerDataRefresh(Array.from(recipients), "profile");
}

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

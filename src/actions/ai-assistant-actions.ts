"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";
import { rateLimiters } from "@/lib/rate-limit";
import { parseUserMessage } from "@/lib/ai-assistant";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AssistantTask {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  projectId: string;
  projectName: string;
  assignees: string[];
  dependsOn: string[];
  blocks: string[];
}

interface PendingReminder {
  id: string;
  description: string;
  scheduledFor: string;
}

interface AssistantContext {
  tasks: AssistantTask[];
  userName: string;
  pendingReminders: PendingReminder[];
}

// The NotificationType enum doesn't include REMINDER, so we use DUE_SOON
// and prefix the message with [Reminder] to distinguish reminders from
// system-generated due-soon notifications.
const REMINDER_PREFIX = "[Reminder] ";

// ─── getAssistantContext ────────────────────────────────────────────────────

export async function getAssistantContext(): Promise<AssistantContext> {
  const user = await requireUser();

  const rateLimit = await rateLimiters.api.check(user.id);
  if (!rateLimit.success) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  // Get all projects where user is a member
  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    select: { projectId: true },
  });

  const projectIds = memberships.map((m) => m.projectId);

  // Get all task nodes from those projects' graphs
  const tasks = await prisma.taskNode.findMany({
    where: {
      graph: {
        projectId: { in: projectIds },
      },
    },
    include: {
      graph: {
        include: {
          project: {
            select: { id: true, name: true },
          },
        },
      },
      assignments: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
      incomingEdges: {
        select: { sourceNodeId: true },
      },
      outgoingEdges: {
        select: { targetNodeId: true },
      },
    },
  });

  const formattedTasks: AssistantTask[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    projectId: task.graph.project.id,
    projectName: task.graph.project.name,
    assignees: task.assignments.map(
      (a) => a.user.name || a.user.email
    ),
    dependsOn: task.incomingEdges.map((e) => e.sourceNodeId),
    blocks: task.outgoingEdges.map((e) => e.targetNodeId),
  }));

  // Get pending reminders (unread notifications with [Reminder] prefix)
  const reminderNotifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      read: false,
      message: { startsWith: REMINDER_PREFIX },
    },
    orderBy: { createdAt: "asc" },
  });

  const pendingReminders: PendingReminder[] = reminderNotifications.map((n) => ({
    id: n.id,
    description: n.message.replace(REMINDER_PREFIX, ""),
    scheduledFor: n.createdAt.toISOString(),
  }));

  return {
    tasks: formattedTasks,
    userName: await getLiveUserName(user),
    pendingReminders,
  };
}

// Fetch the live display name from Clerk (not the potentially stale DB record)
async function getLiveUserName(dbUser: { name: string | null; email: string }): Promise<string> {
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");
      if (fullName) return fullName;
    }
  } catch {
    // Fallback to DB name
  }
  return dbUser.name || dbUser.email;
}

// ─── createReminder ─────────────────────────────────────────────────────────

export async function createReminder(
  description: string,
  scheduledFor: string,
  relatedTaskId?: string
): Promise<{ success: true; id: string }> {
  const user = await requireUser();

  const rateLimit = await rateLimiters.api.check(user.id);
  if (!rateLimit.success) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  if (!description || !description.trim()) {
    throw new Error("Reminder description is required.");
  }

  if (!scheduledFor) {
    throw new Error("Scheduled time is required.");
  }

  // Validate the scheduled date
  const scheduledDate = new Date(scheduledFor);
  if (isNaN(scheduledDate.getTime())) {
    throw new Error("Invalid scheduled date.");
  }

  // Find the related project if a task ID is provided
  let relatedProjectId: string | null = null;
  if (relatedTaskId) {
    const task = await prisma.taskNode.findUnique({
      where: { id: relatedTaskId },
      include: { graph: { select: { projectId: true } } },
    });
    if (task) {
      relatedProjectId = task.graph.projectId;
    }
  }

  // Create the notification as a reminder using DUE_SOON type with [Reminder] prefix
  const notification = await prisma.notification.create({
    data: {
      userId: user.id,
      type: "DUE_SOON",
      message: `${REMINDER_PREFIX}${description.trim()}`,
      read: false,
      relatedNodeId: relatedTaskId || null,
      relatedProjectId,
      createdAt: scheduledDate,
    },
  });

  return { success: true, id: notification.id };
}

// ─── getPendingReminders ────────────────────────────────────────────────────

export async function getPendingReminders(): Promise<PendingReminder[]> {
  const user = await requireUser();

  const rateLimit = await rateLimiters.api.check(user.id);
  if (!rateLimit.success) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  const reminderNotifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      read: false,
      message: { startsWith: REMINDER_PREFIX },
    },
    orderBy: { createdAt: "asc" },
  });

  return reminderNotifications.map((n) => ({
    id: n.id,
    description: n.message.replace(REMINDER_PREFIX, ""),
    scheduledFor: n.createdAt.toISOString(),
  }));
}

// ─── chatWithAssistant (heuristic-powered conversation) ─────────────────────
// Task Helper IS the heuristic engine in src/lib/ai-assistant.ts - there is no
// external LLM call. See parseUserMessage for intent handling.

export async function chatWithAssistant(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{ content: string }> {
  const user = await requireUser();

  const rateLimit = await rateLimiters.api.check(user.id);
  if (!rateLimit.success) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  // Fetch context (tasks, projects, reminders)
  const context = await getAssistantContext();

  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const response = parseUserMessage(lastUserMsg, context);
  return { content: response.content };
}

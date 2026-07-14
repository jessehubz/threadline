"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";
import { rateLimiters } from "@/lib/rate-limit";

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

// ─── chatWithAssistant (LLM-powered conversation) ───────────────────────────

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

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

  // Build system prompt with context
  const systemPrompt = buildSystemPrompt(context);

  const fullMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  // Use Ollama (Llama) via its OpenAI-compatible API at localhost:11434
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
  const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";

  try {
    const { generateText } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");

    const ollama = createOpenAI({
      baseURL: ollamaBaseUrl,
      apiKey: "ollama", // Ollama doesn't need a real key but the SDK requires one
    });

    const result = await generateText({
      model: ollama(ollamaModel),
      messages: fullMessages,
      maxTokens: 800,
      temperature: 0.7,
    });

    return { content: result.text };
  } catch (error: unknown) {
    // If Ollama fails, fall back to heuristic
    console.error("[AI Assistant] Ollama error, falling back to heuristic:", error);
    const { parseUserMessage } = await import("@/lib/ai-assistant");
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    const response = parseUserMessage(lastUserMsg, context);
    return { content: response.content };
  }
}

function buildSystemPrompt(context: AssistantContext): string {
  const now = new Date();
  const tasksSummary = context.tasks
    .filter((t) => t.status !== "COMPLETE")
    .slice(0, 30)
    .map((t) => {
      const parts = [`- "${t.title}" [${t.projectName}] - ${t.status}`];
      if (t.dueDate) {
        const due = new Date(t.dueDate);
        const daysUntil = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil < 0) parts.push(`(${Math.abs(daysUntil)}d OVERDUE)`);
        else if (daysUntil === 0) parts.push("(due TODAY)");
        else if (daysUntil <= 7) parts.push(`(due in ${daysUntil}d)`);
      }
      if (t.blocks.length > 0) parts.push(`(blocks ${t.blocks.length} tasks)`);
      if (t.assignees.length > 0) parts.push(`[assigned: ${t.assignees.join(", ")}]`);
      return parts.join(" ");
    })
    .join("\n");

  const projectNames = [...new Set(context.tasks.map((t) => t.projectName))];

  return `You are Loom, a friendly and concise AI planning assistant inside Threadline - a collaborative task management app built around visual dependency graphs.

Your user's name is ${context.userName}.

## Your personality
- Friendly but concise - no filler, get to the point
- Use emoji sparingly for emphasis (not every sentence)
- When giving task advice, be specific and actionable
- You can introduce yourself as "Loom" if asked your name

## What you know about the user's workspace
- Projects: ${projectNames.join(", ") || "none yet"}
- Active tasks (${context.tasks.filter((t) => t.status !== "COMPLETE").length} total):
${tasksSummary || "  (no active tasks)"}
- Pending reminders: ${context.pendingReminders.length}
- Current time: ${now.toLocaleString()}

## What you can help with
- Prioritizing tasks based on due dates, dependencies, and urgency
- Planning schedules and suggesting work order
- Answering questions about their projects and tasks
- General productivity advice
- Setting reminders (tell user you've noted it, actual reminder creation happens separately)

## Important rules
- You are advisory only - you cannot modify tasks, only suggest actions
- Keep responses under 200 words unless the user asks for detail
- If you don't know something about their workspace, say so
- Never invent tasks or data that isn't in the context above`;
}

// =============================================================================
// AI Assistant - Heuristic-based task prioritization & scheduling
// (User-facing name: "Task Helper")
// Advisory only: does NOT modify graph data, only suggests actions.
// =============================================================================

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface TaskData {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  projectId: string;
  projectName: string;
  assignees: string[];
  dependsOn: string[]; // task IDs this task is blocked by
  blocks: string[]; // task IDs this task blocks
}

export interface AssistantContext {
  tasks: TaskData[];
  userName: string;
  pendingReminders: Array<{
    id: string;
    description: string;
    scheduledFor: string;
  }>;
}

export interface AssistantResponse {
  type: 'text' | 'priority_list' | 'schedule' | 'reminder_confirm' | 'clarify';
  content: string;
  reminderData?: { description: string; scheduledFor: string; taskId?: string };
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const PRIORITY_SCORES = {
  URGENT_STATUS: 50,
  OVERDUE_BASE: 40,
  OVERDUE_PER_DAY: 5,
  DUE_TODAY: 30,
  DUE_THIS_WEEK: 20,
  BLOCKS_PER_TASK: 10,
  BLOCKED_PENALTY: -20,
  IN_PROGRESS_BONUS: 5,
} as const;

const INTENT_PATTERNS: Record<string, RegExp> = {
  IDENTITY: /\b(what('?s| is) your name|who are you|what are you|are you (an? )?(ai|bot|human|llm|chatgpt|gpt))\b/i,
  PRIORITIZE:
    /\b(prioriti[sz]e|priority|what should i|what to do|focus|most important|next|work on)\b/i,
  SCHEDULE:
    /\b(schedule|plan my|order|sequence|when should|timeline)\b/i,
  REMIND: /\b(remind|reminder|notify me|alert me)\b/i,
  HELP: /\b(help|what can you|how do|commands)\b/i,
  GREETING: /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/i,
};

// -----------------------------------------------------------------------------
// Main entry point
// -----------------------------------------------------------------------------

export function parseUserMessage(
  message: string,
  context: AssistantContext,
): AssistantResponse {
  const normalizedMessage = message.trim().toLowerCase();
  const intent = detectIntent(normalizedMessage);

  switch (intent) {
    case 'IDENTITY':
      return handleIdentity();
    case 'GREETING':
      return handleGreeting(context);
    case 'HELP':
      return handleHelp();
    case 'PRIORITIZE':
      return handlePrioritize(context.tasks);
    case 'SCHEDULE':
      return handleSchedule(context.tasks);
    case 'REMIND':
      return handleRemind(message, context);
    default:
      return handleUnknown();
  }
}

// -----------------------------------------------------------------------------
// Priority suggestion
// -----------------------------------------------------------------------------

export function generatePrioritySuggestion(tasks: TaskData[]): string {
  const scoredTasks = tasks
    .filter((t) => t.status !== 'COMPLETE')
    .map((task) => ({
      task,
      score: calculatePriorityScore(task),
      reasons: getPriorityReasons(task),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);

  if (scoredTasks.length === 0) {
    return '✨ You have no pending tasks - nice work!';
  }

  const lines: string[] = ['🎯 **Here\'s what to focus on:**\n'];

  scoredTasks.forEach(({ task, reasons }, index) => {
    const emoji = index === 0 ? '🔥' : index < 3 ? '⚡' : '📌';
    const projectTag = `[${task.projectName}]`;
    const reasonText = reasons.join(', ');
    lines.push(
      `${emoji} **${index + 1}. ${task.title}** ${projectTag}`,
    );
    lines.push(`   _${reasonText}_\n`);
  });

  return lines.join('\n');
}

// -----------------------------------------------------------------------------
// Schedule suggestion
// -----------------------------------------------------------------------------

export function generateScheduleSuggestion(tasks: TaskData[]): string {
  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETE');

  if (activeTasks.length === 0) {
    return '✨ No active tasks to schedule - you\'re all caught up!';
  }

  const { doFirst, doNext, flexible } = groupTasksByDependency(activeTasks);

  const lines: string[] = ['📅 **Suggested schedule:**\n'];

  if (doFirst.length > 0) {
    lines.push('🚀 **Do first** _(these unblock other tasks):_');
    sortByDueDate(doFirst).forEach((t) => {
      lines.push(`   • ${t.title} ${formatDueTag(t.dueDate)} - unblocks ${t.blocks.length} task(s)`);
    });
    lines.push('');
  }

  if (doNext.length > 0) {
    lines.push('⏭️ **Do next** _(after dependencies clear):_');
    sortByDueDate(doNext).forEach((t) => {
      lines.push(`   • ${t.title} ${formatDueTag(t.dueDate)} - waiting on ${t.dependsOn.length} task(s)`);
    });
    lines.push('');
  }

  if (flexible.length > 0) {
    lines.push('🌊 **Flexible** _(no dependency constraints):_');
    sortByDueDate(flexible).forEach((t) => {
      lines.push(`   • ${t.title} ${formatDueTag(t.dueDate)}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

// -----------------------------------------------------------------------------
// Reminder parsing
// -----------------------------------------------------------------------------

export function parseReminderRequest(
  message: string,
): { taskQuery?: string; time?: string; description?: string } | null {
  const normalized = message.toLowerCase().trim();

  // Must contain a reminder-related keyword
  if (!/\b(remind|reminder|notify|alert)\b/i.test(normalized)) {
    return null;
  }

  const time = extractTime(normalized);
  const taskQuery = extractTaskQuery(message);
  const description = extractReminderDescription(message);

  if (!time && !taskQuery && !description) {
    return null;
  }

  return {
    taskQuery: taskQuery || undefined,
    time: time || undefined,
    description: description || undefined,
  };
}

// -----------------------------------------------------------------------------
// Intent detection
// -----------------------------------------------------------------------------

function detectIntent(message: string): string {
  // Check patterns in priority order (most specific first)
  if (INTENT_PATTERNS.IDENTITY.test(message)) return 'IDENTITY';
  if (INTENT_PATTERNS.REMIND.test(message)) return 'REMIND';
  if (INTENT_PATTERNS.SCHEDULE.test(message)) return 'SCHEDULE';
  if (INTENT_PATTERNS.PRIORITIZE.test(message)) return 'PRIORITIZE';
  if (INTENT_PATTERNS.HELP.test(message)) return 'HELP';
  if (INTENT_PATTERNS.GREETING.test(message)) return 'GREETING';
  return 'UNKNOWN';
}

// -----------------------------------------------------------------------------
// Intent handlers
// -----------------------------------------------------------------------------

function handleIdentity(): AssistantResponse {
  return {
    type: 'text',
    content:
      "🤖 I'm the **Task Helper**, your built-in planning assistant. I run entirely on your workspace data - no external AI service - and I help you prioritize tasks, plan your schedule, and set reminders. Ask me to prioritize, schedule, or remind you about something!",
  };
}

function handleGreeting(context: AssistantContext): AssistantResponse {
  const urgentCount = context.tasks.filter(
    (t) => t.status === 'URGENT' || isOverdue(t),
  ).length;

  let greeting = `👋 Hey ${context.userName}! I'm the Task Helper, your built-in planning assistant. `;

  if (urgentCount > 0) {
    greeting += `You have ${urgentCount} urgent/overdue task${urgentCount > 1 ? 's' : ''}. Want me to help you prioritize?`;
  } else if (context.tasks.filter((t) => t.status !== 'COMPLETE').length === 0) {
    greeting += 'Looks like you\'re all caught up - nice! 🎉';
  } else {
    greeting += 'Ready to help you stay on track. Ask me to prioritize, schedule, or set a reminder!';
  }

  return { type: 'text', content: greeting };
}

function handleHelp(): AssistantResponse {
  const content = [
    '🤖 **Here\'s what I can help with:**\n',
    '• **Prioritize** - "What should I focus on?" / "Prioritize my tasks"',
    '• **Schedule** - "Plan my day" / "What order should I work in?"',
    '• **Remind** - "Remind me about [task] tomorrow" / "Set a reminder in 2 hours"',
    '',
    '💡 I analyze your tasks across all projects using due dates, dependencies, and urgency to give suggestions.',
    '',
    '_I\'m advisory only - I won\'t change your graph, just help you decide what matters most._',
  ].join('\n');

  return { type: 'text', content };
}

function handlePrioritize(tasks: TaskData[]): AssistantResponse {
  const content = generatePrioritySuggestion(tasks);
  return { type: 'priority_list', content };
}

function handleSchedule(tasks: TaskData[]): AssistantResponse {
  const content = generateScheduleSuggestion(tasks);
  return { type: 'schedule', content };
}

function handleRemind(
  message: string,
  context: AssistantContext,
): AssistantResponse {
  const parsed = parseReminderRequest(message);

  if (!parsed) {
    return {
      type: 'clarify',
      content:
        '⏰ I\'d love to set a reminder! Could you tell me:\n• What to remind you about\n• When (e.g., "tomorrow", "in 2 hours", "next week")',
    };
  }

  // Resolve time
  const scheduledFor = parsed.time
    ? resolveTimeExpression(parsed.time)
    : null;

  if (!scheduledFor) {
    return {
      type: 'clarify',
      content:
        '⏰ Got it! When should I remind you? (e.g., "tomorrow", "in 2 hours", "next week")',
    };
  }

  // Try to match a task
  let matchedTask: TaskData | undefined;
  if (parsed.taskQuery) {
    matchedTask = findMatchingTask(parsed.taskQuery, context.tasks);
  }

  const description =
    parsed.description ||
    (matchedTask ? `Follow up on: ${matchedTask.title}` : 'Reminder');

  const formattedTime = formatDateTime(scheduledFor);

  return {
    type: 'reminder_confirm',
    content: `✅ Reminder set for **${formattedTime}**:\n"${description}"${matchedTask ? ` (linked to: ${matchedTask.title})` : ''}`,
    reminderData: {
      description,
      scheduledFor: scheduledFor.toISOString(),
      taskId: matchedTask?.id,
    },
  };
}

function handleUnknown(): AssistantResponse {
  return {
    type: 'text',
    content:
      '🤔 I\'m not sure what you\'re asking. Try:\n• "What should I focus on?"\n• "Plan my schedule"\n• "Remind me about X tomorrow"\n• "Help"',
  };
}

// -----------------------------------------------------------------------------
// Priority scoring
// -----------------------------------------------------------------------------

function calculatePriorityScore(task: TaskData): number {
  let score = 0;

  // Status-based scoring
  if (task.status === 'URGENT') score += PRIORITY_SCORES.URGENT_STATUS;
  if (task.status === 'BLOCKED') score += PRIORITY_SCORES.BLOCKED_PENALTY;
  if (task.status === 'IN_PROGRESS') score += PRIORITY_SCORES.IN_PROGRESS_BONUS;

  // Due date scoring
  if (task.dueDate) {
    const now = new Date();
    const due = new Date(task.dueDate);
    const daysUntilDue = Math.floor(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilDue < 0) {
      // Overdue
      score += PRIORITY_SCORES.OVERDUE_BASE + Math.abs(daysUntilDue) * PRIORITY_SCORES.OVERDUE_PER_DAY;
    } else if (daysUntilDue === 0) {
      score += PRIORITY_SCORES.DUE_TODAY;
    } else if (daysUntilDue <= 7) {
      score += PRIORITY_SCORES.DUE_THIS_WEEK;
    }
  }

  // Dependency fanout scoring
  score += task.blocks.length * PRIORITY_SCORES.BLOCKS_PER_TASK;

  return score;
}

function getPriorityReasons(task: TaskData): string[] {
  const reasons: string[] = [];

  if (task.status === 'URGENT') reasons.push('🚨 Urgent');
  if (task.status === 'BLOCKED') reasons.push('🚫 Blocked');
  if (task.status === 'IN_PROGRESS') reasons.push('▶️ In progress');

  if (task.dueDate) {
    const now = new Date();
    const due = new Date(task.dueDate);
    const daysUntilDue = Math.floor(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilDue < 0) {
      reasons.push(`⏰ ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''} overdue`);
    } else if (daysUntilDue === 0) {
      reasons.push('📅 Due today');
    } else if (daysUntilDue <= 7) {
      reasons.push(`📅 Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`);
    }
  }

  if (task.blocks.length > 0) {
    reasons.push(`🔗 Unblocks ${task.blocks.length} task${task.blocks.length > 1 ? 's' : ''}`);
  }

  if (reasons.length === 0) {
    reasons.push('📋 Pending');
  }

  return reasons;
}

// -----------------------------------------------------------------------------
// Schedule grouping & topological sort
// -----------------------------------------------------------------------------

function groupTasksByDependency(tasks: TaskData[]): {
  doFirst: TaskData[];
  doNext: TaskData[];
  flexible: TaskData[];
} {
  const doFirst: TaskData[] = [];
  const doNext: TaskData[] = [];
  const flexible: TaskData[] = [];

  for (const task of tasks) {
    // Tasks that block others and have no unresolved dependencies themselves
    const hasUnresolvedDeps = task.dependsOn.some((depId) => {
      const dep = tasks.find((t) => t.id === depId);
      return dep && dep.status !== 'COMPLETE';
    });

    if (task.blocks.length > 0 && !hasUnresolvedDeps) {
      doFirst.push(task);
    } else if (hasUnresolvedDeps) {
      doNext.push(task);
    } else {
      flexible.push(task);
    }
  }

  return { doFirst, doNext, flexible };
}

function sortByDueDate(tasks: TaskData[]): TaskData[] {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

// -----------------------------------------------------------------------------
// Reminder helpers
// -----------------------------------------------------------------------------

function extractTime(message: string): string | null {
  // Match "in X hours"
  const hoursMatch = message.match(/in\s+(\d+)\s+hour/i);
  if (hoursMatch) return `in ${hoursMatch[1]} hours`;

  // Match "in X minutes"
  const minutesMatch = message.match(/in\s+(\d+)\s+minute/i);
  if (minutesMatch) return `in ${minutesMatch[1]} minutes`;

  // Match keywords
  if (/\btomorrow\b/i.test(message)) return 'tomorrow';
  if (/\bnext week\b/i.test(message)) return 'next week';
  if (/\btonight\b/i.test(message)) return 'tonight';
  if (/\btoday\b/i.test(message)) return 'today';

  return null;
}

function extractTaskQuery(message: string): string | null {
  // Match "about [task name]" or "for [task name]"
  const aboutMatch = message.match(
    /(?:about|for|regarding)\s+['"]?([^'",.!?]+?)['"]?\s*(?:tomorrow|today|tonight|next week|in \d+|$)/i,
  );
  if (aboutMatch) return aboutMatch[1].trim();

  // Match "remind me [task name]"
  const remindMatch = message.match(
    /(?:remind(?:\s+me)?(?:\s+to)?)\s+['"]?([^'",.!?]+?)['"]?\s*(?:tomorrow|today|tonight|next week|in \d+|$)/i,
  );
  if (remindMatch) return remindMatch[1].trim();

  return null;
}

function extractReminderDescription(message: string): string | null {
  // Try to extract what the user wants to be reminded about
  const toMatch = message.match(
    /(?:remind(?:\s+me)?(?:\s+to)?)\s+(.+?)(?:\s+(?:tomorrow|today|tonight|next week|in \d+))/i,
  );
  if (toMatch) return toMatch[1].trim();

  const aboutMatch = message.match(
    /(?:about|for|regarding)\s+(.+?)(?:\s+(?:tomorrow|today|tonight|next week|in \d+)|$)/i,
  );
  if (aboutMatch) return aboutMatch[1].trim();

  return null;
}

function resolveTimeExpression(timeExpr: string): Date | null {
  const now = new Date();

  if (timeExpr === 'tomorrow') {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  }

  if (timeExpr === 'today' || timeExpr === 'tonight') {
    const d = new Date(now);
    d.setHours(18, 0, 0, 0);
    // If it's already past 6pm, set for tomorrow 6pm
    if (d.getTime() <= now.getTime()) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  }

  if (timeExpr === 'next week') {
    const d = new Date(now);
    const daysUntilMonday = ((1 - d.getDay()) + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilMonday);
    d.setHours(9, 0, 0, 0);
    return d;
  }

  // "in X hours"
  const hoursMatch = timeExpr.match(/in\s+(\d+)\s+hour/i);
  if (hoursMatch) {
    const d = new Date(now);
    d.setHours(d.getHours() + parseInt(hoursMatch[1], 10));
    return d;
  }

  // "in X minutes"
  const minutesMatch = timeExpr.match(/in\s+(\d+)\s+minute/i);
  if (minutesMatch) {
    const d = new Date(now);
    d.setMinutes(d.getMinutes() + parseInt(minutesMatch[1], 10));
    return d;
  }

  return null;
}

function findMatchingTask(
  query: string,
  tasks: TaskData[],
): TaskData | undefined {
  const normalizedQuery = query.toLowerCase().trim();

  // Exact match first
  const exactMatch = tasks.find(
    (t) => t.title.toLowerCase() === normalizedQuery,
  );
  if (exactMatch) return exactMatch;

  // Partial match (query is a substring of title)
  const partialMatch = tasks.find((t) =>
    t.title.toLowerCase().includes(normalizedQuery),
  );
  if (partialMatch) return partialMatch;

  // Fuzzy: title contains any word from query (3+ chars)
  const queryWords = normalizedQuery
    .split(/\s+/)
    .filter((w) => w.length >= 3);
  if (queryWords.length > 0) {
    const fuzzyMatch = tasks.find((t) => {
      const title = t.title.toLowerCase();
      return queryWords.some((word) => title.includes(word));
    });
    if (fuzzyMatch) return fuzzyMatch;
  }

  return undefined;
}

// -----------------------------------------------------------------------------
// Utility helpers
// -----------------------------------------------------------------------------

function isOverdue(task: TaskData): boolean {
  if (!task.dueDate) return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

function formatDueTag(dueDate: string | null): string {
  if (!dueDate) return '';

  const now = new Date();
  const due = new Date(dueDate);
  const daysUntilDue = Math.floor(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilDue < 0) return `⚠️ ${Math.abs(daysUntilDue)}d overdue`;
  if (daysUntilDue === 0) return '📅 due today';
  if (daysUntilDue === 1) return '📅 due tomorrow';
  if (daysUntilDue <= 7) return `📅 due in ${daysUntilDue}d`;
  return `📅 ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

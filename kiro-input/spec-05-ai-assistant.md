# AI Assistant — Planning, Scheduling & Natural-Language Commands

**Where this goes:** save as `spec-05-ai-assistant.md` in your spec-input folder. Kick off with `/spec new ai-assistant`, choose **Build a Feature**. Run `spec-02-task-details-panel.md` first — this spec's command examples reference the Urgent status added there.

This is a new, fairly large capability — treat it as its own spec rather than folding it into the existing Dashboard/AI Insights work.

## Core capability (Feature)
- Add a chatbot-style AI assistant the user can ask for help with task planning: sequencing tasks into the right chronological/dependency order, or building a schedule for finishing a set of tasks.
- *(Design discretion)* Where it lives: a dedicated chat panel, reachable from the AI Insights widget or its own nav entry, is a reasonable default — it shouldn't require leaving the current project to use it.
- The assistant can offer to send reminders by email — it must ask permission before sending any given reminder, never send one unprompted. Default to treating that permission as a one-time ask per reminder rather than a standing preference, unless told otherwise.
- WHEN a reminder is active or pending THEN the system SHALL show an indicator on the existing AI Insights dashboard widget, so the user notices it without opening the assistant directly.
- Scope the scheduling logic to reason over data that already exists in the system — due dates, dependency/blocking relationships from the node graph, and current status — rather than requiring new input just to support the assistant.

## Natural-language command execution (Feature)
- The assistant must be able to parse direct instructions and actually execute them against the app's data, not just respond conversationally. Example given: "make task 1 urgent and assign David" should both set task 1's status to Urgent and assign David to it in the same action.
- *(Design discretion)* Scope the initial command set to what's been explicitly requested, rather than trying to cover every possible action up front:
  - Set a task's status (including Urgent)
  - Assign / unassign a member to a task
  - Ask for a suggested chronological order or schedule across a set of tasks
  - Set up an email reminder (with confirmation, per above)
- WHEN a command references a task or person that doesn't resolve unambiguously (e.g. more than one "David" on the project, or an identifier the user doesn't actually use) THEN the system SHALL ask for clarification rather than guessing or silently failing.
- WHEN a command executes successfully THEN the system SHALL confirm what it actually did (e.g. "Set Task 1 to Urgent and assigned David.") so the user isn't left unsure whether it worked.

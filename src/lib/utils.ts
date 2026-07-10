import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

// Single-accent status system: violet-shade for neutral/positive states,
// muted coral (--danger) for anything that needs attention. No other hues.
export function getStatusColor(status: string): string {
  switch (status) {
    case "NOT_STARTED":
      return "bg-[var(--bg-muted)] text-[var(--text-muted)]";
    case "IN_PROGRESS":
      return "bg-[var(--violet-200)] text-[var(--violet-600)]";
    case "AWAITING_APPROVAL":
      return "bg-[var(--violet-100)] text-[var(--violet-600)]";
    case "BLOCKED":
      return "bg-[var(--danger-soft)] text-[var(--danger)]";
    case "REJECTED":
      return "bg-[var(--danger-soft)] text-[var(--danger)]";
    case "COMPLETE":
      return "bg-[var(--accent-soft)] text-[var(--accent)]";
    default:
      return "bg-[var(--bg-muted)] text-[var(--text-muted)]";
  }
}

// Solid-color equivalent for dots/rings/inline styles (SVG fills, borderLeftColor, etc.)
export function getStatusDotColor(status: string): string {
  switch (status) {
    case "NOT_STARTED":
      return "var(--text-muted)";
    case "BLOCKED":
    case "REJECTED":
      return "var(--danger)";
    default:
      return "var(--accent)"; // IN_PROGRESS, AWAITING_APPROVAL, COMPLETE
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "NOT_STARTED":
      return "Not Started";
    case "IN_PROGRESS":
      return "In Progress";
    case "BLOCKED":
      return "Blocked";
    case "AWAITING_APPROVAL":
      return "Awaiting Approval";
    case "REJECTED":
      return "Rejected";
    case "COMPLETE":
      return "Complete";
    default:
      return status;
  }
}

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

export function getStatusColor(status: string): string {
  switch (status) {
    case "NOT_STARTED":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "BLOCKED":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    case "AWAITING_APPROVAL":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
    case "REJECTED":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    case "COMPLETE":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-700";
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

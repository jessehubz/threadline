import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 text-surface-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-surface-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

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
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-400">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-[#1A1A1A]">{title}</h3>
      <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-[#9CA3AF]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

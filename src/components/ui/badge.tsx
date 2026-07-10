import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variants = {
  default: "bg-hover text-body",
  success: "bg-[var(--accent-soft)] text-[var(--accent)]",
  warning: "bg-[var(--danger-soft)] text-[var(--danger)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  info: "bg-[var(--violet-100)] text-[var(--violet-600)]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

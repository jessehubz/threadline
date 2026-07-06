import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variants = {
  default: "bg-surface-100 text-surface-600",
  success: "bg-green-50 text-green-700900300",
  warning: "bg-amber-50 text-amber-700900300",
  danger: "bg-red-50 text-red-700900300",
  info: "bg-blue-50 text-blue-700900300",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}

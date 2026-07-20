import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent-hover)]",
      secondary: "border border-themed bg-card text-heading hover:bg-hover hover:border-themed",
      ghost: "text-body hover:bg-hover hover:text-heading",
      danger: "bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-(--ease-out-strong) active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-px [@media(hover:hover)_and_(pointer:fine)]:active:translate-y-0 [@media(hover:hover)_and_(pointer:fine)]:disabled:hover:translate-y-0",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

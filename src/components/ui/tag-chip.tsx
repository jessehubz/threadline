"use client";

import { X } from "lucide-react";

interface TagChipProps {
  name: string;
  color: string;
  isSystem?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  size?: "sm" | "md";
}

/**
 * TagChip — A small pill-shaped tag with color coding.
 * Supports light/dark mode via CSS custom properties.
 * Follows the .mini-tag pattern from the dashboard reference.
 */
export function TagChip({ name, color, isSystem, onRemove, onClick, size = "sm" }: TagChipProps) {
  const isSmall = size === "sm";

  return (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? "4px" : "6px",
        fontSize: isSmall ? "10.5px" : "12px",
        fontWeight: 600,
        padding: isSmall ? "3px 9px" : "4px 12px",
        borderRadius: "999px",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        flexShrink: 0,
        color: color,
        background: hexToSoftBg(color),
        cursor: onClick || onRemove ? "pointer" : "default",
        transition: "all .18s ease",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        if (onClick || onRemove) {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = `0 0 0 2px ${hexToSoftBg(color)}`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: isSmall ? "12px" : "14px",
            height: isSmall ? "12px" : "14px",
            borderRadius: "50%",
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            padding: 0,
            opacity: 0.7,
            transition: "opacity .15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; }}
          aria-label={`Remove ${name} tag`}
        >
          <X style={{ width: isSmall ? "9px" : "10px", height: isSmall ? "9px" : "10px" }} />
        </button>
      )}
    </span>
  );
}

/**
 * Convert a hex color to a soft background with low opacity.
 * Works in both light and dark mode because it uses rgba with low alpha.
 */
function hexToSoftBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.14)`;
}

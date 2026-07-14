"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

interface TagScrollContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * TagScrollContainer - A horizontal-scroll container for tags.
 *
 * Per spec 04-tags-system.md:
 * - Scrolls horizontally rather than wrapping to multiple lines
 * - Used on project cards and anywhere else tags are displayed
 * - Must remain usable (scrollable, not clipped) on mobile widths
 * - Works in both light and dark mode
 *
 * Features:
 * - Hidden scrollbar (clean look)
 * - Fade indicators when content overflows (visual affordance)
 * - Touch/scroll on mobile
 */
export function TagScrollContainer({ children, className }: TagScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkOverflow = () => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth;
    setShowLeftFade(el.scrollLeft > 2);
    setShowRightFade(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    checkOverflow();
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{ position: "relative", width: "100%" }}
      className={className}
    >
      {/* Left fade indicator */}
      {showLeftFade && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "20px",
            background: "linear-gradient(to right, var(--bg-elevated), transparent)",
            zIndex: 1,
            pointerEvents: "none",
            borderRadius: "999px 0 0 999px",
          }}
        />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={checkOverflow}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "2px",
        }}
      >
        {children}
      </div>

      {/* Right fade indicator */}
      {showRightFade && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "20px",
            background: "linear-gradient(to left, var(--bg-elevated), transparent)",
            zIndex: 1,
            pointerEvents: "none",
            borderRadius: "0 999px 999px 0",
          }}
        />
      )}

      {/* Hide webkit scrollbar via inline style element */}
      <style>{`
        div[data-tag-scroll]::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

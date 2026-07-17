"use client";

import { useReactFlow } from "@xyflow/react";
import { ZoomIn, ZoomOut, LocateFixed, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";

export function CustomControls() {
  const { fitView, zoomIn, zoomOut, getZoom } = useReactFlow();
  const [zoom, setZoom] = useState(100);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setZoom(Math.round(getZoom() * 100));
    }, 200);
    return () => clearInterval(interval);
  }, [getZoom]);

  return (
    <div className="absolute bottom-4 right-4 z-[5] flex items-center gap-1 rounded-xl border border-themed-subtle bg-card px-2.5 py-1.5 shadow-sm">
      <button
        onClick={() => zoomOut()}
        className="rounded-lg p-1.5 text-dim transition-colors hover:bg-hover hover:text-body"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <span className="min-w-[2.5rem] text-center text-xs font-medium text-body">
        {zoom}%
      </span>
      <button
        onClick={() => zoomIn()}
        className="rounded-lg p-1.5 text-dim transition-colors hover:bg-hover hover:text-body"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <div className="mx-1 h-4 w-px bg-hover" />
      <button
        onClick={() => fitView({ padding: 0.3, duration: 300 })}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-dim transition-colors hover:bg-hover hover:text-body"
        aria-label="Recenter"
      >
        <LocateFixed className="h-4 w-4" />
        <span className="text-xs font-medium">Recenter</span>
      </button>
      <div className="mx-1 h-4 w-px bg-hover" />
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="rounded-lg p-1.5 text-dim transition-colors hover:bg-hover hover:text-body"
        aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title={resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
      >
        {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
}

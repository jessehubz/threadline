"use client";

import { useReactFlow } from "@xyflow/react";
import { Maximize2, ZoomIn, ZoomOut, LocateFixed } from "lucide-react";
import { useState, useEffect } from "react";

export function CustomControls() {
  const { fitView, zoomIn, zoomOut, getZoom } = useReactFlow();
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setZoom(Math.round(getZoom() * 100));
    }, 200);
    return () => clearInterval(interval);
  }, [getZoom]);

  return (
    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-xl border border-surface-200/60 bg-white px-2.5 py-1.5 shadow-sm">
      <button
        onClick={() => zoomOut()}
        className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <span className="min-w-[2.5rem] text-center text-xs font-medium text-[#6B7280]">
        {zoom}%
      </span>
      <button
        onClick={() => zoomIn()}
        className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <div className="mx-1 h-4 w-px bg-surface-200" />
      <button
        onClick={() => fitView({ padding: 0.3, duration: 300 })}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
        aria-label="Recenter"
      >
        <LocateFixed className="h-4 w-4" />
        <span className="text-xs font-medium">Recenter</span>
      </button>
    </div>
  );
}

"use client";

import { useReactFlow } from "@xyflow/react";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
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
    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-lg border border-gray-200/50 bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/90">
      <button
        onClick={() => zoomOut()}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[3rem] text-center text-xs text-gray-500 dark:text-gray-400">
        {zoom}%
      </span>
      <button
        onClick={() => zoomIn()}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>
      <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
      <button
        onClick={() => fitView({ padding: 0.2 })}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label="Fit view"
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

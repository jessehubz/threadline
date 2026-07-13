"use client";

import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export function ThemedBezierEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Invisible wider path for easier click targeting */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
      />
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        className={`themed-edge ${selected ? "themed-edge--selected" : ""}`}
      />
    </>
  );
}

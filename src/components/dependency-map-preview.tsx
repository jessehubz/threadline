"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { DepGlyph } from "@/lib/dependency-map";
import { DEP_GLYPH_LABEL } from "@/lib/dependency-map";

export interface DependencyMapNode {
  id: string;
  title: string;
  positionX: number;
  positionY: number;
  dueDate: string | null;
  glyph: DepGlyph;
  waitingOn: number;
  blocks: number;
  isFirstUp: boolean;
}

export interface DependencyMapEdge {
  source: string;
  target: string;
  kind: "done" | "hot" | "";
}

export interface DependencyMapData {
  projectId: string;
  projectName: string;
  nodes: DependencyMapNode[];
  edges: DependencyMapEdge[];
}

const NODE_W = 180;
const NODE_H = 90;
const CANVAS_W = 1044;
const CANVAS_H = 400;
const MARGIN = 18;

function formatDue(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Real editor coordinates, normalized into the fixed preview canvas box — not a fabricated layout. */
function layoutNodes(nodes: DependencyMapNode[]) {
  if (nodes.length === 0) return new Map<string, { x: number; y: number }>();
  const xs = nodes.map((n) => n.positionX);
  const ys = nodes.map((n) => n.positionY);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const targetMaxX = CANVAS_W - NODE_W - MARGIN;
  const targetMaxY = CANVAS_H - NODE_H - MARGIN;
  const scaleX = maxX > minX ? (targetMaxX - MARGIN) / (maxX - minX) : 0;
  const scaleY = maxY > minY ? (targetMaxY - MARGIN) / (maxY - minY) : 0;
  const map = new Map<string, { x: number; y: number }>();
  for (const n of nodes) {
    map.set(n.id, {
      x: MARGIN + (n.positionX - minX) * scaleX,
      y: MARGIN + (n.positionY - minY) * scaleY,
    });
  }
  return map;
}

function buildInsight(nodes: DependencyMapNode[]): { text: string; bold: string[] } {
  const rejected = nodes.find((n) => n.glyph === "rej");
  if (rejected) {
    return { text: `"${rejected.title}" was rejected — rework it to publish`, bold: [rejected.title] };
  }
  const blockers = nodes.filter((n) => n.blocks > 0);
  const blocked = nodes.filter((n) => n.glyph === "blocked");
  if (blockers.length > 0 && blocked.length > 0) {
    const maxBlocks = Math.max(...blockers.map((n) => n.blocks));
    return {
      text: `${blockers.length} task${blockers.length === 1 ? "" : "s"} is blocking ${blocked.length} other${blocked.length === 1 ? "" : "s"}`,
      bold: [`${blockers.length} task${blockers.length === 1 ? "" : "s"}`, `${blocked.length} other${blocked.length === 1 ? "" : "s"}`, String(maxBlocks)],
    };
  }
  const ready = nodes.filter((n) => n.glyph === "ready");
  if (ready.length > 0 && blocked.length === 0) {
    return {
      text: `Nothing is waiting upstream — ${ready.length} task${ready.length === 1 ? "" : "s"} ${ready.length === 1 ? "is" : "are"} ready to start`,
      bold: [`${ready.length} task${ready.length === 1 ? "" : "s"}`],
    };
  }
  const done = nodes.filter((n) => n.glyph === "done").length;
  return { text: `${done} of ${nodes.length} done`, bold: [`${done} of ${nodes.length}`] };
}

function InsightLine({ nodes }: { nodes: DependencyMapNode[] }) {
  const { text, bold } = buildInsight(nodes);
  const parts: Array<{ text: string; bold: boolean }> = [{ text, bold: false }];
  for (const b of bold) {
    const last = parts.pop()!;
    const idx = last.text.indexOf(b);
    if (idx === -1) { parts.push(last); continue; }
    if (idx > 0) parts.push({ text: last.text.slice(0, idx), bold: false });
    parts.push({ text: b, bold: true });
    if (idx + b.length < last.text.length) parts.push({ text: last.text.slice(idx + b.length), bold: false });
  }
  return (
    <span className="insight">
      {parts.map((p, i) => (p.bold ? <b key={i}>{p.text}</b> : <span key={i}>{p.text}</span>))}
    </span>
  );
}

export function DependencyMapPreview({ maps }: { maps: DependencyMapData[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const segRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const active = maps[activeIdx];

  const positions = useMemo(() => (active ? layoutNodes(active.nodes) : new Map()), [active]);

  useEffect(() => {
    const btn = btnRefs.current.get(activeIdx);
    const pill = pillRef.current;
    if (!btn || !pill) return;
    pill.style.width = `${btn.offsetWidth}px`;
    pill.style.transform = `translateX(${btn.offsetLeft - 3}px)`;
  }, [activeIdx, maps.length]);

  const switchTo = (idx: number) => {
    if (idx === activeIdx) return;
    setSwapping(true);
    setTimeout(() => {
      setActiveIdx(idx);
      setSwapping(false);
    }, 180);
  };

  if (maps.length === 0 || !active) {
    return (
      <>
        <div className="dash-sect-head"><h3>Dependency map</h3></div>
        <div className="dash-card dash-map-card">
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--dp-ink-3)", fontSize: "13px" }}>
            No projects with a graph yet.
          </div>
        </div>
      </>
    );
  }

  const presentGlyphs = Array.from(new Set(active.nodes.map((n) => n.glyph)));

  return (
    <>
      <div className="dash-sect-head">
        <h3>Dependency map</h3>
      </div>
      <div className="dash-card dash-map-card">
        <div className="dash-map-head">
          <div className="dash-seg" ref={segRef}>
            <span className="dash-seg-pill" ref={pillRef} />
            {maps.map((m, idx) => (
              <button
                key={m.projectId}
                ref={(el) => { if (el) btnRefs.current.set(idx, el); }}
                className={idx === activeIdx ? "on" : undefined}
                onClick={() => switchTo(idx)}
              >
                {m.projectName}
              </button>
            ))}
          </div>
          <Link className="open-editor" href={`/graph/${active.projectId}`}>
            Open editor
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </Link>
        </div>
        <div className="dash-map-body">
          <div className={`dash-map-canvas${swapping ? " swapping" : ""}`} style={{ minWidth: CANVAS_W, height: CANVAS_H }}>
            <svg className="edges" viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}>
              {active.edges.map((e, i) => {
                const a = positions.get(e.source);
                const b = positions.get(e.target);
                if (!a || !b) return null;
                const x1 = a.x + NODE_W;
                const y1 = a.y + NODE_H / 2;
                const x2 = b.x;
                const y2 = b.y + NODE_H / 2;
                const dx = Math.max(34, (x2 - x1) * 0.5);
                return (
                  <path
                    key={i}
                    className={`dash-edge ${e.kind}`}
                    d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                  />
                );
              })}
            </svg>
            {active.nodes.map((n) => {
              const pos = positions.get(n.id);
              if (!pos) return null;
              const cls = ["dash-tnode"];
              if (n.glyph === "done") cls.push("is-done");
              if (n.glyph === "blocked") cls.push("is-blocked");
              if (n.blocks > 0 && n.glyph !== "done") cls.push("is-blocker");
              const statTxt = n.glyph === "blocked" ? (
                <>Waiting on <span className="waitn num">{n.waitingOn}</span></>
              ) : DEP_GLYPH_LABEL[n.glyph];
              return (
                <div key={n.id} className={cls.join(" ")} style={{ left: pos.x, top: pos.y }}>
                  {n.glyph === "rej" && <span className="badge">Rework</span>}
                  {n.glyph !== "rej" && n.blocks > 0 && n.glyph !== "done" && (
                    <span className="badge">Blocks {n.blocks}</span>
                  )}
                  <div className="tstat">
                    <span className={`dash-g dash-g-${n.glyph}`} />
                    {statTxt}
                  </div>
                  <div className="tt">{n.title}</div>
                  <div className="tm">
                    <span className={`due num${n.isFirstUp ? " hot" : ""}`}>
                      {n.glyph === "blocked" ? "queued" : formatDue(n.dueDate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="dash-map-foot">
          <span className="insight">Scroll to pan · full graph in the editor</span>
          <div className="legend">
            {presentGlyphs.map((g) => (
              <span key={g} className="dash-lg"><span className={`dash-g dash-g-${g}`} />{DEP_GLYPH_LABEL[g]}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

/**
 * Hero dependency-graph demo — ported from design-preview8.html (pivot file).
 * A small graph draws itself in, then "Clear the blocker" cascades readiness
 * downstream. Animations and timings match the pivot exactly.
 */

import { useCallback, useEffect, useRef, useState } from "react";

const H_W = 176;
const H_H = 84;

type Status = "done" | "prog" | "ready" | "blocked";

type NodeDef = {
  id: string;
  t: string;
  who: string;
  meta: string;
  s: Status;
  x: number;
  y: number;
  blocker?: boolean;
  wait?: number;
};

const HN: NodeDef[] = [
  { id: "brief",  t: "Design brief",        who: "MK", meta: "Design · Maya",   s: "done",    x: 16,  y: 56 },
  { id: "schema", t: "API schema",          who: "JT", meta: "Backend · Jonah", s: "done",    x: 16,  y: 306 },
  { id: "ui",     t: "UI design",           who: "AF", meta: "Design · Alex",   s: "done",    x: 221, y: 56 },
  { id: "rate",   t: "Fix API rate limits", who: "JT", meta: "Backend · Jonah", s: "prog",    x: 221, y: 306, blocker: true },
  { id: "fe",     t: "Frontend build",      who: "RS", meta: "Web · Rosa",      s: "blocked", x: 426, y: 56,  wait: 1 },
  { id: "notes",  t: "Ship release notes",  who: "MK", meta: "Release · Maya",  s: "blocked", x: 426, y: 306, wait: 1 },
  { id: "qa",     t: "QA checklist pass",   who: "RS", meta: "Release · Rosa",  s: "blocked", x: 631, y: 181, wait: 1 },
  { id: "launch", t: "Launch",              who: "AF", meta: "Release · Alex",  s: "blocked", x: 836, y: 181, wait: 2 },
];

const HE: [string, string][] = [
  ["brief", "ui"], ["schema", "rate"], ["ui", "fe"], ["rate", "fe"],
  ["rate", "notes"], ["fe", "qa"], ["notes", "launch"], ["qa", "launch"],
];

function edgePath(a: NodeDef, b: NodeDef) {
  const x1 = a.x + H_W, y1 = a.y + H_H / 2, x2 = b.x, y2 = b.y + H_H / 2;
  const bend = Math.max(40, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
}

function spillFor(s: Status, wait?: number): [string, string, string] {
  if (s === "done") return ["sp-done", "dot-done", "Done"];
  if (s === "prog") return ["sp-prog", "dot-prog", "In progress"];
  if (s === "ready") return ["sp-ready", "dot-ready", "Ready"];
  return ["sp-blocked", "dot-blocked", "Waiting on " + (wait ?? 1)];
}

/** Blur-out → swap → blur-in, matching the pivot's blurSwap() helper. */
function useBlurSwap<T>(value: T): { shown: T; swapping: boolean } {
  const [shown, setShown] = useState(value);
  const swapping = !Object.is(value, shown);
  useEffect(() => {
    if (Object.is(value, shown)) return;
    const t = setTimeout(() => setShown(value), 150);
    return () => clearTimeout(t);
  }, [value, shown]);
  return { shown, swapping };
}

function StatusPill({ s, wait, pillText }: { s: Status; wait?: number; pillText?: string }) {
  const { shown, swapping } = useBlurSwap(`${s}|${wait ?? ""}|${pillText ?? ""}`);
  const [shownS, shownWait, shownPill] = shown.split("|");
  const [sc, dc, sl] = spillFor(shownS as Status, shownWait ? Number(shownWait) : undefined);
  return (
    <span className={`spill ${sc}${swapping ? " swapping" : ""}`}>
      <span className={`dot ${dc}`}></span>
      {shownPill || sl}
    </span>
  );
}

function SubText({ text }: { text: string }) {
  const { shown, swapping } = useBlurSwap(text);
  return <span className={`swap${swapping ? " swapping" : ""}`}>{shown}</span>;
}

type NodeState = {
  s: Status;
  wait?: number;
  sub: string;
  pillText?: string;
  freed: boolean;
  cleared: boolean;
};

function initialNodeState(): Record<string, NodeState> {
  const st: Record<string, NodeState> = {};
  for (const n of HN) st[n.id] = { s: n.s, wait: n.wait, sub: n.meta, freed: false, cleared: false };
  return st;
}

export function LandingStage() {
  const [drawn, setDrawn] = useState(false);
  const [settled, setSettled] = useState(false);
  const [nodes, setNodes] = useState<Record<string, NodeState>>(initialNodeState);
  const [flowing, setFlowing] = useState<Set<string>>(new Set());
  const [cascaded, setCascaded] = useState(false);
  const [readout, setReadout] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cascadedRef = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const rmRef = useRef(false);

  const patch = useCallback((id: string, up: Partial<NodeState>) => {
    setNodes(prev => ({ ...prev, [id]: { ...prev[id], ...up } }));
  }, []);

  const flow = useCallback((pairs: [string, string][] | "all", on: boolean) => {
    setFlowing(prev => {
      const next = new Set(prev);
      const keys = pairs === "all" ? HE.map(([a, b]) => `${a}-${b}`) : pairs.map(([a, b]) => `${a}-${b}`);
      for (const k of keys) { if (on) next.add(k); else next.delete(k); }
      return next;
    });
  }, []);

  const runCascade = useCallback(() => {
    if (cascadedRef.current) return;
    cascadedRef.current = true;
    setCascaded(true);
    const rm = rmRef.current;
    const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, rm ? 0 : ms));
    patch("rate", { s: "done", sub: "Done · just now", cleared: true });
    later(() => flow([["rate", "fe"], ["rate", "notes"]], true), 250);
    later(() => patch("fe",    { s: "ready", sub: "Up next · Rosa", freed: true }), 850);
    later(() => patch("notes", { s: "ready", sub: "Up next · Maya", freed: true }), 1020);
    later(() => flow([["fe", "qa"], ["notes", "launch"], ["qa", "launch"]], true), 1350);
    later(() => {
      patch("qa", { sub: "Timeline moved up 2 days" });
      patch("launch", { sub: "Timeline moved up 2 days" });
    }, 1600);
    later(() => setReadout("<b>2 tasks ready</b> · 3 timelines moved up · Rosa &amp; Maya notified"), 2000);
    later(() => flow("all", false), 3600);
  }, [patch, flow]);

  const replay = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    flow("all", false);
    setNodes(initialNodeState());
    setReadout(null);
    setCascaded(false);
    cascadedRef.current = false;
  }, [flow]);

  useEffect(() => {
    rmRef.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const raf = requestAnimationFrame(() => setDrawn(true));
    const unstagger = setTimeout(() => setSettled(true), 1600);
    const auto = rmRef.current ? null : setTimeout(() => runCascade(), 3000 + 380);
    const onWatch = () => {
      stageRef.current?.scrollIntoView({ behavior: rmRef.current ? "auto" : "smooth", block: "center" });
      setTimeout(runCascade, rmRef.current ? 0 : 500);
    };
    window.addEventListener("tl-stage-play", onWatch);
    const localTimers = timers.current;
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(unstagger);
      if (auto) clearTimeout(auto);
      localTimers.forEach(clearTimeout);
      window.removeEventListener("tl-stage-play", onWatch);
    };
  }, [runCascade]);

  return (
    <div className="stage-wrap">
      <div className="stage-frame">
        <div className="stage-top">
          <span className="dotrow"><i></i><i></i><i></i></span>
          <span className="stitle">Launch v2 — dependency graph</span>
          <span className="live-chip"><i></i>LIVE</span>
        </div>
        <div className="stage" id="stage" ref={stageRef}>
          <div className={`stage-inner${drawn ? " drawn" : ""}${settled ? " settled" : ""}`}>
            <svg className="wires">
              {HE.map(([a, b], i) => {
                const d = edgePath(HN.find(n => n.id === a)!, HN.find(n => n.id === b)!);
                return (
                  <g key={`${a}-${b}`}>
                    <path
                      className="hedge"
                      d={d}
                      pathLength={1}
                      style={{
                        strokeDasharray: 1,
                        strokeDashoffset: drawn ? 0 : 1,
                        transition: `stroke-dashoffset 700ms cubic-bezier(0.23,1,0.32,1) ${380 + i * 90}ms`,
                      }}
                    />
                    <path className={`hedge-flow${flowing.has(`${a}-${b}`) ? " flowing" : ""}`} d={d} />
                  </g>
                );
              })}
            </svg>
            {HN.map((n, i) => {
              const st = nodes[n.id];
              const cls = ["hnode"];
              if (st.s === "blocked" && !st.freed) cls.push("blocked");
              if (n.blocker) cls.push("hero-blocker");
              if (st.freed) cls.push("freed");
              if (st.cleared) cls.push("cleared");
              return (
                <div
                  key={n.id}
                  className={cls.join(" ")}
                  style={{
                    left: n.x, top: n.y,
                    ["--sd" as string]: `${i * 70}ms`,
                    ["--bd" as string]: `${(i % 4) * 900}ms`,
                  }}
                >
                  <span className="nhead">
                    <StatusPill s={st.s} wait={st.wait} pillText={st.pillText} />
                    <span className="ava">{n.who}</span>
                  </span>
                  <span className="nt">{n.t}</span>
                  <span className="nm"><SubText text={st.sub} /></span>
                </div>
              );
            })}
            <div
              className={`stage-cta${cascaded ? " gone" : ""}`}
              style={{ left: 221 + H_W / 2, top: 306 + H_H + 14 }}
            >
              <button className="btn btn-blue" onClick={runCascade}>Clear the blocker</button>
            </div>
          </div>
          <div
            className={`stage-readout${readout ? " show" : ""}`}
            dangerouslySetInnerHTML={{ __html: readout ?? "" }}
          />
          <button className={`mini-btn stage-replay${readout ? " show" : ""}`} onClick={replay}>
            Replay
          </button>
        </div>
      </div>
      <div className="stage-under">
        <span className="li"><span className="dot dot-done"></span>Done</span>
        <span className="li"><span className="dot dot-prog"></span>In progress</span>
        <span className="li"><span className="dot dot-ready"></span>Ready</span>
        <span className="li"><span className="dot dot-blocked"></span>Waiting upstream</span>
      </div>
    </div>
  );
}

/** Hero "Watch it flow" link — scrolls to the stage and plays the cascade. */
export function WatchItFlow() {
  return (
    <button
      className="applelink"
      onClick={() => window.dispatchEvent(new Event("tl-stage-play"))}
    >
      Watch it flow <span className="chev">›</span>
    </button>
  );
}

"use client";

/**
 * Feature stations — ported from design-preview8.html (pivot file).
 * A vertical thread fills as you scroll; each station "completes" as it passes.
 * Five interactive vignettes: roles, live sync, timing, focused view, assistant.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

// st-node check draws in via stroke-dash (needs pathLength); perm-mark check
// just fades. Both carry explicit fill="none" so no inherited fill can blob them.
const NODE_CHECK = (
  <svg viewBox="0 0 10 10" fill="none"><path pathLength={1} fill="none" d="M2 5.4 l 2.2 2.2 L 8 2.6" /></svg>
);
const CHECK = (
  <svg viewBox="0 0 10 10" fill="none"><path fill="none" d="M2 5.4 l 2.2 2.2 L 8 2.6" /></svg>
);

function useBlurSwapText(text: string): { shown: string; swapping: boolean } {
  const [shown, setShown] = useState(text);
  const swapping = text !== shown;
  useEffect(() => {
    if (text === shown) return;
    const t = setTimeout(() => setShown(text), 150);
    return () => clearTimeout(t);
  }, [text, shown]);
  return { shown, swapping };
}

function SwapBtn({ label, onClick, className = "mini-btn" }: { label: string; onClick: () => void; className?: string }) {
  const { shown, swapping } = useBlurSwapText(label);
  return (
    <button className={`${className} lblswap${swapping ? " swapping" : ""}`} onClick={onClick}>
      <span className="lbl">{shown}</span>
    </button>
  );
}

/* ─── Station shell: copy · thread gutter · vignette ─── */

function Station({
  id, title, copy, state, children,
}: {
  id: string; title: string; copy: string;
  state: { active: boolean; passed: boolean };
  children: ReactNode;
}) {
  const stateLabel = useBlurSwapText(state.passed ? "Done" : "Queued");
  return (
    <div
      className={`station${state.active ? " active" : ""}${state.passed ? " passed" : ""}`}
      data-station
    >
      <div className="st-copy">
        <div className="st-idrow">
          <span className="st-id">{id}</span>
          <span className={`st-state${stateLabel.swapping ? " swapping" : ""}`}>{stateLabel.shown}</span>
        </div>
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
      <div className="st-gut">
        <span className="fillseg" data-fillseg></span>
        <span className="st-node">{NODE_CHECK}</span>
      </div>
      {children}
    </div>
  );
}

/* ─── TL-01 · Roles ─── */

type RoleKey = "head" | "cohead" | "member";
const PERMS: Record<RoleKey, Record<string, [boolean, string]>> = {
  head:   { invite: [true, ""],  edit: [true, "any task"],       roles: [true, ""],           delete: [true, ""] },
  cohead: { invite: [true, ""],  edit: [true, "any task"],       roles: [false, "Head only"], delete: [false, "Head only"] },
  member: { invite: [false, ""], edit: [true, "own tasks only"], roles: [false, ""],          delete: [false, ""] },
};
const PERM_LABELS: [string, string][] = [
  ["invite", "Invite & remove members"],
  ["edit", "Edit tasks"],
  ["roles", "Assign roles"],
  ["delete", "Delete the project"],
];

function PermRow({ label, ok, note }: { label: string; ok: boolean; note: string }) {
  const n = useBlurSwapText(note);
  return (
    <div className={`perm-row ${ok ? "ok" : "off"}`}>
      <span className="perm-mark">{CHECK}</span>
      {label}
      <span className={`pnote${n.swapping ? " swapping" : ""}`}>{n.shown}</span>
    </div>
  );
}

function RoleVig() {
  const [role, setRole] = useState<RoleKey>("cohead");
  return (
    <div className="vig">
      <div className="role-row">
        {(["head", "cohead", "member"] as RoleKey[]).map(r => (
          <button
            key={r}
            className={`role-pick${role === r ? " on" : ""}`}
            onClick={() => setRole(r)}
          >
            {r === "head" ? "Head" : r === "cohead" ? "Co-head" : "Member"}
          </button>
        ))}
      </div>
      <div className="perm-list">
        {PERM_LABELS.map(([key, label]) => (
          <PermRow key={key} label={label} ok={PERMS[role][key][0]} note={PERMS[role][key][1]} />
        ))}
      </div>
      <p className="vig-cap">Green = allowed for this role, on this project.</p>
    </div>
  );
}

/* ─── TL-02 · Live ─── */

function LivePane({ label, removed, restored }: { label: string; removed: boolean; restored: boolean }) {
  return (
    <div className="pane">
      <div className="pl">{label}</div>
      <div className="mrow"><span className="ava">MK</span><span className="mn">Maya K.</span><span className="mc num">5 tasks</span></div>
      <div className={`mrow-wrap${removed ? " gone" : ""}`}>
        <div>
          <div className="mrow">
            <span className="ava">JT</span><span className="mn">Jonah T.</span>
            <span className={`mc num${restored ? " restored" : ""}`}>3 tasks</span>
          </div>
        </div>
      </div>
      <div className="mrow"><span className="ava">RS</span><span className="mn">Rosa S.</span><span className="mc num">4 tasks</span></div>
    </div>
  );
}

function LiveVig() {
  const [removed, setRemoved] = useState(false);
  const [restored, setRestored] = useState(false);
  const [cap, setCap] = useState<ReactNode>("Both screens, one truth.");
  const toggle = () => {
    const next = !removed;
    setRemoved(next);
    if (!next) {
      setRestored(true);
      setTimeout(() => setRestored(false), 1400);
      setCap(<>Re-added — <b>3 assignments restored</b>, both screens.</>);
    } else {
      setCap("Gone from both screens in the same second.");
    }
  };
  return (
    <div className="vig">
      <div className="panes">
        <LivePane label="Your screen" removed={removed} restored={restored} />
        <LivePane label="Rosa’s screen" removed={removed} restored={restored} />
      </div>
      <div className="vig-actions">
        <SwapBtn label={removed ? "Re-add Jonah" : "Remove Jonah"} onClick={toggle} />
        <span className="vig-cap" style={{ marginTop: 0 }}>{cap}</span>
      </div>
    </div>
  );
}

/* ─── TL-03 · Timing ─── */

function TimeVig() {
  const [hasTime, setHasTime] = useState(true);
  return (
    <div className="vig">
      <div className="sched-task">
        <span className="dot dot-prog"></span>
        <b>Send beta invites</b>
        <span className={`when-chip num${hasTime ? "" : " default"}`}>
          {hasTime ? "Fri Aug 1 · 10:30 AM" : "Fri Aug 1 · 11:59 PM"}
        </span>
      </div>
      <div className="ruler">
        <span className="rline"></span>
        <span className="tick major" style={{ left: "0%" }}></span><span className="tlabel" style={{ left: "0%" }}>9 AM</span>
        <span className="tick" style={{ left: "10%" }}></span>
        <span className="tick major" style={{ left: "20%" }}></span><span className="tlabel" style={{ left: "20%" }}>12 PM</span>
        <span className="tick" style={{ left: "30%" }}></span><span className="tick" style={{ left: "50%" }}></span>
        <span className="tick major" style={{ left: "40%" }}></span><span className="tlabel" style={{ left: "40%" }}>3 PM</span>
        <span className="tick" style={{ left: "70%" }}></span><span className="tick" style={{ left: "80%" }}></span><span className="tick" style={{ left: "90%" }}></span>
        <span className="tick major" style={{ left: "60%" }}></span><span className="tlabel" style={{ left: "60%" }}>6 PM</span>
        <span className="tick major" style={{ left: "98.5%" }}></span><span className="tlabel" style={{ left: "98.5%" }}>11:59</span>
        <span className={`marker${hasTime ? "" : " default"}`} style={{ left: hasTime ? "10%" : "98.5%" }}></span>
      </div>
      <div className="timeset">
        <button className={`mini-btn${hasTime ? " sel" : ""}`} onClick={() => setHasTime(true)}>10:30 AM set</button>
        <button className={`mini-btn${hasTime ? "" : " sel"}`} onClick={() => setHasTime(false)}>No time set</button>
      </div>
      <p className="vig-cap">
        {hasTime
          ? "A set time pins the marker where you put it."
          : <>No time given — filed at <b>11:59 PM, end of day</b>, automatically.</>}
      </p>
    </div>
  );
}

/* ─── TL-04 · Focus ─── */

const FOCUS_ROWS: [string, string][] = [
  ["dot-done", "Freeze feature list"],
  ["dot-prog", "Regression pass"],
  ["dot-blocked", "Invite beta cohort"],
];

function FocusVig() {
  const [viewing, setViewing] = useState(false);
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  return (
    <div className={`vig${viewing ? " viewing" : ""}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <b style={{ fontSize: 15, letterSpacing: "-0.012em" }}>Mobile beta</b>
        <span className="view-tag">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M1 6 C 2.6 3.4 4.2 2.2 6 2.2 C 7.8 2.2 9.4 3.4 11 6 C 9.4 8.6 7.8 9.8 6 9.8 C 4.2 9.8 2.6 8.6 1 6 Z" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="6" cy="6" r="1.6" fill="currentColor" />
          </svg>
          View only
        </span>
        <span style={{ marginLeft: "auto" }}></span>
        <div className={`mini-seg${viewing ? " right" : ""}`}>
          <button className={viewing ? "" : "on"} onClick={() => setViewing(false)}>Edit</button>
          <button className={viewing ? "on" : ""} onClick={() => setViewing(true)}>View</button>
          <span className="thumb"></span>
        </div>
      </div>
      <div className="focus-list">
        {FOCUS_ROWS.map(([dot, label], i) => (
          <div className="focus-row" key={label}>
            <span className="focus-ui" style={{ width: 12 }}><span className="grip">⠿</span></span>
            <button
              className="chk focus-ui"
              style={{ width: 20, background: checked[i] ? "var(--blue)" : undefined }}
              aria-label="toggle"
              onClick={() => setChecked(c => c.map((v, j) => (j === i ? !v : v)))}
            ></button>
            <span className="stglyph"><span className={`dot ${dot}`}></span></span>
            {label}
            <span className="dots focus-ui" style={{ width: 14 }}>⋯</span>
          </div>
        ))}
      </div>
      <div className="focus-ui" style={{ display: "block", marginTop: 12 }}>
        <button className="mini-btn">+ Add task</button>
      </div>
      <p className="vig-cap">Same project, two audiences.</p>
    </div>
  );
}

/* ─── TL-05 · Assistant ─── */

const PLAN_ROWS: [string, string, string][] = [
  ["Freeze the feature list", "", "Aug 21 · 5:00 PM"],
  ["Full regression pass", "waits on 1", "Aug 28 · 5:00 PM"],
  ["Invite the beta cohort", "waits on 2", "Sep 4 · 10:00 AM"],
  ["Ship to TestFlight", "waits on 3", "Sep 11 · 9:00 AM"],
];

function PlanVig() {
  const [inRows, setInRows] = useState<boolean[]>(PLAN_ROWS.map(() => false));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const played = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const play = () => {
    const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setInRows(PLAN_ROWS.map(() => false));
    PLAN_ROWS.forEach((_, i) => {
      timers.current.push(setTimeout(
        () => setInRows(rows => rows.map((v, j) => (j === i ? true : v))),
        rm ? 0 : 200 + i * 170,
      ));
    });
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(en => {
      if (en[0].isIntersecting && !played.current) {
        played.current = true;
        play();
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    const localTimers = timers.current;
    return () => { io.disconnect(); localTimers.forEach(clearTimeout); };
  }, []);

  return (
    <div className="vig" ref={rootRef}>
      <div className="plan-mini">
        <div className="ph">
          <svg width="11" height="11" viewBox="0 0 12 12"><path d="M6 0.8 L11.2 6 L6 11.2 L0.8 6 Z" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
          Assistant · Plan mode
        </div>
        <div className="prompt"><span className="pfx">You</span>Beta ships Sep 12 — plan the launch.</div>
        <div className="rows">
          {PLAN_ROWS.map(([t, dep, when], i) => (
            <div className={`prow${inRows[i] ? " in" : ""}`} key={t}>
              <i></i>{t}<span className="dep">{dep}</span><span className="pw num">{when}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="vig-actions">
        <SwapBtn label="Replay" onClick={play} />
        <span className="vig-cap" style={{ marginTop: 0 }}>4 tasks, ordered by dependency — inserted straight into the graph.</span>
      </div>
    </div>
  );
}

/* ─── Stations rail with the scroll-driven thread ─── */

const STATIONS = [
  {
    id: "TL-01 · Roles",
    title: "Three roles, with real edges.",
    copy: "Head, Co-head, Member — assigned per project, not per account. Permissions follow the role, so a Member on one project can still run another as Head.",
    Vig: RoleVig,
  },
  {
    id: "TL-02 · Live",
    title: "No refresh button. Ever.",
    copy: "Names, photos, removals, re-adds — every screen agrees in the same second. Re-add a member and their assignments come back with them.",
    Vig: LiveVig,
  },
  {
    id: "TL-03 · Timing",
    title: "Due dates, down to the minute.",
    copy: "Deadlines take a time, not just a day. Skip the time and threadline quietly files it at 11:59 PM — the end of the day, so nothing slips to tomorrow unnoticed.",
    Vig: TimeVig,
  },
  {
    id: "TL-04 · Focus",
    title: "A view for people who just need to see.",
    copy: "Flip any project to a read-only view: the edit chrome dissolves and only the state of the work remains. Built for stakeholders, clients, and calm.",
    Vig: FocusVig,
  },
  {
    id: "TL-05 · Assistant",
    title: "An assistant that plans, not chats.",
    copy: "Describe the goal and the deadline. The assistant answers with an ordered plan — owners, times, and the dependencies already wired into the graph.",
    Vig: PlanVig,
  },
];

export function LandingStations() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [flags, setFlags] = useState(STATIONS.map(() => ({ active: false, passed: false })));

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(wrap.querySelectorAll<HTMLElement>("[data-station]"));
    const fills = els.map(el => ({ el, seg: el.querySelector<HTMLElement>("[data-fillseg]")!, fill: 0 }));
    let raf = 0;
    const frame = () => {
      const vh = window.innerHeight;
      fills.forEach((st, i) => {
        const rect = st.el.getBoundingClientRect();
        const segH = rect.height + 116;
        const target = Math.max(0, Math.min(vh * 0.55 - (rect.top - 58), segH));
        st.fill = rm ? target : st.fill + (target - st.fill) * 0.16;
        if (Math.abs(st.fill - target) < 0.5) st.fill = target;
        st.seg.style.transform = `scaleY(${(st.fill / segH).toFixed(4)})`;
        const passed = st.fill > segH * 0.52;
        const active = !passed && rect.top < vh * 0.82;
        setFlags(prev => {
          if (prev[i].passed === passed && prev[i].active === active) return prev;
          const next = [...prev];
          next[i] = { active, passed };
          return next;
        });
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="stations-wrap" ref={wrapRef}>
      {STATIONS.map(({ id, title, copy, Vig }, i) => (
        <Station key={id} id={id} title={title} copy={copy} state={flags[i]}>
          <Vig />
        </Station>
      ))}
    </div>
  );
}

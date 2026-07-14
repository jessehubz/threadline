<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Threadline — Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --ink: #0A0A0B;
    --surface: #151517;
    --surface-raised: #1C1C1F;
    --hairline: rgba(255,255,255,0.08);
    --text-1: #F2F2F4;
    --text-2: #98989F;
    --text-3: #626268;
    --violet-deep: #4C1D95;
    --violet: #8B5CF6;
    --violet-bright: #A78BFA;
    --orchid: #C4B5FD;
    --danger: var(--violet-deep);
    --shadow-1: 0 1px 2px rgba(0,0,0,0.3), 0 6px 14px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04);
    --shadow-2: 0 2px 4px rgba(0,0,0,0.4), 0 8px 18px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
    --radius-xl: 28px;
    --radius-lg: 22px;
    --radius-md: 16px;
    --radius-sm: 10px;
  }
  html[data-theme="light"] {
    --ink: #F5F5F6;
    --surface: #FFFFFF;
    --surface-raised: #FFFFFF;
    --hairline: rgba(20,20,25,0.08);
    --text-1: #17171A;
    --text-2: #75757C;
    --text-3: #A6A6AD;
    --violet-deep: #6D28D9;
    --violet: #7C3AED;
    --violet-bright: #8B5CF6;
    --orchid: #7C3AED;
    --danger: var(--violet-deep);
    --shadow-1: 0 1px 2px rgba(0,0,0,0.05), 0 6px 14px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.6);
    --shadow-2: 0 2px 4px rgba(0,0,0,0.08), 0 8px 18px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7);
  }

- { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--ink);
  color: var(--text-1);
  transition: background-color .4s ease, color .4s ease;
  -webkit-font-smoothing: antialiased;
  }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .nested-value, .ring-value, .task-count, .stat-line-value { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
  svg { display: block; }

@media (prefers-reduced-motion: reduce) {
*, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}

/* ============================================================ _/
/_ DASHBOARD _/
/_ ============================================================ */
.dash-wrap { max-width: 1520px; margin: 0 auto; padding: 20px 28px 90px; }

/* Navbar — two quiet rows: brand alone on the left, search + notifications + profile clustered together on the right (so there's no dead gap in between), full primary navigation below. Containers stay a neutral recessed tone (var(--ink)); violet only ever marks the active item, never sits as ambient background wash. */
.navbar {
background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--radius-xl);
padding: 16px 20px; box-shadow: var(--shadow-1); margin-bottom: 26px;
display: flex; flex-direction: column; gap: 14px;
}
.navbar-row { display: flex; align-items: center; }
.navbar-row-top { justify-content: space-between; gap: 24px; }
.navbar-row-nav { border-top: 1px solid var(--hairline); padding-top: 14px; }
.navbar-utility-group { display: flex; align-items: center; gap: 14px; }

.nav-pills { display: flex; align-items: center; gap: 2px; background: var(--ink); border-radius: 999px; padding: 4px; overflow-x: auto; scrollbar-width: none; }
.nav-pills::-webkit-scrollbar { display: none; }
.nav-pill { display: flex; align-items: center; gap: 7px; padding: 8px 15px; border-radius: 999px; font-size: 13.5px; font-weight: 500; color: var(--text-2); cursor: pointer; transition: all .18s ease; white-space: nowrap; flex-shrink: 0; }
.nav-pill:hover { color: var(--text-1); background: rgba(139,92,246,0.08); }
.nav-pill.active { background: var(--violet); color: #fff; }
.nav-pill.active:hover { background: var(--violet); }
.nav-divider { width: 1px; height: 22px; background: var(--hairline); margin: 0 6px; flex-shrink: 0; }

/* Search — a sensible fixed width instead of stretching to fill the row; nudges wider on focus */
.navbar-search { width: 250px; display: flex; align-items: center; gap: 9px; background: var(--ink); border: 1px solid var(--hairline); border-radius: 999px; padding: 9px 16px; color: var(--text-3); transition: all .2s ease; }
.navbar-search:focus-within { border-color: var(--violet); width: 290px; }
.navbar-search svg { flex-shrink: 0; }
.navbar-search input { flex: 1; min-width: 0; background: transparent; border: none; outline: none; color: var(--text-1); font-family: inherit; font-size: 13.5px; }
.navbar-search input::placeholder { color: var(--text-3); }

.nav-right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.icon-btn { position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 999px; color: var(--text-2); cursor: pointer; transition: all .18s ease; }
.icon-btn:hover { background: rgba(139,92,246,0.08); color: var(--text-1); transform: translateY(-1px); }
.icon-btn .notif-dot { position: absolute; top: 6px; right: 6px; width: 7px; height: 7px; border-radius: 50%; background: var(--violet-bright); border: 2px solid var(--surface); }
.theme-switch { display: flex; align-items: center; gap: 2px; background: var(--ink); border-radius: 999px; padding: 3px; }
.theme-switch-btn { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-2); cursor: pointer; transition: all .18s ease; }
.theme-switch-btn:hover { color: var(--text-1); }
.theme-switch-btn.active { background: var(--violet); color: #fff; }
.avatar-group { display: flex; align-items: center; gap: 7px; cursor: pointer; margin-left: 6px; padding: 4px 6px 4px 4px; border-radius: 999px; transition: background .18s ease; }
.avatar-group:hover { background: rgba(139,92,246,0.07); }
.avatar { width: 34px; height: 34px; border-radius: 999px; background: linear-gradient(135deg, var(--violet-bright), var(--violet-deep)); color: #fff; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-chevron { color: var(--text-3); flex-shrink: 0; }

/* HERO — greeting + live context on the left; a compact health/remaining-work snapshot on the right. Flat surface, no glow, no gradient. */
.dash-hero {
position: relative; overflow: hidden;
display: grid; grid-template-columns: 1.4fr 1fr; gap: 36px; align-items: center;
background: var(--surface);
border: 1px solid var(--hairline); border-radius: var(--radius-xl); box-shadow: var(--shadow-2);
padding: 42px 46px; margin-bottom: 20px;
animation: fadeSlideUp .5s ease both;
}
.dash-hero-content { position: relative; z-index: 1; }
.dash-badges { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; }
.dash-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--text-2); background: rgba(139,92,246,0.07); border: 1px solid var(--hairline); padding: 8px 15px; border-radius: 999px; }
.dash-badge .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--violet-bright); box-shadow: 0 0 0 3px rgba(139,92,246,0.18); flex-shrink: 0; }
.dash-hero h1 { font-size: 52px; font-weight: 200; letter-spacing: -0.02em; line-height: 1.08; margin-bottom: 18px; }
.dash-hero h1 b { font-weight: 700; background: linear-gradient(120deg, var(--violet-bright), var(--violet-deep)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.dash-hero p { font-size: 16.5px; color: var(--text-2); line-height: 1.6; max-width: 480px; margin-bottom: 30px; }

.snapshot-card { position: relative; z-index: 1; background: var(--ink); border: 1px solid var(--hairline); border-radius: var(--radius-lg); box-shadow: var(--shadow-2); overflow: hidden; }
.snapshot-body { padding: 32px; }
.snapshot-stat-label { font-size: 12.5px; font-weight: 600; color: var(--text-2); margin-bottom: 10px; }
.snapshot-stat-value-row { display: flex; align-items: center; gap: 12px; }
.snapshot-big-num { font-size: 44px; font-weight: 200; letter-spacing: -0.02em; line-height: 1; color: var(--text-1); }
.snapshot-health { display: flex; align-items: center; gap: 24px; margin-bottom: 28px; }
.snapshot-tasks-row { margin-bottom: 28px; }
.snapshot-tasks-row .stat-sub { font-size: 13.5px; color: var(--text-2); }
.snapshot-breakdown { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
.snap-bd-item { background: var(--surface); border: 1px solid var(--hairline); border-radius: 12px; padding: 13px 8px; text-align: center; }
.snap-bd-item .n { font-size: 18px; font-weight: 700; }
.snap-bd-item .l { font-size: 9.5px; color: var(--text-3); text-transform: uppercase; letter-spacing: .04em; margin-top: 4px; }

.mini-tag { font-size: 10.5px; font-weight: 600; padding: 3px 9px; border-radius: 999px; letter-spacing: .02em; }
.mini-tag.good { color: var(--violet-bright); background: rgba(167,139,250,0.14); }
.mini-tag.neutral { color: var(--text-2); background: var(--hairline); }
#miniRing { transition: stroke-dashoffset 1.2s cubic-bezier(.22,.9,.3,1); }
.ring-anim { transition: stroke-dashoffset 1.1s cubic-bezier(.22,.9,.3,1); }

/* AI banner — standalone strip; used to sit inside the old Overview box, which the hero now replaces */
.ai-banner { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--radius-lg); box-shadow: var(--shadow-1); padding: 16px 22px; margin-bottom: 20px; animation: fadeSlideUp .5s ease both; }
.ai-badge { display: flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 700; letter-spacing: .03em; color: var(--violet-bright); background: rgba(139,92,246,0.12); padding: 5px 11px; border-radius: 999px; flex-shrink: 0; }
.ai-insight-text { font-size: 13.5px; color: var(--text-2); }
.ai-insight-text b { color: var(--text-1); font-weight: 600; }

/* MY PROJECTS — a real card grid with filter tabs, not a horizontal scroller */
.projects-section { margin-bottom: 20px; animation: fadeSlideUp .5s ease both; }
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; gap: 16px; flex-wrap: wrap; }
.section-head h2 { font-size: 18px; font-weight: 700; }
.section-sub { font-size: 12.5px; color: var(--text-3); margin-top: 4px; }
.search-box { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--hairline); border-radius: 999px; padding: 9px 16px; font-size: 13px; color: var(--text-3); width: 210px; }

.tab-bar { display: inline-flex; align-items: center; gap: 2px; background: var(--surface); border: 1px solid var(--hairline); border-radius: 999px; padding: 5px; box-shadow: var(--shadow-1); margin-bottom: 22px; flex-wrap: wrap; }
.tab-pill { padding: 9px 18px; border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--text-2); cursor: pointer; white-space: nowrap; transition: all .18s ease; }
.tab-pill:hover { color: var(--text-1); }
.tab-pill.active { background: var(--violet); color: #fff; }

.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.project-card[data-extra="true"] { display: none; }
.projects-toggle { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; padding: 12px; border-radius: 999px; border: 1px solid var(--hairline); color: var(--text-2); font-size: 13px; font-weight: 600; cursor: pointer; transition: all .18s ease; }
.projects-toggle:hover { border-color: var(--violet); color: var(--violet-bright); background: rgba(139,92,246,0.05); }
.projects-toggle .toggle-chevron { transition: transform .2s ease; }
.projects-toggle.expanded .toggle-chevron { transform: rotate(180deg); }
.project-card { position: relative; background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--radius-lg); box-shadow: var(--shadow-1); padding: 26px; transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
.project-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-2); border-color: rgba(139,92,246,0.28); }
.project-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.project-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
.project-name { font-size: 17px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.01em; }
.project-meta { font-size: 13px; color: var(--text-2); line-height: 1.55; margin-bottom: 18px; min-height: 38px; }
.project-progress-track { height: 5px; border-radius: 999px; background: var(--hairline); overflow: hidden; margin-bottom: 18px; }
.project-progress-fill { height: 100%; background: var(--violet); border-radius: 999px; }
.project-divider { height: 1px; background: var(--hairline); margin-bottom: 14px; }
.project-footer-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.project-updated { font-size: 11.5px; color: var(--text-3); display: inline-flex; align-items: center; gap: 5px; }
.project-updated.stale { color: var(--violet-bright); }
.project-open { font-size: 13px; font-weight: 700; color: var(--violet-bright); display: inline-flex; align-items: center; gap: 4px; cursor: pointer; transition: gap .18s ease; white-space: nowrap; }
.project-open:hover { gap: 8px; }

/* SECOND ROW: needs attention + friends (replaces the old workload capsule view) */
.second-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.panel { background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--radius-xl); box-shadow: var(--shadow-1); padding: 26px; animation: fadeSlideUp .5s ease both; }
.panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.panel-title { font-size: 15px; font-weight: 700; }
.panel-sub { font-size: 12px; color: var(--text-3); margin-top: 2px; font-weight: 400; }

.attn-row { display: flex; gap: 14px; padding: 13px 0; border-left: 3px solid var(--danger); padding-left: 16px; margin-bottom: 4px; border-radius: 4px; transition: background-color .15s ease; }
.attn-row.amber { border-color: var(--danger); }
.attn-row.calm { border-color: var(--violet-bright); }
.attn-row:hover { background: rgba(139,92,246,0.05); }
.attn-text { font-size: 13.5px; line-height: 1.45; }
.attn-text b { font-weight: 600; }
.attn-time { font-size: 11px; color: var(--text-3); margin-top: 3px; }

.friends-list { display: flex; flex-direction: column; }
.friend-row { display: flex; align-items: center; gap: 14px; padding: 13px 0; border-bottom: 1px solid var(--hairline); }
.friend-row:last-child { border-bottom: none; }
.friend-avatar-wrap { position: relative; flex-shrink: 0; }
.friend-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 700; color: #fff; }
.status-dot { position: absolute; bottom: -1px; right: -1px; width: 11px; height: 11px; border-radius: 50%; border: 2.5px solid var(--surface); }
.status-dot.online { background: var(--violet-bright); }
.status-dot.offline { background: var(--text-3); }
.friend-info { flex: 1; min-width: 0; }
.friend-name { font-size: 13.5px; font-weight: 600; margin-bottom: 2px; }
.friend-status-text { font-size: 11.5px; color: var(--text-3); }
.friend-health { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.friend-health-label { font-size: 12.5px; font-weight: 700; text-align: right; }
.friend-health-sub { font-size: 10.5px; color: var(--text-3); text-align: right; }

/* DEADLINES — segmented tabs instead of an accordion */
.deadlines-panel { margin-bottom: 20px; }
.deadlines-tabbar { display: flex; gap: 4px; background: var(--ink); border-radius: 999px; padding: 5px; margin-bottom: 18px; }
.deadline-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--text-2); cursor: pointer; transition: all .18s ease; }
.deadline-tab:hover { color: var(--text-1); }
.deadline-tab.active { background: var(--surface-raised); color: var(--text-1); box-shadow: var(--shadow-1); }
.deadline-tab .count { font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 999px; background: rgba(139,92,246,0.14); color: var(--violet-bright); }
.deadline-tab.active .count { background: var(--violet); color: #fff; }
.deadline-panel-body { display: none; }
.deadline-panel-body.active { display: block; animation: fadeIn .3s ease both; }
.deadline-task-row { display: flex; align-items: center; gap: 14px; padding: 13px 8px; border-radius: 10px; transition: background-color .15s ease; }
.deadline-task-row:hover { background: rgba(139,92,246,0.05); }
.dtr-check { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--text-3); flex-shrink: 0; cursor: pointer; transition: all .18s ease; }
.dtr-check:hover { border-color: var(--violet-bright); background: rgba(139,92,246,0.1); }
.dtr-title { flex: 1; font-size: 13.5px; font-weight: 500; min-width: 0; }
.dtr-tag { font-size: 10.5px; font-weight: 600; padding: 3px 10px; border-radius: 999px; white-space: nowrap; flex-shrink: 0; }
.dtr-when { font-size: 12px; color: var(--text-3); white-space: nowrap; flex-shrink: 0; width: 52px; text-align: right; }
.deadline-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 38px 20px; gap: 10px; color: var(--text-3); }
.deadline-empty .msg { font-size: 13.5px; color: var(--text-2); font-weight: 500; }

/* FOOTER */
.dash-footer { margin-top: 4px; background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--radius-xl); box-shadow: var(--shadow-1); padding: 40px 44px 26px; animation: fadeSlideUp .5s ease both; }
.footer-top { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 32px; padding-bottom: 30px; border-bottom: 1px solid var(--hairline); }
.footer-tagline { font-size: 13px; color: var(--text-2); line-height: 1.6; max-width: 240px; margin: 12px 0 20px; }
.footer-dev-label { font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); margin-bottom: 8px; }
.footer-dev-names { font-size: 12.5px; color: var(--text-2); margin-bottom: 18px; line-height: 1.8; }
.footer-dev-names b { color: var(--text-1); font-weight: 600; }
.footer-dev-names .sep { color: var(--text-3); margin: 0 8px; }
.footer-social { display: flex; gap: 10px; }
.footer-social a { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--hairline); display: flex; align-items: center; justify-content: center; color: var(--text-2); transition: all .18s ease; cursor: pointer; }
.footer-social a:hover { border-color: var(--violet); color: var(--violet-bright); transform: translateY(-2px); }
.footer-col-title { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-3); margin-bottom: 16px; }
.footer-col a { display: block; font-size: 13.5px; color: var(--text-2); text-decoration: none; margin-bottom: 12px; transition: color .15s ease; }
.footer-col a:hover { color: var(--text-1); }
.footer-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 22px; flex-wrap: wrap; gap: 12px; }
.footer-bottom-links { display: flex; gap: 20px; font-size: 12.5px; color: var(--text-2); }
.footer-bottom-links a { color: inherit; text-decoration: none; }
.footer-bottom-links a:hover { color: var(--text-1); }
.footer-meta { display: flex; align-items: center; gap: 14px; font-size: 11.5px; color: var(--text-3); }
.footer-version-tag { font-family: 'JetBrains Mono', monospace; background: var(--hairline); padding: 3px 9px; border-radius: 6px; }

@media (max-width: 900px) {
.dash-hero { grid-template-columns: 1fr; }
.second-row { grid-template-columns: 1fr; }
.footer-top { grid-template-columns: 1fr 1fr; }
.navbar-search { width: 190px; }
}
@media (max-width: 640px) {
.dash-wrap { padding: 14px 14px 90px; }
.navbar-row-nav { display: none; }
.navbar-search { display: none; }
.deadlines-tabbar { flex-direction: column; }
.dtr-when { width: auto; }
.footer-top { grid-template-columns: 1fr; }
.footer-bottom { flex-direction: column; align-items: flex-start; }
}
</style>
</head>
<body>

<div class="dash-wrap">

  <nav class="navbar">
    <div class="navbar-row navbar-row-top">
      <div class="word"><span class="t1">Thread</span><span class="t2">line</span></div>
      <div class="navbar-utility-group">
        <div class="navbar-search">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8.5" cy="8.5" r="6"/><line x1="13" y1="13" x2="17.5" y2="17.5" stroke-linecap="round"/></svg>
          <input type="text" placeholder="Search...">
        </div>
        <div class="nav-right">
          <div class="icon-btn">
            <svg width="16" height="16" viewBox="0 0 20 20"><path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H8l-4 3v-3H3a1 1 0 01-1-1V5a1 1 0 011-1z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
            <span class="notif-dot"></span>
          </div>
          <div class="icon-btn">
            <svg width="16" height="16" viewBox="0 0 20 20"><path d="M10 2a5 5 0 00-5 5v3.5L3.5 13.5A1 1 0 004.3 15h11.4a1 1 0 00.8-1.5L15 10.5V7a5 5 0 00-5-5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 17a2 2 0 004 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <span class="notif-dot"></span>
          </div>
          <div class="theme-switch">
            <div class="theme-switch-btn active" id="btn-dark" onclick="setTheme('dark')" title="Dark mode"><svg width="14" height="14" viewBox="0 0 20 20"><path d="M15.5 12.5A6.5 6.5 0 017.5 4.5a6.5 6.5 0 108 8z" fill="currentColor"/></svg></div>
            <div class="theme-switch-btn" id="btn-light" onclick="setTheme('light')" title="Light mode"><svg width="14" height="14" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="10" y1="1.5" x2="10" y2="3.5"/><line x1="10" y1="16.5" x2="10" y2="18.5"/><line x1="1.5" y1="10" x2="3.5" y2="10"/><line x1="16.5" y1="10" x2="18.5" y2="10"/></g></svg></div>
          </div>
          <div class="nav-divider"></div>
          <div class="avatar-group">
            <div class="avatar">D</div>
            <svg class="avatar-chevron" width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l5 5 5-5"/></svg>
          </div>
        </div>
      </div>
    </div>

    <div class="navbar-row navbar-row-nav">
      <div class="nav-pills">
        <div class="nav-pill active">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/></svg>
          Dashboard
        </div>
        <div class="nav-pill">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="4" y="3" width="12" height="14" rx="2"/><rect x="7" y="1.3" width="6" height="3" rx="1"/><line x1="6.5" y1="9" x2="13.5" y2="9" stroke-linecap="round"/><line x1="6.5" y1="12.5" x2="13.5" y2="12.5" stroke-linecap="round"/></svg>
          Overview
        </div>
        <div class="nav-pill">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4" width="14" height="13" rx="2"/><line x1="3" y1="8" x2="17" y2="8"/><path d="M7 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Tasks
        </div>
        <div class="nav-pill">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H8l-4 3v-3H3a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg>
          Messages
        </div>
        <div class="nav-divider"></div>
        <div class="nav-pill">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4.5" width="14" height="12.5" rx="2"/><line x1="3" y1="8.5" x2="17" y2="8.5"/><line x1="6.5" y1="2.5" x2="6.5" y2="5.5" stroke-linecap="round"/><line x1="13.5" y1="2.5" x2="13.5" y2="5.5" stroke-linecap="round"/></svg>
          Calendar
        </div>
        <div class="nav-pill">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="17" x2="4" y2="10"/><line x1="10" y1="17" x2="10" y2="5"/><line x1="16" y1="17" x2="16" y2="12"/></svg>
          Analytics
        </div>
        <div class="nav-pill">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="7" cy="7" r="2.5"/><circle cx="14" cy="7" r="2.5"/><path d="M2.5 16c.5-3 2-4.5 4.5-4.5s4 1.5 4.5 4.5"/><path d="M11.5 16c.4-2.4 1.6-3.7 3.3-4"/></svg>
          Team
        </div>
        <div class="nav-pill">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8" cy="7" r="3"/><path d="M2.5 17c.5-3.5 2.5-5.5 5.5-5.5s5 2 5.5 5.5"/><line x1="15" y1="6" x2="15" y2="10"/><line x1="13" y1="8" x2="17" y2="8"/></svg>
          Friends
        </div>
      </div>
    </div>

  </nav>

  <!-- HERO — replaces the old plain page-header. Left: greeting + live context badges + primary action. Right: a compact "workspace snapshot" card surfacing health + remaining work at a glance. No gradient, no glow — flat surface throughout. -->
  <div class="dash-hero">
    <div class="dash-hero-content">
      <div class="dash-badges">
        <span class="dash-badge"><span class="live-dot"></span>Synced just now</span>
        <span class="dash-badge">10 projects · 3 need attention</span>
      </div>
      <h1>Good morning, <b>David.</b></h1>
      <p>Here's what's moving, what's stuck, and what needs a nudge — all in one place before you dive in.</p>
      <button class="btn-primary">
        <span class="btn-icon-circle">
          <svg width="12" height="12" viewBox="0 0 20 20"><line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </span>
        New Project
      </button>
    </div>

    <div class="snapshot-card">
      <div class="snapshot-body">
        <div class="snapshot-health">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="30" fill="none" stroke="var(--hairline)" stroke-width="7"/>
            <circle id="miniRing" cx="40" cy="40" r="30" fill="none" stroke="var(--violet-bright)" stroke-width="7" stroke-linecap="round" stroke-dasharray="188" stroke-dashoffset="188" transform="rotate(-90 40 40)"/>
          </svg>
          <div class="snapshot-health-info">
            <div class="snapshot-stat-label">Health score</div>
            <div class="snapshot-stat-value-row">
              <span class="snapshot-big-num">72</span>
              <span class="mini-tag good">On track</span>
            </div>
          </div>
        </div>
        <div class="snapshot-tasks-row">
          <div class="snapshot-stat-label">Tasks remaining</div>
          <div class="snapshot-stat-value-row">
            <span class="snapshot-big-num">8</span>
            <span class="stat-sub">across 10 projects</span>
          </div>
        </div>
        <div class="snapshot-breakdown">
          <div class="snap-bd-item"><div class="n">0</div><div class="l">Today</div></div>
          <div class="snap-bd-item"><div class="n">0</div><div class="l">This Week</div></div>
          <div class="snap-bd-item"><div class="n">8</div><div class="l">Later</div></div>
        </div>
      </div>
    </div>

  </div>

  <div class="ai-banner" style="animation-delay:.05s;">
    <span class="ai-badge">
      <svg width="12" height="12" viewBox="0 0 20 20"><path d="M10 2c.4 3 2 5 5 5.5-3 .5-4.6 2.5-5 5.5-.4-3-2-5-5-5.5 3-.5 4.6-2.5 5-5.5z" fill="currentColor"/></svg>
      AI Insight
    </span>
    <span class="ai-insight-text"><b>testbeta</b> hasn't moved in 4 days — might be worth a quick check-in.</span>
  </div>

  <!-- MY PROJECTS — redesigned as a card grid (icon, status, description, progress, open link) with real filter tabs above it. -->
  <div class="projects-section" style="animation-delay:.1s;">
    <div class="section-head">
      <div>
        <h2>My Projects</h2>
        <div class="section-sub">10 projects · 3 need your attention</div>
      </div>
      <div class="search-box"><svg width="14" height="14" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="13" y1="13" x2="17.5" y2="17.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>Search projects...</div>
    </div>

    <div class="tab-bar">
      <div class="tab-pill active" onclick="filterProjects('all', this)">All Projects</div>
      <div class="tab-pill" onclick="filterProjects('notstarted', this)">Not Started</div>
      <div class="tab-pill" onclick="filterProjects('ongoing', this)">Ongoing</div>
      <div class="tab-pill" onclick="filterProjects('draft', this)">Draft</div>
    </div>

    <div class="projects-grid">
      <div class="project-card" data-status="ongoing">
        <div class="project-card-top">
          <div class="project-icon" style="background:rgba(167,139,250,0.16); color:var(--violet-bright);">T</div>
          <span class="mini-tag good">Ongoing</span>
        </div>
        <div class="project-name">testbeta</div>
        <div class="project-meta">Confirming user availability ahead of the pilot kickoff.</div>
        <div class="project-progress-track"><div class="project-progress-fill" style="width:2%; background:var(--violet-bright);"></div></div>
        <div class="project-divider"></div>
        <div class="project-footer-row">
          <span class="project-updated stale">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2"/></svg>
            Updated 4d ago
          </span>
          <span class="project-open">Open<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h11M11 5l5 5-5 5"/></svg></span>
        </div>
      </div>

      <div class="project-card" data-status="ongoing">
        <div class="project-card-top">
          <div class="project-icon" style="background:rgba(139,92,246,0.16); color:var(--violet);">N</div>
          <span class="mini-tag good">Ongoing</span>
        </div>
        <div class="project-name">Northwind Redesign</div>
        <div class="project-meta">Refreshing the marketing site ahead of the Q3 launch.</div>
        <div class="project-progress-track"><div class="project-progress-fill" style="width:45%; background:var(--violet);"></div></div>
        <div class="project-divider"></div>
        <div class="project-footer-row">
          <span class="project-updated">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2"/></svg>
            Updated 2h ago
          </span>
          <span class="project-open">Open<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h11M11 5l5 5-5 5"/></svg></span>
        </div>
      </div>

      <div class="project-card" data-status="ongoing">
        <div class="project-card-top">
          <div class="project-icon" style="background:rgba(76,29,149,0.16); color:var(--violet-deep);">G</div>
          <span class="mini-tag good">Ongoing</span>
        </div>
        <div class="project-name">Gateway v2</div>
        <div class="project-meta">Migrating internal services to the new API gateway.</div>
        <div class="project-progress-track"><div class="project-progress-fill" style="width:68%; background:var(--violet-deep);"></div></div>
        <div class="project-divider"></div>
        <div class="project-footer-row">
          <span class="project-updated">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2"/></svg>
            Updated 5h ago
          </span>
          <span class="project-open">Open<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h11M11 5l5 5-5 5"/></svg></span>
        </div>
      </div>

      <div class="project-card" data-status="notstarted">
        <div class="project-card-top">
          <div class="project-icon" style="background:rgba(76,29,149,0.16); color:var(--violet-deep);">A</div>
          <span class="mini-tag neutral">Not started</span>
        </div>
        <div class="project-name">adsasdad</div>
        <div class="project-meta">Onboarding flow and first-week setup for new hires.</div>
        <div class="project-progress-track"><div class="project-progress-fill" style="width:4%;"></div></div>
        <div class="project-divider"></div>
        <div class="project-footer-row">
          <span class="project-updated stale">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2"/></svg>
            Updated 17h ago
          </span>
          <span class="project-open">Open<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h11M11 5l5 5-5 5"/></svg></span>
        </div>
      </div>

      <div class="project-card" data-status="ongoing">
        <div class="project-card-top">
          <div class="project-icon" style="background:rgba(167,139,250,0.16); color:var(--violet-bright);">C</div>
          <span class="mini-tag good">Ongoing</span>
        </div>
        <div class="project-name">Customer Portal</div>
        <div class="project-meta">Self-serve billing and account management for customers.</div>
        <div class="project-progress-track"><div class="project-progress-fill" style="width:30%; background:var(--violet-bright);"></div></div>
        <div class="project-divider"></div>
        <div class="project-footer-row">
          <span class="project-updated">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2"/></svg>
            Updated 3d ago
          </span>
          <span class="project-open">Open<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h11M11 5l5 5-5 5"/></svg></span>
        </div>
      </div>

      <div class="project-card" data-status="notstarted">
        <div class="project-card-top">
          <div class="project-icon" style="background:rgba(196,181,253,0.18); color:var(--orchid);">N</div>
          <span class="mini-tag neutral">Not started</span>
        </div>
        <div class="project-name">new proj</div>
        <div class="project-meta">Early-stage planning — requirements still being scoped.</div>
        <div class="project-progress-track"><div class="project-progress-fill" style="width:2%; background:var(--orchid);"></div></div>
        <div class="project-divider"></div>
        <div class="project-footer-row">
          <span class="project-updated stale">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2"/></svg>
            Updated 4d ago
          </span>
          <span class="project-open">Open<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h11M11 5l5 5-5 5"/></svg></span>
        </div>
      </div>

      <div class="project-card" data-status="notstarted" data-extra="true">
        <div class="project-card-top">
          <div class="project-icon" style="background:rgba(196,181,253,0.18); color:var(--orchid);">M</div>
          <span class="mini-tag neutral">Not started</span>
        </div>
        <div class="project-name">Marketing Site Refresh</div>
        <div class="project-meta">New landing pages for the upcoming campaign.</div>
        <div class="project-progress-track"><div class="project-progress-fill" style="width:0%;"></div></div>
        <div class="project-divider"></div>
        <div class="project-footer-row">
          <span class="project-updated">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2"/></svg>
            Updated 6d ago
          </span>
          <span class="project-open">Open<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h11M11 5l5 5-5 5"/></svg></span>
        </div>
      </div>

      <div class="project-card" data-status="notstarted" data-extra="true">
        <div class="project-card-top">
          <div class="project-icon" style="background:rgba(139,92,246,0.16); color:var(--violet);">I</div>
          <span class="mini-tag neutral">Not started</span>
        </div>
        <div class="project-name">Internal Tools Audit</div>
        <div class="project-meta">Reviewing internal tooling for consolidation opportunities.</div>
        <div class="project-progress-track"><div class="project-progress-fill" style="width:5%; background:var(--violet);"></div></div>
        <div class="project-divider"></div>
        <div class="project-footer-row">
          <span class="project-updated">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2"/></svg>
            Updated 8h ago
          </span>
          <span class="project-open">Open<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h11M11 5l5 5-5 5"/></svg></span>
        </div>
      </div>

      <div class="project-card" data-status="draft" data-extra="true">
        <div class="project-card-top">
          <div class="project-icon" style="background:transparent; border:1.5px dashed var(--text-3); color:var(--text-3);">N</div>
          <span class="mini-tag neutral">Draft</span>
        </div>
        <div class="project-name">new proj</div>
        <div class="project-meta">Empty draft — add tasks to bring this one to life.</div>
        <div class="project-progress-track"><div class="project-progress-fill" style="width:0%;"></div></div>
        <div class="project-divider"></div>
        <div class="project-footer-row">
          <span class="project-updated">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2"/></svg>
            Updated 4d ago
          </span>
          <span class="project-open">Open<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h11M11 5l5 5-5 5"/></svg></span>
        </div>
      </div>

      <div class="project-card" data-status="draft" data-extra="true">
        <div class="project-card-top">
          <div class="project-icon" style="background:transparent; border:1.5px dashed var(--text-3); color:var(--text-3);">Q</div>
          <span class="mini-tag neutral">Draft</span>
        </div>
        <div class="project-name">Q3 Roadmap</div>
        <div class="project-meta">Draft roadmap — pending leadership review.</div>
        <div class="project-progress-track"><div class="project-progress-fill" style="width:0%;"></div></div>
        <div class="project-divider"></div>
        <div class="project-footer-row">
          <span class="project-updated">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2"/></svg>
            Updated 2d ago
          </span>
          <span class="project-open">Open<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h11M11 5l5 5-5 5"/></svg></span>
        </div>
      </div>
    </div>

    <div class="projects-toggle" id="projectsToggleBtn" onclick="toggleProjectsExpanded()">
      <span class="toggle-label">Show all 10 projects</span>
      <svg class="toggle-chevron" width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l5 5 5-5"/></svg>
    </div>

  </div>

  <!-- SECOND ROW: needs attention + friends (replaces the old workload capsule view) -->
  <div class="second-row" style="animation-delay:.15s;">
    <div class="panel">
      <div class="panel-head"><div><div class="panel-title">Needs Attention</div><div class="panel-sub">Surfaced automatically</div></div></div>
      <div class="attn-row amber">
        <div><div class="attn-text"><b>testbeta</b> hasn't completed any tasks yet.</div><div class="attn-time">Just now</div></div>
      </div>
      <div class="attn-row amber">
        <div><div class="attn-text"><b>new proj</b> has no tasks assigned.</div><div class="attn-time">2h ago</div></div>
      </div>
      <div class="attn-row amber">
        <div><div class="attn-text"><b>adsasdad</b> is still at 0% after 17 hours.</div><div class="attn-time">17h ago</div></div>
      </div>
      <div class="attn-row calm">
        <div><div class="attn-text">Nothing is currently blocked.</div><div class="attn-time">Today</div></div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><div><div class="panel-title">Friends</div><div class="panel-sub">Who's around right now</div></div></div>
      <div class="friends-list">
        <div class="friend-row">
          <div class="friend-avatar-wrap">
            <div class="friend-avatar" style="background:var(--violet);">A</div>
            <span class="status-dot online"></span>
          </div>
          <div class="friend-info">
            <div class="friend-name">Ana R.</div>
            <div class="friend-status-text">Active now</div>
          </div>
          <div class="friend-health">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="var(--hairline)" stroke-width="3.2"/>
              <circle class="ring-anim" data-offset="55.54" cx="16" cy="16" r="13" fill="none" stroke="var(--violet-bright)" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="81.68" stroke-dashoffset="81.68" transform="rotate(-90 16 16)"/>
            </svg>
            <div>
              <div class="friend-health-label" style="color:var(--violet-bright);">32%</div>
              <div class="friend-health-sub">Light load</div>
            </div>
          </div>
        </div>

        <div class="friend-row">
          <div class="friend-avatar-wrap">
            <div class="friend-avatar" style="background:var(--orchid);">M</div>
            <span class="status-dot online"></span>
          </div>
          <div class="friend-info">
            <div class="friend-name">Marcus D.</div>
            <div class="friend-status-text">Active now</div>
          </div>
          <div class="friend-health">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="var(--hairline)" stroke-width="3.2"/>
              <circle class="ring-anim" data-offset="9.80" cx="16" cy="16" r="13" fill="none" stroke="var(--violet-deep)" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="81.68" stroke-dashoffset="81.68" transform="rotate(-90 16 16)"/>
            </svg>
            <div>
              <div class="friend-health-label" style="color:var(--violet-deep);">88%</div>
              <div class="friend-health-sub">Stacked</div>
            </div>
          </div>
        </div>

        <div class="friend-row">
          <div class="friend-avatar-wrap">
            <div class="friend-avatar" style="background:var(--violet-bright);">P</div>
            <span class="status-dot offline"></span>
          </div>
          <div class="friend-info">
            <div class="friend-name">Priya N.</div>
            <div class="friend-status-text">Offline · 2h ago</div>
          </div>
          <div class="friend-health">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="var(--hairline)" stroke-width="3.2"/>
              <circle class="ring-anim" data-offset="31.86" cx="16" cy="16" r="13" fill="none" stroke="var(--violet)" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="81.68" stroke-dashoffset="81.68" transform="rotate(-90 16 16)"/>
            </svg>
            <div>
              <div class="friend-health-label" style="color:var(--violet);">61%</div>
              <div class="friend-health-sub">Busy</div>
            </div>
          </div>
        </div>

        <div class="friend-row">
          <div class="friend-avatar-wrap">
            <div class="friend-avatar" style="background:var(--violet-deep);">L</div>
            <span class="status-dot offline"></span>
          </div>
          <div class="friend-info">
            <div class="friend-name">Leo K.</div>
            <div class="friend-status-text">Offline · 1d ago</div>
          </div>
          <div class="friend-health">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="var(--hairline)" stroke-width="3.2"/>
              <circle class="ring-anim" data-offset="66.98" cx="16" cy="16" r="13" fill="none" stroke="var(--violet-bright)" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="81.68" stroke-dashoffset="81.68" transform="rotate(-90 16 16)"/>
            </svg>
            <div>
              <div class="friend-health-label" style="color:var(--violet-bright);">18%</div>
              <div class="friend-health-sub">Light load</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- DEADLINES — segmented tabs instead of an accordion, with a calm empty state for the buckets that are actually empty. -->
  <div class="panel deadlines-panel" style="animation-delay:.2s;">
    <div class="panel-head"><div><div class="panel-title">Deadlines</div><div class="panel-sub">What's due, sorted by urgency</div></div></div>

    <div class="deadlines-tabbar">
      <div class="deadline-tab" onclick="showDeadlineTab('today', this)">Today <span class="count">0</span></div>
      <div class="deadline-tab" onclick="showDeadlineTab('week', this)">This Week <span class="count">0</span></div>
      <div class="deadline-tab active" onclick="showDeadlineTab('later', this)">Later <span class="count">8</span></div>
    </div>

    <div id="dl-today" class="deadline-panel-body">
      <div class="deadline-empty">
        <svg width="32" height="32" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M6.5 10.5l2.3 2.3L14 8"/></svg>
        <div class="msg">Nothing due today. Nice.</div>
      </div>
    </div>
    <div id="dl-week" class="deadline-panel-body">
      <div class="deadline-empty">
        <svg width="32" height="32" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M6.5 10.5l2.3 2.3L14 8"/></svg>
        <div class="msg">Clear for the rest of the week.</div>
      </div>
    </div>
    <div id="dl-later" class="deadline-panel-body active">
      <div class="deadline-task-row">
        <div class="dtr-check"></div>
        <div class="dtr-title">Set up onboarding flow</div>
        <span class="dtr-tag" style="color:var(--violet-deep); background:rgba(76,29,149,0.14);">adsasdad</span>
        <div class="dtr-when">Jul 28</div>
      </div>
      <div class="deadline-task-row">
        <div class="dtr-check"></div>
        <div class="dtr-title">Check user availability</div>
        <span class="dtr-tag" style="color:var(--violet-bright); background:rgba(167,139,250,0.14);">testbeta</span>
        <div class="dtr-when">Aug 2</div>
      </div>
      <div class="deadline-task-row">
        <div class="dtr-check"></div>
        <div class="dtr-title">Draft initial requirements</div>
        <span class="dtr-tag" style="color:var(--orchid); background:rgba(196,181,253,0.15);">new proj</span>
        <div class="dtr-when">Aug 5</div>
      </div>
    </div>

  </div>

  <!-- FOOTER — structure borrows from the reference (brand + developed-by + social, then link columns, then a legal/version bar), trimmed to what actually applies to Threadline. -->
  <footer class="dash-footer" style="animation-delay:.25s;">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="word" style="margin-bottom:12px;"><span class="t1">Thread</span><span class="t2">line</span></div>
        <p class="footer-tagline">Every thread, one place. Built for teams who'd rather ship than chase status updates.</p>
        <div class="footer-dev-label">Developed by</div>
        <div class="footer-dev-names"><b>Jordan Vale</b><span class="sep">·</span><b>Mei Sato</b><span class="sep">·</span><b>Theo Bramwell</b></div>
        <div class="footer-social">
          <a href="#" title="Email"><svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"><rect x="2.5" y="4.5" width="15" height="11" rx="2"/><path d="M3 5.5l7 5.5 7-5.5"/></svg></a>
          <a href="#" title="Website"><svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5c2.5 2 2.5 13 0 15M10 2.5c-2.5 2-2.5 13 0 15" stroke-linecap="round"/></svg></a>
          <a href="#" title="Community"><svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"><path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H8l-4 3v-3H3a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg></a>
        </div>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Product</div>
        <a href="#">Features</a><a href="#">Pricing</a><a href="#">Integrations</a><a href="#">Changelog</a>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Resources</div>
        <a href="#">Help Center</a><a href="#">Docs</a><a href="#">API</a><a href="#">Blog</a>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Company</div>
        <a href="#">About</a><a href="#">Careers</a><a href="#">Contact</a>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-bottom-links"><a href="#">Terms of Use</a><a href="#">Privacy Policy</a></div>
      <div class="footer-meta">
        <span>© 2026 Threadline</span>
        <span class="footer-version-tag">v1.4.0</span>
        <a href="#" style="color:inherit; text-decoration:none;">Send feedback</a>
      </div>
    </div>
  </footer>

</div>

<script>
  function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    document.getElementById('btn-light').classList.toggle('active', mode === 'light');
    document.getElementById('btn-dark').classList.toggle('active', mode === 'dark');
  }
  let projectsExpanded = false;
  let currentProjectFilter = 'all';

  function filterProjects(status, el) {
    document.querySelectorAll('.tab-bar .tab-pill').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    currentProjectFilter = status;
    updateProjectsView();
  }

  function toggleProjectsExpanded() {
    projectsExpanded = !projectsExpanded;
    updateProjectsView();
  }

  function updateProjectsView() {
    document.querySelectorAll('.project-card').forEach(card => {
      const statusMatch = currentProjectFilter === 'all' || card.dataset.status === currentProjectFilter;
      const isExtra = card.dataset.extra === 'true';
      const hiddenByCollapse = currentProjectFilter === 'all' && isExtra && !projectsExpanded;
      card.style.display = (statusMatch && !hiddenByCollapse) ? 'block' : 'none';
    });
    const toggleBtn = document.getElementById('projectsToggleBtn');
    if (toggleBtn) {
      toggleBtn.style.display = currentProjectFilter === 'all' ? 'flex' : 'none';
      toggleBtn.classList.toggle('expanded', projectsExpanded);
      toggleBtn.querySelector('.toggle-label').textContent = projectsExpanded ? 'Show less' : 'Show all 10 projects';
    }
  }
  function showDeadlineTab(name, el) {
    document.querySelectorAll('.deadline-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.deadline-panel-body').forEach(p => p.classList.remove('active'));
    document.getElementById('dl-' + name).classList.add('active');
  }
  setTheme('dark');
  window.addEventListener('load', () => {
    setTimeout(() => {
      const ring = document.getElementById('miniRing');
      if (ring) ring.style.strokeDashoffset = 188 - (188 * 0.72);
      document.querySelectorAll('.ring-anim').forEach(r => {
        r.style.strokeDashoffset = r.getAttribute('data-offset');
      });
    }, 200);
  });
</script>

</body>
</html>

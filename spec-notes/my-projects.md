<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>My Projects — Redesign v5</title>
<style>
  :root {
    /* ---- color tokens (from real dashboard screenshot) ---- */
    --bg: #0a0a0d;
    --surface: #131317;
    --surface-inset: #1b1b20;
    --surface-hover: #202027;
    --border: rgba(255,255,255,0.08);
    --border-strong: rgba(255,255,255,0.16);
    --text: #f4f4f6;
    --text-muted: #98999a;
    --text-faint: #6c6d78;
    --accent: #7c6ff0;
    --accent-bright: #a78bfa;
    --accent-soft: rgba(124,111,240,0.16);
    --accent-soft-border: rgba(124,111,240,0.32);
    --tag-blue-bg: rgba(59,130,246,0.16);
    --tag-blue-text: #93c5fd;
    --tag-red-bg: rgba(239,68,68,0.16);
    --tag-red-text: #fca5a5;

    /* ---- shape hierarchy: pill = compact controls, rounded-rect = wide containers ---- */
    --radius-container: 20px;
    --radius-md: 12px;
    --radius-sm: 8px;
    --radius-pill: 999px;

    /* ---- 4px spacing scale ---- */
    --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
    --sp-5: 20px; --sp-6: 24px; --sp-7: 28px; --sp-8: 32px;
    --sp-10: 40px; --sp-12: 48px;

    /* ---- type scale ---- */
    --fs-display: 28px;
    --fs-body: 14px;
    --fs-ui: 13px;
    --fs-small: 12px;
    --fs-micro: 11px;

    --ease: cubic-bezier(0.22, 0.8, 0.24, 1);
    --shadow-hover: 0 14px 34px rgba(0,0,0,0.5), 0 0 0 1px var(--border-strong);

    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: radial-gradient(1100px 560px at 10% -8%, rgba(124,111,240,0.08), transparent 60%), var(--bg);
    color: var(--text);
    padding: var(--sp-12) var(--sp-6);
    min-height: 100vh;
    font-variant-numeric: tabular-nums;
  }

  .page { max-width: 1180px; margin: 0 auto; }

  .note {
    color: var(--text-faint); font-size: var(--fs-micro); letter-spacing: 0.06em;
    margin-bottom: var(--sp-8); text-transform: uppercase; font-weight: 600;
  }

  /* ---- global quality floor: focus + motion ---- */
  a, button, input, [tabindex], .status-tab, .tag-filter-chip {
    outline: none;
  }
  a:focus-visible, button:focus-visible, input:focus-visible,
  .status-tab:focus-visible, .tag-filter-chip:focus-visible {
    outline: 2px solid var(--accent-bright);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      transition-duration: 0.001ms !important;
    }
  }

  /* ---------- Header row ---------- */
  .projects-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: var(--sp-6); flex-wrap: wrap; margin-bottom: var(--sp-6);
  }
  .projects-heading h1 {
    margin: 0 0 var(--sp-1) 0; font-size: var(--fs-display); font-weight: 700; letter-spacing: -0.02em;
  }
  .projects-heading p { margin: 0; color: var(--text-muted); font-size: var(--fs-body); }
  .projects-actions { display: flex; align-items: center; gap: var(--sp-2); }

  .search-input {
    display: flex; align-items: center; gap: var(--sp-2);
    background: var(--surface-inset); border: 1px solid var(--border); border-radius: var(--radius-pill);
    padding: var(--sp-3) var(--sp-4); width: 300px;
    transition: border-color 0.18s var(--ease), background 0.18s var(--ease);
  }
  .search-input:focus-within { border-color: var(--accent-soft-border); background: var(--surface-hover); }
  .search-input svg { flex-shrink: 0; color: var(--text-faint); }
  .search-input input {
    background: transparent; border: none; outline: none; color: var(--text);
    font-size: var(--fs-ui); width: 100%; font-family: inherit;
  }
  .search-input input::placeholder { color: var(--text-faint); }

  .btn-new {
    display: flex; align-items: center; gap: var(--sp-2); background: var(--accent); color: white;
    border: none; border-radius: var(--radius-pill); padding: var(--sp-3) var(--sp-5);
    font-size: var(--fs-ui); font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap;
    box-shadow: 0 4px 14px rgba(124,111,240,0.3);
    transition: transform 0.18s var(--ease), box-shadow 0.18s var(--ease), filter 0.18s var(--ease);
  }
  .btn-new:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(124,111,240,0.4); filter: brightness(1.08); }
  .btn-new:active { transform: translateY(0) scale(0.97); }

  /* ---------- Merged filter bar: rounded-rect container, pill controls inside ---------- */
  .filters-block { margin-bottom: var(--sp-6); }

  .filter-bar {
    display: flex; align-items: center; gap: var(--sp-4);
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-container);
    padding: var(--sp-2); width: 100%;
  }

  .status-tabs { position: relative; display: inline-flex; align-items: center; flex-shrink: 0; }

  .tab-indicator {
    position: absolute; top: 3px; bottom: 3px; left: 0; width: 0;
    background: var(--accent); border-radius: var(--radius-pill);
    transition: left 0.32s var(--ease), width 0.32s var(--ease);
    z-index: 0;
  }

  .status-tab {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: var(--sp-1);
    padding: var(--sp-2) var(--sp-4); border-radius: var(--radius-pill);
    font-size: var(--fs-ui); font-weight: 600; color: var(--text-muted);
    cursor: pointer; white-space: nowrap;
    transition: color 0.32s var(--ease);
  }
  .status-tab:hover { color: var(--text); }
  .status-tab.active { color: white; }
  .status-tab .tab-count {
    font-size: var(--fs-micro); font-weight: 700; opacity: 0.65;
  }

  .filter-divider {
    width: 1px; align-self: stretch; margin: var(--sp-1) 0; flex-shrink: 0;
    background: linear-gradient(to bottom, transparent, var(--border-strong) 25%, var(--border-strong) 75%, transparent);
  }

  .tags-row-wrap { position: relative; flex: 1; min-width: 0; }
  .tags-row-wrap::after {
    content: ""; position: absolute; top: 0; right: 0; bottom: 0; width: 36px;
    background: linear-gradient(to right, transparent, var(--surface));
    opacity: 0; transition: opacity 0.2s var(--ease); pointer-events: none;
  }
  .tags-row-wrap.has-overflow::after { opacity: 1; }

  .tags-row {
    display: flex; align-items: center; gap: var(--sp-2); overflow-x: auto;
    padding: var(--sp-1) var(--sp-7) var(--sp-1) var(--sp-1);
    scrollbar-width: none;
  }
  .tags-row::-webkit-scrollbar { display: none; }
  .tags-row .tag-icon-lead { flex-shrink: 0; color: var(--text-faint); display: flex; align-items: center; padding-right: var(--sp-1); }

  .tag-filter-chip {
    flex-shrink: 0; display: flex; align-items: center; gap: var(--sp-1);
    background: transparent; border: 1px solid var(--border); color: var(--text-muted);
    font-size: var(--fs-small); font-weight: 600; padding: var(--sp-2) var(--sp-3);
    border-radius: var(--radius-pill); cursor: pointer;
    transition: background 0.18s var(--ease), border-color 0.18s var(--ease), color 0.18s var(--ease), transform 0.1s var(--ease);
  }
  .tag-filter-chip:hover { background: var(--surface-hover); color: var(--text); }
  .tag-filter-chip:active { transform: scale(0.95); }
  .tag-filter-chip.active { background: var(--accent-soft); border-color: var(--accent-soft-border); color: var(--accent-bright); }
  .tag-filter-chip .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* ---------- Cards — BYTE-FOR-BYTE UNCHANGED from the locked version ---------- */
  .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(255px, 1fr)); gap: 18px; }

  .project-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);
    padding: 20px; cursor: pointer; transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    opacity: 0; transform: translateY(10px);
    animation: card-in 0.45s var(--ease) forwards;
  }
  @keyframes card-in { to { opacity: 1; transform: translateY(0); } }
  .project-card:nth-child(1) { animation-delay: 0.03s; }
  .project-card:nth-child(2) { animation-delay: 0.08s; }
  .project-card:nth-child(3) { animation-delay: 0.13s; }
  .project-card:nth-child(4) { animation-delay: 0.18s; }
  .project-card:nth-child(5) { animation-delay: 0.23s; }

  .project-card:hover { transform: translateY(-3px); border-color: var(--border-strong); box-shadow: var(--shadow-hover); }
  .project-card.hidden-extra { display: none; }
  .projects-grid.expanded .project-card.hidden-extra { display: block; animation: card-in 0.35s var(--ease) forwards; }

  .card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
  .avatar-square {
    width: 42px; height: 42px; border-radius: 10px; background: var(--accent-soft);
    display: flex; align-items: center; justify-content: center; color: var(--accent-bright);
    font-weight: 700; font-size: 16px;
  }
  .status-pill { font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
  .status-pill.ongoing { background: var(--accent-soft); color: var(--accent-bright); }
  .status-pill.not-started, .status-pill.draft { background: rgba(255,255,255,0.06); color: var(--text-muted); }

  .card-title { font-size: 17px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.01em; }
  .card-meta { font-size: 13px; color: var(--text-faint); margin-bottom: 16px; }

  .progress-row { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--text-faint); margin-bottom: 6px; }
  .progress-track { height: 5px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; margin-bottom: 16px; }
  .progress-fill { height: 100%; border-radius: 999px; background: var(--accent); }

  .card-tags { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; margin-bottom: 18px; scrollbar-width: none; mask-image: linear-gradient(90deg, #000 88%, transparent 100%); }
  .card-tags::-webkit-scrollbar { display: none; }
  .tag-chip { flex-shrink: 0; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
  .tag-chip.blue { background: var(--tag-blue-bg); color: var(--tag-blue-text); }
  .tag-chip.red { background: var(--tag-red-bg); color: var(--tag-red-text); }

  .card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid var(--border); }
  .card-footer .complete-text { font-size: 12px; color: var(--text-faint); }
  .open-link { display: flex; align-items: center; gap: 6px; color: var(--accent-bright); font-weight: 700; font-size: 13px; background: none; border: none; cursor: pointer; font-family: inherit; }
  .open-link .tag-icon { width: 20px; height: 20px; border-radius: 999px; border: 1px solid var(--border-strong); display: flex; align-items: center; justify-content: center; color: var(--text-faint); }
  .open-link:hover .tag-icon { border-color: var(--accent-soft-border); color: var(--accent-bright); }

  /* ---------- Show all — same shape hierarchy rule: wide bar = rounded-rect ---------- */
  .show-all-wrap { margin-top: var(--sp-6); }
  .show-all-bar {
    display: flex; align-items: center; justify-content: space-between; background: var(--surface);
    border: 1px solid var(--border); border-radius: var(--radius-container); padding: var(--sp-4) var(--sp-5);
    cursor: pointer; width: 100%; font-family: inherit; color: var(--text-muted);
    font-size: var(--fs-ui); font-weight: 600;
    transition: background 0.18s var(--ease), border-color 0.18s var(--ease);
  }
  .show-all-bar:hover { background: var(--surface-hover); border-color: var(--border-strong); }
  .show-all-bar:active { transform: scale(0.995); }
  .show-all-bar svg.arrow { color: var(--text-faint); transition: transform 0.28s var(--ease); }
  .show-all-bar.expanded svg.arrow { transform: rotate(90deg); }

  @media (max-width: 640px) {
    .projects-header { flex-direction: column; align-items: stretch; }
    .projects-actions { flex-direction: column; align-items: stretch; }
    .search-input { width: 100%; }
    .filter-bar { flex-wrap: wrap; border-radius: var(--radius-md); }
    .filter-divider { display: none; }
    .status-tabs { width: 100%; overflow-x: auto; }
    .tags-row-wrap { width: 100%; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="note">Redesign v5 — spacing scale, type scale, shape hierarchy, motion, focus states. Card untouched.</div>

    <div class="projects-header">
      <div class="projects-heading">
        <h1>My Projects</h1>
        <p>5 projects · 4 need your attention</p>
      </div>
      <div class="projects-actions">
        <div class="search-input">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search projects..." />
        </div>
        <button class="btn-new">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Project
        </button>
      </div>
    </div>

    <div class="filters-block">
      <div class="filter-bar">
        <div class="status-tabs" id="statusTabs">
          <div class="tab-indicator" id="tabIndicator"></div>
          <div class="status-tab active" tabindex="0" onclick="selectTab(this)" data-count="5">All Projects <span class="tab-count">5</span></div>
          <div class="status-tab" tabindex="0" onclick="selectTab(this)" data-count="2">Not Started <span class="tab-count">2</span></div>
          <div class="status-tab" tabindex="0" onclick="selectTab(this)" data-count="1">Ongoing <span class="tab-count">1</span></div>
          <div class="status-tab" tabindex="0" onclick="selectTab(this)" data-count="1">Draft <span class="tab-count">1</span></div>
        </div>
        <div class="filter-divider"></div>
        <div class="tags-row-wrap" id="tagsWrap">
          <div class="tags-row" id="tagsRow">
            <span class="tag-icon-lead"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1"/></svg></span>
            <div class="tag-filter-chip" tabindex="0" onclick="this.classList.toggle('active')"><span class="dot" style="background:#93c5fd"></span>asdsa</div>
            <div class="tag-filter-chip" tabindex="0" onclick="this.classList.toggle('active')"><span class="dot" style="background:#93c5fd"></span>test1</div>
            <div class="tag-filter-chip" tabindex="0" onclick="this.classList.toggle('active')"><span class="dot" style="background:#fca5a5"></span>try</div>
          </div>
        </div>
      </div>
    </div>

    <div class="projects-grid" id="grid">

      <div class="project-card">
        <div class="card-top"><div class="avatar-square">P</div><span class="status-pill not-started">Not started</span></div>
        <h3 class="card-title">project1</h3>
        <div class="card-meta">2 tasks · 1 member</div>
        <div class="progress-row"><span>Progress</span><span>0%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:0%"></div></div>
        <div class="card-tags"><span class="tag-chip blue">asdsa</span><span class="tag-chip blue">test1</span></div>
        <div class="card-footer">
          <span class="complete-text">0/2 complete</span>
          <button class="open-link"><span class="tag-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1"/></svg></span>Open →</button>
        </div>
      </div>

      <div class="project-card">
        <div class="card-top"><div class="avatar-square">A</div><span class="status-pill ongoing">Ongoing</span></div>
        <h3 class="card-title">adsasdad</h3>
        <div class="card-meta">5 tasks · 1 member</div>
        <div class="progress-row"><span>Progress</span><span>20%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:20%"></div></div>
        <div class="card-tags"><span class="tag-chip red">try</span></div>
        <div class="card-footer">
          <span class="complete-text">1/5 complete</span>
          <button class="open-link"><span class="tag-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1"/></svg></span>Open →</button>
        </div>
      </div>

      <div class="project-card">
        <div class="card-top"><div class="avatar-square">T</div><span class="status-pill not-started">Not started</span></div>
        <h3 class="card-title">testbeta</h3>
        <div class="card-meta">2 tasks · 1 member</div>
        <div class="progress-row"><span>Progress</span><span>0%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:0%"></div></div>
        <div class="card-tags"></div>
        <div class="card-footer">
          <span class="complete-text">0/2 complete</span>
          <button class="open-link"><span class="tag-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1"/></svg></span>Open →</button>
        </div>
      </div>

      <div class="project-card">
        <div class="card-top"><div class="avatar-square">N</div><span class="status-pill not-started">Not started</span></div>
        <h3 class="card-title">new proj</h3>
        <div class="card-meta">3 tasks · 1 member</div>
        <div class="progress-row"><span>Progress</span><span>0%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:0%"></div></div>
        <div class="card-tags"></div>
        <div class="card-footer">
          <span class="complete-text">0/3 complete</span>
          <button class="open-link"><span class="tag-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1"/></svg></span>Open →</button>
        </div>
      </div>

      <div class="project-card hidden-extra">
        <div class="card-top"><div class="avatar-square">N</div><span class="status-pill draft">Draft</span></div>
        <h3 class="card-title">new proj</h3>
        <div class="card-meta">0 tasks · 1 member</div>
        <div class="progress-row"><span>Progress</span><span>0%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:0%"></div></div>
        <div class="card-tags"></div>
        <div class="card-footer">
          <span class="complete-text">0/0 complete</span>
          <button class="open-link"><span class="tag-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1"/></svg></span>Open →</button>
        </div>
      </div>

    </div>

    <div class="show-all-wrap">
      <button class="show-all-bar" id="showAllBtn" onclick="toggleShowAll()">
        <span id="showAllLabel">Show 1 more project</span>
        <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>
  </div>

  <script>
    // Sliding pill indicator behind status tabs
    function positionIndicator(tab) {
      const wrap = document.getElementById('statusTabs');
      const indicator = document.getElementById('tabIndicator');
      const wrapRect = wrap.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      indicator.style.left = (tabRect.left - wrapRect.left) + 'px';
      indicator.style.width = tabRect.width + 'px';
    }
    function selectTab(el) {
      el.parentElement.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      positionIndicator(el);
    }
    window.addEventListener('load', () => {
      const firstTab = document.querySelector('.status-tab.active');
      if (firstTab) positionIndicator(firstTab);
    });
    window.addEventListener('resize', () => {
      const activeTab = document.querySelector('.status-tab.active');
      if (activeTab) positionIndicator(activeTab);
    });

    // Real overflow-aware scroll fade for the tag row (only shows when there's actually more to scroll)
    function updateTagOverflow() {
      const row = document.getElementById('tagsRow');
      const wrap = document.getElementById('tagsWrap');
      const hasOverflow = row.scrollWidth - row.clientWidth - row.scrollLeft > 4;
      wrap.classList.toggle('has-overflow', hasOverflow);
    }
    const tagsRowEl = document.getElementById('tagsRow');
    tagsRowEl.addEventListener('scroll', updateTagOverflow);
    window.addEventListener('resize', updateTagOverflow);
    window.addEventListener('load', updateTagOverflow);

    function toggleShowAll() {
      const grid = document.getElementById('grid');
      const bar = document.getElementById('showAllBtn');
      const label = document.getElementById('showAllLabel');
      const expanded = grid.classList.toggle('expanded');
      bar.classList.toggle('expanded', expanded);
      label.textContent = expanded ? 'Show less' : 'Show 1 more project';
    }
  </script>
</body>
</html>
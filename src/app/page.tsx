import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingNav } from "@/components/landing-nav";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { FloatingThemeToggle } from "@/components/floating-theme-toggle";
import { SiteFooter } from "@/components/site-footer";
import { LandingStage, WatchItFlow } from "@/components/marketing/landing-stage";
import { LandingStations } from "@/components/marketing/landing-stations";

const CHECK_LI = (
  <svg viewBox="0 0 14 14"><path d="M2.5 7.5 l 3 3 L 11.5 4" /></svg>
);

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: landingStyles }} />
      <div className="landing-page">
        <FloatingThemeToggle />

        {/* ─── Sticky Nav ─── */}
        <div className="land-nav-wrapper" id="home">
          <LandingNav />
        </div>

        {/* ─── Hero (dotted-line backdrop) ─── */}
        <div className="lp-top">
          <div className="hero">
            <h1 className="headline-xl">Work flows when you<br />see how it connects.</h1>
            <p className="sub">Master complex projects and never lose sight of what&apos;s blocking your team — with intelligent, real-time dependency mapping. threadline thinks in graphs, not lists.</p>
            <div className="cta-row">
              <Link href="/sign-up" className="btn btn-blue btn-big">Start free</Link>
              <WatchItFlow />
            </div>
            <p className="footnote">Free for teams up to seven per project. Every plan includes the graph.</p>
          </div>

          <LandingStage />
        </div>

        {/* ─── Principles ─── */}
        <div className="principles">
          <div className="pcol"><b>Thinks in graphs, not lists.</b><p>Blocked work shows exactly where the chain breaks — not just that something&apos;s stuck.</p></div>
          <div className="pcol"><b>Real-time by design.</b><p>Changes land on every screen the moment they happen — not at the next standup.</p></div>
          <div className="pcol"><b>Models real dependencies.</b><p>Approvals and sub-projects are dependencies too, so the graph carries the whole chain.</p></div>
        </div>

        {/* ─── Feature stations ─── */}
        <section id="services" className="land-section">
          <div className="ledger-intro">
            <span className="eyebrow">Beyond the graph</span>
            <h2 className="headline">Everything your team needs<br />to ship in the right order.</h2>
            <p className="sub">Roles, live sync, real deadlines, focused views, and an assistant that plans — every piece keeps the graph true. Each one completes as you read it — watch the thread.</p>
          </div>
          <LandingStations />
        </section>

        {/* ─── Pricing ─── */}
        <div className="band">
          <div className="pricing" id="pricing">
            <span className="eyebrow">Pricing</span>
            <h2 className="headline" style={{ marginTop: 12 }}>Two plans.<br />The graph is in both.</h2>
            <div className="price-grid">
              <div className="price-card">
                <div className="pop"></div>
                <h3>Free</h3>
                <div className="amt num">$0 <small>forever</small></div>
                <ul>
                  <li>{CHECK_LI}Up to 5 projects</li>
                  <li>{CHECK_LI}Up to 7 members per project</li>
                  <li>{CHECK_LI}Unlimited tasks &amp; dependencies</li>
                  <li>{CHECK_LI}Live sync, roles, focused views</li>
                </ul>
                <Link href="/sign-up" className="btn btn-quiet">Get started</Link>
              </div>
              <div className="price-card feat">
                <div className="pop">Most popular</div>
                <h3>Team</h3>
                <div className="amt num">$8 <small>per member / month</small></div>
                <ul>
                  <li>{CHECK_LI}Unlimited teammates &amp; projects</li>
                  <li>{CHECK_LI}Everything in Free, without the ceilings</li>
                  <li>{CHECK_LI}The planning assistant</li>
                  <li>{CHECK_LI}Analytics &amp; calendar</li>
                  <li>{CHECK_LI}Free read-only stakeholder seats</li>
                  <li>{CHECK_LI}Priority support</li>
                </ul>
                <Link href="/sign-up" className="btn btn-blue">Start a trial</Link>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Final CTA (kept exactly as-is) ─── */}
        <RevealOnScroll>
          <div className="final-cta">
            <div className="f-eyebrow" style={{ textAlign: "center" }}>Get started</div>
            <h2>Ready to see your projects clearly?</h2>
            <p>Free for teams just getting started. No credit card required.</p>
            <Link href="/sign-up" className="btn-primary" style={{ margin: "0 auto" }}>Start for free</Link>
          </div>
        </RevealOnScroll>

      </div>
      <SiteFooter />
    </>
  );
}

// ─── Landing Page Styles ──────────────────────────────────────────────────────
// Ported from design-preview8.html (pivot file). Strict monochrome; dark mode
// follows the app's `.dark` class. All selectors scoped under .landing-page.

const landingStyles = `
/* ─── 1. Variables ─── */
.landing-page {
  --bg: #ffffff;
  --band: #f5f5f7;
  --card: #ffffff;
  --ink: #1d1d1f;
  --ink-2: #6e6e73;
  --ink-3: #86868b;
  --hair: #d2d2d7;
  --hair-soft: #e8e8ed;
  --field: #f5f5f7;
  --blue: #1d1d1f;
  --blue-hover: #000000;
  --green: #1d1d1f;  --green-soft: rgba(29, 29, 31, 0.08);
  --orange: #6e6e73; --orange-soft: rgba(110, 110, 115, 0.12);
  --gray-dot: #aeaeb2;
  --glass: rgba(255, 255, 255, 0.72);
  --shadow-frame: 0 2px 8px rgba(0, 0, 0, 0.04), 0 24px 60px rgba(0, 0, 0, 0.08);
  --shadow-pop: 0 4px 12px rgba(0, 0, 0, 0.08), 0 20px 50px rgba(0, 0, 0, 0.16);
  --shadow-float: 0 6px 16px rgba(0, 0, 0, 0.16);
  --lp-font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Helvetica Neue", Arial, sans-serif;
  --r-frame: 22px;
  --r-card: 14px;
  --r-field: 10px;
  --pill: 980px;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-io:  cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);

  font-family: var(--lp-font);
  background: var(--bg);
  color: var(--ink);
  font-size: 17px; line-height: 1.47; letter-spacing: -0.012em;
  /* clip, not hidden: overflow-x hidden creates a scroll container and silently
     disables position: sticky on the nav */
  overflow-x: clip;
}
.dark .landing-page {
  --bg: #000000;
  --band: #101012;
  --card: #1c1c1e;
  --ink: #f5f5f7;
  --ink-2: #a1a1a6;
  --ink-3: #8e8e93;
  --hair: #3a3a3c;
  --hair-soft: #2c2c2e;
  --field: #1c1c1e;
  --blue: #f5f5f7;
  --blue-hover: #ffffff;
  --green: #f5f5f7;  --green-soft: rgba(245, 245, 247, 0.10);
  --orange: #a1a1a6; --orange-soft: rgba(161, 161, 166, 0.14);
  --gray-dot: #636366;
  --glass: rgba(10, 10, 12, 0.72);
  --shadow-frame: 0 0 0 1px rgba(255, 255, 255, 0.06);
  --shadow-pop: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 24px 60px rgba(0, 0, 0, 0.6);
  --shadow-float: none;
}
.landing-page button { font: inherit; letter-spacing: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
.landing-page a { color: inherit; text-decoration: none; }
.landing-page svg { display: block; }
.landing-page .num { font-variant-numeric: tabular-nums; }

/* ─── 2. Type scale ─── */
.landing-page .eyebrow {
  font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--ink-3);
}
.landing-page .headline-xl { font-size: clamp(48px, 6.4vw, 80px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.03; }
.landing-page .headline    { font-size: clamp(32px, 4vw, 48px);  font-weight: 700; letter-spacing: -0.018em; line-height: 1.07; }
.landing-page .sub {
  font-size: clamp(18px, 1.8vw, 21px); line-height: 1.42; color: var(--ink-2);
  font-weight: 400; letter-spacing: -0.01em;
}
.landing-page .footnote { font-size: 12px; line-height: 1.45; color: var(--ink-3); letter-spacing: 0; }

/* ─── 3. Buttons & links ─── */
.landing-page .btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border-radius: var(--pill); font-size: 15px; font-weight: 500; padding: 11px 22px;
  transition: transform 160ms var(--ease-out), background-color 180ms ease,
              color 180ms ease, border-color 180ms ease, opacity 180ms ease;
  letter-spacing: -0.01em;
}
.landing-page .btn:active { transform: scale(0.97); }
.landing-page .btn-blue { background: var(--ink); color: var(--bg); }
@media (hover: hover) and (pointer: fine) { .landing-page .btn-blue:hover { background: var(--blue-hover); box-shadow: var(--shadow-float); } }
.landing-page .btn-quiet { border: 1px solid var(--hair); color: var(--ink); background: var(--card); }
@media (hover: hover) and (pointer: fine) { .landing-page .btn-quiet:hover { border-color: var(--ink-3); } }
.landing-page .btn-big { font-size: 17px; padding: 13px 28px; }
.landing-page .applelink { color: var(--ink); font-size: inherit; display: inline-flex; align-items: center; gap: 2px; }
.landing-page .applelink .chev { transition: transform 200ms var(--ease-out); }
@media (hover: hover) and (pointer: fine) {
  .landing-page .applelink:hover { text-decoration: underline; }
  .landing-page .applelink:hover .chev { transform: translateX(2px); }
}
.landing-page .lblswap .lbl { display: inline-block; transition: filter 150ms ease, opacity 150ms ease; }
.landing-page .lblswap.swapping .lbl { filter: blur(3px); opacity: 0.35; }

/* ─── 4. Status language ─── */
.landing-page .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
.landing-page .dot-done { background: var(--green); }
.landing-page .dot-prog { background: var(--orange); }
.landing-page .dot-ready { background: var(--blue); }
.landing-page .dot-blocked { background: transparent; box-shadow: inset 0 0 0 1.5px var(--gray-dot); }
.landing-page .spill {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
  padding: 3px 10px; border-radius: var(--pill);
  transition: background-color 250ms ease, color 250ms ease, filter 150ms ease, opacity 150ms ease;
}
.landing-page .spill.swapping { filter: blur(3px); opacity: 0.3; }
.landing-page .sp-done    { background: var(--green-soft);  color: var(--green); }
.landing-page .sp-prog    { background: var(--orange-soft); color: var(--orange); }
.landing-page .sp-ready   { background: color-mix(in srgb, var(--ink) 10%, transparent); color: var(--blue); }
.landing-page .sp-blocked { background: var(--band); color: var(--ink-3); }
.landing-page .ava {
  width: 28px; height: 28px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10.5px; font-weight: 600; letter-spacing: 0.02em;
  background: var(--hair-soft); color: var(--ink-2); flex-shrink: 0;
}
.landing-page .swap { transition: filter 150ms ease, opacity 150ms ease; }
.landing-page .swap.swapping { filter: blur(3px); opacity: 0.3; }

/* ─── 5. Sticky nav (glass) ─── */
.land-nav-wrapper {
  position: sticky; top: 0; z-index: 100;
  background: var(--glass);
  -webkit-backdrop-filter: saturate(1.8) blur(20px); backdrop-filter: saturate(1.8) blur(20px);
  border-bottom: 0.5px solid var(--hair-soft);
}
.landing-page .land-nav {
  max-width: 1024px; margin: 0 auto; height: 52px; padding: 0 22px;
  display: flex; align-items: center; gap: 30px;
}
.landing-page .word { font-family: var(--lp-font); font-size: 16px; font-weight: 600; letter-spacing: -0.02em; }
.landing-page .word .t1, .landing-page .word .t2 { color: var(--ink); }
.landing-page .land-links { display: flex; gap: 26px; font-size: 12.5px; color: var(--ink-2); flex: 1; }
.landing-page .land-links a { transition: color 180ms ease; }
@media (hover: hover) and (pointer: fine) { .landing-page .land-links a:hover { color: var(--ink); } }
.landing-page .land-nav-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.landing-page .land-link-nav {
  font-size: 12.5px; font-weight: 500; padding: 6px 14px; border-radius: var(--pill);
  border: 1px solid var(--hair); color: var(--ink); background: var(--card);
  transition: border-color 180ms ease;
}
@media (hover: hover) and (pointer: fine) { .landing-page .land-link-nav:hover { border-color: var(--ink-3); } }
.landing-page .land-cta-nav {
  font-size: 12.5px; font-weight: 500; padding: 6px 14px; border-radius: var(--pill);
  background: var(--ink); color: var(--bg);
  transition: transform 160ms var(--ease-out), background-color 180ms ease;
}
.landing-page .land-cta-nav:active { transform: scale(0.97); }
@media (hover: hover) and (pointer: fine) { .landing-page .land-cta-nav:hover { background: var(--blue-hover); } }
.landing-page .land-mobile-icons { display: none; align-items: center; gap: 4px; }
.landing-page .land-icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; border-radius: 10px; color: var(--ink-2);
  transition: background 160ms ease, color 160ms ease;
}
.landing-page .land-icon-btn:hover { color: var(--ink); background: var(--hair-soft); }

/* ─── 6. Hero + dotted-line backdrop ─── */
@keyframes lpRiseIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.landing-page .lp-top { position: relative; z-index: 0; }
.landing-page .lp-top::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 640px; z-index: -1;
  background-image: radial-gradient(circle, var(--gray-dot) 1px, transparent 1.5px);
  background-size: 14px 28px;
  opacity: 0.3;
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, #000 25%, transparent 72%);
  mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, #000 25%, transparent 72%);
  pointer-events: none;
}
.landing-page .hero { text-align: center; padding: 88px 22px 0; max-width: 980px; margin: 0 auto; }
.landing-page .hero h1 { animation: lpRiseIn 800ms var(--ease-out) backwards; }
.landing-page .hero .sub { max-width: 580px; margin: 22px auto 0; animation: lpRiseIn 800ms var(--ease-out) 100ms backwards; }
.landing-page .hero .cta-row { display: flex; gap: 22px; justify-content: center; align-items: center; margin-top: 32px;
  animation: lpRiseIn 800ms var(--ease-out) 190ms backwards; }
.landing-page .hero .applelink { font-size: 17px; }
.landing-page .hero .footnote { margin-top: 18px; animation: lpRiseIn 800ms var(--ease-out) 260ms backwards; }

/* ─── 7. Graph stage ─── */
.landing-page .stage-wrap { max-width: 1120px; margin: 56px auto 0; padding: 0 22px; animation: lpRiseIn 900ms var(--ease-out) 300ms backwards; }
.landing-page .stage-frame {
  border-radius: var(--r-frame); background: var(--card);
  box-shadow: var(--shadow-frame); overflow: hidden;
  border: 0.5px solid var(--hair-soft);
}
.dark .landing-page .stage-frame { background: #0a0a0a; }
.landing-page .stage-top {
  display: flex; align-items: center; gap: 8px; height: 46px; padding: 0 18px;
  border-bottom: 0.5px solid var(--hair-soft);
}
.landing-page .stage-top .dotrow { display: flex; gap: 6px; }
.landing-page .stage-top .dotrow i { width: 10px; height: 10px; border-radius: 50%; background: var(--hair-soft); }
.landing-page .stage-top .stitle { font-size: 13px; font-weight: 500; color: var(--ink-2); margin-left: 8px; letter-spacing: -0.005em; }
.landing-page .stage-top .live-chip { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--ink-3); letter-spacing: 0.06em; }
.landing-page .stage-top .live-chip i { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: lpLivePulse 2.4s ease-in-out infinite; }
@keyframes lpLivePulse { 50% { box-shadow: 0 0 0 5px var(--green-soft); } }
.landing-page .stage { position: relative; height: 470px; overflow: hidden; }
.landing-page .stage-inner { position: relative; width: 1036px; height: 470px; margin: 0 auto; }
.landing-page .stage svg.wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.landing-page .hedge { fill: none; stroke: var(--hair); stroke-width: 1.5; }
.landing-page .hedge-flow {
  fill: none; stroke: var(--blue); stroke-width: 2; opacity: 0;
  stroke-dasharray: 6 10; stroke-linecap: round;
  transition: opacity 250ms ease;
}
.landing-page .hedge-flow.flowing { opacity: 1; animation: lpFlow 700ms linear infinite; }
@keyframes lpFlow { to { stroke-dashoffset: -16; } }
.landing-page .hnode {
  position: absolute; width: 176px;
  border: 0.5px solid var(--hair); border-radius: var(--r-card);
  background: var(--card); padding: 12px 14px 13px; text-align: left;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: opacity 500ms var(--ease-out), border-color 300ms ease, box-shadow 300ms ease;
}
.dark .landing-page .hnode { box-shadow: none; border-color: var(--hair-soft); }
.landing-page .stage-inner:not(.drawn) .hnode { opacity: 0; }
.landing-page .stage-inner:not(.settled) .hnode { transition-delay: var(--sd, 0ms); }
.landing-page .stage-inner.drawn .hnode { opacity: 1; animation: lpBob 7s ease-in-out infinite; animation-delay: var(--bd, 0ms); }
@keyframes lpBob { 0%, 100% { translate: 0 0; } 50% { translate: 0 -4px; } }
.landing-page .hnode.blocked { border-style: dashed; }
.landing-page .hnode .nhead { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.landing-page .hnode .nhead .ava { margin-left: auto; width: 22px; height: 22px; font-size: 8px; }
.landing-page .hnode .nt { display: block; font-size: 13.5px; font-weight: 600; letter-spacing: -0.014em; line-height: 1.25; }
.landing-page .hnode .nm { display: block; font-size: 11.5px; color: var(--ink-3); margin-top: 3px; letter-spacing: -0.005em; }
.landing-page .hnode.hero-blocker { border-color: var(--orange); box-shadow: 0 0 0 1px var(--orange), 0 8px 24px var(--orange-soft); }
.landing-page .hnode.hero-blocker.cleared { border-color: var(--hair); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03); }
.landing-page .hnode.freed { border-style: solid; }
@keyframes lpFreedPulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--ink) 30%, transparent); } 100% { box-shadow: 0 0 0 14px transparent; } }
.landing-page .stage-inner.drawn .hnode.freed { animation: lpBob 7s ease-in-out infinite var(--bd, 0ms), lpFreedPulse 700ms var(--ease-out); }
.landing-page .stage-cta { position: absolute; z-index: 5; translate: -50% 0; transition: opacity 250ms ease, transform 300ms var(--ease-out); }
.landing-page .stage-cta.gone { opacity: 0; transform: translateY(6px); pointer-events: none; }
.landing-page .stage-cta .btn { box-shadow: var(--shadow-pop); }
.landing-page .stage-readout {
  position: absolute; left: 16px; bottom: 14px; z-index: 5;
  background: var(--ink); color: var(--bg);
  font-size: 12.5px; font-weight: 500; border-radius: var(--pill); padding: 8px 16px;
  opacity: 0; transform: translateY(8px);
  transition: opacity 240ms ease, transform 280ms var(--ease-out);
  white-space: nowrap;
}
.landing-page .stage-readout.show { opacity: 1; transform: none; }
.landing-page .stage-readout b { font-weight: 600; }
.landing-page .stage-replay { position: absolute; right: 14px; bottom: 12px; z-index: 5; opacity: 0; transition: opacity 240ms ease 400ms; pointer-events: none; }
.landing-page .stage-replay.show { opacity: 1; pointer-events: auto; }
.landing-page .stage-under { display: flex; justify-content: center; gap: 24px; margin-top: 16px; flex-wrap: wrap; }
.landing-page .stage-under .li { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ink-2); }

/* ─── 8. Principles ─── */
.landing-page .principles {
  max-width: 1024px; margin: 0 auto; padding: 90px 22px 20px;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;
}
.landing-page .pcol b { display: block; font-size: 16px; font-weight: 650; letter-spacing: -0.012em; }
.landing-page .pcol p { margin-top: 8px; font-size: 14px; color: var(--ink-2); line-height: 1.55; letter-spacing: -0.008em; }

/* ─── 9. About / section intros ─── */
.landing-page .land-section { scroll-margin-top: 64px; }
.landing-page .ledger-intro { max-width: 660px; margin: 0 auto; text-align: center; padding: 110px 22px 10px; }
.landing-page .ledger-intro .eyebrow { display: block; margin-bottom: 14px; }
.landing-page .ledger-intro .sub { margin-top: 16px; }
/* ─── 10. Stations ─── */
.landing-page .stations-wrap { max-width: 1024px; margin: 0 auto; padding: 20px 22px 110px; }
.landing-page .station {
  display: grid; grid-template-columns: minmax(0, 5fr) 84px minmax(0, 6fr);
  align-items: center; padding: 58px 0;
}
.landing-page .st-copy { justify-self: end; max-width: 370px; width: 100%;
  opacity: 0.4; transition: opacity 500ms ease; }
.landing-page .station.active .st-copy, .landing-page .station.passed .st-copy { opacity: 1; }
.landing-page .st-idrow { display: flex; align-items: center; gap: 10px; }
.landing-page .st-id { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-2); }
.landing-page .st-state { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3);
  transition: filter 150ms ease, opacity 150ms ease, color 300ms ease; }
.landing-page .st-state.swapping { filter: blur(3px); opacity: 0.3; }
.landing-page .station.passed .st-state { color: var(--green); }
.landing-page .st-copy h3 { font-size: 26px; font-weight: 700; letter-spacing: -0.018em; margin-top: 12px; line-height: 1.16; text-wrap: balance; }
.landing-page .st-copy p { margin-top: 10px; font-size: 15px; color: var(--ink-2); line-height: 1.55; text-wrap: pretty; letter-spacing: -0.008em; }
.landing-page .st-gut { position: relative; height: 100%; min-height: 220px; }
.landing-page .st-gut::before {
  content: ""; position: absolute; left: 50%; top: -58px; bottom: -58px;
  width: 1.5px; translate: -50% 0; background: var(--hair-soft);
}
.landing-page .st-gut .fillseg {
  position: absolute; left: 50%; top: -58px; bottom: -58px; width: 1.5px; translate: -50% 0;
  background: var(--ink); transform: scaleY(0); transform-origin: top; will-change: transform;
}
.landing-page .st-node {
  position: absolute; left: 50%; top: calc(50% - 10px); translate: -50% 0; z-index: 2;
  width: 20px; height: 20px; border-radius: 50%;
  border: 1.5px solid var(--hair); background: var(--bg);
  transition: background-color 300ms ease, border-color 300ms ease;
}
.landing-page .station.active .st-node { border-color: var(--orange); background: var(--orange-soft); }
.landing-page .station.passed .st-node { background: var(--green); border-color: var(--green); }
.landing-page .st-node svg { position: absolute; inset: 4px; stroke: var(--bg); stroke-width: 2.4; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.landing-page .st-node svg path { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 320ms var(--ease-out) 120ms; }
.landing-page .station.passed .st-node svg path { stroke-dashoffset: 0; }
.landing-page .vig {
  background: var(--card); border: 0.5px solid var(--hair-soft); border-radius: 18px;
  padding: 22px; box-shadow: var(--shadow-frame);
  transition: transform 260ms var(--ease-out), box-shadow 260ms ease;
}
@media (hover: hover) and (pointer: fine) { .landing-page .vig:hover { transform: translateY(-2px); } }
.landing-page .vig .vig-cap { font-size: 12px; color: var(--ink-3); margin-top: 15px; letter-spacing: 0; }
.landing-page .vig .vig-cap b { color: var(--ink-2); font-weight: 600; }
.landing-page .vig-actions { display: flex; align-items: center; gap: 10px; margin-top: 15px; }
.landing-page .mini-btn {
  font-size: 12.5px; font-weight: 500; padding: 6px 14px; border-radius: var(--pill);
  border: 1px solid var(--hair); background: var(--card); color: var(--ink);
  transition: transform 160ms var(--ease-out), border-color 160ms ease, color 160ms ease,
              background-color 160ms ease, opacity 200ms ease;
}
.landing-page .mini-btn:active { transform: scale(0.96); }
@media (hover: hover) and (pointer: fine) { .landing-page .mini-btn:hover { border-color: var(--ink-3); } }
.landing-page .mini-btn.sel { border-color: var(--blue); color: var(--blue); font-weight: 600; }

/* vignette internals */
.landing-page .role-row { display: flex; gap: 8px; }
.landing-page .role-pick {
  font-size: 13px; font-weight: 500; padding: 6px 16px; border-radius: var(--pill);
  border: 1px solid var(--hair); color: var(--ink-2);
  transition: all 200ms var(--ease-out);
}
.landing-page .role-pick:active { transform: scale(0.95); }
.landing-page .role-pick.on { background: var(--ink); color: var(--bg); border-color: var(--ink); font-weight: 600; }
.landing-page .perm-list { margin-top: 14px; }
.landing-page .perm-row {
  display: flex; align-items: center; gap: 11px; padding: 10px 2px;
  border-bottom: 0.5px solid var(--hair-soft); font-size: 14px; letter-spacing: -0.008em;
  transition: opacity 250ms ease;
}
.landing-page .perm-row:last-child { border-bottom: 0; }
.landing-page .perm-row.off { opacity: 0.35; }
.landing-page .perm-mark { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; position: relative;
  background: var(--hair-soft); transition: background-color 220ms ease; }
.landing-page .perm-row.ok .perm-mark { background: var(--green); }
.landing-page .perm-mark svg { position: absolute; inset: 4px; stroke: var(--bg); stroke-width: 2.4; fill: none; stroke-linecap: round; stroke-linejoin: round;
  opacity: 0; transition: opacity 180ms ease; }
.landing-page .perm-row.ok .perm-mark svg { opacity: 1; }
.landing-page .perm-row .pnote { margin-left: auto; font-size: 11.5px; color: var(--ink-3);
  transition: filter 150ms ease, opacity 150ms ease; }
.landing-page .perm-row .pnote.swapping { filter: blur(3px); opacity: 0.3; }

.landing-page .panes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.landing-page .pane { border-radius: var(--r-card); padding: 13px; background: var(--band); }
.landing-page .pane .pl { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 8px; }
.landing-page .mrow-wrap { overflow: hidden; transition: grid-template-rows 340ms var(--ease-io); display: grid; grid-template-rows: 1fr; }
.landing-page .mrow-wrap.gone { grid-template-rows: 0fr; }
.landing-page .mrow-wrap > div { min-height: 0; overflow: hidden; }
.landing-page .mrow { display: flex; align-items: center; gap: 9px; padding: 6px 2px; transition: opacity 260ms ease; }
.landing-page .mrow-wrap.gone .mrow { opacity: 0; }
.landing-page .mrow .ava { width: 24px; height: 24px; font-size: 9px; }
.landing-page .mrow .mn { font-size: 13px; font-weight: 500; flex: 1; letter-spacing: -0.008em; }
.landing-page .mrow .mc { font-size: 11px; color: var(--ink-3); font-variant-numeric: tabular-nums;
  background: var(--hair-soft); border-radius: var(--pill); padding: 2px 9px;
  transition: background-color 250ms ease, color 250ms ease; }
.landing-page .mrow .mc.restored { background: var(--ink); color: var(--bg); }

.landing-page .sched-task { display: flex; align-items: center; gap: 11px; border: 0.5px solid var(--hair); border-radius: var(--r-card); padding: 12px 15px; }
.landing-page .sched-task b { font-size: 14px; font-weight: 600; flex: 1; letter-spacing: -0.01em; }
.landing-page .when-chip {
  font-size: 12.5px; font-weight: 600; padding: 5px 12px; border-radius: var(--pill);
  background: color-mix(in srgb, var(--ink) 10%, transparent); color: var(--blue); font-variant-numeric: tabular-nums;
  transition: all 250ms ease;
}
.landing-page .when-chip.default { background: var(--band); color: var(--ink-3); font-weight: 500; }
.landing-page .ruler { position: relative; margin: 26px 6px 6px; height: 36px; }
.landing-page .ruler .rline { position: absolute; left: 0; right: 0; top: 16px; height: 1.5px; background: var(--hair-soft); }
.landing-page .ruler .tick { position: absolute; top: 12px; width: 1px; height: 9px; background: var(--hair); }
.landing-page .ruler .tick.major { top: 9px; height: 15px; }
.landing-page .ruler .tlabel { position: absolute; top: 31px; font-size: 10.5px; color: var(--ink-3); translate: -50% 0; font-variant-numeric: tabular-nums; }
.landing-page .ruler .marker {
  position: absolute; top: 16px; left: 0; width: 14px; height: 14px; border-radius: 50%;
  background: var(--ink); translate: -50% -50%; box-shadow: 0 1px 4px color-mix(in srgb, var(--ink) 35%, transparent);
  transition: left 500ms var(--ease-drawer), background-color 250ms ease, box-shadow 250ms ease;
}
.landing-page .ruler .marker.default { background: var(--card); box-shadow: inset 0 0 0 1.5px var(--gray-dot); }
.landing-page .timeset { display: flex; gap: 8px; margin-top: 18px; }

.landing-page .mini-seg { position: relative; display: inline-flex; border-radius: 9px; padding: 2px; background: var(--hair-soft); }
.landing-page .mini-seg button { position: relative; z-index: 1; font-size: 12.5px; font-weight: 500; padding: 4px 16px; border-radius: 7px; color: var(--ink-2); transition: color 220ms ease; }
.landing-page .mini-seg button.on { color: var(--ink); font-weight: 600; }
.landing-page .mini-seg .thumb {
  position: absolute; top: 2px; bottom: 2px; left: 2px; width: calc(50% - 2px);
  background: var(--card); border-radius: 7px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: transform 280ms var(--ease-out);
}
.landing-page .mini-seg.right .thumb { transform: translateX(100%); }
.landing-page .focus-list { margin-top: 14px; }
.landing-page .focus-row { display: flex; align-items: center; gap: 11px; padding: 10px 2px; border-bottom: 0.5px solid var(--hair-soft); font-size: 14px; letter-spacing: -0.008em; }
.landing-page .focus-row:last-child { border-bottom: 0; }
.landing-page .focus-row .grip { color: var(--hair); letter-spacing: 1.5px; font-size: 11px; }
.landing-page .focus-row .dots { margin-left: auto; color: var(--ink-3); font-weight: 700; }
.landing-page .focus-row .chk {
  width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--hair);
  flex-shrink: 0; transition: transform 160ms var(--ease-out), border-color 160ms ease, background-color 160ms ease;
}
.landing-page .focus-row .chk:active { transform: scale(0.85); }
@media (hover: hover) and (pointer: fine) { .landing-page .focus-row .chk:hover { border-color: var(--blue); } }
.landing-page .focus-ui { transition: opacity 280ms ease, width 320ms var(--ease-io); overflow: hidden; white-space: nowrap; }
.landing-page .vig.viewing .focus-ui { opacity: 0; width: 0 !important; pointer-events: none; }
.landing-page .focus-row .stglyph { opacity: 0; width: 0; overflow: hidden; transition: opacity 280ms ease 120ms, width 320ms var(--ease-io); flex-shrink: 0; }
.landing-page .vig.viewing .focus-row .stglyph { opacity: 1; width: 8px; }
.landing-page .view-tag {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--ink-3); opacity: 0; transition: opacity 250ms ease 150ms;
}
.landing-page .vig.viewing .view-tag { opacity: 1; }

.landing-page .plan-mini { background: var(--ink); color: var(--bg); border-radius: var(--r-card); padding: 17px 19px; }
.dark .landing-page .plan-mini { background: var(--band); color: var(--ink); border: 0.5px solid var(--hair-soft); }
.landing-page .plan-mini .ph { display: flex; align-items: center; gap: 8px; font-size: 10.5px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.55; }
.landing-page .plan-mini .prompt { font-size: 13.5px; margin-top: 11px; }
.landing-page .plan-mini .prompt .pfx { opacity: 0.55; font-weight: 600; margin-right: 6px; }
.landing-page .plan-mini .rows { margin-top: 10px; border-top: 1px solid rgba(128, 128, 128, 0.35); padding-top: 4px; }
.landing-page .plan-mini .prow { display: flex; align-items: baseline; gap: 8px; padding: 7px 8px; margin: 0 -8px; border-radius: 8px; font-size: 13px;
  opacity: 0; transform: translateY(6px); transition: opacity 380ms var(--ease-out), transform 380ms var(--ease-out), background-color 160ms ease; }
.landing-page .plan-mini .prow.in { opacity: 1; transform: none; }
@media (hover: hover) and (pointer: fine) {
  .landing-page .plan-mini .prow:hover { background: color-mix(in srgb, var(--bg) 8%, transparent); }
}
.landing-page .plan-mini .prow i { width: 7px; height: 7px; border-radius: 50%; border: 1.5px solid currentColor; opacity: 0.5; flex-shrink: 0; translate: 0 -1px; }
.landing-page .plan-mini .prow .dep { font-size: 11px; opacity: 0.5; }
.landing-page .plan-mini .prow .pw { margin-left: auto; font-size: 11.5px; opacity: 0.65; font-variant-numeric: tabular-nums; white-space: nowrap; }

/* ─── 11. Pricing ─── */
.landing-page .band { background: var(--band); }
.landing-page .pricing { text-align: center; padding: 110px 22px; max-width: 1024px; margin: 0 auto; }
.landing-page .price-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-top: 52px; text-align: left; max-width: 780px; margin-left: auto; margin-right: auto; }
.landing-page .price-card {
  background: var(--card); border-radius: 18px; padding: 30px 28px;
  border: 0.5px solid var(--hair-soft); box-shadow: var(--shadow-frame);
  display: flex; flex-direction: column;
  transition: transform 260ms var(--ease-out);
}
@media (hover: hover) and (pointer: fine) { .landing-page .price-card:hover { transform: translateY(-4px); } }
.landing-page .price-card .pop { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--blue); margin-bottom: 8px; min-height: 16px; }
.landing-page .price-card h3 { font-size: 21px; font-weight: 700; letter-spacing: -0.015em; }
.landing-page .price-card .amt { font-size: 38px; font-weight: 700; letter-spacing: -0.03em; margin-top: 8px; }
.landing-page .price-card .amt small { font-size: 13px; font-weight: 400; letter-spacing: -0.005em; color: var(--ink-3); }
.landing-page .price-card ul { list-style: none; margin: 20px 0 26px; padding: 0; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.landing-page .price-card li { font-size: 13.5px; color: var(--ink-2); display: flex; gap: 9px; align-items: flex-start; letter-spacing: -0.008em; }
.landing-page .price-card li svg { width: 14px; height: 14px; stroke: var(--green); stroke-width: 2.2; fill: none; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; margin-top: 3px; }
.landing-page .price-card.feat { border: 2px solid var(--blue); background: var(--ink); color: var(--bg); }
.landing-page .price-card.feat .pop { color: color-mix(in srgb, var(--bg) 70%, transparent); }
.landing-page .price-card.feat .amt small { color: color-mix(in srgb, var(--bg) 62%, transparent); }
.landing-page .price-card.feat li { color: color-mix(in srgb, var(--bg) 80%, transparent); }
.landing-page .price-card.feat li svg { stroke: var(--bg); }
.landing-page .price-card.feat .btn-blue { background: var(--bg); color: var(--ink); }
.dark .landing-page .price-card.feat { background: var(--card); color: var(--ink); }
.dark .landing-page .price-card.feat .pop { color: var(--ink-2); }
.dark .landing-page .price-card.feat .amt small { color: var(--ink-3); }
.dark .landing-page .price-card.feat li { color: var(--ink-2); }
.dark .landing-page .price-card.feat li svg { stroke: var(--ink); }
.dark .landing-page .price-card.feat .btn-blue { background: var(--ink); color: var(--bg); }
.landing-page .price-card .btn { width: 100%; }

/* ─── 12. Final CTA (styles kept as-is from the previous landing) ─── */
.landing-page .final-cta { max-width: 720px; margin: 40px auto 130px; padding: 60px 48px 0; text-align: center; border-top: 1px solid var(--hair-soft); }
.landing-page .final-cta h2 { font-size: 40px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 16px; color: var(--ink); }
.landing-page .final-cta p { color: var(--ink-2); margin-bottom: 30px; font-size: 15.5px; }
.landing-page .f-eyebrow { font-size: 12.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 16px; }
.landing-page .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: var(--ink); color: var(--bg); border: none; padding: 14px 24px; border-radius: 999px; font-size: 14.5px; font-weight: 600; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease; text-decoration: none; }
.landing-page .btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-float); }

/* ─── 14. Responsive ─── */
@media (max-width: 900px) {
  .landing-page .land-nav { padding: 0 16px; gap: 12px; }
  .landing-page .land-links { display: none; }
  .landing-page .land-mobile-icons { display: flex; margin-left: auto; }
  .landing-page .land-nav-right { margin-left: 0; }
  .landing-page .principles { grid-template-columns: 1fr; gap: 26px; padding-top: 70px; }
  .landing-page .station { grid-template-columns: 40px 1fr; padding: 44px 0; }
  .landing-page .st-gut { grid-column: 1; grid-row: 1 / span 2; min-height: 0; }
  .landing-page .st-copy { grid-column: 2; justify-self: start; max-width: none; }
  .landing-page .station .vig { grid-column: 2; margin-top: 20px; }
  .landing-page .price-grid { grid-template-columns: 1fr; }
  .landing-page .panes { grid-template-columns: 1fr; }
  .landing-page .final-cta { margin: 20px 16px 70px; padding: 40px 24px 0; }
  .landing-page .final-cta h2 { font-size: 30px; }
}
@media (max-width: 480px) {
  .landing-page .hero { padding-top: 56px; }
  .landing-page .hero .cta-row { flex-direction: column; gap: 16px; }
  .landing-page .final-cta h2 { font-size: 24px; }
}
`;

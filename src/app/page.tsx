import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: landingStyles }} />
      <div className="landing-page">
        {/* ─── Nav ─── */}
        <nav className="land-nav">
          <div className="word"><span className="t1">Thread</span><span className="t2">line</span></div>
          <div className="land-links">
            <a href="#features">Product</a>
            <a href="#story">Customers</a>
          </div>
          <div className="land-nav-right">
            <Link href="/sign-in" className="land-link-nav">Sign in</Link>
            <Link href="/sign-up" className="land-cta-nav">Sign up</Link>
          </div>
        </nav>

        {/* ─── Hero ─── */}
        <div className="hero">
          <div>
            <div className="eyebrow">For teams running more than one project</div>
            <h1>Pull every<br/>thread <b>together.</b></h1>
            <p className="lead">Map your tasks as visual dependency graphs. See what blocks what, who owns what, and what ships next — all on one infinite canvas your whole team edits in real time.</p>
            <div className="hero-ctas">
              <Link href="/sign-up" className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 20 20"><line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Start for free
              </Link>
              <a href="#features" className="btn-ghost">See how it works</a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="glow-blob"></div>
            <div className="float-card back1"></div>
            <div className="float-card back2"></div>
            <div className="float-card main">
              <div className="mini-tab-bar">
                <div className="mini-dots">
                  <span style={{ background: "#FF5F57" }}></span>
                  <span style={{ background: "#FFBD2E" }}></span>
                  <span style={{ background: "#28C840" }}></span>
                </div>
                <div className="mini-url">threadline.app/graph</div>
              </div>
              {/* Mini graph with multiple nodes and connections */}
              <div className="mini-graph">
                <div className="mini-branch">
                  <div className="mini-node">
                    <div className="mini-bar" style={{ width: "38px" }}></div>
                    <div className="mini-track" style={{ width: "48px" }}></div>
                  </div>
                  <div className="mini-stem"></div>
                  <div className="mini-node" style={{ padding: "5px 8px" }}>
                    <div className="mini-bar" style={{ width: "22px", opacity: 0.55 }}></div>
                  </div>
                  <div className="mini-stem"></div>
                  <div className="mini-node done" style={{ padding: "4px 8px" }}>
                    <div className="mini-bar" style={{ width: "18px" }}></div>
                    <div style={{ fontSize: "6px", color: "var(--violet-bright)", fontWeight: 600 }}>Done</div>
                  </div>
                </div>
                <div className="mini-branch" style={{ paddingTop: "14px" }}>
                  <div className="mini-node">
                    <div className="mini-bar" style={{ width: "30px" }}></div>
                    <div className="mini-track" style={{ width: "40px" }}></div>
                  </div>
                  <div className="mini-stem"></div>
                  <div className="mini-node done">
                    <div className="mini-bar" style={{ width: "26px" }}></div>
                    <div style={{ fontSize: "6px", color: "var(--violet-bright)", fontWeight: 600 }}>Done</div>
                  </div>
                </div>
                <div className="mini-branch" style={{ paddingTop: "6px" }}>
                  <div className="mini-node" style={{ padding: "5px 8px" }}>
                    <div className="mini-bar" style={{ width: "28px", opacity: 0.7 }}></div>
                  </div>
                  <div className="mini-stem"></div>
                  <div className="mini-node" style={{ padding: "4px 7px" }}>
                    <div className="mini-bar" style={{ width: "20px", opacity: 0.4 }}></div>
                    <div className="mini-track" style={{ width: "32px" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Social Proof ─── */}
        <div className="social-proof">
          <div className="lbl">Trusted by teams shipping real projects</div>
          <div className="logo-row">
            <span>Vector</span><span>Northwind</span><span>Fablehouse</span><span>Solace</span><span>Kindred</span>
          </div>
        </div>

        {/* ─── Feature Row 1: Dependency Graph (MAIN FEATURE) ─── */}
        <div className="feature-row" id="features">
          <div className="f-text">
            <div className="f-eyebrow">The core idea</div>
            <h3>Tasks aren&apos;t a list. They&apos;re a graph.</h3>
            <p>Draw dependencies between tasks on an infinite canvas. See instantly what&apos;s blocked, what&apos;s ready, and what the critical path looks like — no spreadsheet gymnastics required.</p>
          </div>
          <div className="f-visual" style={{ flexDirection: "column", alignItems: "center", gap: "0", padding: "28px" }}>
            {/* Mini dependency graph illustration */}
            <svg width="220" height="180" viewBox="0 0 220 180" fill="none">
              {/* Connections */}
              <line x1="70" y1="40" x2="150" y2="40" stroke="var(--hairline)" strokeWidth="1.5"/>
              <line x1="70" y1="40" x2="110" y2="100" stroke="var(--hairline)" strokeWidth="1.5"/>
              <line x1="150" y1="40" x2="110" y2="100" stroke="var(--hairline)" strokeWidth="1.5"/>
              <line x1="110" y1="100" x2="110" y2="150" stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="4 3"/>
              {/* Nodes */}
              <circle cx="70" cy="40" r="16" fill="var(--surface-raised)" stroke="var(--violet)" strokeWidth="2"/>
              <text x="70" y="44" textAnchor="middle" fontSize="8" fill="var(--violet-bright)" fontWeight="600">Design</text>
              <circle cx="150" cy="40" r="16" fill="var(--surface-raised)" stroke="var(--violet-bright)" strokeWidth="2"/>
              <text x="150" y="44" textAnchor="middle" fontSize="8" fill="var(--violet-bright)" fontWeight="600">API</text>
              <circle cx="110" cy="100" r="18" fill="rgba(139,92,246,0.12)" stroke="var(--violet)" strokeWidth="2"/>
              <text x="110" y="96" textAnchor="middle" fontSize="7" fill="var(--violet-bright)" fontWeight="600">Build</text>
              <text x="110" y="108" textAnchor="middle" fontSize="6" fill="var(--text-3)">blocked</text>
              {/* Done node */}
              <circle cx="110" cy="150" r="14" fill="rgba(139,92,246,0.18)" stroke="var(--violet)" strokeWidth="2"/>
              <text x="110" y="148" textAnchor="middle" fontSize="7" fill="var(--violet-bright)" fontWeight="600">Ship</text>
              <text x="110" y="158" textAnchor="middle" fontSize="6" fill="var(--text-3)">next</text>
              {/* Checkmark on a done task */}
              <circle cx="30" cy="90" r="12" fill="rgba(139,92,246,0.2)" stroke="var(--violet)" strokeWidth="1.5"/>
              <path d="M25 90 L28 93 L35 86" stroke="var(--violet-bright)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <line x1="42" y1="90" x2="70" y2="40" stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 2"/>
            </svg>
          </div>
        </div>

        {/* ─── Feature Row 2: AI Assistant (reversed) ─── */}
        <div className="feature-row rev">
          <div className="f-text">
            <div className="f-eyebrow">AI-powered</div>
            <h3>Describe it. We&apos;ll build the graph.</h3>
            <p>Tell the AI assistant what you&apos;re building in plain English. It generates a full dependency graph with tasks, connections, and sensible structure — ready to edit and assign.</p>
          </div>
          <div className="f-visual" style={{ flexDirection: "column", alignItems: "stretch", gap: "14px", padding: "28px" }}>
            {/* AI chat mockup */}
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, var(--violet-bright), var(--violet-deep))", flexShrink: 0 }}></div>
              <div style={{ background: "rgba(139,92,246,0.08)", borderRadius: "12px", padding: "10px 14px", fontSize: "12.5px", color: "var(--text-2)", lineHeight: 1.5 }}>
                &ldquo;Build a marketing site with design, copy, dev, and QA phases. Dev depends on both design and copy.&rdquo;
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", justifyContent: "flex-end" }}>
              <div style={{ background: "var(--surface-raised)", border: "1px solid var(--hairline)", borderRadius: "12px", padding: "10px 14px", fontSize: "12.5px", color: "var(--text-1)", lineHeight: 1.5, maxWidth: "220px" }}>
                <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--violet-bright)", marginBottom: "6px" }}>✦ Generated 5 tasks, 4 dependencies</div>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "999px", background: "rgba(139,92,246,0.12)", color: "var(--violet-bright)" }}>Design</span>
                  <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "999px", background: "rgba(139,92,246,0.12)", color: "var(--violet-bright)" }}>Copy</span>
                  <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "999px", background: "rgba(139,92,246,0.12)", color: "var(--violet-bright)" }}>Dev</span>
                  <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "999px", background: "rgba(139,92,246,0.12)", color: "var(--violet-bright)" }}>QA</span>
                  <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "999px", background: "rgba(139,92,246,0.12)", color: "var(--violet-bright)" }}>Launch</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Feature Row 3: Blocker Detection ─── */}
        <div className="feature-row">
          <div className="f-text">
            <div className="f-eyebrow">Nothing slips through</div>
            <h3>Know what&apos;s stuck before it slows you down.</h3>
            <p>Threadline surfaces blockers and stale tasks automatically, so problems get caught in a morning check-in — not two weeks before a deadline.</p>
          </div>
          <div className="f-visual" style={{ flexDirection: "column", alignItems: "stretch", gap: "12px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", borderLeft: "3px solid var(--violet-deep)", paddingLeft: "14px" }}>
              <div>
                <div style={{ fontSize: "13.5px" }}><b>Checkout flow</b> has been blocked for 3 days</div>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "3px" }}>Design system</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", borderLeft: "3px solid var(--text-3)", paddingLeft: "14px" }}>
              <div>
                <div style={{ fontSize: "13.5px" }}><b>API docs</b> haven&apos;t moved in 6 days</div>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "3px" }}>Platform</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Feature Row 4: Team Workload (reversed) ─── */}
        <div className="feature-row rev">
          <div className="f-text">
            <div className="f-eyebrow">Built for real teams</div>
            <h3>Built for how your team actually works.</h3>
            <p>Workload views show who&apos;s stretched thin and who has room — so the next task goes to the right person, automatically informed, never guessed.</p>
          </div>
          <div className="f-visual" style={{ flexDirection: "column", alignItems: "stretch", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--violet)", flexShrink: 0 }}></div>
              <div style={{ flex: 1, height: "9px", borderRadius: "999px", background: "var(--hairline)", overflow: "hidden" }}><div style={{ width: "70%", height: "100%", background: "var(--violet)" }}></div></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--orchid)", flexShrink: 0 }}></div>
              <div style={{ flex: 1, height: "9px", borderRadius: "999px", background: "var(--hairline)", overflow: "hidden" }}><div style={{ width: "35%", height: "100%", background: "var(--orchid)" }}></div></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--violet-deep)", flexShrink: 0 }}></div>
              <div style={{ flex: 1, height: "9px", borderRadius: "999px", background: "var(--hairline)", overflow: "hidden" }}><div style={{ width: "90%", height: "100%", background: "var(--violet-deep)" }}></div></div>
            </div>
          </div>
        </div>

        {/* ─── Testimonials ─── */}
        <div className="testimonial-section" id="story">
          <TestimonialCard
            quote="Replaced Jira and three other tools. The graph view makes complex dependencies actually manageable."
            name="Sarah Chen"
            role="Engineering Lead"
          />
          <TestimonialCard
            quote="We went from async confusion to live coordination overnight. Real-time editing is a game changer."
            name="Marcus Rodriguez"
            role="Product Manager"
          />
          <TestimonialCard
            quote="Finally understands how real projects work — dependencies, approvals, nested sub-projects, all of it."
            name="Anika Patel"
            role="Design Director"
          />
        </div>

        {/* ─── Stats Row ─── */}
        <div className="stats-row">
          <div><div className="stat-value">2,000+</div><div className="stat-label">Active teams</div></div>
          <div><div className="stat-value">99.9%</div><div className="stat-label">Uptime</div></div>
          <div><div className="stat-value">50ms</div><div className="stat-label">Response time</div></div>
          <div><div className="stat-value">4.9/5</div><div className="stat-label">User rating</div></div>
        </div>

        {/* ─── Final CTA ─── */}
        <div className="final-cta">
          <h2>Ready to see your projects clearly?</h2>
          <p>Free for teams just getting started. No credit card required.</p>
          <Link href="/sign-up" className="btn-primary" style={{ margin: "0 auto" }}>Start for free</Link>
        </div>

        {/* ─── Footer ─── */}
        <footer className="land-footer">
          <div className="foot-grid">
            <div>
              <div className="word" style={{ fontSize: "16px" }}><span className="t1">Thread</span><span className="t2">line</span></div>
              <p className="foot-tagline">Visual project management for teams who think in systems.</p>
            </div>
            <div className="foot-col">
              <h4>Product</h4>
              <ul><li><a href="#features">Features</a></li><li><a href="#">Pricing</a></li><li><a href="#">Changelog</a></li></ul>
            </div>
            <div className="foot-col">
              <h4>Company</h4>
              <ul><li><a href="#">About</a></li><li><a href="#">Blog</a></li><li><a href="#">Contact</a></li></ul>
            </div>
            <div className="foot-col">
              <h4>Legal</h4>
              <ul><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul>
            </div>
          </div>
          <div className="foot-bottom">
            <div className="copy">&copy; 2026 Threadline</div>
            <div className="footer-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a></div>
          </div>
        </footer>
      </div>
    </>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="quote-card">
      <div className="stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 20 20"><path d="M10 1.5l2.5 5.6 6.1.6-4.6 4.1 1.3 6-5.3-3.2-5.3 3.2 1.3-6-4.6-4.1 6.1-.6z" fill="currentColor"/></svg>
        ))}
      </div>
      <div className="quote-text">&ldquo;{quote}&rdquo;</div>
      <div className="quote-person">
        <div className="quote-avatar"></div>
        <div><div className="quote-name">{name}</div><div className="quote-role">{role}</div></div>
      </div>
    </div>
  );
}

// ─── All styles from sample4.html, copied 1:1 ──────────────────────────────

const landingStyles = `
.landing-page {
  --ink: var(--bg-base);
  --surface: var(--bg-elevated);
  --surface-raised: var(--bg-muted);
  --hairline: var(--border-default);
  --text-1: var(--text-primary);
  --text-2: var(--text-secondary);
  --text-3: var(--text-muted);
  --violet-deep: #4C1D95;
  --violet: #8B5CF6;
  --violet-bright: #A78BFA;
  --orchid: #C4B5FD;
  --shadow-1: var(--shadow-sm);
  --shadow-2: var(--shadow-md);
}
.dark .landing-page {
  --violet-deep: #4C1D95;
  --violet: #8B5CF6;
  --violet-bright: #A78BFA;
  --orchid: #C4B5FD;
}

.land-nav { display: flex; align-items: center; justify-content: space-between; padding: 22px 48px; max-width: 1320px; margin: 0 auto; }
.word { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
.word .t1 { color: var(--text-1); }
.word .t2 { color: var(--violet-bright); }
.land-links { display: flex; gap: 34px; font-size: 14px; color: var(--text-2); }
.land-links a { text-decoration: none; color: inherit; transition: color .15s ease; }
.land-links a:hover { color: var(--text-1); }
.land-cta-nav { background: var(--text-1); color: var(--ink); padding: 10px 20px; border-radius: 999px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: transform .15s ease; text-decoration: none; }
.land-cta-nav:hover { transform: translateY(-1px); }
.land-nav-right { display: flex; align-items: center; gap: 16px; }
.land-link-nav { font-size: 14px; font-weight: 500; color: var(--text-2); text-decoration: none; transition: color .15s ease; }
.land-link-nav:hover { color: var(--text-1); }

.hero { max-width: 1320px; margin: 0 auto; padding: 80px 48px 60px; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; }
.eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--violet-bright); margin-bottom: 22px; }
.eyebrow::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--violet-bright); }
.hero h1 { font-size: 76px; font-weight: 200; line-height: 1.02; letter-spacing: -0.03em; margin-bottom: 26px; color: var(--text-1); }
.hero h1 b { font-weight: 600; background: linear-gradient(120deg, var(--violet-bright), var(--violet-deep)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero p.lead { font-size: 17px; color: var(--text-2); line-height: 1.6; max-width: 460px; margin-bottom: 34px; }
.hero-ctas { display: flex; gap: 14px; align-items: center; }
.landing-page .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, var(--violet), var(--violet-deep)); color: #fff; border: none; padding: 14px 24px; border-radius: 999px; font-size: 14.5px; font-weight: 600; cursor: pointer; box-shadow: 0 8px 24px rgba(139,92,246,0.35); transition: transform .18s ease, box-shadow .18s ease; text-decoration: none; }
.landing-page .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(139,92,246,0.42); }
.btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--text-1); border: 1px solid var(--hairline); padding: 14px 22px; border-radius: 999px; font-size: 14.5px; font-weight: 600; cursor: pointer; transition: all .18s ease; text-decoration: none; }
.btn-ghost:hover { border-color: var(--violet); color: var(--violet-bright); }

.hero-visual { position: relative; height: 420px; }
.glow-blob { position: absolute; width: 380px; height: 380px; border-radius: 50%; background: radial-gradient(circle, rgba(139,92,246,0.20), transparent 70%); top: 10px; right: 10px; filter: blur(10px); }
.float-card { position: absolute; background: var(--surface-raised); border: 1px solid var(--hairline); border-radius: var(--radius-lg); box-shadow: var(--shadow-2); }
.float-card.back1 { width: 200px; height: 120px; top: 10px; right: 10px; opacity: .5; transform: rotate(5deg); }
.float-card.back2 { width: 210px; height: 115px; bottom: 80px; left: -15px; opacity: .45; transform: rotate(-6deg); }
.float-card.main { width: 300px; padding: 12px 14px 16px; top: 80px; left: 50px; transform: rotate(-3deg); animation: floatIdle 6s ease-in-out infinite; }
@keyframes floatIdle { 0%,100% { transform: rotate(-3deg) translateY(0); } 50% { transform: rotate(-3deg) translateY(-10px); } }

.mini-tab-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.mini-dots { display: flex; gap: 4px; }
.mini-dots span { width: 6px; height: 6px; border-radius: 50%; }
.mini-url { flex: 1; background: var(--ink); border-radius: 4px; padding: 3px 8px; font-size: 8px; color: var(--text-3); text-align: center; }
.mini-graph { display: flex; align-items: flex-start; gap: 14px; padding-top: 0; }
.mini-branch { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.mini-node { background: var(--surface); border: 1px solid var(--hairline); border-radius: 6px; padding: 6px 10px; }
.mini-node.done { background: rgba(139,92,246,0.12); border-color: var(--violet); }
.mini-bar { height: 4px; border-radius: 99px; background: var(--violet-bright); margin-bottom: 4px; }
.mini-track { height: 3px; border-radius: 99px; background: var(--hairline); }
.mini-stem { width: 1px; height: 10px; background: var(--hairline); }

.social-proof { max-width: 1320px; margin: 50px auto 0; padding: 0 48px 90px; text-align: center; }
.social-proof .lbl { font-size: 11.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); margin-bottom: 26px; }
.logo-row { display: flex; justify-content: center; gap: 56px; flex-wrap: wrap; opacity: .5; font-weight: 700; font-size: 18px; letter-spacing: -0.01em; color: var(--text-1); }

.feature-row { max-width: 1320px; margin: 0 auto; padding: 120px 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 70px; align-items: center; }
.feature-row.rev .f-text { order: 2; }
.feature-row.rev .f-visual { order: 1; }
.f-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--violet-bright); margin-bottom: 14px; }
.f-text h3 { font-size: 34px; font-weight: 300; letter-spacing: -0.01em; margin-bottom: 16px; line-height: 1.15; color: var(--text-1); }
.f-text p { font-size: 15.5px; color: var(--text-2); line-height: 1.65; max-width: 420px; }
.f-visual { background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--radius-xl); box-shadow: var(--shadow-1); padding: 36px; min-height: 260px; display: flex; align-items: center; justify-content: center; }

.testimonial-section { max-width: 1320px; margin: 0 auto; padding: 60px 48px 40px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
.stars { display: flex; gap: 3px; color: var(--violet-bright); margin-bottom: 16px; }
.quote-card { background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-1); }
.quote-text { font-size: 14.5px; line-height: 1.6; margin-bottom: 20px; color: var(--text-1); }
.quote-person { display: flex; align-items: center; gap: 10px; }
.quote-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--violet-bright), var(--violet-deep)); flex-shrink: 0; }
.quote-name { font-size: 13.5px; font-weight: 600; color: var(--text-1); }
.quote-role { font-size: 12px; color: var(--text-3); }

.stats-row { max-width: 640px; margin: 0 auto; padding: 60px 48px 130px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
.stat-value { font-size: 32px; font-weight: 300; letter-spacing: -0.01em; color: var(--text-1); }
.stat-label { font-size: 11.5px; color: var(--text-3); margin-top: 6px; }

.final-cta { max-width: 1000px; margin: 0 auto 110px; padding: 70px 48px; text-align: center; background: linear-gradient(160deg, var(--surface), var(--surface-raised)); border: 1px solid var(--hairline); border-radius: var(--radius-xl); box-shadow: var(--shadow-2); }
.final-cta h2 { font-size: 40px; font-weight: 300; letter-spacing: -0.02em; margin-bottom: 16px; color: var(--text-1); }
.final-cta p { color: var(--text-2); margin-bottom: 30px; font-size: 15.5px; }

.land-footer { max-width: 1320px; margin: 0 auto; padding: 60px 48px 60px; }
.foot-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 48px; }
.foot-tagline { font-size: 13px; color: var(--text-3); margin-top: 14px; max-width: 200px; line-height: 1.6; }
.foot-col h4 { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--text-3); margin-bottom: 16px; }
.foot-col ul { list-style: none; }
.foot-col li { margin-bottom: 12px; }
.foot-col a { font-size: 13.5px; color: var(--text-2); text-decoration: none; transition: color .15s ease; }
.foot-col a:hover { color: var(--text-1); }
.foot-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 28px; border-top: 1px solid var(--hairline); }
.land-footer .copy { font-size: 12.5px; color: var(--text-3); }
.footer-links { display: flex; gap: 24px; font-size: 13px; }
.footer-links a { color: var(--text-2); text-decoration: none; transition: color .15s ease; }
.footer-links a:hover { color: var(--text-1); }

/* Light mode fixes — inverted gradients and better card appearance */
:root .landing-page .btn-primary,
:not(.dark) .landing-page .btn-primary {
  background: linear-gradient(135deg, #4C1D95, #2E1065);
}
:root .landing-page .final-cta,
:not(.dark) .landing-page .final-cta {
  background: linear-gradient(160deg, var(--surface-raised), var(--surface));
}
:root .landing-page .float-card,
:not(.dark) .landing-page .float-card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.10);
  border-color: rgba(0,0,0,0.06);
}
:root .landing-page .float-card.main,
:not(.dark) .landing-page .float-card.main {
  background: #FFFFFF;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 2px 6px rgba(0,0,0,0.14), 0 6px 16px rgba(0,0,0,0.10);
}
:root .landing-page .mini-url,
:not(.dark) .landing-page .mini-url {
  background: #F5F5F6;
}
:root .landing-page .glow-blob,
:not(.dark) .landing-page .glow-blob {
  background: radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%);
}
/* Dark mode uses the original gradient direction */
.dark .landing-page .btn-primary {
  background: linear-gradient(135deg, #C4B5FD, #6D28D9);
}
.dark .landing-page .final-cta {
  background: linear-gradient(160deg, var(--surface), var(--surface-raised));
}
/* Dark mode main card — explicit dark surface so it doesn't look washed out */
.dark .landing-page .float-card {
  background: #1C1C1F;
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 2px 4px rgba(0,0,0,0.4), 0 8px 18px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
}
.dark .landing-page .float-card.main {
  background: #151517;
  border-color: rgba(255,255,255,0.08);
}
.dark .landing-page .mini-url {
  background: #0A0A0B;
}
.dark .landing-page .mini-node {
  background: #1C1C1F;
  border-color: rgba(255,255,255,0.08);
}
/* Light mode h1 gradient — dark gradient (deep to dark) on white bg */
:root .landing-page .hero h1 b,
:not(.dark) .landing-page .hero h1 b {
  background: linear-gradient(120deg, #4C1D95, #2E1065);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
/* Dark mode h1 gradient — light to dark */
.dark .landing-page .hero h1 b {
  background: linear-gradient(120deg, #C4B5FD, #6D28D9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@media (max-width: 900px) {
  .hero, .feature-row, .testimonial-section, .foot-grid { grid-template-columns: 1fr; }
  .feature-row.rev .f-text, .feature-row.rev .f-visual { order: unset; }
  .hero h1 { font-size: 48px; }
  .hero-visual { height: 300px; margin-top: 20px; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .foot-bottom { flex-direction: column; gap: 12px; align-items: flex-start; }
  .land-nav { padding: 16px 24px; }
  .land-links { display: none; }
  .hero { padding: 40px 24px 40px; }
  .social-proof { padding: 0 24px 60px; }
  .feature-row { padding: 60px 24px; }
  .testimonial-section { padding: 40px 24px; }
  .stats-row { padding: 40px 24px 80px; }
  .final-cta { margin: 0 16px 60px; padding: 40px 24px; }
  .land-footer { padding: 40px 24px; }
}
`;

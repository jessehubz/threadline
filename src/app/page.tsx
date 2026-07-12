import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingNav } from "@/components/landing-nav";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: landingStyles }} />
      <div className="landing-page">
        {/* ─── Sticky Nav ─── */}
        <div className="land-nav-wrapper" id="home">
          <LandingNav />
        </div>

        {/* ─── Hero ─── */}
        <div className="hero">
          <div>
            <h1>Pull every<br/>thread <b>together.</b></h1>
            <p className="lead">Map your tasks as visual dependency graphs. See what blocks what, who owns what, and what ships next — all on one infinite canvas your whole team edits in real time.</p>
            <div className="hero-ctas">
              <Link href="/sign-up" className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 20 20"><line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Start for free
              </Link>
              <a href="#services" className="btn-ghost">See how it works</a>
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

        {/* ─── About Us Section ─── */}
        <section id="about" className="land-section">
          <RevealOnScroll>
            <div className="section-header">
              <div className="f-eyebrow">About Us</div>
              <h2 className="section-title">Built by builders,<br/>for builders.</h2>
              <p className="section-subtitle">We&apos;re a small, obsessive team that believes project management should think the way engineers think — in graphs, not lists. Threadline was born from the frustration of forcing complex, interconnected work into flat tools that weren&apos;t designed for it.</p>
            </div>
          </RevealOnScroll>

          {/* Social Proof */}
          <RevealOnScroll delay={100}>
            <div className="social-proof">
              <div className="lbl">Trusted by teams shipping real projects</div>
              <div className="logo-row">
                <span>Vector</span><span>Northwind</span><span>Fablehouse</span><span>Solace</span><span>Kindred</span>
              </div>
            </div>
          </RevealOnScroll>

          {/* Testimonials */}
          <RevealOnScroll delay={150}>
            <div className="testimonial-section">
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
          </RevealOnScroll>

          {/* Stats */}
          <RevealOnScroll delay={200}>
            <div className="stats-row">
              <div><div className="stat-value">2,000+</div><div className="stat-label">Active teams</div></div>
              <div><div className="stat-value">99.9%</div><div className="stat-label">Uptime</div></div>
              <div><div className="stat-value">50ms</div><div className="stat-label">Response time</div></div>
              <div><div className="stat-value">4.9/5</div><div className="stat-label">User rating</div></div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ─── Services Section ─── */}
        <section id="services" className="land-section">
          <RevealOnScroll>
            <div className="section-header">
              <div className="f-eyebrow">Services</div>
              <h2 className="section-title">Everything you need to ship,<br/>nothing you don&apos;t.</h2>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={80}>
            <div className="feature-row">
              <div className="f-text">
                <div className="f-eyebrow">The core idea</div>
                <h3>Tasks aren&apos;t a list. They&apos;re a graph.</h3>
                <p>Draw dependencies between tasks on an infinite canvas. See instantly what&apos;s blocked, what&apos;s ready, and what the critical path looks like — no spreadsheet gymnastics required.</p>
              </div>
              <div className="f-visual" style={{ flexDirection: "column", alignItems: "center", gap: "0", padding: "28px" }}>
                <svg width="220" height="180" viewBox="0 0 220 180" fill="none">
                  <line x1="70" y1="40" x2="150" y2="40" stroke="var(--hairline)" strokeWidth="1.5"/>
                  <line x1="70" y1="40" x2="110" y2="100" stroke="var(--hairline)" strokeWidth="1.5"/>
                  <line x1="150" y1="40" x2="110" y2="100" stroke="var(--hairline)" strokeWidth="1.5"/>
                  <line x1="110" y1="100" x2="110" y2="150" stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="4 3"/>
                  <circle cx="70" cy="40" r="16" fill="var(--surface-raised)" stroke="var(--violet)" strokeWidth="2"/>
                  <text x="70" y="44" textAnchor="middle" fontSize="8" fill="var(--violet-bright)" fontWeight="600">Design</text>
                  <circle cx="150" cy="40" r="16" fill="var(--surface-raised)" stroke="var(--violet-bright)" strokeWidth="2"/>
                  <text x="150" y="44" textAnchor="middle" fontSize="8" fill="var(--violet-bright)" fontWeight="600">API</text>
                  <circle cx="110" cy="100" r="18" fill="rgba(139,92,246,0.12)" stroke="var(--violet)" strokeWidth="2"/>
                  <text x="110" y="96" textAnchor="middle" fontSize="7" fill="var(--violet-bright)" fontWeight="600">Build</text>
                  <text x="110" y="108" textAnchor="middle" fontSize="6" fill="var(--text-3)">blocked</text>
                  <circle cx="110" cy="150" r="14" fill="rgba(139,92,246,0.18)" stroke="var(--violet)" strokeWidth="2"/>
                  <text x="110" y="148" textAnchor="middle" fontSize="7" fill="var(--violet-bright)" fontWeight="600">Ship</text>
                  <text x="110" y="158" textAnchor="middle" fontSize="6" fill="var(--text-3)">next</text>
                  <circle cx="30" cy="90" r="12" fill="rgba(139,92,246,0.2)" stroke="var(--violet)" strokeWidth="1.5"/>
                  <path d="M25 90 L28 93 L35 86" stroke="var(--violet-bright)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <line x1="42" y1="90" x2="70" y2="40" stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 2"/>
                </svg>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={80}>
            <div className="feature-row rev">
              <div className="f-text">
                <div className="f-eyebrow">AI-powered</div>
                <h3>Describe it. We&apos;ll build the graph.</h3>
                <p>Tell the AI assistant what you&apos;re building in plain English. It generates a full dependency graph with tasks, connections, and sensible structure — ready to edit and assign.</p>
              </div>
              <div className="f-visual" style={{ flexDirection: "column", alignItems: "stretch", gap: "14px", padding: "28px" }}>
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
          </RevealOnScroll>

          <RevealOnScroll delay={80}>
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
          </RevealOnScroll>

          <RevealOnScroll delay={80}>
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
          </RevealOnScroll>
        </section>

        {/* ─── Contact Section ─── */}
        <section id="contact" className="land-section">
          <RevealOnScroll>
            <div className="contact-section">
              <div className="contact-content">
                <div className="f-eyebrow">Contact</div>
                <h2 className="section-title">Let&apos;s talk about<br/>your workflow.</h2>
                <p className="section-subtitle">Whether you&apos;re exploring Threadline for your team or need help with an existing workspace, we&apos;re here. Reach out and we&apos;ll get back to you within a business day.</p>
                <div className="contact-grid">
                  <div className="contact-card">
                    <div className="contact-card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <h4>Email us</h4>
                    <p>hello@threadline.app</p>
                  </div>
                  <div className="contact-card">
                    <div className="contact-card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <h4>Live chat</h4>
                    <p>Available weekdays, 9am–6pm EST</p>
                  </div>
                  <div className="contact-card">
                    <div className="contact-card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <h4>Schedule a demo</h4>
                    <p>30-minute walkthrough, tailored to your team</p>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ─── Final CTA ─── */}
        <RevealOnScroll>
          <div className="final-cta">
            <h2>Ready to see your projects clearly?</h2>
            <p>Free for teams just getting started. No credit card required.</p>
            <Link href="/sign-up" className="btn-primary" style={{ margin: "0 auto" }}>Start for free</Link>
          </div>
        </RevealOnScroll>

        {/* ─── Footer ─── */}
        <footer className="land-footer">
          <div className="foot-row">
            <div className="foot-brand">
              <div className="word" style={{ fontSize: "16px" }}><span className="t1">Thread</span><span className="t2">line</span></div>
              <span className="foot-tagline">Visual project management for teams who think in systems.</span>
            </div>
            <div className="foot-links-row">
              <a href="#services">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Changelog</a>
            </div>
          </div>
          <div className="foot-bottom">
            <div className="copy">&copy; 2026 Threadline</div>
            <div className="footer-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#contact">Contact</a></div>
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

// ─── Landing Page Styles ──────────────────────────────────────────────────────

const landingStyles = `
/* ─── Variables ─── */
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
  --nav-height: 72px;
  overflow-x: hidden;
}
.dark .landing-page {
  --violet-deep: #4C1D95;
  --violet: #8B5CF6;
  --violet-bright: #A78BFA;
  --orchid: #C4B5FD;
}

/* ─── Sticky Nav ─── */
.land-nav-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-base);
  transition: background-color 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease;
}
.land-nav-wrapper:has(.land-nav--scrolled) {
  background: color-mix(in srgb, var(--bg-base) 85%, transparent);
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
}
.dark .land-nav-wrapper:has(.land-nav--scrolled) {
  background: color-mix(in srgb, var(--bg-base) 80%, transparent);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2);
}

.land-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 48px;
  max-width: 1320px;
  margin: 0 auto;
  transition: padding 0.3s ease;
}
.land-nav--scrolled {
  padding-top: 14px;
  padding-bottom: 14px;
}

.word { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
.word .t1 { color: var(--text-1); }
.word .t2 { color: var(--violet-bright); }

.land-links { display: flex; gap: 32px; font-size: 14px; color: var(--text-2); }
.land-links a { text-decoration: none; color: inherit; transition: color .15s ease; position: relative; }
.land-links a:hover { color: var(--text-1); }
.land-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 1.5px;
  background: var(--violet-bright);
  transform: scaleX(0);
  transition: transform 0.2s ease;
  border-radius: 1px;
}
.land-links a:hover::after { transform: scaleX(1); }

.land-cta-nav { background: var(--text-1); color: var(--ink); padding: 10px 20px; border-radius: 999px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: transform .15s ease, opacity .15s ease; text-decoration: none; }
.land-cta-nav:hover { transform: translateY(-1px); opacity: 0.9; }
.land-nav-right { display: flex; align-items: center; gap: 16px; }
.land-link-nav { font-size: 14px; font-weight: 500; color: var(--text-2); text-decoration: none; transition: color .15s ease; }
.land-link-nav:hover { color: var(--text-1); }

/* Mobile hamburger toggle */
.land-mobile-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-1);
  cursor: pointer;
  transition: background 0.15s ease;
}
.land-mobile-toggle:hover { background: var(--surface-raised); }

/* Mobile dropdown — hidden on desktop */
.land-mobile-dropdown {
  display: none;
}

/* Mobile menu (active styles applied via responsive query) */
@media (max-width: 900px) {
  .land-mobile-dropdown {
    display: block;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 150;
    padding: 8px 24px 24px;
    background: var(--bg-base);
    border-bottom: 1px solid var(--hairline);
    animation: dropIn 0.2s cubic-bezier(0.16,1,0.3,1);
  }
}
@keyframes dropIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.land-mobile-inner {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.land-mobile-link {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-2);
  text-decoration: none;
  padding: 12px 0;
  transition: color 0.15s ease;
}
.land-mobile-link:hover { color: var(--text-1); }
.land-mobile-divider {
  height: 1px;
  background: var(--hairline);
  margin: 8px 0;
}
.land-mobile-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 4px;
}
.land-mobile-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--text-1);
  color: var(--ink);
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.15s ease;
}
.land-mobile-cta:hover { opacity: 0.9; }

/* Hamburger icon — two lines that animate to X */
.hamburger-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
  gap: 5px;
  position: relative;
}
.hamburger-icon span {
  display: block;
  width: 18px;
  height: 1.5px;
  background: var(--text-1);
  border-radius: 1px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.hamburger-icon.open span:first-child {
  transform: translateY(3.25px) rotate(45deg);
}
.hamburger-icon.open span:last-child {
  transform: translateY(-3.25px) rotate(-45deg);
}

/* ─── Sections ─── */
.land-section {
  scroll-margin-top: var(--nav-height);
}

.section-header {
  max-width: 1320px;
  margin: 0 auto;
  padding: 100px 48px 40px;
  text-align: center;
}
.section-title {
  font-size: 42px;
  font-weight: 200;
  letter-spacing: -0.025em;
  line-height: 1.15;
  color: var(--text-1);
  margin-bottom: 20px;
}
.section-subtitle {
  font-size: 16px;
  color: var(--text-2);
  line-height: 1.65;
  max-width: 560px;
  margin: 0 auto;
}

/* ─── Hero ─── */
.hero {
  max-width: 1320px;
  margin: 0 auto;
  padding: 80px 48px 60px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
  align-items: center;
  position: relative;
  overflow: visible;
}
/* Dots — covers entire hero including text and cards */
.hero::before {
  content: '';
  position: absolute;
  inset: -150px -500px;
  background-image: radial-gradient(circle, var(--dot-color) 1px, transparent 1px);
  background-size: 28px 28px;
  -webkit-mask-image: radial-gradient(ellipse 78% 72% at 50% 50%, black 30%, transparent 72%);
  mask-image: radial-gradient(ellipse 78% 72% at 50% 50%, black 30%, transparent 72%);
  pointer-events: none;
  z-index: 0;
}
.hero > * { position: relative; z-index: 1; }
.landing-page { --dot-color: rgba(0, 0, 0, 0.13); }
.dark .landing-page { --dot-color: rgba(255, 255, 255, 0.10); }
.eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--text-3); margin-bottom: 22px; opacity: 0.7; }
.eyebrow::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--violet-bright); opacity: 0.5; }
.hero h1 { font-size: 76px; font-weight: 200; line-height: 1.02; letter-spacing: -0.03em; margin-bottom: 26px; color: var(--text-1); }
.hero h1 b { font-weight: 600; background: linear-gradient(120deg, var(--violet-bright), var(--violet-deep)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero p.lead { font-size: 17px; color: var(--text-2); line-height: 1.6; max-width: 460px; margin-bottom: 34px; }
.hero-ctas { display: flex; gap: 14px; align-items: center; }

/* Landing btn-primary with gradient */
.landing-page .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, var(--violet), var(--violet-deep)); color: #fff; border: none; padding: 14px 24px; border-radius: 999px; font-size: 14.5px; font-weight: 600; cursor: pointer; box-shadow: 0 8px 24px rgba(139,92,246,0.35); transition: transform .18s ease, box-shadow .18s ease; text-decoration: none; }
.landing-page .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(139,92,246,0.42); }
.btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--text-1); border: 1px solid var(--hairline); padding: 14px 22px; border-radius: 999px; font-size: 14.5px; font-weight: 600; cursor: pointer; transition: all .18s ease; text-decoration: none; }
.btn-ghost:hover { border-color: var(--violet); color: var(--violet-bright); }

/* ─── Hero Visual: Stacked / Overlapping card layout (2x size) ─── */
.hero-visual {
  position: relative;
  height: 580px;
}
.glow-blob {
  position: absolute;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: blur(14px);
  pointer-events: none;
}
.float-card {
  position: absolute;
  background: var(--surface-raised);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2);
  z-index: 3;
}

/* Back card 1 — top-right position (highest in the ladder) */
.float-card.back1 {
  width: 380px;
  height: 230px;
  top: 20px;
  left: 50%;
  margin-left: -60px;
  transform: rotate(4deg);
  opacity: .5;
}
/* Back card 2 — bottom-left position (lowest in the ladder) */
.float-card.back2 {
  width: 400px;
  height: 220px;
  bottom: 30px;
  left: 50%;
  margin-left: -340px;
  transform: rotate(-5deg);
  opacity: .45;
}
/* Main card (front) — center-middle position */
.float-card.main {
  width: 440px;
  padding: 18px 20px 24px;
  top: 140px;
  left: 50%;
  margin-left: -220px;
  transform: rotate(-2deg);
  animation: floatIdle 6s ease-in-out infinite;
  z-index: 5;
}

@keyframes floatIdle {
  0%,100% { transform: rotate(-2deg) translateY(0); }
  50% { transform: rotate(-2deg) translateY(-10px); }
}

/* Mini card internals scaled proportionally */
.mini-tab-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.mini-dots { display: flex; gap: 6px; }
.mini-dots span { width: 9px; height: 9px; border-radius: 50%; }
.mini-url { flex: 1; background: var(--ink); border-radius: 6px; padding: 5px 12px; font-size: 11px; color: var(--text-3); text-align: center; }
.mini-graph { display: flex; align-items: flex-start; gap: 20px; padding-top: 4px; }
.mini-branch { display: flex; flex-direction: column; align-items: center; gap: 9px; }
.mini-node { background: var(--surface); border: 1px solid var(--hairline); border-radius: 8px; padding: 9px 14px; }
.mini-node.done { background: rgba(139,92,246,0.12); border-color: var(--violet); }
.mini-bar { height: 6px; border-radius: 99px; background: var(--violet-bright); margin-bottom: 5px; }
.mini-track { height: 4px; border-radius: 99px; background: var(--hairline); }
.mini-stem { width: 1.5px; height: 14px; background: var(--hairline); }

/* ─── Social Proof ─── */
.social-proof { max-width: 1320px; margin: 30px auto 0; padding: 0 48px 60px; text-align: center; }
.social-proof .lbl { font-size: 11.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); margin-bottom: 26px; }
.logo-row { display: flex; justify-content: center; gap: 56px; flex-wrap: wrap; opacity: .5; font-weight: 700; font-size: 18px; letter-spacing: -0.01em; color: var(--text-1); }

/* ─── Feature Rows ─── */
.feature-row { max-width: 1320px; margin: 0 auto; padding: 80px 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 70px; align-items: center; }
.feature-row.rev .f-text { order: 2; }
.feature-row.rev .f-visual { order: 1; }
.f-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--violet-bright); margin-bottom: 14px; }
.f-text h3 { font-size: 34px; font-weight: 300; letter-spacing: -0.01em; margin-bottom: 16px; line-height: 1.15; color: var(--text-1); }
.f-text p { font-size: 15.5px; color: var(--text-2); line-height: 1.65; max-width: 420px; }
.f-visual { background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--radius-xl); box-shadow: var(--shadow-1); padding: 36px; min-height: 260px; display: flex; align-items: center; justify-content: center; }

/* ─── Testimonials ─── */
.testimonial-section { max-width: 1320px; margin: 0 auto; padding: 40px 48px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
.stars { display: flex; gap: 3px; color: var(--violet-bright); margin-bottom: 16px; }
.quote-card { background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-1); }
.quote-text { font-size: 14.5px; line-height: 1.6; margin-bottom: 20px; color: var(--text-1); }
.quote-person { display: flex; align-items: center; gap: 10px; }
.quote-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--violet-bright), var(--violet-deep)); flex-shrink: 0; }
.quote-name { font-size: 13.5px; font-weight: 600; color: var(--text-1); }
.quote-role { font-size: 12px; color: var(--text-3); }

/* ─── Stats ─── */
.stats-row { max-width: 640px; margin: 0 auto; padding: 60px 48px 40px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
.stat-value { font-size: 32px; font-weight: 300; letter-spacing: -0.01em; color: var(--text-1); }
.stat-label { font-size: 11.5px; color: var(--text-3); margin-top: 6px; }

/* ─── Contact Section ─── */
.contact-section {
  max-width: 1320px;
  margin: 0 auto;
  padding: 100px 48px 80px;
  text-align: center;
}
.contact-content .section-title { margin-bottom: 16px; }
.contact-content .section-subtitle { margin-bottom: 48px; }
.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
}
.contact-card {
  background: var(--surface);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  text-align: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.contact-card:hover {
  border-color: var(--violet);
  box-shadow: 0 0 0 1px rgba(139,92,246,0.1), var(--shadow-1);
}
.contact-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(139,92,246,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: var(--violet-bright);
}
.contact-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 8px;
}
.contact-card p {
  font-size: 13.5px;
  color: var(--text-2);
  line-height: 1.5;
}

/* ─── Final CTA ─── */
.final-cta { max-width: 1000px; margin: 60px auto 110px; padding: 70px 48px; text-align: center; background: linear-gradient(160deg, var(--surface), var(--surface-raised)); border: 1px solid var(--hairline); border-radius: var(--radius-xl); box-shadow: var(--shadow-2); }
.final-cta h2 { font-size: 40px; font-weight: 300; letter-spacing: -0.02em; margin-bottom: 16px; color: var(--text-1); }
.final-cta p { color: var(--text-2); margin-bottom: 30px; font-size: 15.5px; }

/* ─── Footer ─── */
.land-footer { max-width: 1320px; margin: 0 auto; padding: 48px 48px; }
.foot-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.foot-brand { display: flex; align-items: center; gap: 16px; }
.foot-tagline { font-size: 13px; color: var(--text-3); line-height: 1.5; }
.foot-links-row { display: flex; gap: 28px; }
.foot-links-row a { font-size: 13.5px; color: var(--text-2); text-decoration: none; transition: color .15s ease; }
.foot-links-row a:hover { color: var(--text-1); }
.foot-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid var(--hairline); }
.land-footer .copy { font-size: 12.5px; color: var(--text-3); }
.footer-links { display: flex; gap: 24px; font-size: 13px; }
.footer-links a { color: var(--text-2); text-decoration: none; transition: color .15s ease; }
.footer-links a:hover { color: var(--text-1); }

/* ─── Task 5: Gradient Direction Fix (subtle) ─── */
/* Light mode: darker → lighter (left to right), softened */
:root .landing-page .hero h1 b,
:not(.dark) .landing-page .hero h1 b {
  background: linear-gradient(120deg, #7C3AED, #C4B5FD);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
:root .landing-page .btn-primary,
:not(.dark) .landing-page .btn-primary {
  background: linear-gradient(135deg, #7C3AED, #C4B5FD);
}
/* Dark mode: lighter → darker (left to right), softened */
.dark .landing-page .hero h1 b {
  background: linear-gradient(120deg, #C4B5FD, #7C3AED);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.dark .landing-page .btn-primary {
  background: linear-gradient(135deg, #C4B5FD, #7C3AED);
}

/* ─── Light/Dark Mode Card Overrides ─── */
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

.dark .landing-page .final-cta {
  background: linear-gradient(160deg, var(--surface), var(--surface-raised));
}
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

/* ─── Responsive ─── */
@media (max-width: 900px) {
  .land-nav { padding: 16px 24px; }
  .land-links { display: none; }
  .land-nav-right .land-link-nav,
  .land-nav-right .land-cta-nav { display: none; }
  .land-mobile-toggle { display: flex; }

  .hero { grid-template-columns: 1fr; padding: 40px 24px 40px; }
  .hero h1 { font-size: 48px; }
  .hero-visual { height: 420px; margin-top: 20px; }
  .float-card.back1 { width: 260px; height: 156px; margin-left: -40px; top: 15px; }
  .float-card.back2 { width: 270px; height: 150px; margin-left: -230px; bottom: 25px; }
  .float-card.main { width: 300px; padding: 14px 16px 18px; top: 95px; margin-left: -150px; }
  .mini-dots span { width: 7px; height: 7px; }
  .mini-url { font-size: 9px; padding: 4px 8px; }
  .mini-graph { gap: 14px; }
  .mini-node { padding: 7px 10px; }
  .mini-bar { height: 5px; }
  .mini-track { height: 3px; }
  .mini-stem { height: 10px; }

  .section-header { padding: 60px 24px 24px; }
  .section-title { font-size: 32px; }
  .social-proof { padding: 0 24px 40px; }
  .feature-row { grid-template-columns: 1fr; padding: 40px 24px; gap: 32px; }
  .feature-row.rev .f-text, .feature-row.rev .f-visual { order: unset; }
  .testimonial-section { grid-template-columns: 1fr; padding: 24px 24px; gap: 16px; }
  .stats-row { grid-template-columns: repeat(2, 1fr); padding: 40px 24px 40px; }
  .contact-section { padding: 60px 24px 40px; }
  .contact-grid { grid-template-columns: 1fr; max-width: 360px; }
  .final-cta { margin: 40px 16px 60px; padding: 40px 24px; }
  .final-cta h2 { font-size: 30px; }
  .land-footer { padding: 32px 24px; }
  .foot-row { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
  .foot-brand { flex-direction: column; align-items: flex-start; gap: 8px; }
  .foot-links-row { gap: 20px; }
  .foot-bottom { flex-direction: row; justify-content: space-between; align-items: center; }
}

@media (max-width: 480px) {
  .hero-visual { height: 340px; }
  .float-card.back1 { width: 200px; height: 120px; margin-left: -30px; top: 10px; }
  .float-card.back2 { width: 210px; height: 116px; margin-left: -180px; bottom: 20px; }
  .float-card.main { width: 240px; padding: 10px 12px 14px; top: 75px; margin-left: -120px; }
  .mini-tab-bar { gap: 6px; margin-bottom: 6px; }
  .mini-dots span { width: 6px; height: 6px; }
  .mini-url { font-size: 8px; }
  .mini-graph { gap: 10px; }
  .mini-node { padding: 5px 8px; border-radius: 5px; }
  .mini-bar { height: 4px; margin-bottom: 3px; }
  .mini-track { height: 3px; }
  .mini-stem { height: 8px; }
  .stats-row { gap: 16px; }
  .foot-links-row { gap: 16px; }
  .foot-links-row a { font-size: 12.5px; }
  .footer-links { gap: 16px; font-size: 12px; }
  .land-footer .copy { font-size: 11.5px; }
}
`;

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingNav } from "@/components/landing-nav";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { FloatingThemeToggle } from "@/components/floating-theme-toggle";
import { SiteFooter } from "@/components/site-footer";

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

        {/* ─── Hero ─── */}
        <div className="hero">
          <div>
            <h1>Work flows when <br/>you see <span className="h1-2">how it connects.</span></h1>
            <p className="lead">Master complex projects and never lose sight of what's blocking your team with intelligent, real-time dependency mapping.</p>
            <div className="hero-ctas">
              <Link href="/sign-up" className="btn-primary">
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
                <div className="mini-url">threadline.app</div>
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

        <section id="about" className="land-section">
          <RevealOnScroll>
            <div className="section-header">
              <div className="f-eyebrow">About Me</div>
              <h2 className="section-title">No team. No funding.<br/>Just one stubborn developer.</h2>
              <p className="section-subtitle">I got tired of forcing complex, tangled projects into flat checklists that weren&apos;t built for how work actually connects. So I built the tool I wished existed, <b>threadline</b>, one that thinks in graphs, not lists.</p>
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
                quote="We were losing a day every sprint untangling blocked tickets in Jira. Now the graph just shows us where the chain actually breaks."
                name="Sarah Chen"
                role="Engineering Lead, Vector"
              />
              <TestimonialCard
                quote="Our team is split across three time zones. Seeing changes land in real time cut our standup down from thirty minutes to ten."
                name="Marcus Rodriguez"
                role="Product Manager, Northwind"
              />
              <TestimonialCard
                quote="Most tools flatten everything into a list. This is the first one that actually models how our approvals and sub-projects depend on each other."
                name="Anika Patel"
                role="Design Director, Fablehouse"
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
              <h2 className="section-title">Built for how real teams actually work.</h2>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={80}>
            <div className="feature-row">
              <div className="f-text">
                <div className="f-eyebrow">The core idea</div>
                <h3>Tasks aren&apos;t a list. They&apos;re a graph.</h3>
                <p>Draw dependencies between tasks on an infinite canvas. See instantly what&apos;s blocked, what&apos;s ready, and what the critical path looks like.</p>
              </div>
              <div className="f-visual" style={{ padding: "28px" }}>
                <div className="mg-graph">
                  <svg className="mg-edges" width="180" height="132" viewBox="0 0 180 132" fill="none">
                    <defs>
                      <marker id="mg-arrow" markerWidth="6" markerHeight="6" refX="4.4" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="var(--violet)" />
                      </marker>
                    </defs>
                    <path d="M30,28 C30,38 66,38 90,44" stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#mg-arrow)"/>
                    <path d="M150,28 C150,38 114,38 90,44" stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#mg-arrow)"/>
                    <path d="M90,72 C90,78 90,82 90,88" stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#mg-arrow)"/>
                  </svg>

                  <div className="mg-node mg-node-done" style={{ left: 0, top: 0, width: 60 }}>
                    <div className="mg-node-bar" />
                    <div className="mg-node-line" style={{ width: "34px" }} />
                  </div>

                  <div className="mg-node mg-node-done" style={{ right: 0, top: 0, width: 60 }}>
                    <div className="mg-node-bar" />
                    <div className="mg-node-line" style={{ width: "28px" }} />
                  </div>

                  <div className="mg-node mg-node-blocked" style={{ left: "50%", transform: "translateX(-50%)", top: 44, width: 68 }}>
                    <div className="mg-node-bar" />
                    <div className="mg-node-line" style={{ width: "38px" }} />
                  </div>

                  <div className="mg-node mg-node-pending" style={{ left: "50%", transform: "translateX(-50%)", top: 88, width: 58 }}>
                    <div className="mg-node-bar" />
                    <div className="mg-node-line" style={{ width: "26px" }} />
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={80}>
            <div className="feature-row rev">
              <div className="f-text">
                <div className="f-eyebrow">AI-powered</div>
                <h3>Describe it. We&apos;ll build the graph.</h3>
                <p>Tell the AI assistant what you&apos;re building. It generates a full dependency graph with tasks, connections, and sensible structure that are ready to edit and assign.</p>
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
                    <div style={{ fontSize: "10px", fontWeight: 400, color: "#ffffff", marginBottom: "6px" }}>✦ Generated 5 tasks, 4 dependencies</div>
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
                <p>Threadline surfaces blockers and stale tasks automatically, so problems get caught in a morning check-in and not two weeks before a deadline.</p>
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
                <p>Workload views show who&apos;s stretched thin and who has room so the next task goes to the right person, automatically informed, never guessed.</p>
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
                <p className="section-subtitle">Whether you&apos;re exploring <b>threadline</b> for your team or need help with an existing workspace, we&apos;re here. Reach out and we&apos;ll get back to you within a business day.</p>
                <div className="contact-grid">
                  <a href="mailto:jdfrancisco5@up.edu.ph" className="contact-item">
                    <span className="contact-item-label">Email</span>
                    <span className="contact-item-value">jdfrancisco5@up.edu.ph</span>
                  </a>
                  <a href="https://www.linkedin.com/in/jessedavidf/" className="contact-item">
                    <span className="contact-item-label">LinkedIn</span>
                    <span className="contact-item-value">linkedin.com/in/jessedavidf</span>
                  </a>
                  <a href="https://github.com/jessehubz" className="contact-item">
                    <span className="contact-item-label">GitHub</span>
                    <span className="contact-item-value">github.com/jessehubz</span>
                  </a>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ─── Final CTA ─── */}
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
        <div className="quote-name">{name}</div>
        <div className="quote-role">{role}</div>
      </div>
    </div>
  );
}

// ─── Landing Page Styles ──────────────────────────────────────────────────────

const landingStyles = `
/* ────────────────────────────────────────────────────────────────────────
   Landing Page Styles — table of contents
   1. Variables      5. Hero (visual)    9. Stats
   2. Sticky Nav      6. Social Proof    10. Contact Section
   3. Section Header  7. Feature Rows    11. Final CTA
   4. Hero (text)     8. Testimonials    12. Footer
                                          13. Responsive
   Light/dark overrides live directly under the rule they override,
   not in a separate block — search for ":not(.dark)" / ".dark ".
   ──────────────────────────────────────────────────────────────────────── */

/* ─── 1. Variables ─── */
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

/* ─── 2. Sticky Nav ─── */
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

.word { font-family: 'Inter', sans-serif; font-size: 25px; font-weight: 450; letter-spacing: 0.05em; }
.word .t1 { color: var(--text-1); }
.word .t2 { color: #7C3AED;; }


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
/* Mobile icon nav - hidden on desktop, shown on mobile */
.land-mobile-icons {
  display: none;
  align-items: center;
  gap: 4px;
}
.land-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: var(--text-2);
  text-decoration: none;
  transition: all 0.18s ease;
  position: relative;
}
.land-icon-btn:hover {
  color: var(--violet);
  background: rgba(139,92,246,0.08);
  transform: translateY(-1px);
}
.land-icon-btn:active {
  transform: scale(0.9);
  background: rgba(139,92,246,0.15);
}

/* ─── 3. Section Header (shared across sections) ─── */
.land-section {
  scroll-margin-top: var(--nav-height);
}

.section-header {
  max-width: 1320px;
  margin: 0 auto;
  padding: 84px 48px 40px;
  text-align: center;
}
.section-title {
  font-family: 'inter', sans-serif;
  font-size: 42px;
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 1.15;
  color: var(--text-1);
  margin-bottom: 20px;
  padding-top: 8px;
}
.section-subtitle {
  font-family: "Figtree", sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: var(--text-2);
  line-height: 1.65;
  max-width: 560px;
  margin: 0 auto;
}

/* ─── 4. Hero — text side ─── */
.hero {
  max-width: 1320px;
  margin: 0 auto;
  padding: 80px 48px 64px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 72px;
  align-items: center;
  position: relative;
  overflow: visible;
}
/* Dots - covers entire hero including text and cards */
.hero::before {
  content: '';
  position: absolute;
  inset: -150px -500px;
  background-image: radial-gradient(circle, var(--dot-color) 1px, transparent 1px);
  background-size: 28px 28px;
  -webkit-mask-image: radial-gradient(ellipse 78% 72% at 50% 50%, black 30%, transparent 72%);
  mask-image: radial-gradient(ellipse 78% 72% at 50% 50%, black 30%, transparent 72%);
  pointer-events: none;
  z-index: -100;
}
.hero > * { position: relative; z-index: 1; }
.landing-page { --dot-color: rgba(0, 0, 0, 0.24); }
.dark .landing-page { --dot-color: rgba(255, 255, 255, 0.16); }
.eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--text-3); margin-bottom: 22px; opacity: 0.7; }
.eyebrow::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--violet-bright); opacity: 0.5; }


.hero h1 { font-family: 'inter', sans-serif; font-size: 81px; font-weight: 350; line-height: 1.02; letter-spacing: -0.03em; margin-bottom: 26px; color: var(--text-1); }

.hero .h1-2 { color: #7C3AED;; }

:root .landing-page .hero h1 b,
:not(.dark) .landing-page .hero h1 b {
  background: none;
  -webkit-background-clip: unset;
  background-clip: unset;
  color: #7C3AED;
}
.dark .landing-page .hero h1 b {
  background: none;
  -webkit-background-clip: unset;
  background-clip: unset;
  color: #7C3AED;
}
.hero p.lead { font-family: "Figtree", sans-serif; font-size: 16px; color: var(--text-2); line-height: 1.6; max-width: 460px; margin-bottom: 34px; }
.hero-ctas { display: flex; gap: 14px; align-items: center; }

/* Landing btn-primary with gradient */
.landing-page .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: #7C3AED; color: #fff; border: none; padding: 14px 24px; border-radius: 999px; font-size: 14.5px; font-weight: 600; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease; text-decoration: none; }
.landing-page .btn-primary:hover { transform: translateY(-2px); }

:root .landing-page .btn-primary,

:not(.dark) .landing-page .btn-primary {
  background: #7C3AED;
}
.dark .landing-page .btn-primary {
  background: #7C3AED;
}

.btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 14px 22px; border-radius: 999px; font-size: 14.5px; font-weight: 600;
          cursor: pointer; transition: all .18s ease; text-decoration: none; }

:root .landing-page .btn-ghost,
:not(.dark) .landing-page .btn-ghost {
  color: #1a1a1a;
  background: var(--bg-base);
  border: 1px solid #555555;
}

:not(.dark) .landing-page .btn-ghost:hover {
  border-color: var(--violet);
  color: var(--violet);
}

.dark .landing-page .btn-ghost {
  background: var(--bg-base);
  color: #fff;
  border: 1px solid #5a5a5a;
}

.dark .landing-page .btn-ghost:hover {
  border-color: var(--violet);
  color: var(--violet-bright);
}

/* ─── 5. Hero — visual side (stacked / overlapping card layout, 2x size) ─── */
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
:root .landing-page .glow-blob,
:not(.dark) .landing-page .glow-blob {
  background: radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%);
}
.float-card {
  position: absolute;
  background: var(--surface-raised);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2);
  z-index: 3;
}
:root .landing-page .float-card,
:not(.dark) .landing-page .float-card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.10);
  border-color: rgba(0,0,0,0.06);
}
.dark .landing-page .float-card {
  background: #1C1C1F;
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 2px 4px rgba(0,0,0,0.4), 0 8px 18px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
}

/* Back card 1 - top-right position (highest in the ladder) */
.float-card.back1 {
  width: 380px;
  height: 230px;
  top: 20px;
  left: 50%;
  margin-left: -60px;
  transform: rotate(4deg);
}
/* Back card 2 - bottom-left position (lowest in the ladder) */
.float-card.back2 {
  width: 400px;
  height: 220px;
  bottom: 30px;
  left: 50%;
  margin-left: -340px;
  transform: rotate(-5deg);
}
:not(.dark) .landing-page .float-card.back1,
:not(.dark) .landing-page .float-card.back2 {
  background: #f6f6f6;
  border-color: rgba(0,0,0,0.05);
}
.dark .landing-page .float-card.back1,
.dark .landing-page .float-card.back2 {
  background: #0D0D0E;
  border-color: rgba(255,255,255,0.05);
}
/* Main card (front) - center-middle position */
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
:root .landing-page .float-card.main,
:not(.dark) .landing-page .float-card.main {
  background: #FFFFFF;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 2px 6px rgba(0,0,0,0.14), 0 6px 16px rgba(0,0,0,0.10);
}
.dark .landing-page .float-card.main {
  background: #151517;
  border-color: rgba(255,255,255,0.08);
}

@keyframes floatIdle {
  0%,100% { transform: rotate(-2deg) translateY(0); }
  50% { transform: rotate(-2deg) translateY(-10px); }
}

/* Mini card internals scaled proportionally */
.mini-tab-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.mini-dots { display: flex; gap: 6px; }
.mini-dots span { width: 9px; height: 9px; border-radius: 50%; }
.mini-url { flex: 1; background: var(--ink); border-radius: 8doespx; padding: 5px 12px; font-size: 9px; color: var(--text-3); text-align: center; }
:root .landing-page .mini-url,
:not(.dark) .landing-page .mini-url {
  background: #F5F5F6;
}
.dark .landing-page .mini-url {
  background: #0A0A0B;
}
.mini-graph { display: flex; align-items: flex-start; gap: 20px; padding-top: 4px; }
.mini-branch { display: flex; flex-direction: column; align-items: center; gap: 9px; }
.mini-node { background: var(--surface); border: 1px solid var(--hairline); border-radius: 8px; padding: 9px 14px; }
.dark .landing-page .mini-node {
  background: #1C1C1F;
  border-color: rgba(255,255,255,0.08);
}
.mini-node.done { background: rgba(139,92,246,0.12); border-color: var(--violet); }
.mini-bar { height: 6px; border-radius: 99px; background: var(--violet-bright); margin-bottom: 5px; }
.mini-track { height: 4px; border-radius: 99px; background: var(--hairline); }
.mini-stem { width: 1.5px; height: 14px; background: var(--hairline); }

/* ─── 6. Social Proof ─── */
.social-proof { max-width: 1320px; margin: 52px auto 0; padding: 0 48px 68px; text-align: center; }
.social-proof .lbl { font-family: "DM Sans", sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); margin-bottom: 26px; }
.logo-row { display: flex; justify-content: center; gap: 56px; flex-wrap: wrap; opacity: .5; font-family: "Fraunces", serif; font-weight: 500; font-size: 19px; letter-spacing: -0.01em; color: var(--text-1); }

/* ─── 7. Feature Rows ─── */
.feature-row { max-width: 1320px; margin: 0 auto; padding: 80px 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 70px; align-items: center; }
.feature-row.rev .f-text { order: 2; }
.feature-row.rev .f-visual { order: 1; }
.f-eyebrow { font-family: "DM Sans", sans-serif; font-size: 12.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #7C3AED; margin-bottom: 16px; }
.f-text h3 { font-family: 'inter', sans-serif; font-size: 34px; font-weight: 500; letter-spacing: -0.015em; margin-bottom: 16px; line-height: 1.15; color: var(--text-1); }
.f-text p { font-family: "Figtree", sans-serif; font-size: 15.5px; font-weight: 400; color: var(--text-2); line-height: 1.65; max-width: 420px; }
.f-visual { background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--radius-xl); box-shadow: var(--shadow-1); padding: 36px; min-height: 260px; display: flex; align-items: center; justify-content: center; transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; cursor: pointer; }
.f-visual:hover { transform: translateY(-5px); box-shadow: 0 8px 28px rgba(0,0,0,0.08); border-color: rgba(139,92,246,0.2); }
.dark .f-visual:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.3); border-color: rgba(139,92,246,0.3); }

/* Minimal dependency-graph mockup - rounded task cards + dashed bezier links, echoes the real graph editor */
.mg-graph { position: relative; width: 180px; height: 132px; }
.mg-edges { position: absolute; inset: 0; pointer-events: none; }
.mg-node { position: absolute; background: var(--surface); border: 1px solid var(--hairline); border-radius: 7px; padding: 6px 8px 7px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.dark .mg-node { background: #1C1C1F; border-color: rgba(255,255,255,0.08); }
.mg-node-bar { height: 2.5px; border-radius: 3px 3px 0 0; margin: -6px -8px 6px; background: var(--hairline); }
.mg-node-line { height: 4px; border-radius: 99px; background: var(--hairline); }
.mg-node-done .mg-node-bar { background: var(--violet-bright); }
.mg-node-blocked { border-style: dashed; border-width: 1.5px; }

/* ─── 8. Testimonials ─── */
.testimonial-section { max-width: 1320px; margin: 0 auto; padding: 52px 48px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
.stars { display: flex; gap: 3px; color: var(--violet-bright); margin-bottom: 16px; }
.quote-card { background: var(--surface); border: none; border-radius: 20px; padding: 36px 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03); transition: transform 0.22s ease, box-shadow 0.22s ease; cursor: default; }
.quote-card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
.dark .quote-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15); }
.dark .quote-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.1); }
.quote-text { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif; font-size: 15.5px; font-weight: 400; line-height: 1.6; letter-spacing: -0.005em; margin-bottom: 24px; color: var(--text-1); }
.quote-person { padding-top: 16px; border-top: 1px solid var(--hairline); }
.quote-name { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif; font-size: 13.5px; font-weight: 600; color: var(--text-1); }
.quote-role { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif; font-size: 12px; color: var(--text-3); margin-top: 3px; }

/* ─── 9. Stats ─── */
.stats-row { max-width: 640px; margin: 0 auto; padding: 68px 48px 56px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
.stat-value { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif; font-size: 34px; font-weight: 500; letter-spacing: -0.01em; color: var(--text-1); }
.stat-label { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--text-3); margin-top: 8px; }

/* ─── 10. Contact Section ─── */
.contact-section {
  max-width: 1320px;
  margin: 0 auto;
  padding: 100px 48px 80px;
  text-align: center;
}
.contact-content .section-title { margin-bottom: 16px; }
.contact-content .section-subtitle { margin-bottom: 48px; }
.contact-grid {
  display: flex;
  justify-content: center;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}
.contact-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 32px;
  text-align: center;
  border-left: 1px solid var(--hairline);
  text-decoration: none;
  transition: transform 0.18s ease;
}
.contact-item:first-child { border-left: none; }
a.contact-item:hover { transform: translateY(-2px); }
.contact-item-label {
  font-family: "DM Sans", sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--violet-bright);
}
.contact-item-value {
  font-family: "Figtree", sans-serif;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--text-1);
  line-height: 1.5;
}
a.contact-item .contact-item-value { transition: color 0.18s ease; }
a.contact-item:hover .contact-item-value { color: var(--violet); }

/* ─── 11. Final CTA ─── */
.final-cta { max-width: 720px; margin: 40px auto 130px; padding: 60px 48px 0; text-align: center; border-top: 1px solid var(--hairline); }
.final-cta h2 { font-family: 'inter', sans-serif; font-size: 40px; font-weight: 400; letter-spacing: -0.02em; margin-bottom: 16px; color: var(--text-1); }
.final-cta p { font-family: "Figtree", sans-serif; color: var(--text-2); margin-bottom: 30px; font-size: 15.5px; }

/* ─── 12. Footer — see shared <SiteFooter /> component ─── */

/* ─── 13. Responsive ─── */
@media (max-width: 900px) {
  .land-nav { padding: 14px 16px; gap: 12px; }
  .land-links { display: none; }
  .land-mobile-icons { display: flex; }
  .land-nav-right .land-link-nav { font-size: 12.5px; padding: 8px 12px; }
  .land-nav-right .land-cta-nav { font-size: 12.5px; padding: 8px 14px; }

  .hero { grid-template-columns: 1fr; padding: 40px 24px 40px; }
  .hero h1 { font-size: 48px; }
  .hero-visual { height: 420px; margin-top: 44px; }
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
  .social-proof { margin-top: 32px; padding: 0 24px 40px; }
  .feature-row { grid-template-columns: 1fr; padding: 40px 24px; gap: 32px; }
  .feature-row.rev .f-text, .feature-row.rev .f-visual { order: unset; }
  .f-text h3 { font-size: 26px; }
  .f-text p { font-size: 14.5px; max-width: none; }
  .f-visual { padding: 24px; min-height: 200px; }
  .f-visual svg { max-width: 100%; height: auto; }
  .testimonial-section { grid-template-columns: 1fr; padding: 24px 24px; gap: 16px; }
  .stats-row { grid-template-columns: repeat(2, 1fr); padding: 40px 24px 40px; }
  .contact-section { padding: 60px 24px 40px; }
  .contact-grid { flex-direction: column; max-width: 360px; margin: 0 auto; gap: 20px; }
  .contact-item { border-left: none; border-top: 1px solid var(--hairline); padding: 16px 0 0; }
  .contact-item:first-child { border-top: none; padding-top: 0; }
  .final-cta { margin: 20px 16px 70px; padding: 40px 24px 0; }
  .final-cta h2 { font-size: 30px; }
}

@media (max-width: 480px) {
  .land-nav { padding: 12px 12px; }
  .land-icon-btn { width: 34px; height: 34px; }
  .land-mobile-icons { gap: 2px; }
  .land-nav-right .land-link-nav { display: none; }
  .land-nav-right .land-cta-nav { font-size: 12px; padding: 7px 12px; }
  .hero h1 { font-size: 38px; }
  .hero p.lead { font-size: 15px; }
  .hero-ctas { flex-direction: column; align-items: stretch; }
  .hero-ctas .btn-primary,
  .hero-ctas .btn-ghost { text-align: center; justify-content: center; }
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
  .section-title { font-size: 26px; }
  .section-subtitle { font-size: 14px; }
  .stats-row { gap: 16px; }
  .stat-value { font-size: 26px; }
  .contact-section { padding: 40px 16px 30px; }
  .final-cta h2 { font-size: 24px; }
  .final-cta p { font-size: 14px; }
  .land-mobile-dropdown { left: 12px; right: 12px; }
}
`;

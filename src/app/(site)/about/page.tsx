"use client";

import Link from "next/link";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <RevealOnScroll>
      <div style={{ marginBottom: "56px" }}>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}
        >
          About Threadline
        </h1>
        <p
          style={{
            fontSize: "17px",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            maxWidth: "680px",
          }}
        >
          I started building Threadline because I was tired of forcing tangled, real projects into
          flat to-do lists that hide how tasks actually relate to each other. Every real project has
          dependencies, bottlenecks, and parallel tracks - your tools should make those visible, not
          force them into a single column.
        </p>
      </div>
      </RevealOnScroll>

      {/* Mission */}
      <RevealOnScroll delay={80}>
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          marginBottom: "48px",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          Our Mission
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Make project complexity visible and manageable, for teams and solo builders alike. I
          believe that when you can see the whole picture - dependencies, blockers, progress, and
          people - you make better decisions and ship faster with less stress.
        </p>
      </div>
      </RevealOnScroll>

      {/* Story */}
      <RevealOnScroll delay={80}>
      <div style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "24px",
          }}
        >
          The Story
        </h2>
        <div
          className="story-card"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "24px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            padding: "28px 26px",
            transition: "transform .18s ease, box-shadow .18s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = "translateY(-3px)";
            el.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "none";
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            JF
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
              Jesse David Francisco
            </h3>
            <p style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600, marginBottom: "12px" }}>
              Solo Developer
            </p>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "10px" }}>
              No team. No funding. Just one stubborn developer. I design, build, and ship Threadline
              on my own - from the graph editor and real-time sync down to the marketing pages you&apos;re
              reading right now.
            </p>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Being a team of one means every feature has to earn its place - there&apos;s no one else to
              hand off the parts that don&apos;t work. It also means I hear directly from anyone who
              writes in, and I read every message myself.
            </p>
          </div>
        </div>
      </div>
      </RevealOnScroll>

      {/* What's Next */}
      <RevealOnScroll delay={80}>
      <div style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          What&apos;s Next
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Threadline is under active, ongoing development. The current focus is making the graph
          editor faster and more intuitive, tightening up notifications and messaging, and shipping
          the feedback that comes in through the{" "}
          <Link href="/contact" style={{ color: "var(--accent)", fontWeight: 500 }}>
            contact page
          </Link>
          . If something feels rough or missing, that&apos;s the best way to reach me.
        </p>
      </div>
      </RevealOnScroll>

      {/* Values */}
      <RevealOnScroll delay={80}>
      <div>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "20px",
          }}
        >
          What We Believe
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { title: "Visibility over complexity", desc: "Show the full picture. Hiding information doesn't reduce complexity - it just makes surprises worse." },
            { title: "Speed of thought", desc: "The tool should never be the bottleneck. Keyboard shortcuts, instant sync, and minimal clicks." },
            { title: "Privacy by design", desc: "Your data is yours. I don't sell it, advertise against it, or use it to train models." },
          ].map((value) => (
            <div
              key={value.title}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                padding: "16px 20px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  flexShrink: 0,
                  marginTop: "7px",
                }}
              />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {value.title}
                </h4>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {value.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </RevealOnScroll>

      {/* Responsive */}
      <style>{`
        @media (max-width: 640px) {
          .story-card {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}

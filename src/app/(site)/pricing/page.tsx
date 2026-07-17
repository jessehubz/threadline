"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

const plans = [
  {
    name: "Free",
    price: "$0",
    interval: "forever",
    description: "For individuals and small side projects.",
    features: [
      "Up to 3 projects",
      "Unlimited tasks",
      "1 collaborator per project",
      "Basic graph editor",
      "Community support",
    ],
    cta: "Get Started",
    ctaHref: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    interval: "per user / month",
    description: "For teams who need collaboration and advanced features.",
    features: [
      "Unlimited projects",
      "Unlimited tasks",
      "Up to 20 collaborators",
      "AI Assistant",
      "Approval workflows",
      "Real-time collaboration",
      "Analytics dashboard",
      "File attachments (10 MB)",
      "Priority support",
    ],
    cta: "Start Free Trial",
    ctaHref: "/sign-up",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    interval: "billed annually",
    description: "For organizations that need advanced security and control.",
    features: [
      "Everything in Pro",
      "Unlimited collaborators",
      "SSO / SAML",
      "Advanced audit logs",
      "Dedicated account manager",
      "Custom integrations",
      "99.9% uptime SLA",
      "SOC 2 compliance",
      "Onboarding assistance",
    ],
    cta: "Contact Sales",
    ctaHref: "/contact",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Hero */}
      <RevealOnScroll>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h1
            style={{
              fontSize: "42px",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "16px",
            }}
          >
            Simple, transparent pricing
          </h1>
          <p
            style={{
              fontSize: "17px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            Start free, upgrade when you need to. No hidden fees, no surprises.
            Cancel anytime.
          </p>
        </div>
      </RevealOnScroll>

      {/* Pricing Grid */}
      <div
        className="pricing-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {plans.map((plan, idx) => (
          <RevealOnScroll key={plan.name} delay={idx * 60}>
          <div
            style={{
              position: "relative",
              background: "var(--bg-elevated)",
              border: plan.highlighted
                ? "2px solid var(--accent)"
                : "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              padding: "32px 28px",
              transition: "transform .2s ease, box-shadow .2s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-4px)";
              el.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
            }}
          >
            {plan.highlighted && (
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--accent)",
                  color: "var(--on-accent)",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "4px 14px",
                  borderRadius: "999px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Most Popular
              </div>
            )}

            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "8px",
              }}
            >
              {plan.name}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              {plan.description}
            </p>

            <div style={{ marginBottom: "24px" }}>
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                {plan.price}
              </span>
              {plan.interval !== "forever" && (
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginLeft: "6px",
                  }}
                >
                  {plan.interval}
                </span>
              )}
            </div>

            {/* CTA */}
            <Link
              href={plan.ctaHref}
              className="pricing-cta"
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "14px",
                fontWeight: 600,
                textAlign: "center",
                textDecoration: "none",
                boxSizing: "border-box",
                border: plan.highlighted ? "none" : "1px solid var(--border-default)",
                background: plan.highlighted ? "var(--accent)" : "transparent",
                color: plan.highlighted ? "var(--on-accent)" : "var(--text-primary)",
                cursor: "pointer",
                transition: "background-color .18s ease, border-color .18s ease, color .18s ease, transform .18s ease",
                marginBottom: "24px",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                if (plan.highlighted) {
                  el.style.background = "var(--accent-hover)";
                  el.style.transform = "translateY(-1px)";
                } else {
                  el.style.borderColor = "var(--accent)";
                  el.style.color = "var(--accent)";
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                if (plan.highlighted) {
                  el.style.background = "var(--accent)";
                  el.style.transform = "translateY(0)";
                } else {
                  el.style.borderColor = "var(--border-default)";
                  el.style.color = "var(--text-primary)";
                }
              }}
            >
              {plan.cta}
            </Link>

            {/* Features */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <Check
                    style={{
                      width: "15px",
                      height: "15px",
                      color: "var(--accent)",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </RevealOnScroll>
        ))}
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
            max-width: 420px !important;
            margin: 0 auto !important;
          }
        }
        .pricing-cta:focus-visible {
          outline: 2px solid var(--ring-color);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

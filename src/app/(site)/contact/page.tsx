"use client";

import { Mail, ExternalLink, Code2 } from "lucide-react";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "For general inquiries and support.",
    value: "jdfrancisco5@up.edu.ph",
    href: "mailto:jdfrancisco5@up.edu.ph",
  },
  {
    icon: ExternalLink,
    title: "LinkedIn",
    description: "Connect with us on LinkedIn.",
    value: "linkedin.com/in/jessedavidf",
    href: "https://www.linkedin.com/in/jessedavidf/",
  },
  {
    icon: Code2,
    title: "GitHub",
    description: "Check out our projects on GitHub.",
    value: "github.com/jessehubz",
    href: "https://github.com/jessehubz",
  },
];

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: "48px" }}>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "12px",
          }}
        >
          Contact Us
        </h1>
        <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Have a question, feedback, or just want to say hi? We&apos;d love to hear from you.
        </p>
      </div>

      {/* Contact Methods */}
      <div
        className="contact-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginBottom: "48px",
        }}
      >
        {contactMethods.map((method) => {
          const Icon = method.icon;
          return (
            <a
              key={method.title}
              href={method.href}
              style={{
                display: "block",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "28px 24px",
                textDecoration: "none",
                textAlign: "center",
                transition: "border-color .18s ease, transform .18s ease, box-shadow .18s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(139, 92, 246, 0.2)";
                el.style.transform = "translateY(-3px)";
                el.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border-default)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "var(--accent-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <Icon style={{ width: "20px", height: "20px", color: "var(--accent)" }} />
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                {method.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                {method.description}
              </p>
              <span style={{ fontSize: "13px", color: "var(--accent)", fontWeight: 500 }}>
                {method.value}
              </span>
            </a>
          );
        })}
      </div>

      {/* Contact Form */}
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "20px",
          }}
        >
          Send us a message
        </h2>
        <form
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
          className="contact-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                transition: "border-color .15s ease",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                transition: "border-color .15s ease",
              }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Message
            </label>
            <textarea
              rows={5}
              placeholder="How can we help?"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
                transition: "border-color .15s ease",
                fontFamily: "inherit",
              }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button
              type="submit"
              style={{
                padding: "11px 24px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .18s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "var(--accent-hover)";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "var(--accent)";
                el.style.transform = "translateY(0)";
              }}
            >
              Send Message
            </button>
          </div>
        </form>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          .contact-form {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

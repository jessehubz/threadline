"use client";

import { useState } from "react";
import { Mail, ExternalLink, Code2 } from "lucide-react";

import { submitContactMessage } from "@/actions/contact-actions";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

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

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const result = await submitContactMessage({ name, email, message });

    if (result.error) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }

    setName("");
    setEmail("");
    setMessage("");
    setStatus("success");
  }

  return (
    <div>
      {/* Hero */}
      <RevealOnScroll>
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
      </RevealOnScroll>

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
        {contactMethods.map((method, idx) => {
          const Icon = method.icon;
          return (
            <RevealOnScroll key={method.title} delay={idx * 60}>
            <a
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
                el.style.borderColor = "var(--ring-color)";
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
            </RevealOnScroll>
          );
        })}
      </div>

      {/* Contact Form */}
      <RevealOnScroll delay={80}>
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
          onSubmit={handleSubmit}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              disabled={status === "submitting"}
              className="contact-field"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                transition: "border-color .15s ease, box-shadow .15s ease",
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
              disabled={status === "submitting"}
              className="contact-field"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-default)",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                transition: "border-color .15s ease, box-shadow .15s ease",
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={5000}
              disabled={status === "submitting"}
              className="contact-field"
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
                transition: "border-color .15s ease, box-shadow .15s ease",
                fontFamily: "inherit",
              }}
            />
          </div>
          {status === "success" && (
            <div
              style={{ gridColumn: "1 / -1" }}
              role="status"
              className="contact-form-success"
            >
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--accent)",
                  background: "var(--accent-soft)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  margin: 0,
                }}
              >
                Thanks — your message is on its way. We&apos;ll get back to you soon.
              </p>
            </div>
          )}
          {status === "error" && (
            <div style={{ gridColumn: "1 / -1" }} role="alert">
              <p
                style={{
                  fontSize: "13.5px",
                  color: "#ef4444",
                  background: "rgba(239, 68, 68, 0.08)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  margin: 0,
                }}
              >
                {errorMessage}
              </p>
            </div>
          )}
          <div style={{ gridColumn: "1 / -1" }}>
            <button
              type="submit"
              disabled={status === "submitting"}
              style={{
                padding: "11px 24px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: "var(--accent)",
                color: "var(--on-accent)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: status === "submitting" ? "default" : "pointer",
                opacity: status === "submitting" ? 0.7 : 1,
                transition: "background-color .18s ease, transform .18s ease",
              }}
              onMouseEnter={(e) => {
                if (status === "submitting") return;
                const el = e.currentTarget as HTMLElement;
                el.style.background = "var(--accent-hover)";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                if (status === "submitting") return;
                const el = e.currentTarget as HTMLElement;
                el.style.background = "var(--accent)";
                el.style.transform = "translateY(0)";
              }}
            >
              {status === "submitting" ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
      </RevealOnScroll>

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
        .contact-field:focus-visible {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px var(--ring-color);
        }
      `}</style>
    </div>
  );
}

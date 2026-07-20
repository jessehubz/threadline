"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ExternalLink, Phone, Code2, Sparkles } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Guides", href: "/guides" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

const socialLinks = [
  { Icon: Mail, href: "mailto:jdfrancisco5@up.edu.ph", label: "Email" },
  { Icon: ExternalLink, href: "https://www.linkedin.com/in/jessedavidf/", label: "LinkedIn" },
  { Icon: Phone, href: "tel:09356428539", label: "Phone" },
  { Icon: Code2, href: "https://github.com/jessehubz", label: "GitHub" },
];

export function SiteFooter() {
  const router = useRouter();
  // Footer Assistant entry — consistent across every page. Opens the AI chat
  // panel when one is mounted (dashboard pages); otherwise goes to /dashboard.
  const openAssistant = () => {
    if ((window as unknown as { __tlAssistantReady?: boolean }).__tlAssistantReady) {
      window.dispatchEvent(new Event("open-ai-chat"));
    } else {
      router.push("/dashboard");
    }
  };
  return (
    <footer
      style={{
        width: "100%",
        background: "#1d1d1f",
        borderTop: "none",
        padding: "40px 44px 26px",
        marginTop: "0",
        color: "#f5f5f7",
      }}
    >
      {/* Tagline headline */}
      <div
        style={{
          maxWidth: "1520px",
          margin: "0 auto",
          paddingBottom: "26px",
        }}
      >
      </div>
      <div
        className="site-footer-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          gap: "32px",
          maxWidth: "1520px",
          margin: "0 auto",
          paddingBottom: "30px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        {/* Brand */}
        <div>
          <div
            className="logo-word"
            style={{
              fontSize: "20px",
              marginBottom: "12px",
              color: "#f5f5f7",
            }}
          >
            <span style={{ color: "#f5f5f7" }}>threadline</span>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "#a1a1a6",
              lineHeight: 1.6,
              maxWidth: "240px",
              marginBottom: "20px",
            }}
          >
            Every thread, one place. Built for teams who&apos;d rather ship than chase status updates.
          </p>
          <div
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: "#8e8e93",
              marginBottom: "8px",
            }}
          >
            Developed by
          </div>
          <div
            style={{
              fontSize: "12.5px",
              color: "#a1a1a6",
              marginBottom: "18px",
              lineHeight: 1.8,
            }}
          >
            <strong style={{ color: "#f5f5f7", fontWeight: 600 }}>Jesse David Francisco</strong>
          </div>
          {/* Social */}
          <div style={{ display: "flex", gap: "10px" }}>
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8e8e93",
                  transition: "all .18s ease",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-2px)";
                  el.style.borderColor = "#f5f5f7";
                  el.style.color = "#f5f5f7";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.borderColor = "rgba(255, 255, 255, 0.16)";
                  el.style.color = "#8e8e93";
                }}
              >
                <Icon style={{ width: "15px", height: "15px" }} />
              </a>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "#8e8e93",
              marginBottom: "16px",
            }}
          >
            Product
          </div>
          <button
            onClick={openAssistant}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13.5px",
              color: "#a1a1a6",
              background: "none",
              border: "none",
              padding: 0,
              marginBottom: "12px",
              cursor: "pointer",
              transition: "color .15s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#f5f5f7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#a1a1a6";
            }}
          >
            <Sparkles style={{ width: "13px", height: "13px" }} />
            Assistant
          </button>
          {footerLinks.product.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                display: "block",
                fontSize: "13.5px",
                color: "#a1a1a6",
                textDecoration: "none",
                marginBottom: "12px",
                transition: "color .15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#f5f5f7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#a1a1a6";
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Resources */}
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "#8e8e93",
              marginBottom: "16px",
            }}
          >
            Resources
          </div>
          {footerLinks.resources.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                display: "block",
                fontSize: "13.5px",
                color: "#a1a1a6",
                textDecoration: "none",
                marginBottom: "12px",
                transition: "color .15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#f5f5f7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#a1a1a6";
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Company */}
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "#8e8e93",
              marginBottom: "16px",
            }}
          >
            Company
          </div>
          {footerLinks.company.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                display: "block",
                fontSize: "13.5px",
                color: "#a1a1a6",
                textDecoration: "none",
                marginBottom: "12px",
                transition: "color .15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#f5f5f7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#a1a1a6";
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div
        className="site-footer-bottom"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1520px",
          margin: "0 auto",
          paddingTop: "22px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "20px", fontSize: "12.5px", color: "#a1a1a6" }}>
          <Link
            href="/terms"
            style={{ color: "inherit", textDecoration: "none", transition: "color .15s ease" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#f5f5f7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#a1a1a6";
            }}
          >
            Terms of Use
          </Link>
          <Link
            href="/privacy"
            style={{ color: "inherit", textDecoration: "none", transition: "color .15s ease" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#f5f5f7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#a1a1a6";
            }}
          >
            Privacy Policy
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "11.5px", color: "#8e8e93" }}>
          <span>© 2026 Threadline</span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: "rgba(255, 255, 255, 0.08)",
              padding: "3px 9px",
              borderRadius: "6px",
              fontSize: "10px",
              color: "#a1a1a6",
            }}
          >
            v2.1.0
          </span>
          <Link
            href="/contact"
            style={{ color: "inherit", textDecoration: "none", transition: "color .15s ease" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#a1a1a6";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#8e8e93";
            }}
          >
            Send feedback
          </Link>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .site-footer-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
          }
          .site-footer-grid > div:first-child {
            grid-column: 1 / -1 !important;
            margin-bottom: 12px;
          }
        }
        @media (max-width: 640px) {
          .site-footer-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 20px !important;
          }
          .site-footer-grid > div:first-child {
            grid-column: 1 / -1 !important;
            margin-bottom: 8px;
          }
          .site-footer-bottom {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </footer>
  );
}

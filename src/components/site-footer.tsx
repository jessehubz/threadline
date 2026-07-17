"use client";

import Link from "next/link";
import { Mail, ExternalLink, Phone, Code2 } from "lucide-react";

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
  return (
    <footer
      style={{
        width: "100%",
        background: "var(--bg-elevated)",
        borderTop: "1px solid var(--border-default)",
        padding: "40px 44px 26px",
        marginTop: "40px",
      }}
    >
      <div
        className="site-footer-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          gap: "32px",
          maxWidth: "1520px",
          margin: "0 auto",
          paddingBottom: "30px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Brand */}
        <div>
          <div
            className="logo-word"
            style={{
              fontSize: "20px",
              marginBottom: "12px",
            }}
          >
            <span className="text-heading">thread</span>
            <span className="logo-word-accent">line</span>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
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
              color: "var(--text-muted)",
              marginBottom: "8px",
            }}
          >
            Developed by
          </div>
          <div
            style={{
              fontSize: "12.5px",
              color: "var(--text-secondary)",
              marginBottom: "18px",
              lineHeight: 1.8,
            }}
          >
            <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>Jesse David Francisco</strong>
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
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  transition: "all .18s ease",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-2px)";
                  el.style.borderColor = "var(--accent)";
                  el.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.borderColor = "var(--border-default)";
                  el.style.color = "var(--text-muted)";
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
              color: "var(--text-muted)",
              marginBottom: "16px",
            }}
          >
            Product
          </div>
          {footerLinks.product.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                display: "block",
                fontSize: "13.5px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                marginBottom: "12px",
                transition: "color .15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
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
              color: "var(--text-muted)",
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
                color: "var(--text-secondary)",
                textDecoration: "none",
                marginBottom: "12px",
                transition: "color .15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
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
              color: "var(--text-muted)",
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
                color: "var(--text-secondary)",
                textDecoration: "none",
                marginBottom: "12px",
                transition: "color .15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
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
        <div style={{ display: "flex", gap: "20px", fontSize: "12.5px", color: "var(--text-secondary)" }}>
          <Link
            href="/terms"
            style={{ color: "inherit", textDecoration: "none", transition: "color .15s ease" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            }}
          >
            Terms of Use
          </Link>
          <Link
            href="/privacy"
            style={{ color: "inherit", textDecoration: "none", transition: "color .15s ease" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            }}
          >
            Privacy Policy
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "11.5px", color: "var(--text-muted)" }}>
          <span>© 2026 Threadline</span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: "var(--bg-muted)",
              padding: "3px 9px",
              borderRadius: "6px",
              fontSize: "10px",
            }}
          >
            v2.1.0
          </span>
          <Link
            href="/contact"
            style={{ color: "inherit", textDecoration: "none", transition: "color .15s ease" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
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

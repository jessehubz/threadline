"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function SitePageHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        background: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border-default)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="site-page-header-inner"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1520px",
          margin: "0 auto",
          padding: "14px 28px",
        }}
      >
        {/* Logo / Brand */}
        <Link
          href="/dashboard"
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text-primary)",
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          <span>Thread</span>
          <span style={{ color: "var(--accent)" }}>line</span>
        </Link>

        {/* Back to Dashboard button */}
        <Link
          href="/dashboard"
          className="back-to-dash-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 18px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#fff",
            background: "var(--accent)",
            textDecoration: "none",
            transition: "all .18s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "var(--accent-hover)";
            el.style.transform = "translateY(-1px)";
            el.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.3)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "var(--accent)";
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "none";
          }}
        >
          <ArrowLeft style={{ width: "14px", height: "14px" }} />
          Back to Dashboard
        </Link>
      </div>
    </header>
  );
}

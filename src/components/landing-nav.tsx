"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    handleScroll(); // check on mount
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    setMobileOpen(false);
    const id = href.replace("#", "");
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <>
      <nav
        className={`land-nav ${scrolled ? "land-nav--scrolled" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="word"
          style={{ textDecoration: "none" }}
        >
          <span className="t1">Thread</span>
          <span className="t2">line</span>
        </a>

        {/* Desktop links */}
        <div className="land-links">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="land-nav-right">
          <Link href="/sign-in" className="land-link-nav">
            Sign in
          </Link>
          <Link href="/sign-up" className="land-cta-nav">
            Sign up
          </Link>
          {/* Mobile hamburger */}
          <button
            className="land-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="land-mobile-menu">
          <div
            className="land-mobile-backdrop"
            onClick={() => setMobileOpen(false)}
          />
          <div className="land-mobile-panel">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="land-mobile-link"
              >
                {item.label}
              </a>
            ))}
            <div className="land-mobile-ctas">
              <Link
                href="/sign-in"
                className="land-link-nav"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="land-cta-nav"
                onClick={() => setMobileOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

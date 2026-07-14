"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Features", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Close on click outside (excluding the toggle button itself)
  useEffect(() => {
    if (!mobileOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      // Don't close if clicking the toggle button - let its onClick handle it
      if (toggleRef.current && toggleRef.current.contains(target)) return;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  // Close menu when viewport exceeds mobile breakpoint (900px)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    function handleChange(e: MediaQueryListEvent | MediaQueryList) {
      if (e.matches) setMobileOpen(false);
    }
    handleChange(mq); // check on mount
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
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
  }, []);

  return (
    <div style={{ position: "relative" }}>
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
          <span className="t1">thread</span>
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
          {/* Mobile toggle */}
          <button
            ref={toggleRef}
            className="land-mobile-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className={`hamburger-icon ${mobileOpen ? "open" : ""}`}>
              <span />
              <span />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="land-mobile-dropdown" ref={menuRef}>
          <div className="land-mobile-inner">
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
            <div className="land-mobile-divider" />
            <div className="land-mobile-actions">
              <Link
                href="/sign-in"
                className="land-mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="land-mobile-cta"
                onClick={() => setMobileOpen(false)}
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

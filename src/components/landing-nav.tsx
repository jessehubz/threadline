"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Home, Layers, Tag, Mail } from "lucide-react";

const navItems = [
  { label: "Home", href: "#home", icon: Home },
  { label: "Features", href: "#services", icon: Layers },
  { label: "Pricing", href: "#pricing", icon: Tag },
  { label: "Contact", href: "/contact", icon: Mail },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return; // route links (e.g. /contact) navigate normally
    e.preventDefault();
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

      {/* Desktop text links */}
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

      {/* Mobile icon links */}
      <div className="land-mobile-icons">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="land-icon-btn"
              title={item.label}
              aria-label={item.label}
            >
              <Icon size={18} />
            </a>
          );
        })}
      </div>

      <div className="land-nav-right">
        <Link href="/sign-in" className="land-link-nav">
          Sign in
        </Link>
        <Link href="/sign-up" className="land-cta-nav">
          Sign up
        </Link>
      </div>
    </nav>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, CodeXml, AtSign, Link2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface MemberProfilePopupProps {
  userId: string;
  name: string | null;
  username?: string | null;
  email: string;
  imageUrl?: string | null;
  bio?: string | null;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  children: React.ReactNode;
}

export function MemberProfilePopup({
  userId,
  name,
  username,
  email,
  imageUrl,
  bio,
  githubUrl,
  twitterUrl,
  linkedinUrl,
  websiteUrl,
  children,
}: MemberProfilePopupProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="cursor-pointer"
      >
        {children}
      </div>
      {open && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-50 mt-2 w-72 animate-[fadeInUp_0.15s_ease-out_both]"
          style={{
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-default)",
            backgroundColor: "var(--bg-elevated)",
            boxShadow: "var(--elevation-3, var(--shadow-md))",
          }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shrink-0"
                style={{
                  backgroundColor: "var(--accent-soft)",
                  color: "var(--accent)",
                }}
              >
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                ) : (
                  (name?.[0] || email[0]).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {name || email}
                </p>
                {username && (
                  <p
                    className="text-[11px] truncate"
                    style={{ color: "var(--accent)" }}
                  >
                    @{username}
                  </p>
                )}
                <p
                  className="text-[11px] truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {email}
                </p>
              </div>
            </div>
            {bio && (
              <p
                className="text-xs mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                {bio}
              </p>
            )}
            {(githubUrl || twitterUrl || linkedinUrl || websiteUrl) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    <CodeXml className="h-3.5 w-3.5" />
                  </a>
                )}
                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    <AtSign className="h-3.5 w-3.5" />
                  </a>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
            <Link
              href={`/profile/${userId}`}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--text-secondary)" }}
            >
              View full profile <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  Menu,
} from "lucide-react";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { ChatPopup } from "@/components/chat-popup";
import { SearchDropdown } from "@/components/search-dropdown";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { cn } from "@/lib/utils";

export function TopBar({ currentUserId }: { currentUserId: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className="flex h-14 items-center justify-between border-b px-4 sm:px-6 flex-shrink-0"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
      >
        {/* Left: Mobile menu button + Search trigger */}
        <div className="flex items-center gap-2">
          {/* Mobile hamburger - visible only below md */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={cn(
              "rounded-lg p-2 transition-all duration-200 md:hidden",
              "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] hover:scale-105"
            )}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search bar trigger */}
          <div className="hidden sm:flex">
            <SearchDropdown />
          </div>

          {/* Small screen search icon */}
          <div className="flex sm:hidden">
            <SearchDropdown />
          </div>
        </div>

        {/* Right: Utility actions */}
        <div className="flex items-center gap-1">
          <ChatPopup currentUserId={currentUserId} />
          <NotificationDropdown />
          <div
            className="mx-1.5 h-6 w-px opacity-50"
            style={{ backgroundColor: "var(--border-default)" }}
          />
          <div className="ml-0.5">
            <UserButton
              appearance={{ elements: { avatarBox: "h-7 w-7" } }}
            />
          </div>
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}

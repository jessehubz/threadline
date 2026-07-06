"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Menu } from "lucide-react";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { useState } from "react";
import { MobileSidebar } from "@/components/mobile-sidebar";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-surface-200/80 bg-white px-6 lg:px-10">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-xl p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <div className="ml-1 h-8 w-px bg-surface-200" />
          <div className="ml-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </div>
        </div>
      </header>

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}

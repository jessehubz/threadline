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
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="btn-ghost p-2 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <NotificationDropdown />
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </header>

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}

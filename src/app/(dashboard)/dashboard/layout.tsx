"use client";

import { useEffect } from "react";

export default function DashboardHomeLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const parent = document.getElementById('dashboard-shell');
    if (parent) parent.setAttribute('data-dashboard-home', 'true');
    return () => {
      if (parent) parent.removeAttribute('data-dashboard-home');
    };
  }, []);

  return <>{children}</>;
}

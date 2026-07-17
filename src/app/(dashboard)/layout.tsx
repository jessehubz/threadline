import { DashboardNavbar } from "@/components/dashboard-navbar";
import { SiteFooter } from "@/components/site-footer";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen bg-page" style={{ display: "flex", flexDirection: "column" }}>
      <div className="dash-wrap" style={{ flex: 1 }}>
        <DashboardNavbar userId={user.id} />
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}

import { DashboardNavbar } from "@/components/dashboard-navbar";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="dash-wrap min-h-screen bg-page">
      <DashboardNavbar />
      {children}
    </div>
  );
}

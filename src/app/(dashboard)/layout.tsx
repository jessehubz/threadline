import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div
      id="dashboard-shell"
      className="flex h-screen overflow-hidden bg-page [&[data-dashboard-home=true]_.sidebar-container]:hidden [&[data-dashboard-home=true]_.topbar-container]:hidden [&[data-dashboard-home=true]_.main-content]:p-0 [&[data-dashboard-home=true]]:block [&[data-dashboard-home=true]]:overflow-y-auto"
    >
      <div className="sidebar-container">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="topbar-container">
          <TopBar currentUserId={user.id} />
        </div>

        <main className="main-content flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

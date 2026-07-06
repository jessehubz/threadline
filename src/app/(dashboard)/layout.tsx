import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF8]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header currentUserId={user.id} />
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-page">
      <Header currentUserId={user.id} />
      <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}

import { requireUser } from "@/lib/auth";

export default async function GraphLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-page">
      {children}
    </div>
  );
}

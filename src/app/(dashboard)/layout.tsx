import { DashboardNavbar } from "@/components/dashboard-navbar";
import { FloatingThemeToggle } from "@/components/floating-theme-toggle";
import { SiteFooter } from "@/components/site-footer";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // Lean read for projects (used by the navbar's project links if needed).
  const projects = await prisma.project.findMany({
    where: { deletedAt: null, members: { some: { userId: user.id } } },
    select: {
      id: true,
      name: true,
      graphs: { select: { nodes: { select: { status: true }, where: { deletedAt: null } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });
  const sidebarProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    open: p.graphs.flatMap((g) => g.nodes).filter((n) => n.status !== "COMPLETE").length,
  }));

  return (
    <div className="dash-shell dash-shell--topnav bg-page">
      <DashboardNavbar userId={user.id} projects={sidebarProjects} />
      <FloatingThemeToggle />
      <main className="dash-content">
        <div className="dash-content-inner">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

import { getProjects } from "@/actions/project-actions";
import { ProjectGrid } from "@/components/project-grid";
import { CreateProjectButton } from "@/components/create-project-button";
import { EmptyState } from "@/components/ui/empty-state";
import { LayoutDashboard } from "lucide-react";

export default async function DashboardPage() {
  const projects = await getProjects();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your projects and task graphs
          </p>
        </div>
        <CreateProjectButton />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<LayoutDashboard className="h-8 w-8" />}
          title="No projects yet"
          description="Create your first project to start organizing tasks as dependency graphs."
          action={<CreateProjectButton />}
        />
      ) : (
        <ProjectGrid projects={projects} />
      )}
    </div>
  );
}

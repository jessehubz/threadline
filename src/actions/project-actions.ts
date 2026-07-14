"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generateSecureToken } from "@/lib/tokens";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export async function getProjects() {
  const user = await requireUser();

  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
      members: {
        some: { userId: user.id },
      },
    },
    include: {
      members: {
        include: { user: true },
      },
      graphs: {
        include: {
          nodes: {
            select: { id: true, status: true, dueDate: true },
          },
        },
      },
      labels: true,
      projectTags: {
        include: { tag: true },
        orderBy: { tag: { name: "asc" } },
      },
    },
    orderBy: [{ lastOpenedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  });

  const now = new Date();

  const mapped = projects.map((project) => {
    const allNodes = project.graphs.flatMap((g) => g.nodes);
    const totalTasks = allNodes.length;
    const completedTasks = allNodes.filter((n) => n.status === "COMPLETE").length;
    const needsAttention = allNodes.some(
      (n) => n.status === "BLOCKED" || (n.dueDate && n.dueDate < now && n.status !== "COMPLETE")
    );

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      shareToken: project.shareToken,
      memberCount: project.members.length,
      totalTasks,
      completedTasks,
      needsAttention,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      lastOpenedAt: project.lastOpenedAt,
      displayOrder: project.members.find((m) => m.userId === user.id)?.displayOrder ?? 0,
      role: project.members.find((m) => m.userId === user.id)?.role || "MEMBER",
      labels: project.labels || [],
      tags: (project.projectTags || []).map((pt) => ({
        id: pt.tag.id,
        name: pt.tag.name,
        color: pt.tag.color,
        isSystem: pt.tag.isSystem,
      })),
    };
  });

  // If user has customized order (any non-zero displayOrder), sort by that
  const hasCustomOrder = mapped.some((p) => p.displayOrder !== 0);
  if (hasCustomOrder) {
    mapped.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  return mapped;
}

export async function createProject(formData: FormData) {
  const user = await requireUser();

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      shareToken: generateSecureToken(),
      lastOpenedAt: new Date(),
      members: {
        create: {
          userId: user.id,
          role: "HEAD",
        },
      },
      graphs: {
        create: {
          name: "Root",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  return { project, projectId: project.id };
}

export async function updateProject(formData: FormData) {
  const user = await requireUser();

  const parsed = updateProjectSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  // Check ownership
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId: parsed.data.id },
    },
  });

  if (!member || member.role === "MEMBER") {
    return { error: "Not authorized" };
  }

  const project = await prisma.project.update({
    where: { id: parsed.data.id },
    data: {
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
    },
  });

  revalidatePath("/dashboard");
  return { project };
}

export async function deleteProject(projectId: string) {
  const user = await requireUser();

  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId },
    },
  });

  if (!member || member.role !== "HEAD") {
    return { error: "Only the owner can delete a project" };
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      deletedAt: new Date(),
      deleteAfter: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}

export async function restoreProject(projectId: string) {
  const user = await requireUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!member || member.role !== "HEAD") throw new Error("Only the project owner can restore");

  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: null, deleteAfter: null },
  });
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}

export async function permanentlyDeleteProject(projectId: string) {
  const user = await requireUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!member || member.role !== "HEAD") throw new Error("Only the project owner can permanently delete");

  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}

export async function getDeletedProjects() {
  const user = await requireUser();
  return prisma.project.findMany({
    where: {
      deletedAt: { not: null },
      members: { some: { userId: user.id, role: "HEAD" } },
    },
    select: { id: true, name: true, deletedAt: true, deleteAfter: true },
    orderBy: { deletedAt: "desc" },
  });
}

export async function reorderProjects(projectIds: string[]) {
  const user = await requireUser();

  // Update displayOrder for each project membership
  await Promise.all(
    projectIds.map((projectId, index) =>
      prisma.projectMember.updateMany({
        where: { userId: user.id, projectId },
        data: { displayOrder: index },
      })
    )
  );

  revalidatePath("/dashboard");
  return { success: true };
}

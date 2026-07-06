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
            select: { id: true, status: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return projects.map((project) => {
    const allNodes = project.graphs.flatMap((g) => g.nodes);
    const totalTasks = allNodes.length;
    const completedTasks = allNodes.filter((n) => n.status === "COMPLETE").length;

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      shareToken: project.shareToken,
      memberCount: project.members.length,
      totalTasks,
      completedTasks,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      role: project.members.find((m) => m.userId === user.id)?.role || "VIEWER",
    };
  });
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
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
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
  return { project };
}

export async function updateProject(formData: FormData) {
  const user = await requireUser();

  const parsed = updateProjectSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description"),
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

  if (!member || member.role === "VIEWER") {
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

  if (!member || member.role !== "OWNER") {
    return { error: "Only the owner can delete a project" };
  }

  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/dashboard");
  return { success: true };
}

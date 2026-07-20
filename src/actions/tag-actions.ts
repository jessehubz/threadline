"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(30, "Tag name too long"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color format"),
});

const addTagToProjectSchema = z.object({
  projectId: z.string().min(1),
  tagId: z.string().min(1),
});

const removeTagFromProjectSchema = z.object({
  projectId: z.string().min(1),
  tagId: z.string().min(1),
});

// ─── Ensure system tags exist ────────────────────────────────────────────────

const SYSTEM_TAGS = [
  { name: "Draft", color: "#6B7280" },
  { name: "Ongoing", color: "#525252" },
] as const;

export async function ensureSystemTags() {
  for (const tag of SYSTEM_TAGS) {
    const existing = await prisma.tag.findFirst({
      where: { name: tag.name, isSystem: true },
    });
    if (!existing) {
      await prisma.tag.create({
        data: { name: tag.name, color: tag.color, isSystem: true, userId: null },
      });
    }
  }
}

// Helper to get or create system tags (userId = null, matched by name + null)
async function getOrCreateSystemTags() {
  const existing = await prisma.tag.findMany({
    where: { isSystem: true },
  });

  const results: typeof existing = [];

  for (const st of SYSTEM_TAGS) {
    const found = existing.find((t) => t.name === st.name);
    if (found) {
      results.push(found);
    } else {
      const created = await prisma.tag.create({
        data: { name: st.name, color: st.color, isSystem: true, userId: null },
      });
      results.push(created);
    }
  }

  return results;
}

// ─── Get tags available to the current user ──────────────────────────────────

export async function getUserTags() {
  const user = await requireUser();

  // Ensure system tags exist
  await getOrCreateSystemTags();

  const tags = await prisma.tag.findMany({
    where: {
      OR: [
        { isSystem: true },
        { userId: user.id },
      ],
    },
    orderBy: [
      { isSystem: "desc" },
      { name: "asc" },
    ],
  });

  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    isSystem: t.isSystem,
  }));
}

// ─── Get tags for a specific project ─────────────────────────────────────────

export async function getProjectTags(projectId: string) {
  const user = await requireUser();

  // Verify user is member of this project
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!member) throw new Error("Not a member of this project");

  const projectTags = await prisma.projectTag.findMany({
    where: { projectId },
    include: { tag: true },
    orderBy: { tag: { name: "asc" } },
  });

  return projectTags.map((pt) => ({
    id: pt.tag.id,
    name: pt.tag.name,
    color: pt.tag.color,
    isSystem: pt.tag.isSystem,
  }));
}

// ─── Create a custom tag ─────────────────────────────────────────────────────

export async function createTag(formData: FormData) {
  const user = await requireUser();

  const parsed = createTagSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  // Check for duplicate name for this user
  const existing = await prisma.tag.findFirst({
    where: {
      name: parsed.data.name,
      OR: [
        { userId: user.id },
        { isSystem: true },
      ],
    },
  });

  if (existing) {
    return { error: "A tag with this name already exists" };
  }

  const tag = await prisma.tag.create({
    data: {
      name: parsed.data.name,
      color: parsed.data.color,
      userId: user.id,
      isSystem: false,
    },
  });

  revalidatePath("/dashboard");
  return { tag: { id: tag.id, name: tag.name, color: tag.color, isSystem: tag.isSystem } };
}

// ─── Delete a custom tag ─────────────────────────────────────────────────────

export async function deleteTag(tagId: string) {
  const user = await requireUser();

  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) return { error: "Tag not found" };
  if (tag.isSystem) return { error: "Cannot delete system tags" };
  if (tag.userId !== user.id) return { error: "Not authorized" };

  await prisma.tag.delete({ where: { id: tagId } });

  revalidatePath("/dashboard");
  return { success: true };
}

// ─── Add a tag to a project ──────────────────────────────────────────────────

export async function addTagToProject(projectId: string, tagId: string) {
  const user = await requireUser();

  const parsed = addTagToProjectSchema.safeParse({ projectId, tagId });
  if (!parsed.success) return { error: "Invalid input" };

  // Check user is a member with edit rights
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!member) return { error: "Not a member of this project" };

  // Verify the tag belongs to the user or is a system tag
  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) return { error: "Tag not found" };
  if (!tag.isSystem && tag.userId !== user.id) return { error: "Not authorized to use this tag" };

  // Check if already applied
  const existing = await prisma.projectTag.findUnique({
    where: { projectId_tagId: { projectId, tagId } },
  });
  if (existing) return { error: "Tag already applied to this project" };

  await prisma.projectTag.create({
    data: { projectId, tagId },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

// ─── Remove a tag from a project ─────────────────────────────────────────────

export async function removeTagFromProject(projectId: string, tagId: string) {
  const user = await requireUser();

  const parsed = removeTagFromProjectSchema.safeParse({ projectId, tagId });
  if (!parsed.success) return { error: "Invalid input" };

  // Check user is a member
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!member) return { error: "Not a member of this project" };

  const projectTag = await prisma.projectTag.findUnique({
    where: { projectId_tagId: { projectId, tagId } },
  });
  if (!projectTag) return { error: "Tag not applied to this project" };

  await prisma.projectTag.delete({
    where: { id: projectTag.id },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

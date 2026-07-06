"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addLabel(projectId: string, name: string, color: string) {
  const user = await requireUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!member) return { error: "Not a member of this project" };
  if (!name.trim()) return { error: "Label name is required" };
  const label = await prisma.projectLabel.create({
    data: { projectId, name: name.trim(), color: color || "#7c3aed" },
  });
  revalidatePath("/dashboard");
  return { success: true, label };
}

export async function removeLabel(projectId: string, labelId: string) {
  const user = await requireUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!member) return { error: "Not a member" };
  await prisma.projectLabel.delete({ where: { id: labelId } });
  revalidatePath("/dashboard");
  return { success: true };
}

import { templates } from "./ai-templates";

interface GeneratedGraph {
  nodes: { title: string; x: number; y: number }[];
  edges: { sourceIndex: number; targetIndex: number }[];
}

/**
 * Parse a user's text description into a dependency graph.
 * Uses heuristics to split text into steps and infer dependencies.
 */
export function parseDescription(description: string): GeneratedGraph {
  // Split by common delimiters
  const steps = splitIntoSteps(description);

  if (steps.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Position nodes in a nice layout (top to bottom, with branching)
  const nodes = steps.map((title, i) => ({
    title: title.trim(),
    x: 150 + (i % 3) * 300,
    y: 100 + Math.floor(i / 3) * 180,
  }));

  // Infer sequential dependencies with some parallelism
  const edges: { sourceIndex: number; targetIndex: number }[] = [];

  for (let i = 1; i < steps.length; i++) {
    // Check for keywords that suggest parallelism
    const step = steps[i].toLowerCase();

    if (step.includes("meanwhile") || step.includes("at the same time") || step.includes("simultaneously")) {
      // Parallel: depends on same parent as previous
      if (i >= 2) {
        edges.push({ sourceIndex: i - 2, targetIndex: i });
      }
    } else if (step.includes("after all") || step.includes("finally") || step.includes("combine") || step.includes("integrate")) {
      // Depends on ALL previous incomplete nodes
      const recentNodes = [];
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (!edges.some((e) => e.sourceIndex === j && e.targetIndex > j && e.targetIndex < i)) {
          recentNodes.push(j);
        }
      }
      recentNodes.forEach((j) => edges.push({ sourceIndex: j, targetIndex: i }));
    } else {
      // Default: sequential dependency on previous step
      edges.push({ sourceIndex: i - 1, targetIndex: i });
    }
  }

  return { nodes, edges };
}

/**
 * Generate a graph from a pre-built template.
 */
export function generateFromTemplate(templateName: string): GeneratedGraph {
  const template = templates.find((t) => t.name === templateName);
  if (!template) return { nodes: [], edges: [] };

  const nodes = template.nodes.map((node, i) => ({
    title: node.title,
    x: 150 + (i % 3) * 300,
    y: 100 + Math.floor(i / 3) * 200,
  }));

  const edges: { sourceIndex: number; targetIndex: number }[] = [];
  template.nodes.forEach((node, i) => {
    node.dependencies.forEach((depIndex) => {
      edges.push({ sourceIndex: depIndex, targetIndex: i });
    });
  });

  return { nodes, edges };
}

function splitIntoSteps(text: string): string[] {
  // Try numbered list first (1. Step one 2. Step two)
  const numberedMatch = text.match(/\d+[\.\)]\s*[^\d]+/g);
  if (numberedMatch && numberedMatch.length >= 2) {
    return numberedMatch.map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim()).filter(Boolean);
  }

  // Try bullet points
  const bulletMatch = text.match(/[-•\*]\s*[^\-•\*\n]+/g);
  if (bulletMatch && bulletMatch.length >= 2) {
    return bulletMatch.map((s) => s.replace(/^[-•\*]\s*/, "").trim()).filter(Boolean);
  }

  // Try newlines
  const lines = text.split(/\n+/).map((s) => s.trim()).filter((s) => s.length > 2);
  if (lines.length >= 2) {
    return lines;
  }

  // Try sentences
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 3);
  if (sentences.length >= 2) {
    return sentences;
  }

  // Try commas with "then" / "and"
  const commaSplit = text.split(/,\s*(?:then|and|next)?\s*/i).map((s) => s.trim()).filter((s) => s.length > 3);
  if (commaSplit.length >= 2) {
    return commaSplit;
  }

  // Last resort: split by commas
  return text.split(/,/).map((s) => s.trim()).filter((s) => s.length > 2);
}

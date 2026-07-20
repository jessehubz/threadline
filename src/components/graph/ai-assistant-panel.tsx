"use client";

import { useEffect, useState } from "react";
import { Sparkles, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { templates } from "@/lib/ai-templates";
import { parseDescription, generateFromTemplate } from "@/lib/ai-parser";
import { createNode, createEdge } from "@/actions/graph-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AIAssistantPanelProps {
  projectId: string;
  graphId: string;
  open: boolean;
  onToggle: () => void;
}

export function AIAssistantPanel({ projectId, graphId, open, onToggle }: AIAssistantPanelProps) {
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [generating, setGenerating] = useState(false);

  // The disclosure panel stays mounted for the duration of its exit
  // transition (fade+scale via transform/opacity only) instead of
  // hard-cutting when closed. `visible` drives the transition; `shouldRender`
  // keeps it in the DOM just long enough to play it.
  const [shouldRender, setShouldRender] = useState(open);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let raf: number | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    function run() {
      if (open) {
        setShouldRender(true);
        raf = requestAnimationFrame(() => setVisible(true));
      } else {
        setVisible(false);
        timeout = setTimeout(() => setShouldRender(false), 200);
      }
    }

    run();
    return () => {
      if (raf !== undefined) cancelAnimationFrame(raf);
      if (timeout !== undefined) clearTimeout(timeout);
    };
  }, [open]);

  async function handleGenerate() {
    setGenerating(true);

    try {
      const result = selectedTemplate
        ? generateFromTemplate(selectedTemplate)
        : parseDescription(description);

      if (result.nodes.length === 0) {
        toast.error("Could not parse any tasks. Try adding more detail or using a template.");
        setGenerating(false);
        return;
      }

      // Create nodes
      const createdNodeIds: string[] = [];
      for (const node of result.nodes) {
        const created = await createNode(projectId, graphId, {
          title: node.title,
          positionX: node.x,
          positionY: node.y,
        });
        createdNodeIds.push(created.id);
      }

      // Create edges
      for (const edge of result.edges) {
        const sourceId = createdNodeIds[edge.sourceIndex];
        const targetId = createdNodeIds[edge.targetIndex];
        if (sourceId && targetId) {
          await createEdge(projectId, graphId, sourceId, targetId);
        }
      }

      toast.success(`Generated ${result.nodes.length} tasks with ${result.edges.length} dependencies!`);
      setDescription("");
      setSelectedTemplate("");
    } catch {
      toast.error("Failed to generate graph");
    }

    setGenerating(false);
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {/* Toggle bar */}
      <button
        onClick={onToggle}
        className="mx-auto flex items-center gap-2 rounded-t-xl border border-b-0 border-themed-subtle bg-card/95 px-4 py-2 text-xs font-medium text-body shadow-sm backdrop-blur-md transition-colors hover:bg-hover"
        style={{ marginLeft: "50%", transform: "translateX(-50%)" }}
      >
        <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
        Task Helper
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
      </button>

      {/* Panel */}
      {shouldRender && (
        <div
          className={cn(
            "origin-top border-t border-themed-subtle bg-card p-5 shadow-themed-md transition-[transform,opacity] duration-200 ease-(--ease-out-strong)",
            visible ? "scale-y-100 opacity-100" : "scale-y-95 opacity-0"
          )}
        >
          <div className="mx-auto max-w-3xl space-y-5">
            <div className="flex items-center gap-3">
              <p className="text-card-title">
                Generate a dependency graph
              </p>
              <BadgeLabel text="No API key needed" />
            </div>

            {/* Template selector */}
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedTemplate}
                onChange={(e) => { setSelectedTemplate(e.target.value); setDescription(""); }}
                className="input-field w-auto text-sm"
              >
                <option value="">Or pick a template...</option>
                {templates.map((t) => (
                  <option key={t.name} value={t.name}>{t.name} - {t.description}</option>
                ))}
              </select>
            </div>

            {/* Custom description */}
            {!selectedTemplate && (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project... e.g. 'Build a landing page: design mockups, write copy, develop frontend, test on mobile, deploy to production'"
                rows={3}
                className="text-sm"
              />
            )}

            {selectedTemplate && (
              <p className="text-sm text-body">
                Will generate {templates.find((t) => t.name === selectedTemplate)?.nodes.length || 0} tasks with dependencies
              </p>
            )}

            <Button
              onClick={handleGenerate}
              loading={generating}
              disabled={!description && !selectedTemplate}
              className="w-full sm:w-auto"
            >
              <Wand2 className="h-4 w-4" />
              Generate Graph
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeLabel({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full accent-bg accent-color px-2.5 py-0.5 text-[10px] font-semibold">
      {text}
    </span>
  );
}

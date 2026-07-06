"use client";

import { useState } from "react";
import { Sparkles, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { templates } from "@/lib/ai-templates";
import { parseDescription, generateFromTemplate } from "@/lib/ai-parser";
import { createNode, createEdge } from "@/actions/graph-actions";
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
    } catch (error) {
      toast.error("Failed to generate graph");
    }

    setGenerating(false);
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {/* Toggle bar */}
      <button
        onClick={onToggle}
        className="mx-auto flex items-center gap-2 rounded-t-xl border border-b-0 border-surface-200/80 bg-white/95 px-4 py-2 text-xs font-medium text-surface-600 shadow-sm backdrop-blur-md transition-colors hover:bg-surface-50/80/95"
        style={{ marginLeft: "50%", transform: "translateX(-50%)" }}
      >
        <Sparkles className="h-3.5 w-3.5 text-purple-500" />
        AI Assistant
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="border-t border-surface-200/80 bg-white p-5 shadow-xl">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-surface-900">
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
                  <option key={t.name} value={t.name}>{t.name} — {t.description}</option>
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
              <p className="text-sm text-surface-500">
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
    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700900300">
      {text}
    </span>
  );
}

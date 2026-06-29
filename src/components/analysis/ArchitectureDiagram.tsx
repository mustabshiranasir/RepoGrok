"use client";

import { useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import type { AnalysisResult } from "@/types/analysis";

const accentColor = "var(--accent)";
const bgSurface = "var(--bg-surface)";
const textPrimary = "var(--text-primary)";
const textSecondary = "var(--text-secondary)";
const textMuted = "var(--text-muted)";
const bgBorder = "var(--bg-border)";

const nodeStyle: React.CSSProperties = {
  background: bgSurface,
  color: textPrimary,
  border: `1px solid ${accentColor}`,
  borderRadius: 8,
  padding: "10px 20px",
  fontSize: 13,
  fontWeight: 600,
  boxShadow: `0 0 0 1px ${"var(--accent-muted)"}`,
};

const edgeStyle = {
  stroke: accentColor,
  strokeWidth: 1.5,
};

function Diagram({ analysis }: { analysis: AnalysisResult }) {
  const { fitView } = useReactFlow();

  const categories = new Set(analysis.techStack.map((t) => t.category));

  const { nodes, edges } = useMemo(() => {
    const result: { nodes: any[]; edges: any[] } = { nodes: [], edges: [] };
    let y = 0;
    const gap = 120;

    const addLayer = (
      id: string,
      label: string,
      techs: string,
      hasCategory: boolean
    ) => {
      if (!hasCategory) return;
      result.nodes.push({
        id,
        type: "default",
        position: { x: 250, y },
        data: {
          label: (
            <div className="flex flex-col items-center gap-0.5">
              <span>{label}</span>
              {techs && (
                <span
                  className="text-[11px] font-normal"
                  style={{ color: textSecondary }}
                >
                  {techs}
                </span>
              )}
            </div>
          ),
        },
        style: nodeStyle,
        draggable: false,
        selectable: false,
      });
      y += gap;
    };

    const frontendTechs = analysis.techStack
      .filter((t) => t.category === "frontend")
      .map((t) => t.name)
      .join(", ");
    const backendTechs = analysis.techStack
      .filter((t) => t.category === "backend")
      .map((t) => t.name)
      .join(", ");
    const dbTechs = analysis.techStack
      .filter((t) => t.category === "database")
      .map((t) => t.name)
      .join(", ");
    const devOpsTechs = analysis.techStack
      .filter((t) => t.category === "devops")
      .map((t) => t.name)
      .join(", ");

    const count = [categories.has("frontend"), categories.has("backend"), categories.has("database"), categories.has("devops")].filter(Boolean).length;
    const startY = (count * gap - gap) / -2;
    y = startY;

    addLayer("frontend", "Frontend", frontendTechs, categories.has("frontend"));
    addLayer("backend", "Backend", backendTechs, categories.has("backend"));
    addLayer("database", "Database", dbTechs, categories.has("database"));
    addLayer("devops", "DevOps / Infra", devOpsTechs, categories.has("devops"));

    const addEdge = (
      id: string,
      source: string,
      target: string,
      label: string
    ) => {
      result.edges.push({
        id,
        source,
        target,
        animated: true,
        style: edgeStyle,
        markerEnd: { type: MarkerType.ArrowClosed, color: accentColor },
        label,
        labelStyle: { fill: textMuted, fontSize: 11 },
        labelBgStyle: { fill: bgSurface, opacity: 0.85 },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 4,
      });
    };

    if (categories.has("frontend") && categories.has("backend")) {
      addEdge("fe-be", "frontend", "backend", "HTTP / API");
    }

    if (categories.has("backend") && categories.has("database")) {
      addEdge("be-db", "backend", "database", "Queries");
    }

    if (categories.has("frontend") && categories.has("database") && !categories.has("backend")) {
      addEdge("fe-db", "frontend", "database", "Direct queries");
    }

    if (categories.has("devops")) {
      if (categories.has("backend")) {
        addEdge("devops-be", "devops", "backend", "Deploys");
      }
      if (categories.has("database")) {
        addEdge("devops-db", "devops", "database", "Manages");
      }
    }

    return result;
  }, [analysis]);

  useEffect(() => {
    fitView({ padding: 0.3 });
  }, [nodes, fitView]);

  return (
      <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      fitViewOptions={{ padding: 0.4 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      proOptions={{ hideAttribution: true }}
      style={{ background: "transparent" }}
    >
      <Background color={bgBorder} gap={20} size={1} />
    </ReactFlow>
  );
}

export default function ArchitectureDiagram({
  analysis,
}: {
  analysis: AnalysisResult;
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--bg-border)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Architecture
        </h2>
      </div>
      <div className="h-[320px]">
        <ReactFlowProvider>
          <Diagram analysis={analysis} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}

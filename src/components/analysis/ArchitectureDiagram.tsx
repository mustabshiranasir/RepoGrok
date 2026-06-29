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

const nodeStyle: React.CSSProperties = {
  background: "#111111",
  color: "#f4f4f5",
  border: "1px solid #6366f1",
  borderRadius: 8,
  padding: "10px 20px",
  fontSize: 13,
  fontWeight: 600,
};

const edgeStyle = {
  stroke: "#6366f1",
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
                <span className="text-[11px] text-[#a1a1aa] font-normal">
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

    addLayer("frontend", "Frontend", frontendTechs, categories.has("frontend"));
    addLayer("backend", "Backend", backendTechs, categories.has("backend"));
    addLayer("database", "Database", dbTechs, categories.has("database"));
    addLayer("devops", "DevOps / Infra", devOpsTechs, categories.has("devops"));

    if (categories.has("frontend") && categories.has("backend")) {
      result.edges.push({
        id: "fe-be",
        source: "frontend",
        target: "backend",
        animated: true,
        style: edgeStyle,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
        label: "HTTP / API calls",
        labelStyle: { fill: "#a1a1aa", fontSize: 11 },
      });
    }

    if (categories.has("backend") && categories.has("database")) {
      result.edges.push({
        id: "be-db",
        source: "backend",
        target: "database",
        animated: true,
        style: edgeStyle,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
        label: "Queries",
        labelStyle: { fill: "#a1a1aa", fontSize: 11 },
      });
    }

    if (categories.has("frontend") && categories.has("database") && !categories.has("backend")) {
      result.edges.push({
        id: "fe-db",
        source: "frontend",
        target: "database",
        animated: true,
        style: edgeStyle,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
        label: "Direct queries",
        labelStyle: { fill: "#a1a1aa", fontSize: 11 },
      });
    }

    if (categories.has("devops")) {
      if (categories.has("backend")) {
        result.edges.push({
          id: "devops-be",
          source: "devops",
          target: "backend",
          animated: true,
          style: edgeStyle,
          markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
          label: "Deploys",
          labelStyle: { fill: "#a1a1aa", fontSize: 11 },
        });
      }
      if (categories.has("database")) {
        result.edges.push({
          id: "devops-db",
          source: "devops",
          target: "database",
          animated: true,
          style: edgeStyle,
          markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
          label: "Manages",
          labelStyle: { fill: "#a1a1aa", fontSize: 11 },
        });
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
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#1e1e1e" gap={20} size={1} />
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

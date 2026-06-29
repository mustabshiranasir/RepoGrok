"use client";

import { useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Globe,
  Server,
  Database,
  Container,
  GitBranch,
} from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

const accentColor = "var(--accent)";
const bgSurface = "var(--bg-surface)";
const textPrimary = "var(--text-primary)";
const textSecondary = "var(--text-secondary)";
const textMuted = "var(--text-muted)";
const bgBorder = "var(--bg-border)";
const bgPrimary = "var(--bg-primary)";

const layerMeta: Record<
  string,
  { icon: typeof Globe; border: string; bg: string }
> = {
  frontend: {
    icon: Globe,
    border: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
  },
  backend: {
    icon: Server,
    border: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
  },
  database: {
    icon: Database,
    border: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
  },
  devops: {
    icon: Container,
    border: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
  },
};

function LayerNode({ data }: { data: { label: string; techs: string; layer: string } }) {
  const meta = layerMeta[data.layer];
  const Icon = meta?.icon ?? GitBranch;
  const borderColor = meta?.border ?? accentColor;
  const bgColor = meta?.bg ?? "transparent";

  return (
    <div
      style={{
        background: bgSurface,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: 0,
        minWidth: 180,
        overflow: "hidden",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: bgColor,
          borderBottom: `1px solid ${bgBorder}`,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: bgSurface,
            border: `1px solid ${borderColor}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} color={borderColor} />
        </div>
        <span style={{ color: textPrimary, fontSize: 13, fontWeight: 600 }}>
          {data.label}
        </span>
      </div>
      {data.techs && (
        <div style={{ padding: "8px 14px" }}>
          <span style={{ color: textSecondary, fontSize: 11 }}>
            {data.techs}
          </span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { layerNode: LayerNode };

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
    const gap = 130;

    const addLayer = (
      id: string,
      label: string,
      techs: string,
      layer: string,
      hasCategory: boolean
    ) => {
      if (!hasCategory) return;
      result.nodes.push({
        id,
        type: "layerNode",
        position: { x: 250, y },
        data: { label, techs, layer },
        draggable: false,
        selectable: false,
      });
      y += gap;
    };

    addLayer(
      "frontend",
      "Frontend",
      analysis.techStack.filter((t) => t.category === "frontend").map((t) => t.name).join(", "),
      "frontend",
      categories.has("frontend")
    );
    addLayer(
      "backend",
      "Backend",
      analysis.techStack.filter((t) => t.category === "backend").map((t) => t.name).join(", "),
      "backend",
      categories.has("backend")
    );
    addLayer(
      "database",
      "Database",
      analysis.techStack.filter((t) => t.category === "database").map((t) => t.name).join(", "),
      "database",
      categories.has("database")
    );
    addLayer(
      "devops",
      "DevOps / Infra",
      analysis.techStack.filter((t) => t.category === "devops").map((t) => t.name).join(", "),
      "devops",
      categories.has("devops")
    );

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
        type: "smoothstep",
        style: edgeStyle,
        markerEnd: { type: MarkerType.ArrowClosed, color: accentColor },
        label,
        labelStyle: { fill: textMuted, fontSize: 11, fontWeight: 500 },
        labelBgStyle: { fill: bgPrimary, opacity: 0.9 },
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
      addEdge("fe-db", "frontend", "database", "Direct");
    }
    if (categories.has("devops")) {
      if (categories.has("backend")) addEdge("devops-be", "devops", "backend", "Deploys");
      if (categories.has("database") && !categories.has("backend")) {
        addEdge("devops-db", "devops", "database", "Manages");
      }
    }

    return result;
  }, [analysis]);

  useEffect(() => {
    const timer = setTimeout(() => fitView({ padding: 0.4 }), 150);
    return () => clearTimeout(timer);
  }, [nodes, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      proOptions={{ hideAttribution: true }}
      style={{ background: "transparent" }}
      defaultEdgeOptions={{ type: "smoothstep" }}
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
      <div className="px-5 py-3 border-b border-[var(--bg-border)] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Architecture
        </h2>
        {analysis.entryPoint?.file && (
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <GitBranch size={12} />
            Entry: <span className="text-[var(--text-secondary)] font-mono">{analysis.entryPoint.file}</span>
          </div>
        )}
      </div>
      <div className="h-[360px]">
        <ReactFlowProvider>
          <Diagram analysis={analysis} />
        </ReactFlowProvider>
      </div>
      {analysis.dataFlow && (
        <div className="px-5 py-2.5 border-t border-[var(--bg-border)] text-[11px] text-[var(--text-muted)] leading-relaxed">
          <span className="text-[var(--text-secondary)] font-medium">Data flow: </span>
          {analysis.dataFlow}
        </div>
      )}
    </div>
  );
}

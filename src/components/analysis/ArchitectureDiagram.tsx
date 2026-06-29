"use client";

import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { GitBranch, Download, ImageDown } from "lucide-react";
import { toPng, toJpeg, toSvg } from "html-to-image";
import type { AnalysisResult } from "@/types/analysis";

const accentColor = "var(--accent)";
const bgSurface = "var(--bg-surface)";
const textPrimary = "var(--text-primary)";
const textSecondary = "var(--text-secondary)";
const textMuted = "var(--text-muted)";
const bgBorder = "var(--bg-border)";
const bgPrimary = "var(--bg-primary)";

const nodeStyle: React.CSSProperties = {
  background: bgSurface,
  color: textPrimary,
  border: `1px solid ${accentColor}`,
  borderRadius: 8,
  padding: "10px 20px",
  fontSize: 13,
  fontWeight: 600,
  boxShadow: `0 2px 8px rgba(0,0,0,0.2), 0 0 0 1px var(--accent-muted)`,
};

const edgeStyle = {
  stroke: accentColor,
  strokeWidth: 1.5,
};

type Format = "png" | "jpg" | "svg";

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
        type: "smoothstep",
        style: edgeStyle,
        markerEnd: { type: MarkerType.ArrowClosed, color: accentColor },
        label,
        labelStyle: { fill: textMuted, fontSize: 11 },
        labelBgStyle: { fill: bgPrimary, opacity: 0.85 },
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
    const timer = setTimeout(() => fitView({ padding: 0.3 }), 150);
    return () => clearTimeout(timer);
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
      style={{ background: "transparent" }}
    >
      <Background color={bgBorder} gap={20} size={1} />
    </ReactFlow>
  );
}

function DownloadBtn({ reactFlowId }: { reactFlowId: string }) {
  const [open, setOpen] = useState(false);

  const download = useCallback(
    async (format: Format) => {
      const el = document.querySelector(`.${reactFlowId}`) as HTMLElement;
      if (!el) return;

      const ext = format === "jpg" ? "jpeg" : format === "svg" ? "svg" : "png";
      const mime =
        format === "jpg" ? "image/jpeg" : format === "svg" ? "image/svg+xml" : "image/png";

      let dataUrl: string;
      try {
        if (format === "svg") {
          dataUrl = await toSvg(el, { quality: 1, backgroundColor: "#0a0a0a" });
        } else if (format === "jpg") {
          dataUrl = await toJpeg(el, { quality: 0.95, backgroundColor: "#0a0a0a" });
        } else {
          dataUrl = await toPng(el, { quality: 1, backgroundColor: "#0a0a0a" });
        }
      } catch {
        return;
      }

      const link = document.createElement("a");
      link.download = `architecture.${ext}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setOpen(false);
    },
    [reactFlowId]
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <Download size={12} />
        Export
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg shadow-xl overflow-hidden min-w-[100px]">
            <FormatBtn format="png" label="PNG" onClick={() => download("png")} />
            <FormatBtn format="jpg" label="JPEG" onClick={() => download("jpg")} />
            <FormatBtn format="svg" label="SVG" onClick={() => download("svg")} />
          </div>
        </>
      )}
    </div>
  );
}

function FormatBtn({
  format,
  label,
  onClick,
}: {
  format: Format;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-border)] hover:text-[var(--text-primary)] transition-colors"
    >
      <ImageDown size={12} />
      {label}
    </button>
  );
}

const REACT_FLOW_ID = "arch-diagram-flow";

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
        <div className="flex items-center gap-3">
          {analysis.entryPoint?.file && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <GitBranch size={12} />
              Entry:{" "}
              <span className="text-[var(--text-secondary)] font-mono">
                {analysis.entryPoint.file}
              </span>
            </div>
          )}
          <DownloadBtn reactFlowId={REACT_FLOW_ID} />
        </div>
      </div>
      <div className={`h-[320px] ${REACT_FLOW_ID}`}>
        <ReactFlowProvider>
          <Diagram analysis={analysis} />
        </ReactFlowProvider>
      </div>
      {analysis.dataFlow && (
        <div className="px-5 py-2.5 border-t border-[var(--bg-border)] text-[11px] text-[var(--text-muted)] leading-relaxed">
          <span className="text-[var(--text-secondary)] font-medium">
            Data flow:{" "}
          </span>
          {analysis.dataFlow}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FolderOpen, File, ChevronRight } from "lucide-react";
import type { FolderInfo } from "@/types/analysis";

interface TreeNode {
  name: string;
  path: string;
  type: "blob" | "tree";
  children: TreeNode[];
}

function buildTree(flat: { path: string; type: string }[]): TreeNode[] {
  const root: TreeNode[] = [];
  const map = new Map<string, TreeNode>();

  for (const item of flat) {
    const parts = item.path.split("/");
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];

      if (!map.has(currentPath)) {
        const node: TreeNode = {
          name: parts[i],
          path: currentPath,
          type: i < parts.length - 1 ? "tree" : (item.type as "blob" | "tree"),
          children: [],
        };
        map.set(currentPath, node);
        if (parentPath) {
          map.get(parentPath)?.children.push(node);
        } else {
          root.push(node);
        }
      }
    }
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const n of nodes) sortNodes(n.children);
  };
  sortNodes(root);

  return root;
}

function TreeRow({
  node,
  depth,
  explanationMap,
  openPaths,
  togglePath,
}: {
  node: TreeNode;
  depth: number;
  explanationMap: Map<string, string>;
  openPaths: Set<string>;
  togglePath: (path: string) => void;
}) {
  const isFolder = node.type === "tree" || node.children.length > 0;
  const isOpen = openPaths.has(node.path);
  const explanation = explanationMap.get(node.path);

  return (
    <div>
      <button
        onClick={() => isFolder && togglePath(node.path)}
        className={`flex items-center gap-2 w-full px-5 py-1.5 text-left transition-colors hover:bg-[var(--bg-border)] ${
          isOpen ? "bg-[var(--bg-border)]/20" : ""
        }`}
        style={{ paddingLeft: `${20 + depth * 16}px` }}
      >
        <span className="w-4 shrink-0 flex items-center justify-center">
          {isFolder ? (
            <ChevronRight
              className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${
                isOpen ? "rotate-90" : ""
              }`}
            />
          ) : (
            <span className="w-3.5" />
          )}
        </span>

        {isFolder ? (
          isOpen ? (
            <FolderOpen className="w-4 h-4 text-accent shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          )
        ) : (
          <File className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        )}

        <span className="text-sm text-[var(--text-primary)] truncate">
          {node.name}
        </span>

        {isFolder && node.children.length > 0 && (
          <span className="text-[10px] text-[var(--text-muted)] ml-auto shrink-0">
            {node.children.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && explanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="text-xs text-[var(--text-secondary)] leading-relaxed pb-1.5"
              style={{ paddingLeft: `${44 + depth * 16}px` }}
            >
              {explanation}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && isFolder && node.children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeRow
                key={child.path}
                node={child}
                depth={depth + 1}
                explanationMap={explanationMap}
                openPaths={openPaths}
                togglePath={togglePath}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FolderTree({
  folders,
  tree,
}: {
  folders: FolderInfo[];
  tree: { path: string; type: string }[];
}) {
  const [openPaths, setOpenPaths] = useState<Set<string>>(new Set());

  const togglePath = (path: string) => {
    setOpenPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const treeData = useMemo(() => {
    if (!tree || tree.length === 0) return [];
    const filtered = tree.filter(
      (item) =>
        !item.path.startsWith("node_modules/") &&
        !item.path.startsWith(".next/") &&
        !item.path.startsWith(".git/")
    );
    return buildTree(filtered);
  }, [tree]);

  const explanationMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of folders) {
      map.set(f.path, f.explanation);
    }
    return map;
  }, [folders]);

  if (treeData.length === 0) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl">
        <div className="px-5 py-3 border-b border-[var(--bg-border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Folder Structure
          </h2>
        </div>
        <div className="px-5 py-4 text-sm text-[var(--text-muted)]">
          No folder structure available.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--bg-border)] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Folder Structure
        </h2>
        <span className="text-[10px] text-[var(--text-muted)]">
          {treeData.reduce((sum, n) => sum + 1 + countItems(n), 0)} items
        </span>
      </div>
      <div className="py-1 max-h-[420px] overflow-y-auto">
        {treeData.map((node) => (
          <TreeRow
            key={node.path}
            node={node}
            depth={0}
            explanationMap={explanationMap}
            openPaths={openPaths}
            togglePath={togglePath}
          />
        ))}
      </div>
    </div>
  );
}

function countItems(node: TreeNode): number {
  return node.children.reduce((sum, child) => sum + 1 + countItems(child), 0);
}

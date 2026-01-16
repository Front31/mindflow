'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  MiniMap,
  addEdge as addEdgeRF,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  ReactFlowProvider,
  SelectionMode,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import * as htmlToImage from 'html-to-image';

import CustomNode from './CustomNode';
import Toolbar from './Toolbar';
import ShareModal from './ShareModal';
import { nodeColors } from '@/lib/utils';
import { useMindFlowStore } from '@/lib/store';
import { getRectOfNodes, getTransformForBounds } from 'reactflow';
import * as htmlToImage from 'html-to-image';
import { getRectOfNodes, getTransformForBounds } from 'reactflow';

const nodeTypes = {
  mindMapNode: CustomNode,
};

function sameIdList(a: string[], b: string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Inline Modal: Export */
function ExportModal({
  isOpen,
  onClose,
  onExport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onExport: (opts: { includeBackground: boolean; theme: 'current' | 'light' | 'dark' }) => void;
}) {
  const [includeBackground, setIncludeBackground] = useState(true);
  const [theme, setTheme] = useState<'current' | 'light' | 'dark'>('current');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative glass-elevated rounded-3xl p-6 w-[360px]">
        <div className="text-base font-semibold mb-4">Export PNG</div>

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={includeBackground}
            onChange={(e) => setIncludeBackground(e.target.checked)}
          />
          <span className="text-sm">Include background</span>
        </label>

        <div className="mb-5">
          <div className="text-sm font-medium mb-2">Theme</div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="w-full rounded-xl px-3 py-2 bg-white/20 dark:bg-white/10 border border-white/20 outline-none"
          >
            <option value="current">Current</option>
            <option value="light">Force Light</option>
            <option value="dark">Force Dark</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            className="rounded-2xl px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-2xl px-4 py-2 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15"
            onClick={() => onExport({ includeBackground, theme })}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

/** Inline Modal: Color Picker */
function ColorModal({
  isOpen,
  onClose,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (hex: string) => void;
}) {
  const [hex, setHex] = useState('#3b82f6');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative glass-elevated rounded-3xl p-6 w-[360px]">
        <div className="text-base font-semibold mb-4">Node color</div>

        <div className="flex items-center gap-3 mb-5">
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="w-14 h-10 bg-transparent border-0 p-0"
          />
          <input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2 bg-white/20 dark:bg-white/10 border border-white/20 outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            className="rounded-2xl px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-2xl px-4 py-2 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15"
            onClick={() => onApply(hex)}
          >
            Apply to selected
          </button>
        </div>
      </div>
    </div>
  );
}

type RoomResponse = {
  id: string;
  state: { nodes: any[]; edges: Edge[] } | null;
  rev: number;
};

function CanvasContent({ roomId }: { roomId: string }) {
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();

  const [isDark, setIsDark] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showColor, setShowColor] = useState(false);

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);

  // Store
  const nodes = useMindFlowStore((s) => s.nodes) as any[];
  const edges = useMindFlowStore((s) => s.edges) as Edge[];
  const addNode = useMindFlowStore((s) => s.addNode);
  const setNodes = useMindFlowStore((s) => s.setNodes);
  const setEdges = useMindFlowStore((s) => s.setEdges);
  const resetRoom = useMindFlowStore((s) => s.resetRoom);

  // Collaboration (poll + save)
  const roomRevRef = useRef<number>(0);
  const applyingRemoteRef = useRef<boolean>(false);
  const saveTimerRef = useRef<any>(null);

  // Clipboard
  const clipboardRef = useRef<{ nodes: any[]; edges: Edge[] } | null>(null);
  const pasteOffsetRef = useRef(0);

  // Theme init
  useEffect(() => {
    const isDarkMode =
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDark(isDarkMode);
    if (isDarkMode) document.documentElement.classList.add('dark');
  }, []);

  // Initial load
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`, { cache: 'no-store' });
        const data = (await res.json()) as RoomResponse;
        if (cancelled) return;

        if (data?.state) {
          applyingRemoteRef.current = true;
          setNodes(data.state.nodes ?? []);
          setEdges((data.state.edges ?? []) as Edge[]);
          roomRevRef.current = data.rev ?? 0;
          applyingRemoteRef.current = false;
        } else {
          roomRevRef.current = data?.rev ?? 0;
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roomId, setNodes, setEdges]);

  // Poll
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`, { cache: 'no-store' });
        const data = (await res.json()) as RoomResponse;

        const serverRev = data?.rev ?? 0;
        if (serverRev > roomRevRef.current && data?.state) {
          applyingRemoteRef.current = true;
          setNodes(data.state.nodes ?? []);
          setEdges((data.state.edges ?? []) as Edge[]);
          roomRevRef.current = serverRev;
          applyingRemoteRef.current = false;
        }
      } catch {
        // ignore
      }
    }, 800);

    return () => clearInterval(t);
  }, [roomId, setNodes, setEdges]);

  // Debounced save
  useEffect(() => {
    if (applyingRemoteRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const payload = { state: { nodes, edges }, rev: roomRevRef.current };
        const res = await fetch(`/api/rooms/${roomId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const out = await res.json();
        if (out?.rev) roomRevRef.current = out.rev;
      } catch {
        // ignore
      }
    }, 200);

    return () => clearTimeout(saveTimerRef.current);
  }, [nodes, edges, roomId]);

  // ReactFlow changes -> store
  const onNodesChange = useCallback(
    (changes: any) => setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `e${params.source}-${params.sourceHandle ?? 's'}-${params.target}-${params.targetHandle ?? 't'}-${Date.now()}`,
        type: 'smoothstep',
        animated: true,
      } as Edge;

      setEdges(addEdgeRF(newEdge, edges));
    },
    [edges, setEdges]
  );

  // Toolbar actions
  const handleAddNodeFromToolbar = useCallback(() => {
    const pos = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    addNode(pos);
  }, [screenToFlowPosition, addNode]);

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  }, []);

  const handleClearCanvas = useCallback(() => {
    if (window.confirm('Reset canvas? This cannot be undone.')) resetRoom();
  }, [resetRoom]);

  const handleFitView = useCallback(() => fitView({ padding: 0.2, duration: 400 }), [fitView]);

  // Delete selected
  const canDelete = useMemo(
    () => selectedNodeIds.length > 0 || selectedEdgeIds.length > 0,
    [selectedNodeIds, selectedEdgeIds]
  );

  const handleDeleteSelected = useCallback(() => {
    if (!canDelete) return;

    let nextEdges = edges.filter((e) => !selectedEdgeIds.includes(e.id));
    const nodeIdSet = new Set(selectedNodeIds);
    const nextNodes = nodes.filter((n) => !nodeIdSet.has(n.id));

    if (selectedNodeIds.length > 0) {
      nextEdges = nextEdges.filter((e) => !nodeIdSet.has(e.source) && !nodeIdSet.has(e.target));
    }

    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
  }, [canDelete, edges, nodes, selectedEdgeIds, selectedNodeIds, setEdges, setNodes]);

  // Copy/Paste
  const handleCopy = useCallback(() => {
    const selNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
    if (selNodes.length === 0) return;

    const idSet = new Set(selNodes.map((n) => n.id));
    const selEdges = edges.filter((e) => idSet.has(e.source) && idSet.has(e.target));
    clipboardRef.current = { nodes: selNodes, edges: selEdges };
    pasteOffsetRef.current = 0;
  }, [nodes, edges, selectedNodeIds]);

  const handlePaste = useCallback(() => {
    const clip = clipboardRef.current;
    if (!clip) return;

    pasteOffsetRef.current += 40;
    const off = pasteOffsetRef.current;

    const idMap = new Map<string, string>();
    const now = Date.now();
    const rand = () => Math.random().toString(16).slice(2);

    const newNodes = clip.nodes.map((n) => {
      const newId = `${n.id}-copy-${now}-${rand()}`;
      idMap.set(n.id, newId);
      return {
        ...n,
        id: newId,
        position: { x: (n.position?.x ?? 0) + off, y: (n.position?.y ?? 0) + off },
        selected: true,
      };
    });

    const newEdges: Edge[] = clip.edges.map((e) => ({
      ...e,
      id: `e${idMap.get(e.source)}-${e.sourceHandle ?? 's'}-${idMap.get(e.target)}-${e.targetHandle ?? 't'}-${now}-${rand()}`,
      source: idMap.get(e.source)!,
      target: idMap.get(e.target)!,
      selected: true,
    }));

    const clearedNodes = nodes.map((n) => ({ ...n, selected: false }));
    const clearedEdges = edges.map((e) => ({ ...e, selected: false }));

    setNodes([...clearedNodes, ...newNodes]);
    setEdges([...clearedEdges, ...newEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  // Global key handling
  const deleteSelectedRef = useRef<() => void>(() => {});
  useEffect(() => {
    deleteSelectedRef.current = handleDeleteSelected;
  }, [handleDeleteSelected]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const isTyping =
        el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          (el as any).isContentEditable);

      if (isTyping) return;

      const isMac = navigator.platform.toLowerCase().includes('mac');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;

      if (ctrl && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopy();
        return;
      }
      if (ctrl && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePaste();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedRef.current?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleCopy, handlePaste]);

  // Apply color to selected nodes (full color picker)
  const applyColorToSelected = (hex: string) => {
    const idSet = new Set(selectedNodeIds);
    setNodes(
      nodes.map((n) =>
        idSet.has(n.id)
          ? { ...n, data: { ...n.data, colorHex: hex } }
          : n
      )
    );
  };

  // ✅ Export (whole map, not viewport) — clones nodes+edges layers
  const exportPng = async (opts: { includeBackground: boolean; theme: 'current' | 'light' | 'dark' }) => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement | null;
    if (!viewport) return;
  
    // --- Theme override
    const html = document.documentElement;
    const hadDark = html.classList.contains('dark');
    if (opts.theme === 'dark') html.classList.add('dark');
    if (opts.theme === 'light') html.classList.remove('dark');
  
    const bgColor =
      opts.includeBackground
        ? opts.theme === 'dark'
          ? '#050815'
          : '#f7f7ff'
        : 'transparent';
  
    // --- (1) TEMP: Glass/Blur deaktivieren -> verhindert "weißes Bild"
    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-export-fix', '1');
    styleTag.textContent = `
      /* Kill blur/filters for export */
      .glass-node, .glass, .glass-elevated {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        filter: none !important;
      }
    `;
    document.head.appendChild(styleTag);
  
    // --- (2) Bounds -> Transform (ganze Map)
    const bounds = getRectOfNodes(nodes);
  
    // Zielgröße groß genug (damit große Maps lesbar bleiben)
    const exportW = 6000;
    const exportH = 6000;
    const padding = 120;
  
    // je nach ReactFlow-Version: Argument-Reihenfolge variiert
    let tx = 0, ty = 0, scale = 1;
    try {
      [tx, ty, scale] = getTransformForBounds(bounds, exportW, exportH, 0.1, 2, padding);
    } catch {
      [tx, ty, scale] = getTransformForBounds(bounds, exportW, exportH, padding, 0.1, 2);
    }
  
    try {
      const dataUrl = await htmlToImage.toPng(viewport, {
        cacheBust: true,
        backgroundColor: bgColor,
        pixelRatio: 3, // 2-4 -> schärfer, größere Datei
        // (3) Wichtig: Transform für Export überschreiben
        style: {
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transformOrigin: '0 0',
        },
        // (4) MiniMap/Toolbar/Handles im Export rausfiltern
        filter: (node) => {
          if (!(node instanceof HTMLElement)) return true;
          const c = node.classList;
          if (c.contains('react-flow__minimap')) return false;
          if (c.contains('react-flow__panel')) return false;
          if (c.contains('react-flow__controls')) return false;
          if (c.contains('react-flow__handle')) return false;
          if (c.contains('react-flow__nodesselection')) return false;
          if (c.contains('react-flow__selection')) return false;
          return true;
        },
      });
  
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `mindflow-${roomId}.png`;
      a.click();
    } finally {
      // cleanup
      styleTag.remove();
      if (opts.theme !== 'current') {
        if (hadDark) html.classList.add('dark');
        else html.classList.remove('dark');
      }
    }
  };


  return (
    <div className="w-full h-screen relative overflow-hidden canvas-cursor">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950" />

      <ReactFlow
        nodes={nodes as any}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.25)',
            strokeWidth: 2,
            strokeDasharray: '4 6',
          },
        }}
        // Interaction model
        panOnDrag={[2]} // right-click pan
        selectionOnDrag // left-drag selection box
        selectionMode={SelectionMode.Partial}
        onPaneContextMenu={(e) => e.preventDefault()}
        elementsSelectable
        edgesFocusable
        edgesUpdatable={false}
        onSelectionChange={({ nodes: selNodes, edges: selEdges }) => {
          const nextNodeIds = (selNodes ?? []).map((n) => n.id).sort();
          const nextEdgeIds = (selEdges ?? []).map((e) => e.id).sort();

          setSelectedNodeIds((prev) => (sameIdList(prev, nextNodeIds) ? prev : nextNodeIds));
          setSelectedEdgeIds((prev) => (sameIdList(prev, nextEdgeIds) ? prev : nextEdgeIds));
        }}
      >
        <Background gap={20} size={1} color={isDark ? '#ffffff12' : '#00000012'} />

        <MiniMap
          nodeColor={(node) => {
            const hex = (node as any).data?.colorHex;
            if (hex) return hex;

            const color = (node as any).data?.color;
            const colors: Record<string, string> = {
              blue: '#3b82f6',
              purple: '#a855f7',
              pink: '#ec4899',
              green: '#10b981',
              orange: '#f97316',
              gray: '#6b7280',
            };
            return colors[color] || '#6b7280';
          }}
          className="!glass-elevated !rounded-2xl !border-0"
        />
      </ReactFlow>

      <Toolbar
        onAddNode={handleAddNodeFromToolbar}
        onDeleteSelected={handleDeleteSelected}
        canDelete={canDelete}
        onClearCanvas={handleClearCanvas}
        onShare={() => setShowShare(true)}
        onExport={() => setShowExport(true)}
        onColor={() => setShowColor(true)}
        onToggleTheme={handleToggleTheme}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitView={handleFitView}
        isDark={isDark}
      />

      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} roomId={roomId} />

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        onExport={(opts) => {
          setShowExport(false);
          exportPng(opts);
        }}
      />

      <ColorModal
        isOpen={showColor}
        onClose={() => setShowColor(false)}
        onApply={(hex) => {
          setShowColor(false);
          applyColorToSelected(hex);
        }}
      />
    </div>
  );
}

export default function Canvas({ roomId }: { roomId: string }) {
  return (
    <ReactFlowProvider>
      <CanvasContent roomId={roomId} />
    </ReactFlowProvider>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import ExportModal from './ExportModal';
import { useMindFlowStore } from '@/lib/store';

const nodeTypes = {
  mindMapNode: CustomNode,
};

function sameIdList(a: string[], b: string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
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

  // Selection state
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);

  // Store
  const nodes = useMindFlowStore((s) => s.nodes) as any[];
  const edges = useMindFlowStore((s) => s.edges) as Edge[];
  const addNode = useMindFlowStore((s) => s.addNode);
  const setNodes = useMindFlowStore((s) => s.setNodes);
  const setEdges = useMindFlowStore((s) => s.setEdges);
  const resetRoom = useMindFlowStore((s) => s.resetRoom);

  // Collaboration (polling + debounced save)
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

  // Toolbar Add node (center)
  const handleAddNodeFromToolbar = useCallback(() => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addNode(position);
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
    if (window.confirm('Reset canvas? This cannot be undone.')) {
      resetRoom();
    }
  }, [resetRoom]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 400 });
  }, [fitView]);

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
      nextEdges = nextEdges.filter(
        (e) => !nodeIdSet.has(e.source) && !nodeIdSet.has(e.target)
      );
    }

    setNodes(nextNodes);
    setEdges(nextEdges);

    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
  }, [canDelete, edges, nodes, selectedEdgeIds, selectedNodeIds, setEdges, setNodes]);

  // Ctrl+C
  const handleCopy = useCallback(() => {
    const selNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
    if (selNodes.length === 0) return;

    const idSet = new Set(selNodes.map((n) => n.id));
    const selEdges = edges.filter((e) => idSet.has(e.source) && idSet.has(e.target));

    clipboardRef.current = { nodes: selNodes, edges: selEdges };
    pasteOffsetRef.current = 0;
  }, [nodes, edges, selectedNodeIds]);

  // Ctrl+V
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

    const newEdges: Edge[] = clip.edges.map((e) => {
      const newId = `e${idMap.get(e.source)}-${e.sourceHandle ?? 's'}-${idMap.get(
        e.target
      )}-${e.targetHandle ?? 't'}-${now}-${rand()}`;
      return {
        ...e,
        id: newId,
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
        selected: true,
      };
    });

    // deselect old
    const clearedNodes = nodes.map((n) => ({ ...n, selected: false }));
    const clearedEdges = edges.map((e) => ({ ...e, selected: false }));

    setNodes([...clearedNodes, ...newNodes]);
    setEdges([...clearedEdges, ...newEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  // Global key handling: Delete + Copy/Paste
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

  // ✅ Export draw.io-style: whole map bounds, no minimap/toolbar, high-res
  const exportPng = async (opts: { includeBackground: boolean; theme: 'current' | 'light' | 'dark' }) => {
    const nodesLayer = document.querySelector('.react-flow__nodes') as HTMLElement | null;
    const edgesLayer = document.querySelector('.react-flow__edges') as HTMLElement | null;
    const labelsLayer = document.querySelector('.react-flow__edgelabel-renderer') as HTMLElement | null;
    const background = document.querySelector('.react-flow__background') as HTMLElement | null;
  
    if (!nodesLayer || !edgesLayer) return;
  
    // Theme override
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
  
    // Bounds (aus Node-Daten, zuverlässig für große Maps)
    const pad = 140;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
    for (const n of nodes) {
      const x = n.position?.x ?? 0;
      const y = n.position?.y ?? 0;
  
      const w =
        n.measured?.width ??
        n.width ??
        (typeof n.style?.width === 'number' ? n.style.width : undefined) ??
        220;
  
      const h =
        n.measured?.height ??
        n.height ??
        (typeof n.style?.height === 'number' ? n.style.height : undefined) ??
        84;
  
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }
  
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      minX = 0; minY = 0; maxX = 1200; maxY = 800;
    }
  
    const exportW = Math.ceil((maxX - minX) + pad * 2);
    const exportH = Math.ceil((maxY - minY) + pad * 2);
  
    // Hohe Schärfe (wie draw.io) – Datei wird größer
    const pixelRatio = 4;
  
    // Offscreen Wrapper
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-10000px';
    wrapper.style.top = '0';
    wrapper.style.width = `${exportW}px`;
    wrapper.style.height = `${exportH}px`;
    wrapper.style.overflow = 'hidden';
    wrapper.style.background = bgColor;
  
    // Optional Grid/Background
    if (opts.includeBackground && background) {
      const bgClone = background.cloneNode(true) as HTMLElement;
      bgClone.style.position = 'absolute';
      bgClone.style.left = '0';
      bgClone.style.top = '0';
      bgClone.style.width = '100%';
      bgClone.style.height = '100%';
      wrapper.appendChild(bgClone);
    }
  
    // Group, die wir passend verschieben
    const group = document.createElement('div');
    group.style.position = 'absolute';
    group.style.left = '0';
    group.style.top = '0';
    group.style.transformOrigin = '0 0';
    group.style.transform = `translate(${(-minX + pad)}px, ${(-minY + pad)}px)`;
  
    // Clone layers (OHNE Viewport-Transform!)
    const edgesClone = edgesLayer.cloneNode(true) as HTMLElement;
    const nodesClone = nodesLayer.cloneNode(true) as HTMLElement;
    group.appendChild(edgesClone);
    group.appendChild(nodesClone);
  
    if (labelsLayer) {
      const labelsClone = labelsLayer.cloneNode(true) as HTMLElement;
      group.appendChild(labelsClone);
    }
  
    // Hide selection/handles in export
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      .react-flow__minimap, .react-flow__controls, .react-flow__panel { display: none !important; }
      .react-flow__nodesselection, .react-flow__selection, .react-flow__handle { display: none !important; }
      .react-flow__node.selected { outline: none !important; }
    `;
    wrapper.appendChild(styleTag);
  
    wrapper.appendChild(group);
    document.body.appendChild(wrapper);
  
    try {
      const dataUrl = await htmlToImage.toPng(wrapper, {
        backgroundColor: bgColor,
        pixelRatio,
        cacheBust: true,
        width: exportW,
        height: exportH,
      });
  
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `mindflow-${roomId}.png`;
      a.click();
    } finally {
      wrapper.remove();
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
        panOnDrag={[2]}
        selectionOnDrag
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

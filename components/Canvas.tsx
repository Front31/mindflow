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

import CustomNode from './CustomNode';
import Toolbar from './Toolbar';
import ShareModal from './ShareModal';
import { useMindFlowStore } from '@/lib/store';

const nodeTypes = { mindMapNode: CustomNode };

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

function CanvasContent({ roomId }: { roomId: string }) {
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();

  const [isDark, setIsDark] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [edgeDashed, setEdgeDashed] = useState(false);

  // Selection state
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);

  // Store (single source of truth)
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

  // Upload input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Theme init
  useEffect(() => {
    const isDarkMode =
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDark(isDarkMode);
    if (isDarkMode) document.documentElement.classList.add('dark');
  }, []);

  // Initial load from DB
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

  // Poll for remote updates
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

  // Debounced save to DB
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
        animated: false,
        style: edgeDashed ? { strokeWidth: 2, strokeDasharray: '6 6' } : { strokeWidth: 2 },
      } as Edge;
  
      setEdges(addEdgeRF(newEdge, edges));
    },
    [edges, setEdges, edgeDashed]
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
  const handleCopy = useCallback(async () => {
    const selNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
    if (selNodes.length === 0) return;
  
    const idSet = new Set(selNodes.map((n) => n.id));
    const selEdges = edges.filter((e) => idSet.has(e.source) && idSet.has(e.target));
  
    const payload = {
      app: 'mindflow',
      version: 1,
      type: 'selection',
      state: { nodes: selNodes, edges: selEdges },
      copiedAt: new Date().toISOString(),
    };
  
    // local tab clipboard (fallback)
    clipboardRef.current = { nodes: selNodes, edges: selEdges };
    pasteOffsetRef.current = 0;
  
    // cross-tab clipboard
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload));
    } catch {
      // ignore (permission/browser)
    }
  }, [nodes, edges, selectedNodeIds]);

  const handlePaste = useCallback(async () => {
    // 1) try OS clipboard first (cross-tab)
    let clip: { nodes: any[]; edges: Edge[] } | null = null;
  
    try {
      const text = await navigator.clipboard.readText();
      const json = JSON.parse(text);
  
      if (json?.app === 'mindflow' && json?.type === 'selection' && json?.state) {
        const newNodes = json.state.nodes;
        const newEdges = json.state.edges;
        if (Array.isArray(newNodes) && Array.isArray(newEdges)) {
          clip = { nodes: newNodes, edges: newEdges };
        }
      }
    } catch {
      // ignore
    }
  
    // 2) fallback to in-tab clipboard
    if (!clip) clip = clipboardRef.current;
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

  // Color apply
  const applyColorToSelected = (hex: string) => {
    const idSet = new Set(selectedNodeIds);
    setNodes(nodes.map((n) => (idSet.has(n.id) ? { ...n, data: { ...n.data, colorHex: hex } } : n)));
  };

  // Download / Upload
  const handleDownloadFile = useCallback(() => {
    const payload = {
      version: 1,
      app: 'mindflow',
      roomId,
      savedAt: new Date().toISOString(),
      state: { nodes, edges },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `mindflow-${roomId}.mindflow.json`;
    a.click();

    URL.revokeObjectURL(url);
  }, [nodes, edges, roomId]);

  const handleUploadFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUploadFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const json = JSON.parse(text);

        const state = json?.state ?? json;
        const newNodes = state?.nodes;
        const newEdges = state?.edges;

        if (!Array.isArray(newNodes) || !Array.isArray(newEdges)) {
          alert('Invalid file. Expected { state: { nodes: [], edges: [] } }.');
          return;
        }

        setNodes(newNodes);
        setEdges(newEdges);
      } catch {
        alert('Could not read file. Is it a valid MindFlow JSON export?');
      } finally {
        e.target.value = '';
      }
    },
    [setNodes, setEdges]
  );

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
          animated: false,
          style: {
            stroke: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.25)',
            strokeWidth: 2,
            strokeDasharray: '4 6',
          },
        }}
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
        onDownloadFile={handleDownloadFile}
        onUploadFile={handleUploadFileClick}
        onColor={() => setShowColor(true)}
        onToggleTheme={handleToggleTheme}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitView={handleFitView}
        isDark={isDark}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json,.mindflow"
        className="hidden"
        onChange={handleUploadFile}
      />

      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} roomId={roomId} />

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

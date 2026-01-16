import { create } from 'zustand';
import { MindMapNode, Collaborator, NodeColor } from '@/types';
import { generateId, getRandomColor, saveToLocalStorage, loadFromLocalStorage } from './utils';

interface MindFlowState {
  nodes: MindMapNode[];
  edges: any[];
  collaborators: Collaborator[];
  roomId: string | null;
  currentUser: Collaborator | null;
  
  // Actions
  setRoomId: (id: string) => void;
  setCurrentUser: (user: Collaborator) => void;
  addNode: (position: { x: number; y: number }, label?: string) => void;
  updateNode: (id: string, data: Partial<MindMapNode['data']>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: any) => void;
  deleteEdge: (id: string) => void;
  setNodes: (nodes: MindMapNode[]) => void;
  setEdges: (edges: any[]) => void;
  loadRoom: (roomId: string) => void;
  saveRoom: () => void;
  resetRoom: () => void;
}

const initialNodes: MindMapNode[] = [
  {
    id: 'welcome-1',
    type: 'mindMapNode',
    position: { x: 250, y: 200 },
    data: {
      label: '🎯 Welcome to MindFlow',
      color: 'blue',
      emoji: '🎯',
    },
  },
  {
    id: 'welcome-2',
    type: 'mindMapNode',
    position: { x: 100, y: 350 },
    data: {
      label: 'Click to add nodes',
      color: 'purple',
      emoji: '✨',
    },
  },
  {
    id: 'welcome-3',
    type: 'mindMapNode',
    position: { x: 400, y: 350 },
    data: {
      label: 'Drag to connect ideas',
      color: 'pink',
      emoji: '🔗',
    },
  },
];

const initialEdges: any[] = [
  {
    id: 'e1-2',
    source: 'welcome-1',
    target: 'welcome-2',
    type: 'smoothstep',
    animated: true,
  },
  {
    id: 'e1-3',
    source: 'welcome-1',
    target: 'welcome-3',
    type: 'smoothstep',
    animated: true,
  },
];

export const useMindFlowStore = create<MindFlowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  collaborators: [],
  roomId: null,
  currentUser: null,

  setRoomId: (id) => set({ roomId: id }),

  setCurrentUser: (user) => set({ currentUser: user }),

  addNode: (position, label = 'New Idea') => {
    const newNode: MindMapNode = {
      id: generateId(),
      type: 'mindMapNode',
      position,
      data: {
        label,
        color: getRandomColor(),
      },
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    get().saveRoom();
  },

  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
    get().saveRoom();
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
    }));
    get().saveRoom();
  },

  addEdge: (edge) => {
    set((state) => ({
      edges: [...state.edges, edge],
    }));
    get().saveRoom();
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
    get().saveRoom();
  },

  setNodes: (nodes) => {
    set({ nodes });
    get().saveRoom();
  },

  setEdges: (edges) => {
    set({ edges });
    get().saveRoom();
  },

  loadRoom: (roomId) => {
    const savedData = loadFromLocalStorage(`room-${roomId}`);
    if (savedData) {
      set({
        nodes: savedData.nodes || initialNodes,
        edges: savedData.edges || initialEdges,
        roomId,
      });
    } else {
      set({
        nodes: initialNodes,
        edges: initialEdges,
        roomId,
      });
    }
  },

  saveRoom: () => {
    const { nodes, edges, roomId } = get();
    if (roomId) {
      saveToLocalStorage(`room-${roomId}`, {
        nodes,
        edges,
        lastModified: Date.now(),
      });
    }
  },

  resetRoom: () => {
    set({
      nodes: initialNodes,
      edges: initialEdges,
    });
    get().saveRoom();
  },
}));

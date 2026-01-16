import { Node } from 'reactflow';

export type NodeColor = 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'gray';

export interface MindMapNode extends Node {
  data: {
    label: string;
    color: NodeColor;
    emoji?: string;
  };
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursorPosition?: { x: number; y: number };
}

export interface RoomData {
  id: string;
  nodes: MindMapNode[];
  edges: any[];
  collaborators: Collaborator[];
  lastModified: number;
}

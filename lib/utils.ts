import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const nodeColors = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-300 dark:border-blue-700/50",
    text: "text-blue-900 dark:text-blue-100",
    accent: "#3b82f6",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-300 dark:border-purple-700/50",
    text: "text-purple-900 dark:text-purple-100",
    accent: "#a855f7",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    border: "border-pink-300 dark:border-pink-700/50",
    text: "text-pink-900 dark:text-pink-100",
    accent: "#ec4899",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-300 dark:border-green-700/50",
    text: "text-green-900 dark:text-green-100",
    accent: "#10b981",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    border: "border-orange-300 dark:border-orange-700/50",
    text: "text-orange-900 dark:text-orange-100",
    accent: "#f97316",
  },
  gray: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    border: "border-gray-300 dark:border-gray-700/50",
    text: "text-gray-900 dark:text-gray-100",
    accent: "#6b7280",
  },
};

export const collaboratorColors = [
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#10b981", // green
  "#f97316", // orange
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
];

export function getRandomColor() {
  const colors = Object.keys(nodeColors) as Array<keyof typeof nodeColors>;
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getCollaboratorColor(index: number) {
  return collaboratorColors[index % collaboratorColors.length];
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function saveToLocalStorage(key: string, data: any) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }
}

export function loadFromLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }
  return null;
}

'use client';

import { memo } from 'react';
import { Palette } from 'lucide-react';
import {
  PlusCircle,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Share2,
  Download,
  Palette,
  Moon,
  Sun,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ToolbarProps {
  onAddNode: () => void;

  onDeleteSelected: () => void;
  canDelete: boolean;

  onClearCanvas: () => void;
  onShare: () => void;

  onExport: () => void;
  onColor: () => void;

  onToggleTheme: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  isDark: boolean;
}

function Toolbar({
  onAddNode,
  onDeleteSelected,
  canDelete,
  onClearCanvas,
  onShare,
  onExport,
  onColor,
  onToggleTheme,
  onZoomIn,
  onZoomOut,
  onFitView,
  isDark,
}: ToolbarProps) {
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-elevated fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-3xl px-6 py-3"
    >
      <div className="flex items-center gap-2">
        {/* Add Node */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onAddNode}
          className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Add Node"
        >
          <PlusCircle className="w-5 h-5" />
        </motion.button>

        {/* Color (selected nodes) */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onColor}
          className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Color (selected nodes)"
        >
          <Palette className="w-5 h-5" />
        </motion.button>
        
        {/* Delete */}
        <motion.button
          variants={buttonVariants}
          whileHover={canDelete ? 'hover' : undefined}
          whileTap={canDelete ? 'tap' : undefined}
          onClick={onDeleteSelected}
          disabled={!canDelete}
          className={`p-3 rounded-2xl transition-colors ${
            canDelete
              ? 'hover:bg-black/5 dark:hover:bg-white/10'
              : 'opacity-40 cursor-not-allowed'
          }`}
          title="Delete selected (Del / Backspace)"
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

        {/* Zoom */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onZoomIn}
          className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onZoomOut}
          className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onFitView}
          className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Fit View"
        >
          <Maximize2 className="w-5 h-5" />
        </motion.button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

        {/* Share */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onShare}
          className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </motion.button>

        {/* Export (next to Share) */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onExport}
          className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Export PNG"
        >
          <Download className="w-5 h-5" />
        </motion.button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

        {/* Theme */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onToggleTheme}
          className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default memo(Toolbar);

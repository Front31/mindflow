'use client';

import { memo } from 'react';
import {
  PlusCircle,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Share2,
  Download,
  Upload,
  Palette,
  Moon,
  Sun,
  Waypoints,
} from 'lucide-react';
import { motion } from 'framer-motion';

export type EdgePreset = {
  kind: 'orthogonal' | 'straight' | 'curved';
  dashed: boolean;
};

export interface ToolbarProps {
  onAddNode: () => void;

  onDeleteSelected: () => void;
  canDelete: boolean;

  onClearCanvas: () => void;
  onShare: () => void;

  onDownloadFile: () => void;
  onUploadFile: () => void;

  onColor: () => void;

  // ✅ edge menu
  edgePreset: EdgePreset;
  onOpenEdgeMenu: () => void;

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
  onDownloadFile,
  onUploadFile,
  onColor,
  edgePreset,
  onOpenEdgeMenu,
  onToggleTheme,
  onZoomIn,
  onZoomOut,
  onFitView,
  isDark,
}: ToolbarProps) {
  const buttonVariants = { hover: { scale: 1.05 }, tap: { scale: 0.95 } };
  const baseBtn =
    'p-3 rounded-2xl transition-colors hover:bg-black/5 dark:hover:bg-white/10';

  const edgeTitle =
    `Line: ${edgePreset.kind}${edgePreset.dashed ? ' (dashed)' : ''}`;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="glass-elevated fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-3xl px-6 py-3"
    >
      <div className="flex items-center gap-2">
        <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap"
          onClick={onAddNode} className={baseBtn} title="Add node">
          <PlusCircle className="w-5 h-5" />
        </motion.button>

        <motion.button variants={buttonVariants}
          whileHover={canDelete ? 'hover' : undefined}
          whileTap={canDelete ? 'tap' : undefined}
          onClick={onDeleteSelected} disabled={!canDelete}
          className={`${baseBtn} ${canDelete ? '' : 'opacity-40 cursor-not-allowed'}`}
          title="Delete selected (Del / Backspace)">
          <Trash2 className="w-5 h-5" />
        </motion.button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        {/* ✅ Edge menu button */}
        <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap"
          onClick={onOpenEdgeMenu}
          className={`${baseBtn} bg-black/5 dark:bg-white/10`}
          title={edgeTitle}>
          <Waypoints className="w-5 h-5" />
        </motion.button>

        <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap"
          onClick={onColor} className={baseBtn} title="Color selected nodes">
          <Palette className="w-5 h-5" />
        </motion.button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap"
          onClick={onZoomIn} className={baseBtn} title="Zoom in">
          <ZoomIn className="w-5 h-5" />
        </motion.button>

        <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap"
          onClick={onZoomOut} className={baseBtn} title="Zoom out">
          <ZoomOut className="w-5 h-5" />
        </motion.button>

        <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap"
          onClick={onFitView} className={baseBtn} title="Fit view">
          <Maximize2 className="w-5 h-5" />
        </motion.button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap"
          onClick={onShare} className={baseBtn} title="Share">
          <Share2 className="w-5 h-5" />
        </motion.button>

        <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap"
          onClick={onDownloadFile} className={baseBtn} title="Download .mindflow.json">
          <Download className="w-5 h-5" />
        </motion.button>

        <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap"
          onClick={onUploadFile} className={baseBtn} title="Upload .mindflow.json">
          <Upload className="w-5 h-5" />
        </motion.button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap"
          onClick={onToggleTheme} className={baseBtn} title="Toggle theme">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default memo(Toolbar);

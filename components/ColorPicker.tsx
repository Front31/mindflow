'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeColor } from '@/types';
import { nodeColors } from '@/lib/utils';

interface ColorPickerProps {
  selectedColor: NodeColor;
  onColorChange: (color: NodeColor) => void;
  isOpen: boolean;
  onClose: () => void;
}

function ColorPicker({ selectedColor, onColorChange, isOpen, onClose }: ColorPickerProps) {
  const colors: NodeColor[] = ['blue', 'purple', 'pink', 'green', 'orange', 'gray'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />

          {/* Color Picker Panel */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="glass-elevated fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-3xl p-4"
          >
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">
                Node Color
              </div>
              {colors.map((color) => {
                const style = nodeColors[color];
                return (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      onColorChange(color);
                      onClose();
                    }}
                    className={`
                      w-10 h-10 rounded-full
                      border-2
                      ${selectedColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'}
                      transition-all
                    `}
                    style={{ backgroundColor: style.accent }}
                  />
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default memo(ColorPicker);

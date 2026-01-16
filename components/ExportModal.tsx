'use client';
 
import { useState } from 'react';

export default function ExportModal({
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

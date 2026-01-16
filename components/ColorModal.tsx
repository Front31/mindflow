'use client';

import { useState } from 'react';

export default function ColorModal({
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

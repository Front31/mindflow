'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

import { MindMapNode } from '@/types';
import { nodeColors } from '@/lib/utils';
import { useMindFlowStore } from '@/lib/store';

function CustomNode({ id, data, selected }: NodeProps<MindMapNode['data']>) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number | null>(null);

  const updateNode = useMindFlowStore((s) => s.updateNode);
  const setNodes = useMindFlowStore((s) => s.setNodes);

  const fallbackAccent = nodeColors[(data.color ?? 'blue')].accent;
  const accent = (data as any).colorHex || fallbackAccent;
  const textClass = nodeColors[(data.color ?? 'blue')].text;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => setIsEditing(true), []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    const next = label.trim();
    if (next) updateNode(id, { label: next });
    else setLabel(data.label);
  }, [id, label, data.label, updateNode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleBlur();
      }
      if (e.key === 'Escape') {
        setIsEditing(false);
        setLabel(data.label);
      }
    },
    [handleBlur, data.label]
  );

  // Handles
  const visibleHandleClass =
    '!w-2.5 !h-2.5 !rounded-full !border-2 !border-white/85 dark:!border-black/45';
  const hitboxHandleClass =
    '!w-7 !h-7 !rounded-full !border-0 !bg-transparent !shadow-none';

  const accentStyle = { background: accent };
  const visibleNoPointer = { pointerEvents: 'none' as const };

  // Resize
  const startResize = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      const state = useMindFlowStore.getState();
      const node = state.nodes.find((n) => n.id === id);

      const startW =
        typeof (node?.style as any)?.width === 'number'
          ? (node!.style as any).width
          : containerRef.current?.getBoundingClientRect().width ?? 260;

      const startH =
        typeof (node?.style as any)?.height === 'number'
          ? (node!.style as any).height
          : containerRef.current?.getBoundingClientRect().height ?? 100;

      const startX = e.clientX;
      const startY = e.clientY;

      const minW = 180;
      const minH = 74;

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        let nextW = Math.max(minW, startW + dx);
        let nextH = Math.max(minH, startH + dy);

        if (ev.shiftKey) {
          const ratio = startW / startH;
          if (Math.abs(dx) > Math.abs(dy)) nextH = Math.max(minH, nextW / ratio);
          else nextW = Math.max(minW, nextH * ratio);
        }

        if (ev.altKey) {
          nextW = Math.max(minW, startW + dx * 2);
          nextH = Math.max(minH, startH + dy * 2);
        }

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const currentNodes = useMindFlowStore.getState().nodes;
          setNodes(
            currentNodes.map((n) =>
              n.id === id
                ? {
                    ...n,
                    style: {
                      ...(n.style || {}),
                      width: nextW,
                      height: nextH,
                    },
                  }
                : n
            )
          );
        });
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [id, setNodes]
  );

  return (
    <div
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
      className={`
        group relative
        w-full h-full
        rounded-3xl px-6 py-4
        transition-all duration-300
        bg-white/18 dark:bg-white/12
        backdrop-blur-xl
        border
        ${selected ? 'scale-[1.03]' : ''}
      `}
      style={{
        minWidth: 220,
        minHeight: 84,
        borderColor: 'rgba(255,255,255,0.14)',
        boxShadow: selected
          ? `0 22px 70px rgba(0,0,0,0.55), 0 0 0 2px ${accent}66`
          : `0 18px 50px rgba(0,0,0,0.18), 0 0 0 1px ${accent}33`,
      }}
    >
      {/* LEFT */}
      <Handle id="t-left" type="target" position={Position.Left} className={hitboxHandleClass} style={{ top: '48%' }} />
      <Handle id="s-left" type="source" position={Position.Left} className={hitboxHandleClass} style={{ top: '52%' }} />
      <Handle
        id="v-left"
        type="target"
        position={Position.Left}
        className={`${visibleHandleClass} !bg-white dark:!bg-gray-900`}
        style={{ ...accentStyle, top: '50%', ...visibleNoPointer }}
      />

      {/* RIGHT */}
      <Handle id="t-right" type="target" position={Position.Right} className={hitboxHandleClass} style={{ top: '48%' }} />
      <Handle id="s-right" type="source" position={Position.Right} className={hitboxHandleClass} style={{ top: '52%' }} />
      <Handle
        id="v-right"
        type="source"
        position={Position.Right}
        className={`${visibleHandleClass} !bg-white dark:!bg-gray-900`}
        style={{ ...accentStyle, top: '50%', ...visibleNoPointer }}
      />

      {/* TOP */}
      <Handle id="t-top" type="target" position={Position.Top} className={hitboxHandleClass} style={{ left: '48%', transform: 'translateX(-50%)' }} />
      <Handle id="s-top" type="source" position={Position.Top} className={hitboxHandleClass} style={{ left: '52%', transform: 'translateX(-50%)' }} />
      <Handle
        id="v-top"
        type="target"
        position={Position.Top}
        className={`${visibleHandleClass} !bg-white dark:!bg-gray-900`}
        style={{ ...accentStyle, left: '50%', transform: 'translateX(-50%)', ...visibleNoPointer }}
      />

      {/* BOTTOM */}
      <Handle id="t-bottom" type="target" position={Position.Bottom} className={hitboxHandleClass} style={{ left: '48%', transform: 'translateX(-50%)' }} />
      <Handle id="s-bottom" type="source" position={Position.Bottom} className={hitboxHandleClass} style={{ left: '52%', transform: 'translateX(-50%)' }} />
      <Handle
        id="v-bottom"
        type="source"
        position={Position.Bottom}
        className={`${visibleHandleClass} !bg-white dark:!bg-gray-900`}
        style={{ ...accentStyle, left: '50%', transform: 'translateX(-50%)', ...visibleNoPointer }}
      />

      {/* Content */}
      <div className="flex items-center justify-center gap-3 h-full">
        {data.emoji && <span className="text-2xl leading-none flex-shrink-0">{data.emoji}</span>}

        {isEditing ? (
          <textarea
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            rows={1}
            className={`
              w-full
              resize-none
              bg-transparent
              outline-none
              text-base
              font-semibold
              text-center
              leading-snug
              whitespace-pre-wrap
              break-words
              ${textClass}
            `}
            placeholder="Type your idea..."
          />
        ) : (
          <div
            className={`
              w-full
              text-base
              font-semibold
              text-center
              leading-snug
              whitespace-pre-wrap
              break-words
              ${textClass}
            `}
          >
            {data.label}
          </div>
        )}
      </div>

      {/* Resize handle */}
      <button
        onPointerDown={startResize}
        title="Resize"
        className={`
          nodrag
          absolute right-2 bottom-2
          w-4 h-4 rounded-md
          bg-black/10 dark:bg-white/10
          border border-white/30 dark:border-white/10
          opacity-0 group-hover:opacity-100
          ${selected ? 'opacity-100' : ''}
          transition-opacity
          cursor-se-resize
        `}
      />
    </div>
  );
}

export default memo(CustomNode);

// Helper: bounds aller Nodes berechnen (ohne reactflow-internals)
function getNodesBoundsForExport(nodes: any[]) {
  if (!nodes.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    const x = n.position?.x ?? 0;
    const y = n.position?.y ?? 0;

    // Breite/Höhe: measured/width/style fallback
    const w =
      n.measured?.width ??
      n.width ??
      (typeof n.style?.width === 'number' ? n.style.width : undefined) ??
      220;

    const h =
      n.measured?.height ??
      n.height ??
      (typeof n.style?.height === 'number' ? n.style.height : undefined) ??
      84;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  }

  return { minX, minY, maxX, maxY };
}

const exportPng = useCallback(
  async (opts: { includeBackground: boolean; theme: 'current' | 'light' | 'dark' }) => {
    // viewport enthält Nodes + Edges, aber NICHT Toolbar/MiniMap => perfekt
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement | null;
    if (!viewport) return;

    // Force theme for export
    const html = document.documentElement;
    const hadDark = html.classList.contains('dark');
    if (opts.theme === 'dark') html.classList.add('dark');
    if (opts.theme === 'light') html.classList.remove('dark');

    // Background Farbe
    const bg =
      opts.includeBackground
        ? opts.theme === 'dark'
          ? '#050815'
          : '#f7f7ff'
        : 'transparent';

    // 1) Bounds + Exportgröße
    const pad = 80; // Padding um die Mindmap
    const { minX, minY, maxX, maxY } = getNodesBoundsForExport(nodes);

    const contentW = Math.max(1, maxX - minX);
    const contentH = Math.max(1, maxY - minY);

    const exportW = Math.ceil(contentW + pad * 2);
    const exportH = Math.ceil(contentH + pad * 2);

    // 2) Quality / Scale
    // scale = 1 => 1:1 Flow-Units
    // pixelRatio hoch => nicht verpixelt
    const scale = 1;
    const pixelRatio = 3; // 2..4 je nach Wunsch

    // 3) Offscreen Wrapper bauen
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-10000px';
    wrapper.style.top = '0';
    wrapper.style.width = `${exportW}px`;
    wrapper.style.height = `${exportH}px`;
    wrapper.style.overflow = 'hidden';
    wrapper.style.background = bg;

    // viewport klonen
    const clone = viewport.cloneNode(true) as HTMLElement;
    clone.style.transformOrigin = '0 0';

    // Ziel: minX/minY links oben rein schieben + padding
    // damit alle Nodes im Bild sind
    const tx = (-minX + pad) * scale;
    const ty = (-minY + pad) * scale;
    clone.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      const dataUrl = await htmlToImage.toPng(wrapper, {
        pixelRatio,
        cacheBust: true,
        backgroundColor: bg,
        width: exportW,
        height: exportH,
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `mindflow-${roomId}.png`;
      a.click();
    } finally {
      wrapper.remove();
      // Theme restore
      if (opts.theme !== 'current') {
        if (hadDark) html.classList.add('dark');
        else html.classList.remove('dark');
      }
    }
  },
  [nodes, roomId]
);

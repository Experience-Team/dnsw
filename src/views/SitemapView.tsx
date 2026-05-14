// @ts-nocheck — temporary FigJam embed A/B test; custom viewport below is commented out
import { useMemo, useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import type { SitemapNode } from '../types';

const STACK_DEPTH  = 2;    // children of depth ≥ STACK_DEPTH stack vertically
const NODE_W       = 200;
const NODE_H       = 40;
const H_GAP        = 24;
const V_GAP        = 56;
const STACK_GAP    = 8;
const STACK_INDENT = 24;
const RAIL_OFFSET  = 12;   // X-offset of the stack rail inside the parent pill

const DEPTH_LABEL: Record<number, string> = {
  0: 'Root', 1: 'Section', 2: 'Region', 3: 'Area', 4: 'Page',
};

function depthClass(depth: number): string {
  if (depth === 0) return 'bg-blue-90 text-white';
  if (depth === 1) return 'bg-blue-80 text-white';
  if (depth === 2) return 'bg-blue-30 text-blue-90';
  if (depth === 3) return 'bg-blue-20 text-blue-90';
  return 'bg-blue-10 text-blue-90 border border-blue-20';
}

function depthLabel(depth: number): string {
  return DEPTH_LABEL[Math.min(depth, 4)];
}

interface Box { w: number; h: number; }
interface Placed {
  node:     SitemapNode;
  x:        number;
  y:        number;
  depth:    number;
  hasKids:  boolean;
  expanded: boolean;
}

export default function SitemapView() {
  const { data } = useAppContext();
  const nodes = data?.sitemapNodes ?? [];

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const initialisedRef = useRef(false);

  const { byParent, root } = useMemo(() => {
    const byParent = new Map<string, SitemapNode[]>();
    for (const n of nodes) {
      if (!n.parent_id || n.parent_id === n.id) continue;
      const arr = byParent.get(n.parent_id) ?? [];
      arr.push(n);
      byParent.set(n.parent_id, arr);
    }
    const root = nodes.find(n => n.id === '1') ?? null;
    return { byParent, root };
  }, [nodes]);

  useEffect(() => {
    if (initialisedRef.current || !root) return;
    const L1 = byParent.get(root.id) ?? [];
    setExpanded(new Set([root.id, ...L1.map(n => n.id)]));
    initialisedRef.current = true;
  }, [root, byParent]);

  const { placed, edges, totalW, totalH } = useMemo(() => {
    const placed: Placed[] = [];
    const edges: { from: Placed; to: Placed }[] = [];
    if (!root) return { placed, edges, totalW: 0, totalH: 0 };

    const boxes = new Map<string, Box>();
    const visibleKids = (n: SitemapNode) =>
      expanded.has(n.id) ? (byParent.get(n.id) ?? []) : [];

    function measure(node: SitemapNode, depth: number): Box {
      const cached = boxes.get(node.id);
      if (cached) return cached;
      const kids = visibleKids(node);
      let box: Box;
      if (kids.length === 0) {
        box = { w: NODE_W, h: NODE_H };
      } else {
        const childBoxes = kids.map(k => measure(k, depth + 1));
        if (depth < STACK_DEPTH) {
          const w = childBoxes.reduce((s, b) => s + b.w, 0) + H_GAP * (kids.length - 1);
          const h = NODE_H + V_GAP + Math.max(...childBoxes.map(b => b.h));
          box = { w: Math.max(NODE_W, w), h };
        } else {
          const w = STACK_INDENT + Math.max(...childBoxes.map(b => b.w));
          const h = NODE_H + STACK_GAP + childBoxes.reduce((s, b) => s + b.h, 0) + STACK_GAP * (kids.length - 1);
          box = { w: Math.max(NODE_W, w), h };
        }
      }
      boxes.set(node.id, box);
      return box;
    }

    function place(node: SitemapNode, depth: number, originX: number, originY: number, parentPlaced: Placed | null) {
      const box = boxes.get(node.id)!;
      const kids = visibleKids(node);
      const allKids = byParent.get(node.id) ?? [];
      const isCentred = depth <= STACK_DEPTH;
      const nodeX = isCentred ? originX + box.w / 2 - NODE_W / 2 : originX;
      const self: Placed = {
        node, x: nodeX, y: originY, depth,
        hasKids:  allKids.length > 0,
        expanded: expanded.has(node.id),
      };
      placed.push(self);
      if (parentPlaced) edges.push({ from: parentPlaced, to: self });

      if (kids.length === 0) return;

      if (depth < STACK_DEPTH) {
        let cx = originX;
        for (const k of kids) {
          const kb = boxes.get(k.id)!;
          place(k, depth + 1, cx, originY + NODE_H + V_GAP, self);
          cx += kb.w + H_GAP;
        }
      } else {
        let cy = originY + NODE_H + STACK_GAP;
        for (const k of kids) {
          place(k, depth + 1, nodeX + STACK_INDENT, cy, self);
          cy += boxes.get(k.id)!.h + STACK_GAP;
        }
      }
    }

    const rootBox = measure(root, 0);
    place(root, 0, 0, 0, null);
    return { placed, edges, totalW: rootBox.w, totalH: rootBox.h };
  }, [root, byParent, expanded]);

  const toggleNode = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll   = () => setExpanded(new Set(nodes.map(n => n.id)));
  const collapseAll = () => setExpanded(root ? new Set([root.id]) : new Set());

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const centeredRef = useRef(false);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [grabbing, setGrabbing] = useState(false);

  const MIN_SCALE = 0.25;
  const MAX_SCALE = 2.5;
  const clamp = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const rootCenterX = totalW / 2;

  const resetView = () => {
    const vp = viewportRef.current;
    if (!vp) return;
    setScale(1);
    setTransform({ x: vp.clientWidth / 2 - rootCenterX, y: V_GAP / 2 });
  };

  const zoomBy = (factor: number, anchorX?: number, anchorY?: number) => {
    const vp = viewportRef.current;
    if (!vp) return;
    setScale(prevScale => {
      const next = clamp(prevScale * factor);
      if (next === prevScale) return prevScale;
      const rect = vp.getBoundingClientRect();
      const ax = anchorX ?? rect.width / 2;
      const ay = anchorY ?? rect.height / 2;
      setTransform(prev => ({
        x: ax - (ax - prev.x) * (next / prevScale),
        y: ay - (ay - prev.y) * (next / prevScale),
      }));
      return next;
    });
  };

  useEffect(() => {
    if (centeredRef.current || totalW === 0) return;
    const vp = viewportRef.current;
    if (!vp) return;
    setTransform({ x: vp.clientWidth / 2 - rootCenterX, y: V_GAP / 2 });
    centeredRef.current = true;
  }, [totalW, rootCenterX]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      const isZoom = e.ctrlKey || e.metaKey;
      if (isZoom) {
        e.preventDefault();
        const rect = vp.getBoundingClientRect();
        const ax = e.clientX - rect.left;
        const ay = e.clientY - rect.top;
        const factor = Math.exp(-e.deltaY * 0.01);
        zoomBy(factor, ax, ay);
      } else {
        e.preventDefault();
        setTransform(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    setGrabbing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setTransform({
      x: dragRef.current.tx + (e.clientX - dragRef.current.x),
      y: dragRef.current.ty + (e.clientY - dragRef.current.y),
    });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setGrabbing(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  if (!root) {
    return (
      <div className="text-base text-blue-90/60 p-6">
        No sitemap data found. Check the Sitemap tab in the Google Sheet.
      </div>
    );
  }

  const padX = H_GAP;
  const padY = V_GAP / 2;
  const canvasW = totalW + padX * 2;
  const canvasH = totalH + padY * 2;

  return (
    <div className="flex flex-col gap-4">
      {/*
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-blue-90 mr-4">Sitemap</h1>
        <button
          onClick={expandAll}
          className="text-base text-blue-90 px-4 py-1 rounded-full bg-white hover:bg-blue-20 transition-all"
        >
          Expand all
        </button>
        <button
          onClick={collapseAll}
          className="text-base text-blue-90 px-4 py-1 rounded-full bg-white hover:bg-blue-20 transition-all"
        >
          Collapse all
        </button>
        <button
          onClick={resetView}
          className="text-base text-blue-90 px-4 py-1 rounded-full bg-white hover:bg-blue-20 transition-all"
        >
          Reset view
        </button>
        <div className="flex items-center gap-1 ml-1">
          <button
            onClick={() => zoomBy(1 / 1.2)}
            aria-label="Zoom out"
            className="text-base text-blue-90 w-8 h-8 rounded-full bg-white hover:bg-blue-20 transition-all flex items-center justify-center"
          >
            −
          </button>
          <button
            onClick={() => { setScale(1); }}
            aria-label="Reset zoom"
            className="text-base text-blue-90 px-3 h-8 rounded-full bg-white hover:bg-blue-20 transition-all min-w-[56px]"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={() => zoomBy(1.2)}
            aria-label="Zoom in"
            className="text-base text-blue-90 w-8 h-8 rounded-full bg-white hover:bg-blue-20 transition-all flex items-center justify-center"
          >
            +
          </button>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3 flex-wrap text-base text-blue-90">
          {[0, 1, 2, 3, 4].map(d => (
            <span key={d} className="flex items-center gap-1.5">
              <span className={`inline-block w-4 h-4 rounded ${depthClass(d)}`} />
              {depthLabel(d)}
            </span>
          ))}
        </div>
      </div>
      */}

      <iframe
        title="FigJam sitemap"
        src="https://embed.figma.com/board/FO8Rr9nxyReUyK7kzL1Dhn/Sitemap?node-id=0-1&embed-host=share"
        allowFullScreen
        className="w-full h-[calc(100vh-6rem)] rounded-md border border-blue-20 bg-white"
      />

      {/*
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`bg-white rounded-md overflow-hidden h-[75vh] select-none ${
          grabbing ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          className="relative"
          style={{
            width:           canvasW,
            height:          canvasH,
            transform:       `translate(${transform.x}px, ${transform.y}px) scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <svg
            className="absolute inset-0 pointer-events-none"
            width={canvasW}
            height={canvasH}
          >
            <defs>
              <marker
                id="sitemap-arrow"
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L5,3 L0,6 Z" fill="#062E66" fillOpacity="0.5" />
              </marker>
            </defs>
            {edges.map((e, i) => {
              const fx = e.from.x + padX;
              const fy = e.from.y + padY;
              const tx = e.to.x + padX;
              const ty = e.to.y + padY;
              const isStacked = e.to.depth > STACK_DEPTH;
              const d = isStacked
                ? `M ${fx + RAIL_OFFSET} ${fy + NODE_H} V ${ty + NODE_H / 2} H ${tx}`
                : (() => {
                    const x1 = fx + NODE_W / 2;
                    const y1 = fy + NODE_H;
                    const x2 = tx + NODE_W / 2;
                    const midY = y1 + (ty - y1) / 2;
                    return `M ${x1} ${y1} V ${midY} H ${x2} V ${ty}`;
                  })();
              return (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#062E66"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                  markerEnd="url(#sitemap-arrow)"
                />
              );
            })}
          </svg>

          {placed.map(p => {
            const visibleChildren = byParent.get(p.node.id) ?? [];
            const canExpand = visibleChildren.length > 0;
            return (
              <button
                key={p.node.id}
                onClick={() => canExpand && toggleNode(p.node.id)}
                disabled={!canExpand}
                title={p.node.url || p.node.description || p.node.page_type}
                className={`absolute rounded-md px-3 flex items-center text-base font-medium leading-tight transition-all
                            ${depthClass(p.depth)}
                            ${canExpand ? 'cursor-pointer hover:brightness-105' : 'cursor-default'}`}
                style={{
                  left:   p.x + padX,
                  top:    p.y + padY,
                  width:  NODE_W,
                  height: NODE_H,
                }}
              >
                <span className="truncate flex-1 text-center">{p.node.page_name}</span>
                {canExpand && (
                  <span className="ml-2 shrink-0 opacity-70 text-sm">
                    {p.expanded ? '−' : '+'}{visibleChildren.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      */}
    </div>
  );
}

import { useMemo, useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import type { SitemapNode, SitemapGroup } from '../types';

const GROUP_LABELS: Record<SitemapGroup, string> = {
  'main-nav':      'Main Nav',
  'destination':   'Destination / Neighbourhood',
  'accommodation': 'Accommodation',
  'products':      'Products',
  'articles':      'Articles / Tags',
  'utility':       'Utility / External',
};

const GROUP_ORDER: SitemapGroup[] = [
  'main-nav', 'destination', 'accommodation', 'products', 'articles', 'utility',
];

const GROUP_STYLE: Record<SitemapGroup, { node: string; pill: string; stroke: string }> = {
  'main-nav':      { node: 'bg-blue-10 border-blue-70 text-blue-90',     pill: 'bg-blue-10 text-blue-90 border-blue-30',     stroke: '#1B5FAA' },
  'destination':   { node: 'bg-green-10 border-green-70 text-green-90',  pill: 'bg-green-10 text-green-90 border-green-30',  stroke: '#05684A' },
  'accommodation': { node: 'bg-purple-10 border-purple-70 text-purple-90', pill: 'bg-purple-10 text-purple-90 border-purple-30', stroke: '#7D00D1' },
  'products':      { node: 'bg-orange-10 border-orange-60 text-orange-90', pill: 'bg-orange-10 text-orange-90 border-orange-30', stroke: '#ED5E00' },
  'articles':      { node: 'bg-yellow-20 border-yellow-70 text-yellow-90', pill: 'bg-yellow-20 text-yellow-90 border-yellow-40', stroke: '#AD8700' },
  'utility':       { node: 'bg-grey-10 border-grey-60 text-grey-90',     pill: 'bg-grey-10 text-grey-90 border-grey-30',     stroke: '#757575' },
};

const NODE_W = 200;
const NODE_H = 56;
const H_GAP  = 24;
const V_GAP  = 80;
const SLOT_W = NODE_W + H_GAP;
const ROW_H  = NODE_H + V_GAP;

interface LaidOutNode {
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

  const [enabledGroups, setEnabledGroups] = useState<Set<SitemapGroup>>(
    () => new Set(GROUP_ORDER),
  );

  // Build parent_id → children map
  const { byParent, root } = useMemo(() => {
    const byParent = new Map<string, SitemapNode[]>();
    for (const n of nodes) {
      if (!n.parent_id || n.parent_id === n.id) continue;
      const arr = byParent.get(n.parent_id) ?? [];
      arr.push(n);
      byParent.set(n.parent_id, arr);
    }
    // Sort children by page_name for stable layout
    for (const arr of byParent.values()) arr.sort((a, b) => a.page_name.localeCompare(b.page_name));
    const root = nodes.find(n => n.id === '1') ?? null;
    return { byParent, root };
  }, [nodes]);

  // Compute layout: bottom-up x assignment, depth-based y
  const { laid, width, height } = useMemo(() => {
    const laid: LaidOutNode[] = [];
    if (!root) return { laid, width: 0, height: 0 };

    let cursor = 0;
    const visit = (node: SitemapNode, depth: number): number => {
      const allKids = byParent.get(node.id) ?? [];
      const kids = allKids.filter(c => enabledGroups.has(c.group));
      const isExpanded = expanded.has(node.id);
      const hasKids = kids.length > 0;

      let x: number;
      if (!isExpanded || !hasKids) {
        x = cursor;
        cursor += 1;
      } else {
        const childXs = kids.map(c => visit(c, depth + 1));
        x = (childXs[0] + childXs[childXs.length - 1]) / 2;
      }
      laid.push({ node, x, y: depth, depth, hasKids, expanded: isExpanded });
      return x;
    };

    if (enabledGroups.has(root.group)) visit(root, 0);

    const maxDepth = laid.reduce((m, n) => Math.max(m, n.depth), 0);
    const width  = Math.max(1, cursor) * SLOT_W;
    const height = (maxDepth + 1) * ROW_H;
    return { laid, width, height };
  }, [root, byParent, enabledGroups, expanded]);

  // Build edges: parent → child for visible nodes
  const edges = useMemo(() => {
    const visibleIds = new Set(laid.map(l => l.node.id));
    const out: { from: LaidOutNode; to: LaidOutNode }[] = [];
    const byNodeId = new Map(laid.map(l => [l.node.id, l]));
    for (const l of laid) {
      if (!l.expanded) continue;
      const kids = byParent.get(l.node.id) ?? [];
      for (const k of kids) {
        if (!visibleIds.has(k.id)) continue;
        const child = byNodeId.get(k.id);
        if (child) out.push({ from: l, to: child });
      }
    }
    return out;
  }, [laid, byParent]);

  const toggleNode = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleGroup = (g: SitemapGroup) => {
    setEnabledGroups(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(nodes.map(n => n.id)));
  const collapseAll = () => setExpanded(root ? new Set([root.id]) : new Set());

  const groupCounts = useMemo(() => {
    const c: Record<SitemapGroup, number> = {
      'main-nav': 0, 'destination': 0, 'accommodation': 0,
      'products': 0, 'articles': 0, 'utility': 0,
    };
    for (const n of nodes) c[n.group]++;
    return c;
  }, [nodes]);

  if (!root) {
    return (
      <div className="text-base text-grey-60 p-6">
        No sitemap data found. Check the Sitemap tab in the Google Sheet.
      </div>
    );
  }

  // Pixel positions for laid nodes
  const nodePos = (l: LaidOutNode) => ({
    left: l.x * SLOT_W,
    top:  l.depth * ROW_H,
  });

  // Pan state (transform-based, replaces native scroll)
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const centeredRef = useRef(false);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [grabbing, setGrabbing] = useState(false);

  const rootLaid = laid.find(l => l.node.id === root.id);
  const rootCenterX = rootLaid ? rootLaid.x * SLOT_W + H_GAP / 2 + NODE_W / 2 : 0;

  const centreOnRoot = () => {
    const vp = viewportRef.current;
    if (!vp) return;
    setTransform({ x: vp.clientWidth / 2 - rootCenterX, y: V_GAP / 2 });
  };

  useEffect(() => {
    if (centeredRef.current || !rootLaid) return;
    const vp = viewportRef.current;
    if (!vp) return;
    setTransform({ x: vp.clientWidth / 2 - rootCenterX, y: V_GAP / 2 });
    centeredRef.current = true;
  }, [rootLaid, rootCenterX]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Don't start a pan when grabbing a node button
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

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-base font-semibold text-grey-80">Page types:</span>
        {GROUP_ORDER.map(g => {
          const on = enabledGroups.has(g);
          const style = GROUP_STYLE[g];
          return (
            <button
              key={g}
              onClick={() => toggleGroup(g)}
              className={`text-base px-3 py-1 rounded-full border transition-all ${
                on ? style.pill : 'bg-white text-grey-50 border-grey-30 line-through'
              }`}
            >
              {GROUP_LABELS[g]} <span className="opacity-60">({groupCounts[g]})</span>
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          onClick={expandAll}
          className="text-base px-3 py-1 rounded-full border border-grey-30 text-grey-80 hover:bg-grey-10"
        >
          Expand all
        </button>
        <button
          onClick={collapseAll}
          className="text-base px-3 py-1 rounded-full border border-grey-30 text-grey-80 hover:bg-grey-10"
        >
          Collapse all
        </button>
        <button
          onClick={centreOnRoot}
          className="text-base px-3 py-1 rounded-full border border-grey-30 text-grey-80 hover:bg-grey-10"
        >
          Reset view
        </button>
      </div>

      {/* Tree canvas — pannable */}
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`bg-white border border-grey-20 rounded-lg overflow-hidden h-[70vh] select-none ${
          grabbing ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          className="relative"
          style={{
            width:     width + H_GAP,
            height:    height + V_GAP / 2,
            padding:   `${V_GAP / 4}px ${H_GAP / 2}px`,
            transform: `translate(${transform.x}px, ${transform.y}px)`,
            transformOrigin: 'top left',
          }}
        >
          {/* Connector lines (SVG underneath nodes) */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={width + H_GAP}
            height={height + V_GAP / 2}
          >
            {edges.map(({ from, to }, i) => {
              const fp = nodePos(from);
              const tp = nodePos(to);
              const x1 = fp.left + NODE_W / 2 + H_GAP / 2;
              const y1 = fp.top + NODE_H + V_GAP / 4;
              const x2 = tp.left + NODE_W / 2 + H_GAP / 2;
              const y2 = tp.top + V_GAP / 4;
              const midY = y1 + (y2 - y1) / 2;
              const stroke = GROUP_STYLE[to.node.group].stroke;
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`}
                  fill="none"
                  stroke={stroke}
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {laid.map(l => {
            const pos = nodePos(l);
            const style = GROUP_STYLE[l.node.group];
            const allKids = byParent.get(l.node.id) ?? [];
            const visibleKidCount = allKids.filter(c => enabledGroups.has(c.group)).length;
            return (
              <button
                key={l.node.id}
                onClick={() => visibleKidCount > 0 && toggleNode(l.node.id)}
                disabled={visibleKidCount === 0}
                title={l.node.url || l.node.description || l.node.page_type}
                className={`absolute rounded-lg border-2 px-3 py-2 text-left shadow-sm transition-all
                            ${style.node}
                            ${visibleKidCount > 0 ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'cursor-default'}`}
                style={{
                  left:   pos.left + H_GAP / 2,
                  top:    pos.top + V_GAP / 4,
                  width:  NODE_W,
                  height: NODE_H,
                }}
              >
                <div className="text-base font-semibold leading-tight truncate">
                  {l.node.page_name}
                </div>
                <div className="text-xs opacity-70 truncate flex items-center gap-1">
                  <span className="truncate">{l.node.page_type || GROUP_LABELS[l.node.group]}</span>
                  {visibleKidCount > 0 && (
                    <span className="ml-auto shrink-0 font-bold">
                      {l.expanded ? '−' : '+'}{visibleKidCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

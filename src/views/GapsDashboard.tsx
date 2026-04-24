import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import PillSelect from '../components/PillSelect';
import type { Gap, GapSeverity } from '../types';

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={`rounded-xl p-5 ${className ?? 'bg-blue-20'}`}>
      <p className="text-3xl font-bold text-blue-90">{value}</p>
      <p className="text-sm text-blue-80 mt-1">{label}</p>
    </div>
  );
}

// ── Heatmap ───────────────────────────────────────────────────────────────────
function heatColor(count: number) {
  if (count === 0) return 'bg-blue-10 text-blue-30';
  if (count <= 2)  return 'bg-yellow-20 text-yellow-80';
  if (count <= 4)  return 'bg-orange-20 text-orange-80';
  return 'bg-red-20 text-red-70';
}

function GapsHeatmap({
  gaps,
  personaNames,
  stageNames,
}: {
  gaps: Gap[];
  personaNames: Map<string, string>;
  stageNames: Map<string, string>;
}) {
  const personas = [...new Set(gaps.map(g => g.persona_id).filter(Boolean))];
  const stages   = [...new Set(gaps.map(g => g.stage_id).filter(Boolean))];

  if (personas.length === 0 || stages.length === 0) return null;

  const count = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    gaps.forEach(g => {
      if (!g.persona_id || !g.stage_id) return;
      if (!map[g.persona_id]) map[g.persona_id] = {};
      map[g.persona_id][g.stage_id] = (map[g.persona_id][g.stage_id] ?? 0) + 1;
    });
    return map;
  }, [gaps]);

  return (
    <div>
      <h2 className="text-base font-semibold text-blue-90 mb-3">Gap heatmap</h2>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-blue-80 font-normal" />
              {stages.map(sid => (
                <th key={sid} className="text-center px-3 py-2 text-blue-90 font-medium whitespace-nowrap">
                  {stageNames.get(sid) ?? sid}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {personas.map(pid => (
              <tr key={pid}>
                <td className="px-3 py-2 text-blue-90 whitespace-nowrap font-medium">
                  {personaNames.get(pid) ?? pid}
                </td>
                {stages.map(sid => {
                  const n = count[pid]?.[sid] ?? 0;
                  return (
                    <td key={sid} className="px-1 py-1">
                      <div className={`w-10 h-8 rounded flex items-center justify-center font-semibold ${heatColor(n)}`}>
                        {n > 0 ? n : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Gaps table ────────────────────────────────────────────────────────────────
type SortKey = keyof Pick<Gap, 'severity' | 'gap_type' | 'site'>;
const SEVERITY_ORDER: Record<GapSeverity, number> = { High: 0, Medium: 1, Low: 2 };

const SEVERITY_COLORS: Record<GapSeverity, string> = {
  High:   'bg-red-20 text-red-70',
  Medium: 'bg-yellow-20 text-yellow-80',
  Low:    'bg-blue-20 text-blue-80',
};

function GapsTable({
  gaps,
  personaNames,
}: {
  gaps: Gap[];
  personaNames: Map<string, string>;
}) {
  const [sortKey, setSortKey]     = useState<SortKey>('severity');
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc');
  const [search, setSearch]       = useState('');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    let rows = gaps.filter(g =>
      !q ||
      g.description.toLowerCase().includes(q) ||
      g.gap_type.toLowerCase().includes(q) ||
      (personaNames.get(g.persona_id) ?? '').toLowerCase().includes(q)
    );

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'severity') {
        cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      } else {
        cmp = (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return rows;
  }, [gaps, search, sortKey, sortDir, personaNames]);

  const SortTh = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-blue-80"
      onClick={() => toggleSort(col)}
    >
      {label} {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-blue-90">All gaps</h2>
        <input
          type="search"
          placeholder="Search gaps…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-blue-20 rounded-lg px-3 py-1.5 text-sm text-blue-90 bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-80/30 w-56"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-blue-20">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-blue-20 text-blue-90">
              <SortTh col="severity" label="Severity" />
              <SortTh col="gap_type" label="Type" />
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Description</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-blue-90/40 text-xs">
                  No gaps match your search.
                </td>
              </tr>
            )}
            {displayed.map((gap, i) => (
              <tr key={gap.gap_id} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-10'}>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${SEVERITY_COLORS[gap.severity]}`}>
                    {gap.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-blue-90 text-xs">{gap.gap_type}</td>
                <td className="px-4 py-3 text-blue-90 max-w-xs">
                  <p className="line-clamp-4 leading-relaxed">{gap.description}</p>
                </td>
                <td className="px-4 py-3 text-blue-80 text-xs max-w-xs">
                  <p className="line-clamp-4 leading-relaxed">{gap.recommended_action}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function GapsDashboard() {
  const { data, siteFilter } = useAppContext();
  const [severityFilter, setSeverityFilter] = useState<GapSeverity | ''>('');

  if (!data) return null;

  const { gaps, personas, stages } = data;

  const personaNames = useMemo(() => {
    const m = new Map<string, string>();
    personas.forEach(p => m.set(p.persona_id, p.name));
    return m;
  }, [personas]);

  const stageNames = useMemo(() => {
    const m = new Map<string, string>();
    stages.forEach(s => m.set(s.stage_id, s.stage_name));
    return m;
  }, [stages]);

  const siteFiltered = useMemo(() =>
    gaps.filter(g => siteFilter === 'both' || g.site === siteFilter),
    [gaps, siteFilter]);

  const displayed = useMemo(() =>
    siteFiltered.filter(g => !severityFilter || g.severity === severityFilter),
    [siteFiltered, severityFilter]);

  const highCount   = siteFiltered.filter(g => g.severity === 'High').length;
  const mediumCount = siteFiltered.filter(g => g.severity === 'Medium').length;
  const lowCount    = siteFiltered.filter(g => g.severity === 'Low').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-blue-90">Quote Bank</h1>
        <p className="text-sm text-blue-90/60 mt-0.5">Content, experience, and data gaps that need addressing, ranked by severity.</p>
        <div className="mt-3">
          <PillSelect
            label="Severity"
            value={severityFilter}
            onChange={v => setSeverityFilter(v as GapSeverity | '')}
            options={[
              { label: 'All', value: '' },
              { label: 'High', value: 'High' },
              { label: 'Medium', value: 'Medium' },
              { label: 'Low', value: 'Low' },
            ]}
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total gaps" value={siteFiltered.length} />
        <StatCard label="High severity" value={highCount} className="bg-red-10 border border-red-30" />
        <StatCard label="Medium severity" value={mediumCount} className="bg-yellow-20 border border-yellow-40" />
        <StatCard label="Low severity" value={lowCount} className="bg-blue-20" />
      </div>

      {/* Heatmap */}
      <div className="bg-blue-10 border border-blue-20 rounded-xl p-5">
        <GapsHeatmap gaps={siteFiltered} personaNames={personaNames} stageNames={stageNames} />
      </div>

      {/* Table */}
      {displayed.length === 0 ? (
        <div className="py-16 text-center text-blue-90/40">No gaps for the current filter.</div>
      ) : (
        <GapsTable gaps={displayed} personaNames={personaNames} />
      )}
    </div>
  );
}

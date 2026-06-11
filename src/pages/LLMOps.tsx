import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { AlertCircle, Loader2, RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { fetchRagTraces } from '../api';
import type { RagTrace } from '../api/types';
import { useFilters, TIME_WINDOWS } from '../context/filters';
import StatCard from '../components/StatCard';
import { useChartTheme } from '../context/ThemeContext';

const TIME_WINDOW_MS: Record<string, number> = {
  'Last 1h':  1 * 60 * 60 * 1000,
  'Last 6h':  6 * 60 * 60 * 1000,
  'Last 24h': 24 * 60 * 60 * 1000,
  'Last 7d':  7 * 24 * 60 * 60 * 1000,
  'Last 30d': 30 * 24 * 60 * 60 * 1000,
};

function toSince(timeWindow: string): string | undefined {
  const ms = TIME_WINDOW_MS[timeWindow];
  if (!ms) return undefined;
  return new Date(Date.now() - ms).toISOString();
}

const modeColors: Record<string, { bg: string; text: string; border: string }> = {
  factual:   { bg: 'bg-blue-500/10',   text: 'text-blue-500',   border: 'border-blue-500/20' },
  synthesis: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
  task:      { bg: 'bg-amber-500/10',  text: 'text-amber-500',  border: 'border-amber-500/20' },
  reasoning: { bg: 'bg-teal-500/10',   text: 'text-teal-500',   border: 'border-teal-500/20' },
};

function ModeBadge({ mode }: { mode: string }) {
  const c = modeColors[mode] ?? { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', border: 'border-gray-300 dark:border-gray-700' };
  return (
    <span className={`inline-flex text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${c.bg} ${c.text} ${c.border}`}>
      {mode}
    </span>
  );
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function avg(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

const PAGE_SIZE = 10;

type SortKey = 'timestamp' | 'latency_ms' | 'top_retrieval_score' | 'total_tokens';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ArrowUpDown size={11} className="text-gray-400 dark:text-gray-600" />;
  return dir === 'asc'
    ? <ArrowUp size={11} className="text-purple-500 dark:text-purple-400" />
    : <ArrowDown size={11} className="text-purple-500 dark:text-purple-400" />;
}

export default function LLMOps() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { timeWindow } = useFilters();
  const { gridColor, axisColor, legendColor, tooltipStyle } = useChartTheme();

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
    setExpandedId(null);
  };

  const { data: traces, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['rag-traces', timeWindow],
    queryFn: () => fetchRagTraces(200, toSince(timeWindow)),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">LLM Operations</h1>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={32} className="animate-spin text-purple-400" />
          <p className="text-sm text-gray-500">Loading traces…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">LLM Operations</h1>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-gray-700 font-medium dark:text-gray-300">Failed to load traces</p>
          <p className="text-sm text-gray-500">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const rows = traces ?? [];
  const totalQueries = rows.length;
  const avgLatency = avg(rows.map((r) => r.latency_ms));
  const avgScore = avg(rows.map((r) => r.top_retrieval_score));
  const avgTokens = avg(rows.map((r) => r.total_tokens));

  const modes = ['all', ...Array.from(new Set(rows.map((r) => r.query_mode))).sort()];

  const q = search.toLowerCase();
  const filteredRows = rows
    .filter((r) => {
      const matchesMode = modeFilter === 'all' || r.query_mode === modeFilter;
      const matchesSearch = !q ||
        r.query_text.toLowerCase().includes(q) ||
        r.model_id.toLowerCase().includes(q) ||
        r.sources.some((s) => s.toLowerCase().includes(q));
      return matchesMode && matchesSearch;
    })
    .sort((a, b) => {
      const v = sortKey === 'timestamp'
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : a[sortKey] - b[sortKey];
      return sortDir === 'asc' ? v : -v;
    });

  const chartData = [...rows].reverse().map((r, i) => ({
    i: i + 1,
    time: fmt(r.timestamp),
    retrieval: r.retrieval_latency_ms,
    generation: r.generation_latency_ms,
    total: r.latency_ms,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">LLM Operations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Observability for atlas-rag
            {totalQueries > 0 && (
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-600">· last {totalQueries} queries</span>
            )}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 dark:text-gray-600 dark:hover:text-gray-400"
        >
          <RefreshCw size={11} className={isFetching ? 'animate-spin' : ''} /> refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Queries" value={String(totalQueries)} status="healthy" />
        <StatCard
          label="Avg Latency"
          value={avgLatency >= 1000 ? `${(avgLatency / 1000).toFixed(1)}s` : `${Math.round(avgLatency)}ms`}
          status={avgLatency > 10000 ? 'warning' : 'healthy'}
        />
        <StatCard label="Avg Retrieval Score" value={avgScore.toFixed(3)} status="healthy" />
        <StatCard label="Avg Tokens / Query" value={Math.round(avgTokens).toLocaleString()} status="healthy" />
      </div>

      {/* Latency chart */}
      {chartData.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-4">
            Latency Breakdown (ms)
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: axisColor, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}ms`}
                  width={52}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}ms`]} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: legendColor }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="retrieval"
                  name="Retrieval"
                  stroke="#818cf8"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="generation"
                  name="Generation"
                  stroke="#c084fc"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Traces table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden dark:bg-gray-900 dark:border-gray-800">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-3 dark:border-gray-800">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider shrink-0">Recent Traces</p>
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search queries, mode, model…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); setExpandedId(null); }}
              className="w-full pl-7 pr-7 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:placeholder-gray-600"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(0); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <select
            value={modeFilter}
            onChange={(e) => { setModeFilter(e.target.value); setPage(0); setExpandedId(null); }}
            className="py-1.5 pl-2.5 pr-6 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
          >
            {modes.map((m) => (
              <option key={m} value={m}>
                {m === 'all' ? 'All modes' : m}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400 shrink-0 ml-auto dark:text-gray-600">
            {filteredRows.length}{search ? ` / ${rows.length}` : ''} traces
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-600">
            No traces yet — run a query in atlas-rag to see data here.
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400 dark:text-gray-600">
            No traces match <span className="text-gray-600 dark:text-gray-400">"{search}"</span>
          </div>
        ) : (
          <>
          {/* Column headers */}
          <div className="flex items-center gap-4 px-5 py-2 border-b border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-900/60">
            <button onClick={() => toggleSort('timestamp')} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 w-28 shrink-0 transition-colors dark:hover:text-gray-300">
              Time <SortIcon active={sortKey === 'timestamp'} dir={sortDir} />
            </button>
            <span className="flex-1 text-xs text-gray-500 min-w-0">Query</span>
            <span className="text-xs text-gray-500 shrink-0 w-20">Mode</span>
            <div className="hidden md:flex items-center gap-4 shrink-0">
              <button onClick={() => toggleSort('latency_ms')} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 w-16 justify-end transition-colors dark:hover:text-gray-300">
                Latency <SortIcon active={sortKey === 'latency_ms'} dir={sortDir} />
              </button>
              <button onClick={() => toggleSort('top_retrieval_score')} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 w-12 justify-end transition-colors dark:hover:text-gray-300">
                Score <SortIcon active={sortKey === 'top_retrieval_score'} dir={sortDir} />
              </button>
              <button onClick={() => toggleSort('total_tokens')} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 w-12 justify-end transition-colors dark:hover:text-gray-300">
                Tokens <SortIcon active={sortKey === 'total_tokens'} dir={sortDir} />
              </button>
            </div>
            <span className="w-4 shrink-0" />
          </div>
          <div className="divide-y divide-gray-200/60 dark:divide-gray-800/60">
            {filteredRows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((trace: RagTrace) => {
              const isExpanded = expandedId === trace.trace_id;
              return (
                <div key={trace.trace_id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : trace.trace_id)}
                    className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/30"
                  >
                    <div className="flex items-center gap-4">
                      {/* Time */}
                      <span className="text-xs text-gray-400 tabular-nums w-28 shrink-0 dark:text-gray-600">
                        {fmt(trace.timestamp)}
                      </span>

                      {/* Query text */}
                      <span className="flex-1 text-sm text-gray-700 truncate min-w-0 dark:text-gray-300">
                        {trace.query_text}
                      </span>

                      {/* Mode */}
                      <div className="shrink-0">
                        <ModeBadge mode={trace.query_mode} />
                      </div>

                      {/* Metrics */}
                      <div className="hidden md:flex items-center gap-4 shrink-0">
                        <span className="text-xs text-gray-500 tabular-nums w-16 text-right">
                          {trace.latency_ms >= 1000
                            ? `${(trace.latency_ms / 1000).toFixed(1)}s`
                            : `${trace.latency_ms}ms`}
                        </span>
                        <span className="text-xs text-gray-500 tabular-nums w-12 text-right">
                          {trace.top_retrieval_score.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 tabular-nums w-12 text-right dark:text-gray-600">
                          {trace.total_tokens.toLocaleString()} tok
                        </span>
                      </div>

                      <span className="text-gray-400 shrink-0 dark:text-gray-600">
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 bg-gray-50 border-t border-gray-200/60 dark:bg-gray-800/20 dark:border-t dark:border-gray-800/60">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-xs mb-3">
                        <div>
                          <span className="text-gray-400 dark:text-gray-600">Retrieval</span>
                          <span className="ml-2 text-gray-700 tabular-nums dark:text-gray-300">{trace.retrieval_latency_ms}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-400 dark:text-gray-600">Generation</span>
                          <span className="ml-2 text-gray-700 tabular-nums dark:text-gray-300">{trace.generation_latency_ms}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-400 dark:text-gray-600">Chunks</span>
                          <span className="ml-2 text-gray-700 tabular-nums dark:text-gray-300">{trace.n_retrieved} retrieved</span>
                        </div>
                        <div>
                          <span className="text-gray-400 dark:text-gray-600">LLM</span>
                          <span className="ml-2 text-gray-700 font-mono dark:text-gray-300">{trace.model_id}</span>
                        </div>
                      </div>
                      {trace.sources.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-400 dark:text-gray-600">Sources</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {trace.sources.map((s) => {
                              const parts = s.split('/');
                              const name = parts[parts.length - 1];
                              return (
                                <span
                                  key={s}
                                  title={s}
                                  className="text-[10px] px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 font-mono dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                                >
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </>
        )}

        {/* Pagination */}
        {filteredRows.length > PAGE_SIZE && (
          <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between dark:border-gray-800">
            <span className="text-xs text-gray-500">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredRows.length)} of {filteredRows.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setPage((p) => p - 1); setExpandedId(null); }}
                disabled={page === 0}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.ceil(filteredRows.length / PAGE_SIZE) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => { setPage(i); setExpandedId(null); }}
                  className={`min-w-[28px] h-7 px-1 rounded-lg text-xs font-medium transition-colors ${
                    i === page
                      ? 'bg-purple-600/20 text-purple-600 border border-purple-600/30 dark:text-purple-400'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => { setPage((p) => p + 1); setExpandedId(null); }}
                disabled={page >= Math.ceil(filteredRows.length / PAGE_SIZE) - 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Column legend */}
      {rows.length > 0 && (
        <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-600">
          <span>Latency = end-to-end query time</span>
          <span>Score = cross-encoder reranker logit (higher = more relevant)</span>
        </div>
      )}
    </div>
  );
}

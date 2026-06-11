import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFilters } from '../context/filters';
import { useChartTheme } from '../context/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, Legend,
} from 'recharts';
import {
  TrendingUp, Award, Target, Layers, AlertCircle, Loader2,
  Database, BarChart2, Search, ChevronRight,
} from 'lucide-react';
import { fetchReportHistory } from '../api';
import type { ReportRecord, FeatureStats } from '../api/types';

function parseClassReport(report: string) {
  const rows: { label: string; precision: number; recall: number; f1: number; support: number }[] = [];
  for (const line of report.split('\n')) {
    const m = line.match(/^\s*(\S+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(\d+)\s*$/);
    if (!m) continue;
    const skip = ['accuracy', 'macro', 'weighted'];
    if (skip.some((s) => m[1].startsWith(s))) continue;
    rows.push({
      label: m[1] === '0' ? 'Benign (0)' : m[1] === '1' ? 'Malicious (1)' : m[1],
      precision: parseFloat(m[2]),
      recall: parseFloat(m[3]),
      f1: parseFloat(m[4]),
      support: parseInt(m[5]),
    });
  }
  return rows;
}

const cmColors = [
  ['#14532d', '#7f1d1d'],
  ['#7f1d1d', '#1e3a5f'],
];
const cmLabels = ['Benign', 'Malicious'];

function MetricBadge({
  label, value, icon: Icon, color,
}: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 dark:bg-gray-900 dark:border-gray-800">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-gray-900 mt-0.5 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 h-20 dark:bg-gray-900 dark:border-gray-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl h-72 dark:bg-gray-900 dark:border-gray-800" />
        <div className="bg-white border border-gray-200 rounded-xl h-72 dark:bg-gray-900 dark:border-gray-800" />
      </div>
    </div>
  );
}

function classifyDtype(dtype: string): 'numeric' | 'categorical' | 'other' {
  if (/Float|Int|UInt/.test(dtype)) return 'numeric';
  if (/Utf8|String|Categorical/.test(dtype)) return 'categorical';
  return 'other';
}

function fmt(v: number | null | undefined, decimals = 4): string {
  return v != null ? v.toFixed(decimals) : '—';
}

// ─── Model Report Tab ────────────────────────────────────────────────────────

function ModelTab({ reports, modelVersion }: { reports: ReportRecord[]; modelVersion: string }) {
  const { gridColor, axisColor, legendColor, tooltipStyle } = useChartTheme();

  const preProdReports = reports.filter(
    (r) => r.report_type === 'PRE_PROD' && (!modelVersion || r.model_version === modelVersion)
  );
  const latest = preProdReports[0];
  const metrics = latest?.content;
  const artifacts = latest?.content;

  const fmtPct = (v?: number | null) => (v != null ? `${(v * 100).toFixed(1)}%` : '—');

  if (!latest) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <Loader2 size={32} className="text-gray-400 dark:text-gray-600" />
        <p className="text-gray-500">No evaluation report found.</p>
        <p className="text-sm text-gray-400 dark:text-gray-600">
          Trigger one via{' '}
          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded dark:bg-gray-800">
            POST /api/v1/reporter/evaluate-model
          </code>
        </p>
      </div>
    );
  }

  const classRows = artifacts?.classification_report
    ? parseClassReport(artifacts.classification_report)
    : [];

  const radarData = [
    { metric: 'Accuracy', value: (metrics?.accuracy ?? 0) * 100 },
    { metric: 'Precision', value: (metrics?.precision ?? 0) * 100 },
    { metric: 'Recall', value: (metrics?.recall ?? 0) * 100 },
    { metric: 'F1-Score', value: (metrics?.f1 ?? 0) * 100 },
    { metric: 'ROC-AUC', value: (metrics?.roc_auc ?? 0) * 100 },
    { metric: 'Avg Precision', value: (metrics?.avg_precision ?? 0) * 100 },
  ];

  const trendData = preProdReports
    .slice()
    .reverse()
    .map((r: ReportRecord, i: number) => ({
      run: `Run ${i + 1}`,
      accuracy: r.content?.accuracy ?? null,
      precision: r.content?.precision ?? null,
      recall: r.content?.recall ?? null,
    }));

  const fprRaw = artifacts?.roc_curve_fpr ?? [];
  const tprRaw = artifacts?.roc_curve_tpr ?? [];
  const rocRaw = fprRaw.map((fpr, i) => ({ fpr, tpr: tprRaw[i] ?? 0 }));
  const step = Math.max(1, Math.floor(rocRaw.length / 150));
  const rocData = rocRaw.filter((_, i) => i % step === 0);
  if (rocRaw.length > 0 && rocData[rocData.length - 1] !== rocRaw[rocRaw.length - 1]) {
    rocData.push(rocRaw[rocRaw.length - 1]);
  }
  const rocDiagonal = [{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }];

  const cm = artifacts?.confusion_matrix;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Classification report — best_model
          {latest.model_version && (
            <span className="ml-2 text-xs text-blue-500 font-mono dark:text-blue-400">{latest.model_version}</span>
          )}
        </p>
        <span className="text-xs text-gray-400 dark:text-gray-600">
          {new Date(latest.timestamp).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricBadge label="Accuracy"  value={fmtPct(metrics?.accuracy)}  icon={Award}      color="bg-blue-600/15 text-blue-500 dark:text-blue-400" />
        <MetricBadge label="Precision" value={fmtPct(metrics?.precision)} icon={Target}     color="bg-emerald-600/15 text-emerald-500 dark:text-emerald-400" />
        <MetricBadge label="Recall"    value={fmtPct(metrics?.recall)}    icon={TrendingUp} color="bg-amber-600/15 text-amber-500 dark:text-amber-400" />
        <MetricBadge label="F1-Score"  value={fmtPct(metrics?.f1)}        icon={Layers}     color="bg-cyan-600/15 text-cyan-500 dark:text-cyan-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Per-class bar chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-700 mb-4 dark:text-gray-300">Per-Class Metrics</h2>
          {classRows.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classRows} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 11 }} />
                  <YAxis domain={[0, 1]} tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${((v as number) * 100).toFixed(1)}%`]} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: legendColor }} />
                  <Bar dataKey="precision" name="Precision" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="recall"    name="Recall"    fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="f1"        name="F1"        fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center dark:text-gray-600">No per-class data available.</p>
          )}
        </div>

        {/* Radar */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-700 mb-4 dark:text-gray-300">Model Performance Radar</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey="metric" tick={{ fill: axisColor, fontSize: 10 }} />
                <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={1.5} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${(v as number).toFixed(1)}%`]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROC Curve */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">ROC Curve</h2>
          {metrics?.roc_auc != null && (
            <span className="text-xs text-gray-500">
              AUC = <span className="text-blue-500 font-mono font-semibold dark:text-blue-400">{metrics.roc_auc.toFixed(4)}</span>
              {metrics?.avg_precision != null && (
                <span className="ml-3">
                  AUC-PR = <span className="text-emerald-500 font-mono font-semibold dark:text-emerald-400">{metrics.avg_precision.toFixed(4)}</span>
                </span>
              )}
            </span>
          )}
        </div>
        {rocData.length > 1 ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  type="number" dataKey="fpr" domain={[0, 1]}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -2, fill: axisColor, fontSize: 11 }}
                />
                <YAxis
                  type="number" dataKey="tpr" domain={[0, 1]}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', offset: 15, fill: axisColor, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v, name) => [
                    (v as number).toFixed(4),
                    name === 'tpr' ? 'TPR (Sensitivity)' : 'Random Classifier',
                  ]}
                  labelFormatter={(fpr) => `FPR: ${(fpr as number).toFixed(4)}`}
                />
                <Line data={rocData} type="monotone" dataKey="tpr" name="tpr" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line data={rocDiagonal} type="linear" dataKey="tpr" name="diag" stroke={gridColor} strokeWidth={1} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center dark:text-gray-600">No ROC curve data available.</p>
        )}
      </div>

      {/* Trend over evaluation runs */}
      {trendData.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-700 mb-4 dark:text-gray-300">
            Metric Trend ({trendData.length} evaluation runs)
          </h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="run" tick={{ fill: axisColor, fontSize: 11 }} />
                <YAxis domain={[0.8, 1]} tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${((v as number) * 100).toFixed(1)}%`]} />
                <Legend wrapperStyle={{ fontSize: '11px', color: legendColor }} />
                <Line type="monotone" dataKey="accuracy"  name="Accuracy"  stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="precision" name="Precision" stroke="#10b981" strokeWidth={1.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="recall"    name="Recall"    stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Confusion matrix */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-700 mb-4 dark:text-gray-300">Confusion Matrix</h2>
          {cm ? (
            <>
              <div className="space-y-1.5">
                {cm.map((row, ri) => (
                  <div key={ri} className="flex gap-1.5">
                    {row.map((val, ci) => (
                      <div
                        key={ci}
                        className="flex-1 rounded-md flex flex-col items-center justify-center py-4 text-white"
                        style={{ backgroundColor: cmColors[ri]?.[ci] ?? '#1f2937' }}
                      >
                        <span className="text-sm font-mono font-bold">{val.toLocaleString()}</span>
                        <span className="text-xs opacity-60 mt-0.5">
                          {ri === ci ? (ri === 0 ? 'TN' : 'TP') : ri === 0 ? 'FP' : 'FN'}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-2">
                {cmLabels.slice(0, cm[0]?.length ?? 0).map((l) => (
                  <div key={l} className="flex-1 text-center text-xs text-gray-400 dark:text-gray-600">Pred: {l}</div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 dark:text-gray-600">Rows = Actual, Columns = Predicted</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center dark:text-gray-600">No confusion matrix available.</p>
          )}
        </div>

        {/* Classification report table */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-700 mb-4 dark:text-gray-300">Classification Report</h2>
          {classRows.length > 0 ? (
            <div className="space-y-0.5">
              <div className="grid grid-cols-5 gap-2 text-xs text-gray-500 font-medium uppercase px-2 mb-2">
                <span className="col-span-2">Class</span>
                <span className="text-right">Prec.</span>
                <span className="text-right">Recall</span>
                <span className="text-right">F1</span>
              </div>
              {classRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-5 gap-2 text-xs px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50"
                >
                  <span className="col-span-2 text-gray-700 font-medium dark:text-gray-300">{row.label}</span>
                  <span className="text-right text-gray-500 font-mono dark:text-gray-400">{fmtPct(row.precision)}</span>
                  <span className="text-right text-gray-500 font-mono dark:text-gray-400">{fmtPct(row.recall)}</span>
                  <span className="text-right text-gray-500 font-mono dark:text-gray-400">{fmtPct(row.f1)}</span>
                </div>
              ))}
              <div className="grid grid-cols-5 gap-2 text-xs px-2 py-2 border-t border-gray-200 mt-1 dark:border-gray-800">
                <span className="col-span-2 text-gray-500 font-medium">Overall</span>
                <span className="text-right text-blue-500 font-mono font-semibold dark:text-blue-400">{fmtPct(metrics?.precision)}</span>
                <span className="text-right text-emerald-500 font-mono font-semibold dark:text-emerald-400">{fmtPct(metrics?.recall)}</span>
                <span className="text-right text-amber-500 font-mono font-semibold dark:text-amber-400">{fmtPct(metrics?.f1)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center dark:text-gray-600">No classification report available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Data Evaluation Tab ─────────────────────────────────────────────────────

function DataEvalSummaryCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-100/60 rounded-xl p-4 dark:bg-gray-800/60">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold font-mono text-gray-900 mt-1 dark:text-gray-100">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-600">{sub}</p>}
    </div>
  );
}

function DataTab({ reports, modelVersion }: { reports: ReportRecord[]; modelVersion: string }) {
  // Resolve the model_id for the selected version from its PRE_PROD report, then
  // filter DATA_EVAL reports to only those belonging to the same model.
  const modelId = reports.find(
    (r) => r.report_type === 'PRE_PROD' && r.model_version === modelVersion
  )?.model_id ?? null;
  const dataReports = reports.filter(
    (r) => r.report_type === 'DATA_EVAL' && (modelId ? r.model_id === modelId : true)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [featureSearch, setFeatureSearch] = useState('');

  useEffect(() => {
    if (dataReports.length > 0 && !selectedId) {
      setSelectedId(dataReports[0].report_id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReports.length]);

  if (dataReports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <Database size={32} className="text-gray-400 dark:text-gray-600" />
        <p className="text-gray-500">No data evaluation reports found.</p>
        <p className="text-sm text-gray-400 dark:text-gray-600">
          Trigger one via{' '}
          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded dark:bg-gray-800">
            POST /api/v1/reporter/evaluate-data
          </code>
        </p>
      </div>
    );
  }

  const selected = dataReports.find((r) => r.report_id === selectedId) ?? dataReports[0];
  const m = selected.content;
  const features: FeatureStats[] = (selected.content?.features ?? []) as FeatureStats[];

  const classDist = m?.class_distribution ?? {};
  const totalSamples = Object.values(classDist).reduce((a, b) => a + b, 0);

  const classLabels: Record<string, string> = { '0': 'Benign (0)', '1': 'Malicious (1)' };

  const filteredFeatures = features.filter((f) =>
    f.name.toLowerCase().includes(featureSearch.toLowerCase())
  );

  const imbalanceRatio = m?.imbalance_ratio ?? 0;
  const imbalanceColor =
    imbalanceRatio > 3 ? 'text-red-400' : imbalanceRatio > 1.5 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="space-y-5">
      {/* Report selector */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Select Dataset Report</p>
        <select
          value={selected.report_id}
          onChange={(e) => { setSelectedId(e.target.value); setFeatureSearch(''); }}
          className="w-full sm:w-72 px-3 py-2 rounded-lg text-xs font-mono border bg-white text-gray-700 border-gray-200 focus:outline-none focus:border-blue-500 transition-colors dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800"
        >
          {dataReports.map((r) => (
            <option key={r.report_id} value={r.report_id}>
              {r.model_version ?? 'unknown'}
            </option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <DataEvalSummaryCard label="Total Rows" value={(m?.n_rows ?? 0).toLocaleString()} sub={`${m?.n_features ?? 0} features`} />
        <DataEvalSummaryCard label="Duplicate Rows" value={(m?.duplicate_rows ?? 0).toLocaleString()} sub={m?.duplicate_rows === 0 ? 'clean' : 'found'} />
        <DataEvalSummaryCard label="Missing Cells" value={(m?.missing_cells ?? 0).toLocaleString()} sub={m?.missing_cells === 0 ? 'no nulls' : 'total nulls'} />
        <div className="bg-gray-100/60 rounded-xl p-4 dark:bg-gray-800/60">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Imbalance Ratio</p>
          <p className={`text-xl font-bold font-mono mt-1 ${imbalanceColor}`}>
            {imbalanceRatio > 0 ? imbalanceRatio.toFixed(2) : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-600">majority / minority</p>
        </div>
      </div>

      {/* Class distribution */}
      {totalSamples > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-700 mb-4 dark:text-gray-300">Class Distribution</h2>
          <div className="space-y-3">
            {Object.entries(classDist).map(([cls, count]) => {
              const pct = (count / totalSamples) * 100;
              return (
                <div key={cls}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{classLabels[cls] ?? cls}</span>
                    <span className="text-sm font-mono text-gray-500">
                      {count.toLocaleString()} <span className="text-gray-400 dark:text-gray-600">({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-800">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: cls === '0' ? '#10b981' : '#f59e0b',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature statistics table */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Feature Statistics
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-600">{filteredFeatures.length} of {features.length}</span>
          </h2>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Filter features…"
              value={featureSearch}
              onChange={(e) => setFeatureSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors w-44 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:placeholder-gray-600"
            />
          </div>
        </div>

        {features.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {['Feature', 'Type', 'Missing%', 'Unique', 'Mean', 'Std', 'Min', 'P25', 'P50', 'P75', 'Max'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-gray-500 font-medium uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60 dark:divide-gray-800/60">
                {filteredFeatures.map((f) => {
                  const kind = classifyDtype(f.dtype);
                  const isNum = kind === 'numeric';
                  const missingPct = (f.missing_pct * 100).toFixed(1);
                  return (
                    <tr key={f.name} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/30">
                      <td className="px-3 py-2 font-mono text-gray-800 whitespace-nowrap dark:text-gray-200">{f.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          kind === 'numeric'
                            ? 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400'
                            : kind === 'categorical'
                            ? 'bg-violet-500/10 text-violet-500 dark:text-violet-400'
                            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {f.dtype}
                        </span>
                      </td>
                      <td className={`px-3 py-2 font-mono tabular-nums ${f.missing_count > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-gray-500'}`}>
                        {missingPct}%
                      </td>
                      <td className="px-3 py-2 font-mono tabular-nums text-gray-500">{f.n_unique.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-gray-500">{isNum ? fmt(f.mean) : '—'}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-gray-500">{isNum ? fmt(f.std) : '—'}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-gray-500">{isNum ? fmt(f.min) : '—'}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-gray-500">{isNum ? fmt(f.p25) : '—'}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-gray-500">{isNum ? fmt(f.p50) : '—'}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-gray-500">{isNum ? fmt(f.p75) : '—'}</td>
                      <td className="px-3 py-2 font-mono tabular-nums text-gray-500">{isNum ? fmt(f.max) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredFeatures.length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm dark:text-gray-600">No features match "{featureSearch}"</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center dark:text-gray-600">No feature statistics available.</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Evaluation() {
  const { modelVersion } = useFilters();
  const [tab, setTab] = useState<'model' | 'data'>('model');

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReportHistory,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Evaluation</h1>
          <p className="text-sm text-gray-500 mt-0.5">Loading evaluation report…</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-gray-700 font-medium dark:text-gray-300">Failed to load evaluation data</p>
        <p className="text-sm text-gray-500">{(error as Error).message}</p>
      </div>
    );
  }

  const allReports = reports ?? [];

  return (
    <div className="space-y-5">
      {/* Page header + tabs */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Evaluation</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {tab === 'model' ? 'Pre-production metrics & curves' : 'Dataset profiling & feature statistics'}
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1 dark:bg-gray-900 dark:border-gray-800">
          <button
            onClick={() => setTab('model')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'model'
                ? 'bg-blue-600/20 text-blue-600 border border-blue-600/20 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <BarChart2 size={14} /> Model Report
          </button>
          <button
            onClick={() => setTab('data')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'data'
                ? 'bg-blue-600/20 text-blue-600 border border-blue-600/20 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Database size={14} /> Data Evaluation
          </button>
        </div>
      </div>

      {tab === 'model'
        ? <ModelTab reports={allReports} modelVersion={modelVersion} />
        : <DataTab reports={allReports} modelVersion={modelVersion} />
      }
    </div>
  );
}

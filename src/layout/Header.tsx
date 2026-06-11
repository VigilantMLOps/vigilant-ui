import { ChevronDown, Bell, Clock, Cpu, XCircle, AlertTriangle, CheckCircle2, Activity, Sun, Moon, Wifi, WifiOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchModelVersions, fetchIncidents, fetchModelHealth, type ModelVersionEntry } from '../api';
import { useFilters, TIME_WINDOWS } from '../context/filters';
import { useTheme } from '../context/ThemeContext';
import type { IncidentRecord } from '../api/types';
import type { TimeWindow } from '../context/filters';

function Dropdown({
  icon: Icon,
  label,
  options,
  optionLabels = {},
  value,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  options: string[];
  optionLabels?: Record<string, string>;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const displayValue = optionLabels[value] ?? value;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
      >
        <Icon size={13} className="text-gray-400 dark:text-gray-500" />
        <span className="text-gray-400 text-xs mr-0.5 dark:text-gray-500">{label}:</span>
        <span className="max-w-[140px] truncate">{displayValue}</span>
        <ChevronDown size={13} className={`text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 right-0 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden dark:bg-gray-900 dark:border-gray-700">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors truncate ${
                opt === value
                  ? 'text-blue-600 bg-blue-600/10 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
            >
              {optionLabels[opt] ?? opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const severityIcon: Record<string, { Icon: React.ElementType; color: string; bg: string }> = {
  CRITICAL: { Icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  WARNING: { Icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  INFO: { Icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

export default function Header() {
  const { timeWindow, setTimeWindow, modelVersion, setModelVersion } = useFilters();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const isLLMOps = pathname.startsWith('/llm-ops');

  const { data: modelEntries = [] } = useQuery<ModelVersionEntry[]>({
    queryKey: ['model-versions'],
    queryFn: fetchModelVersions,
    staleTime: 5 * 60_000,
    enabled: !isLLMOps,
  });
  const versions = modelEntries.map((e) => e.version);
  const versionLabel = Object.fromEntries(modelEntries.map((e) => [e.version, e.label]));

  const { data: modelHealth } = useQuery({
    queryKey: ['model-health'],
    queryFn: fetchModelHealth,
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled: !isLLMOps,
  });
  const serviceUp = modelHealth?.status_code === 200;
  const servingVersion = modelHealth?.serving_model_version ?? null;
  // Healthy only when the service is up AND it's serving the currently selected model
  const isHealthy = serviceUp && (servingVersion === null || servingVersion === modelVersion);

  const { data: incidents } = useQuery({
    queryKey: ['incidents', modelVersion],
    queryFn: () => fetchIncidents(modelVersion || undefined),
    staleTime: 60_000,
    enabled: !isLLMOps,
  });

  const versionsKey = versions.join(',');
  useEffect(() => {
    if (versions.length > 0 && !versions.includes(modelVersion)) {
      setModelVersion(versions[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionsKey]);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);

  const alerts = (incidents ?? []).filter(
    (i: IncidentRecord) => i.severity === 'CRITICAL' || i.severity === 'WARNING'
  );
  const badgeCount = alerts.length;

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white/90 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-6 z-10 dark:bg-gray-950/90 dark:border-gray-800">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest dark:text-gray-600">Filters</span>
      </div>
      <div className="flex items-center gap-3">
        <Dropdown
          icon={Clock}
          label="Window"
          options={[...TIME_WINDOWS]}
          value={timeWindow}
          onChange={(v) => setTimeWindow(v as TimeWindow)}
        />
        {isLLMOps ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700">
            <Cpu size={13} className="text-gray-400 dark:text-gray-500" />
            <span className="text-gray-400 text-xs mr-0.5 dark:text-gray-500">System:</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Atlas RAG</span>
          </div>
        ) : (
          <Dropdown
            icon={Cpu}
            label="Model"
            options={versions.length > 0 ? versions : ['loading…']}
            optionLabels={versionLabel}
            value={versions.includes(modelVersion) ? modelVersion : (versions[0] ?? 'loading…')}
            onChange={setModelVersion}
          />
        )}

        {isLLMOps ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 dark:bg-gray-800/60 dark:border-gray-700">
            <Activity size={11} className="text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 font-medium dark:text-gray-400">Atlas RAG · Local</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600" />
          </div>
        ) : modelHealth === undefined ? null : isHealthy ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Wifi size={11} className="text-emerald-400" />
            <span className="text-xs text-emerald-500 font-medium dark:text-emerald-400">Model Healthy</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 dark:bg-gray-800/60 dark:border-gray-700">
            <WifiOff size={11} className="text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 font-medium dark:text-gray-400">Service Offline</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600" />
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((p) => !p)}
            className="relative p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800"
          >
            <Bell size={16} />
            {badgeCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold px-0.5 leading-none">
                {badgeCount > 9 ? '9+' : badgeCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden dark:bg-gray-900 dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Alerts</span>
                <span className="text-xs text-gray-500">{badgeCount} active</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
                {badgeCount === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-600">No active alerts</div>
                ) : (
                  alerts.slice(0, 20).map((alert: IncidentRecord) => {
                    const cfg = severityIcon[alert.severity] ?? severityIcon.INFO;
                    const Icon = cfg.Icon;
                    return (
                      <div
                        key={alert.incident_id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/30"
                      >
                        <div className={`mt-0.5 p-1 rounded-md ${cfg.bg} shrink-0`}>
                          <Icon size={12} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[10px] font-semibold uppercase tracking-wide ${cfg.color}`}>
                              {alert.severity}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-600">{alert.incident_type}</span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed line-clamp-2 dark:text-gray-300">
                            {alert.description ?? 'No description'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 dark:text-gray-600">{timeAgo(alert.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {badgeCount > 20 && (
                <div className="px-4 py-2 border-t border-gray-200 text-center text-xs text-gray-400 dark:border-gray-800 dark:text-gray-600">
                  +{badgeCount - 20} more — see Overview for full list
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

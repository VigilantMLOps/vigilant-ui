import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ShieldAlert, ShieldCheck, ShieldX, Loader2, Code, FormInput,
  AlertCircle, ChevronDown, ChevronUp, Zap, RotateCcw, WifiOff, ServerOff,
} from 'lucide-react';
import apiClient from '../api/client';
import { fetchModelHealth } from '../api';
import { useFilters } from '../context/filters';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoginEvent {
  user_id: string;
  session_id?: string;
  ip_address?: string;
  geo_country?: string;
  geo_lat?: number | null;
  geo_lon?: number | null;
  user_agent?: string;
  device_fingerprint?: string;
  last_login_gap_h?: number | null;
  geo_distance_delta?: number | null;
  login_success?: boolean;
  mfa_used?: boolean;
  mfa_method?: 'none' | 'totp' | 'sms' | 'email';
  login_duration_ms?: number | null;
  account_age_days?: number | null;
  failed_attempts_7d?: number | null;
  distinct_ips_7d?: number | null;
  login_success_rate_30d?: number | null;
  avg_login_hour_7d?: number | null;
}

interface LoginDecision {
  event_id: string;
  decision: 'ALLOW' | 'CHALLENGE' | 'BLOCK';
  risk_score: number;
  context_flags: string[];
  model_version: string;
  degraded: boolean;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_FORM: LoginEvent = {
  user_id: 'user_demo_001',
  session_id: 'sess_' + Math.random().toString(36).slice(2, 10),
  ip_address: '198.51.100.42',
  geo_country: 'US',
  geo_lat: 37.7749,
  geo_lon: -122.4194,
  user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  device_fingerprint: 'fp_demo_abc123',
  login_success: true,
  mfa_used: false,
  mfa_method: 'none',
  login_duration_ms: 842,
  account_age_days: 120,
  failed_attempts_7d: 0,
  distinct_ips_7d: 1,
  login_success_rate_30d: 0.98,
  avg_login_hour_7d: 9.5,
};

const SUSPICIOUS_PRESET: LoginEvent = {
  user_id: 'user_demo_002',
  session_id: 'sess_' + Math.random().toString(36).slice(2, 10),
  ip_address: '103.21.244.18',
  geo_country: 'RU',
  geo_lat: 55.7558,
  geo_lon: 37.6173,
  user_agent: 'python-requests/2.31.0',
  device_fingerprint: 'fp_new_unknown_' + Math.random().toString(36).slice(2, 6),
  login_success: false,
  mfa_used: false,
  mfa_method: 'none',
  login_duration_ms: 120,
  account_age_days: 0,
  failed_attempts_7d: 12,
  distinct_ips_7d: 8,
  login_success_rate_30d: 0.1,
  avg_login_hour_7d: 2.3,
};

const HIGH_RISK_PRESET: LoginEvent = {
  user_id: 'atk_victim_5543',
  session_id: 'sess_' + Math.random().toString(36).slice(2, 10),
  ip_address: '197.210.65.4',
  geo_country: 'NG',
  geo_lat: 6.4541,
  geo_lon: 3.3947,
  user_agent: 'python-requests/2.28.0',
  device_fingerprint: 'fp_unknown_attack_device',
  login_success: false,
  mfa_used: false,
  mfa_method: 'none',
  login_duration_ms: 98,
  account_age_days: 365,
  failed_attempts_7d: 50,
  distinct_ips_7d: 30,
  login_success_rate_30d: 0.0,
  avg_login_hour_7d: 3.0,
  geo_distance_delta: 12000,
  last_login_gap_h: 8760,
};

// ---------------------------------------------------------------------------
// Decision display
// ---------------------------------------------------------------------------

const decisionConfig = {
  ALLOW: {
    icon: ShieldCheck,
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-400',
    label: 'ALLOW',
    desc: 'Login passed — no suspicious signals detected.',
  },
  CHALLENGE: {
    icon: ShieldAlert,
    bg: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-400',
    label: 'CHALLENGE',
    desc: 'Require additional verification (MFA, CAPTCHA, etc.)',
  },
  BLOCK: {
    icon: ShieldX,
    bg: 'bg-red-500/10 border-red-500/30',
    text: 'text-red-400',
    label: 'BLOCK',
    desc: 'Login blocked — high risk of account takeover.',
  },
};

function RiskGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 75 ? 'bg-red-500' : pct >= 35 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">Risk Score</span>
        <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-600 mt-1">
        <span>Low</span><span>Medium</span><span>High</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form field helpers
// ---------------------------------------------------------------------------

function Field({
  label, children, hint,
}: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1 font-medium">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">{hint}</p>}
    </div>
  );
}

function Input({
  value, onChange, type = 'text', placeholder,
}: { value: string | number | null | undefined; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500/60 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-600"
    />
  );
}

function Select({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500/60 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Toggle({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-4.5 rounded-full transition-colors cursor-pointer ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
        style={{ height: '18px' }}
      >
        <div
          className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ModelServing() {
  const { modelVersion } = useFilters();
  const [mode, setMode] = useState<'form' | 'json'>('form');

  const { data: modelHealth } = useQuery({
    queryKey: ['model-health'],
    queryFn: fetchModelHealth,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const servingVersion = modelHealth?.serving_model_version ?? null;
  const serviceUp = modelHealth?.status_code === 200;
  const modelMismatch = serviceUp && servingVersion !== null && servingVersion !== modelVersion;
  const [form, setForm] = useState<LoginEvent>({ ...DEFAULT_FORM });
  const [jsonText, setJsonText] = useState(() => JSON.stringify(DEFAULT_FORM, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = (key: keyof LoginEvent, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const mutation = useMutation({
    mutationFn: async (payload: LoginEvent): Promise<LoginDecision> => {
      const resp = await apiClient.post<LoginDecision>('/api/v1/events/login', payload);
      return resp.data;
    },
  });

  const handleSubmit = () => {
    if (mode === 'json') {
      try {
        const parsed = JSON.parse(jsonText);
        mutation.mutate(parsed);
      } catch {
        setJsonError('Invalid JSON — fix syntax errors before submitting.');
        return;
      }
    } else {
      mutation.mutate(form);
    }
  };

  const loadPreset = (preset: LoginEvent) => {
    setForm({ ...preset });
    setJsonText(JSON.stringify(preset, null, 2));
  };

  const syncFormToJson = () => {
    setJsonText(JSON.stringify(form, null, 2));
    setMode('json');
  };

  const syncJsonToForm = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setForm({ ...DEFAULT_FORM, ...parsed });
      setJsonError(null);
      setMode('form');
    } catch {
      setJsonError('Fix JSON syntax errors before switching to form mode.');
    }
  };

  const result = mutation.data;

  // Model not deployed — show empty state instead of the prediction form
  const notDeployed = modelHealth !== undefined && (!serviceUp || modelMismatch);

  if (notDeployed) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Model Serving</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Score a login event in real time — returns ALLOW / CHALLENGE / BLOCK
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <ServerOff size={24} className="text-gray-400 dark:text-gray-600" />
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-medium dark:text-gray-300">
              {serviceUp ? 'Model not deployed' : 'Inference service offline'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-600 mt-1 max-w-sm">
              {serviceUp
                ? <>
                    The selected model <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded dark:bg-gray-800">{modelVersion}</span> is not currently loaded.
                    The inference service is serving <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded dark:bg-gray-800">{servingVersion}</span>.
                  </>
                : <>
                    Start <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded dark:bg-gray-800">vigilant-detect</span> on port 8001 to enable live scoring.
                  </>
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Model Serving</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Score a login event in real time — returns ALLOW / CHALLENGE / BLOCK
            {servingVersion && (
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-600">
                · serving <span className="font-mono">{servingVersion}</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPreset(DEFAULT_FORM)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg hover:text-gray-700 hover:border-gray-400 transition-colors dark:border-gray-700 dark:hover:border-gray-500 dark:hover:text-gray-200"
          >
            <RotateCcw size={11} /> Normal login
          </button>
          <button
            onClick={() => loadPreset(SUSPICIOUS_PRESET)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-600 border border-amber-500/40 bg-amber-500/5 rounded-lg hover:bg-amber-500/10 transition-colors dark:text-amber-400"
          >
            <ShieldAlert size={11} /> Suspicious login
          </button>
          <button
            onClick={() => loadPreset(HIGH_RISK_PRESET)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-500/40 bg-red-500/5 rounded-lg hover:bg-red-500/10 transition-colors dark:text-red-400"
          >
            <ShieldX size={11} /> High risk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800 w-fit">
            <button
              onClick={() => { syncJsonToForm(); setMode('form'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === 'form'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FormInput size={12} /> Form
            </button>
            <button
              onClick={syncFormToJson}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === 'json'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Code size={12} /> JSON
            </button>
          </div>

          {mode === 'json' ? (
            <div className="space-y-2">
              <textarea
                value={jsonText}
                onChange={(e) => { setJsonText(e.target.value); setJsonError(null); }}
                rows={24}
                spellCheck={false}
                className="w-full px-4 py-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500/60 resize-none leading-relaxed dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
              />
              {jsonError && (
                <div className="flex items-center gap-2 text-xs text-red-400 px-1">
                  <AlertCircle size={11} /> {jsonError}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:divide-gray-800">
              {/* Identity */}
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Identity</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="User ID *">
                    <Input value={form.user_id} onChange={(v) => set('user_id', v)} placeholder="hashed-uid" />
                  </Field>
                  <Field label="Session ID">
                    <Input value={form.session_id} onChange={(v) => set('session_id', v)} placeholder="sess-123" />
                  </Field>
                </div>
              </div>

              {/* Network */}
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Network</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="IP Address">
                    <Input value={form.ip_address} onChange={(v) => set('ip_address', v)} placeholder="1.2.3.4" />
                  </Field>
                  <Field label="Geo Country">
                    <Input value={form.geo_country} onChange={(v) => set('geo_country', v)} placeholder="US" />
                  </Field>
                  <Field label="Latitude">
                    <Input type="number" value={form.geo_lat} onChange={(v) => set('geo_lat', v ? parseFloat(v) : null)} placeholder="37.77" />
                  </Field>
                  <Field label="Longitude">
                    <Input type="number" value={form.geo_lon} onChange={(v) => set('geo_lon', v ? parseFloat(v) : null)} placeholder="-122.41" />
                  </Field>
                </div>
              </div>

              {/* Device */}
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Device</p>
                <div className="grid grid-cols-1 gap-3">
                  <Field label="Device Fingerprint">
                    <Input value={form.device_fingerprint} onChange={(v) => set('device_fingerprint', v)} placeholder="fp-abc123" />
                  </Field>
                  <Field label="User Agent">
                    <Input value={form.user_agent} onChange={(v) => set('user_agent', v)} placeholder="Mozilla/5.0..." />
                  </Field>
                </div>
              </div>

              {/* Auth */}
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Authentication</p>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <Toggle checked={form.login_success ?? true} onChange={(v) => set('login_success', v)} label="Login success" />
                  <Toggle checked={form.mfa_used ?? false} onChange={(v) => set('mfa_used', v)} label="MFA used" />
                  <Field label="MFA Method">
                    <Select
                      value={form.mfa_method ?? 'none'}
                      onChange={(v) => set('mfa_method', v as LoginEvent['mfa_method'])}
                      options={['none', 'totp', 'sms', 'email']}
                    />
                  </Field>
                  <Field label="Login Duration (ms)">
                    <Input type="number" value={form.login_duration_ms} onChange={(v) => set('login_duration_ms', v ? parseFloat(v) : null)} placeholder="842" />
                  </Field>
                </div>
              </div>

              {/* Advanced / behavioral */}
              <div className="p-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors dark:hover:text-gray-300"
                >
                  {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showAdvanced ? 'Hide' : 'Show'} behavioral features
                </button>
                {showAdvanced && (
                  <div className="mt-3 space-y-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Behavioral (offline features)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Account Age (days)" hint="0 = new user (cold-start)">
                        <Input type="number" value={form.account_age_days} onChange={(v) => set('account_age_days', v ? parseInt(v) : null)} placeholder="120" />
                      </Field>
                      <Field label="Failed Attempts (7d)">
                        <Input type="number" value={form.failed_attempts_7d} onChange={(v) => set('failed_attempts_7d', v ? parseInt(v) : null)} placeholder="0" />
                      </Field>
                      <Field label="Distinct IPs (7d)">
                        <Input type="number" value={form.distinct_ips_7d} onChange={(v) => set('distinct_ips_7d', v ? parseInt(v) : null)} placeholder="1" />
                      </Field>
                      <Field label="Login Success Rate (30d)" hint="-1 = no history">
                        <Input type="number" value={form.login_success_rate_30d} onChange={(v) => set('login_success_rate_30d', v !== '' ? parseFloat(v) : null)} placeholder="0.98" />
                      </Field>
                      <Field label="Avg Login Hour (7d)" hint="-1 = no history">
                        <Input type="number" value={form.avg_login_hour_7d} onChange={(v) => set('avg_login_hour_7d', v !== '' ? parseFloat(v) : null)} placeholder="9.5" />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {mutation.isPending ? (
              <><Loader2 size={14} className="animate-spin" /> Scoring...</>
            ) : (
              <><Zap size={14} /> Score Login Event</>
            )}
          </button>
        </div>

        {/* Right: Response */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl dark:bg-gray-900 dark:border-gray-800 min-h-[400px] flex flex-col">
            {mutation.isPending && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 size={24} className="animate-spin text-blue-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Scoring event...</p>
                </div>
              </div>
            )}

            {mutation.isError && (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <AlertCircle size={24} className="text-red-400 mx-auto mb-3" />
                  <p className="text-sm text-red-400 font-medium">Request failed</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    {(mutation.error as Error)?.message ?? 'Unknown error'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                    Ensure vigilant-api is running and /api/v1/events/login is reachable.
                  </p>
                </div>
              </div>
            )}

            {!mutation.isPending && !mutation.isError && !result && (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <ShieldAlert size={20} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">Submit an event to see the decision</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Use the presets above to quickly test normal vs suspicious logins
                  </p>
                </div>
              </div>
            )}

            {result && (
              <div className="p-5 space-y-5">
                {/* Decision badge */}
                {(() => {
                  const cfg = decisionConfig[result.decision];
                  const Icon = cfg.icon;
                  return (
                    <div className={`flex items-center gap-4 p-4 rounded-xl border ${cfg.bg}`}>
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${cfg.bg} border ${cfg.bg.replace('bg-', 'border-').replace('/10', '/30')}`}>
                        <Icon size={22} className={cfg.text} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xl font-bold font-mono ${cfg.text}`}>{result.decision}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{cfg.desc}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Risk score */}
                <RiskGauge score={result.risk_score} />

                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Model Version</p>
                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">{result.model_version}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Degraded Mode</p>
                    <p className={`text-xs font-medium ${result.degraded ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {result.degraded ? 'Yes — Redis down' : 'No — full features'}
                    </p>
                  </div>
                </div>

                {/* Context flags */}
                {result.context_flags.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Context Flags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.context_flags.map((flag) => (
                        <span
                          key={flag}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/25 text-amber-400"
                        >
                          {flag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw JSON */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Raw Response</p>
                  <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl p-3 overflow-x-auto text-gray-700 dark:text-gray-300 leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>

                <p className="text-[10px] text-gray-500 text-right font-mono">
                  event_id: {result.event_id}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface FlowRecord {
  flow_duration: number;
  bytes_total: number;
  pkts_total: number;
  rate: number;
  srate: number;
  drate: number;
  min: number;
  max: number;
  avg: number;
  std: number;
  proto: string;
  state: string;
  source: string;
}

export interface LoginRecord {
  user_id: string;
  ip_address: string;
  geo_country: string;
  geo_lat: number;
  geo_lon: number;
  user_agent: string;
  device_fingerprint: string;
  login_success: boolean;
  mfa_used: boolean;
  mfa_method: string;
  login_duration_ms: number;
  account_age_days: number;
  failed_attempts_7d: number;
  distinct_ips_7d: number;
  login_success_rate_30d: number;
  avg_login_hour_7d: number;
}

export interface FeatureStats {
  name: string;
  dtype: string;
  missing_count: number;
  missing_pct: number;
  n_unique: number;
  mean?: number | null;
  std?: number | null;
  min?: number | null;
  p25?: number | null;
  p50?: number | null;
  p75?: number | null;
  max?: number | null;
}

// The backend collapsed the legacy `metrics` and `artifacts` columns into a
// single `content` JSONB payload, so every report type now flattens its fields
// into one bag here.
export interface ReportContent {
  // PRE_PROD metrics
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  roc_auc?: number;
  avg_precision?: number;
  // PRE_PROD artifacts
  confusion_matrix?: number[][];
  roc_curve_fpr?: number[];
  roc_curve_tpr?: number[];
  classification_report?: string;
  // DATA_EVAL metrics
  split?: string;
  stage?: string;
  n_rows?: number;
  n_features?: number;
  class_distribution?: Record<string, number>;
  imbalance_ratio?: number;
  duplicate_rows?: number;
  missing_cells?: number;
  // DATA_EVAL artifacts
  features?: FeatureStats[];
  [key: string]: unknown;
}

export interface ReportRecord {
  report_id: string;
  timestamp: string;
  report_type: string;
  model_id: string | null;
  model_version: string | null;
  content: ReportContent | null;
}

export interface IncidentRecord {
  incident_id: string;
  timestamp: string;
  severity: string;
  incident_type: string;
  description: string | null;
  status: string;
  model_id: string | null;
}

export type DriftStatus = 'ok' | 'warning' | 'critical';

export interface FeatureDriftResult {
  feature: string;
  method: string;
  statistic: number;
  pvalue: number | null;
  status: DriftStatus;
}

export interface DataDriftResult {
  n_accumulated: number;
  n_features_checked: number;
  n_drifted: number;
  drift_rate: number;
  overall_status: DriftStatus;
  features: FeatureDriftResult[];
}

export interface ModelHealthResponse {
  model_api: string;
  url: string;
  status_code: number | null;
  error: string | null;
  serving_model_version: string | null;
}

export interface RagTrace {
  trace_id: string;
  timestamp: string;
  query_text: string;
  query_mode: string;
  n_retrieved: number;
  top_retrieval_score: number;
  total_tokens: number;
  latency_ms: number;
  retrieval_latency_ms: number;
  generation_latency_ms: number;
  model_id: string;
  sources: string[];
  prompt_version: string;
}

import apiClient from './client';
import type { ReportRecord, IncidentRecord, DataDriftResult, ModelHealthResponse, RagTrace, FlowRecord } from './types';

export const fetchReportHistory = (): Promise<ReportRecord[]> =>
  apiClient.get<ReportRecord[]>('/api/v1/reports/history').then((r) => r.data);

export interface ModelVersionEntry { version: string; label: string; }

export const fetchModelVersions = (): Promise<ModelVersionEntry[]> =>
  apiClient.get<ModelVersionEntry[]>('/api/v1/reports/model-versions').then((r) => r.data);

export const fetchIncidents = (modelVersion?: string): Promise<IncidentRecord[]> =>
  apiClient
    .get<IncidentRecord[]>('/api/v1/incidents', { params: modelVersion ? { model_version: modelVersion } : {} })
    .then((r) => r.data);

export const fetchNetworkRecords = (): Promise<FlowRecord[]> =>
  apiClient.get<FlowRecord[]>('/api/v1/reporter/records').then((r) => r.data);

export const fetchDrift = (): Promise<DataDriftResult> =>
  fetchNetworkRecords().then((records) =>
    apiClient.post<DataDriftResult>('/api/v1/reporter/evaluate-drift', { records }).then((r) => r.data)
  );

export const fetchModelHealth = (): Promise<ModelHealthResponse> =>
  apiClient.get<ModelHealthResponse>('/api/v1/reporter/model-health').then((r) => r.data);

export const fetchIncident = (id: string): Promise<IncidentRecord> =>
  apiClient.get<IncidentRecord>(`/api/v1/incidents/${id}`).then((r) => r.data);

export const fetchRagTraces = (limit = 50, since?: string): Promise<RagTrace[]> =>
  apiClient
    .get<RagTrace[]>('/api/v1/telemetry/rag-traces', { params: { limit, ...(since ? { since } : {}) } })
    .then((r) => r.data);

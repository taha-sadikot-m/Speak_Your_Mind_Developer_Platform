/**
 * API service for the SYM Developer Portal
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://api.speakyourmind.app' : 'http://127.0.0.1:8000');

// ── Portal API (JWT auth) ─────────────────────────────────────────────────────
export const portalApi = axios.create({
  baseURL: `${BASE_URL}/api/v1/dev-portal`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

portalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('dev_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

portalApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dev_access_token');
      localStorage.removeItem('dev_refresh_token');
      localStorage.removeItem('dev_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth helpers ──────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    portalApi.post('/auth/login/', { email, password }),
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  get: () => portalApi.get('/profile/'),
  update: (data: Record<string, unknown>) => portalApi.patch('/profile/', data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => portalApi.get('/dashboard/'),
};

// ── API Keys ──────────────────────────────────────────────────────────────────
export const apiKeyApi = {
  list: () => portalApi.get('/api-keys/'),
  create: (data: { label: string; mode: string; requests_per_minute: number }) =>
    portalApi.post('/api-keys/', data),
  update: (id: string, data: Record<string, unknown>) => portalApi.patch(`/api-keys/${id}/`, data),
  revoke: (id: string) => portalApi.delete(`/api-keys/${id}/`),
};

// ── Question Sets ─────────────────────────────────────────────────────────────
export const setApi = {
  list: () => portalApi.get('/sets/'),
  create: (data: Record<string, unknown>) => portalApi.post('/sets/', data),
  get: (id: string) => portalApi.get(`/sets/${id}/`),
  update: (id: string, data: Record<string, unknown>) => portalApi.patch(`/sets/${id}/`, data),
  delete: (id: string) => portalApi.delete(`/sets/${id}/`),
  // Questions
  listQuestions: (setId: string) => portalApi.get(`/sets/${setId}/questions/`),
  addQuestion: (setId: string, data: Record<string, unknown>) =>
    portalApi.post(`/sets/${setId}/questions/`, data),
  replaceQuestions: (setId: string, questions: Record<string, unknown>[]) =>
    portalApi.put(`/sets/${setId}/questions/`, { questions }),
  updateQuestion: (setId: string, qId: string, data: Record<string, unknown>) =>
    portalApi.patch(`/sets/${setId}/questions/${qId}/`, data),
  deleteQuestion: (setId: string, qId: string) =>
    portalApi.delete(`/sets/${setId}/questions/${qId}/`),
};

// ── Sessions ──────────────────────────────────────────────────────────────────
export const sessionApi = {
  list: (params?: Record<string, string>) => portalApi.get('/sessions/', { params }),
  get: (roomId: string) => portalApi.get(`/sessions/${roomId}/`),
  /**
   * Run or re-run Gemini analysis (server-side; allow up to 2 minutes).
   * Set regenerate: true when analysis_status is already DONE (replaces stored analysis).
   */
  runAnalysis: (roomId: string, opts?: { regenerate?: boolean }) =>
    portalApi.post(
      `/sessions/${roomId}/run-analysis/`,
      opts?.regenerate ? { regenerate: true } : {},
      { timeout: 120000 }
    ),
  /** Latest stored progress report for a session (timing / trajectory narrative). */
  getProgressReport: (roomId: string) => portalApi.get(`/sessions/${roomId}/progress-report/`, { timeout: 60000 }),
  /** Generate (or regenerate) a fresh progress report for this session. */
  runProgressReport: (roomId: string, opts?: { regenerate?: boolean }) =>
    portalApi.post(
      `/sessions/${roomId}/progress-report/run/`,
      opts?.regenerate ? { regenerate: true } : {},
      { timeout: 180000 }
    ),
};

// ── Progress reports (batch, JWT) ───────────────────────────────────────────
export const progressReportApi = {
  /** 1–5 COMPLETED session room UUIDs. May return 202 + poll listByBatch. */
  generate: (session_room_ids: string[]) =>
    portalApi.post('/progress-reports/', { session_room_ids }, { timeout: 180000 }),
  listByBatch: (batchId: string) =>
    portalApi.get('/progress-reports/', { params: { batch_id: batchId }, timeout: 30000 }),
  list: (params?: Record<string, string | number | undefined>) =>
    portalApi.get('/progress-reports/', { params, timeout: 30000 }),
  get: (reportId: string) => portalApi.get(`/progress-reports/${reportId}/`, { timeout: 60000 }),
  delete: (reportId: string) => portalApi.delete(`/progress-reports/${reportId}/`, { timeout: 30000 }),
};

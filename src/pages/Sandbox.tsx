import React, { useState, useEffect } from 'react';
import { Send, Copy, Check, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { portalApi } from '../services/api';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://api.speakyourmind.app' : 'http://127.0.0.1:8000');

/* ── Types ───────────────────────────────────────────── */
interface KeyOption { id: string; label: string; key_prefix: string; mode: string; is_active: boolean; }
interface SetOption  { id: string; name: string; question_count: number; question_count_limit: number; }

interface LogEntry {
  id: string;
  ts: Date;
  method: string;
  path: string;
  status: number | null;
  ms: number;
  req: string;
  res: string;
  err?: string;
}

/* ── Endpoint definitions ────────────────────────────── */
const ENDPOINTS = [
  {
    id: 'sets-list',
    label: 'List Sets (public)',
    method: 'GET',
    path: '/api/v1/developer/sets/',
    auth: 'apikey',
    desc: 'List question sets (X-API-Key)',
    params: [],
    buildBody: () => '',
  },
  {
    id: 'sets-create',
    label: 'Create Set (public)',
    method: 'POST',
    path: '/api/v1/developer/sets/',
    auth: 'apikey',
    desc: 'Create a question set (X-API-Key)',
    params: [],
    buildBody: () =>
      JSON.stringify(
        {
          name: 'Frontend Engineer Interview',
          description: 'Public API created set',
          logo_url: '',
          question_count_limit: 5,
          is_active: true,
        },
        null,
        2
      ),
  },
  {
    id: 'set-detail',
    label: 'Get Set (public)',
    method: 'GET',
    path: '/api/v1/developer/sets/:set_id/',
    auth: 'apikey',
    desc: 'Fetch a set by id (X-API-Key)',
    params: ['set_id'],
    buildBody: () => '',
  },
  {
    id: 'set-delete',
    label: 'Delete Set (public)',
    method: 'DELETE',
    path: '/api/v1/developer/sets/:set_id/',
    auth: 'apikey',
    desc: 'Delete a set by id (X-API-Key)',
    params: ['set_id'],
    buildBody: () => '',
  },
  {
    id: 'set-questions-list',
    label: 'List Set Questions (public)',
    method: 'GET',
    path: '/api/v1/developer/sets/:set_id/questions/',
    auth: 'apikey',
    desc: 'List questions for a set (X-API-Key)',
    params: ['set_id'],
    buildBody: () => '',
  },
  {
    id: 'set-questions-replace',
    label: 'Replace Set Questions (public)',
    method: 'PUT',
    path: '/api/v1/developer/sets/:set_id/questions/',
    auth: 'apikey',
    desc: 'Bulk replace all questions (X-API-Key)',
    params: ['set_id'],
    buildBody: () =>
      JSON.stringify(
        {
          questions: [
            { text: 'Tell me about yourself.', question_type: 'BEHAVIORAL', order: 0, time_limit_seconds: 120 },
            { text: 'Explain event loop in JS.', question_type: 'TECHNICAL', order: 1, time_limit_seconds: 120 },
          ],
        },
        null,
        2
      ),
  },
  {
    id: 'create-session',
    label: 'Create Session',
    method: 'POST',
    path: '/api/v1/developer/sessions/',
    auth: 'apikey',
    desc: 'Create an interview room and receive a room_url',
    params: ['set_id', 'candidate_name', 'candidate_email', 'webhook_url'],
    buildBody: (v: Record<string, string>) => JSON.stringify({
      set_id:              v.set_id || '',
      candidate_name:      v.candidate_name || 'Alice Smith',
      candidate_email:     v.candidate_email || 'alice@example.com',
      candidate_metadata:  { source: 'sandbox' },
      ...(v.webhook_url ? { webhook_url: v.webhook_url } : {}),
      expiry_hours: 72,
    }, null, 2),
  },
  {
    id: 'session-status',
    label: 'Get Session Status',
    method: 'GET',
    path: '/api/v1/developer/sessions/:room_id/',
    auth: 'apikey',
    desc: 'Check the status of a session',
    params: ['room_id'],
    buildBody: () => '',
  },
  {
    id: 'get-analysis',
    label: 'Get Analysis',
    method: 'GET',
    path: '/api/v1/developer/sessions/:room_id/analysis/',
    auth: 'apikey',
    desc: 'Full Gemini AI analysis for a completed session',
    params: ['room_id'],
    buildBody: () => '',
  },
  {
    id: 'get-transcript',
    label: 'Get Transcript',
    method: 'GET',
    path: '/api/v1/developer/sessions/:room_id/transcript/',
    auth: 'apikey',
    desc: 'Raw Q&A transcript',
    params: ['room_id'],
    buildBody: () => '',
  },
  {
    id: 'progress-batch-create',
    label: 'Batch progress reports',
    method: 'POST',
    path: '/api/v1/developer/progress-reports/',
    auth: 'apikey',
    desc: '1–5 COMPLETED room UUIDs (comma-separated) → timing narratives',
    params: ['session_room_ids'],
    buildBody: (v: Record<string, string>) => {
      const ids = (v.session_room_ids || '').split(/[\s,]+/).map((s) => s.trim()).filter(Boolean).slice(0, 5);
      return JSON.stringify({ session_room_ids: ids }, null, 2);
    },
  },
  {
    id: 'progress-batch-poll',
    label: 'Poll progress batch',
    method: 'GET',
    path: '/api/v1/developer/progress-reports/?batch_id=:batch_id',
    auth: 'apikey',
    desc: 'Poll GET until each row is DONE or FAILED',
    params: ['batch_id'],
    buildBody: () => '',
  },
  {
    id: 'progress-delete',
    label: 'Delete progress report (public)',
    method: 'DELETE',
    path: '/api/v1/developer/progress-reports/:report_id/',
    auth: 'apikey',
    desc: 'Delete a progress report row by id',
    params: ['report_id'],
    buildBody: () => '',
  },
  {
    id: 'progress-run',
    label: 'Run progress report (public)',
    method: 'POST',
    path: '/api/v1/developer/sessions/:room_id/progress-report/run/',
    auth: 'apikey',
    desc: 'Generate/regenerate latest progress report row for a room',
    params: ['room_id'],
    buildBody: () => JSON.stringify({ regenerate: true }, null, 2),
  },
  {
    id: 'list-sessions',
    label: 'List Sessions',
    method: 'GET',
    path: '/api/v1/dev-portal/sessions/',
    auth: 'jwt',
    desc: 'All sessions (portal JWT)',
    params: [],
    buildBody: () => '',
  },
  {
    id: 'list-sets',
    label: 'List Question Sets',
    method: 'GET',
    path: '/api/v1/dev-portal/sets/',
    auth: 'jwt',
    desc: 'All question sets (portal JWT)',
    params: [],
    buildBody: () => '',
  },
] as const;

type Endpoint = (typeof ENDPOINTS)[number];

/* ── Status color ────────────────────────────────────── */
const statusColor = (s: number | null): string => {
  if (!s) return 'var(--text-muted)';
  if (s < 300) return 'var(--green)';
  if (s < 400) return 'var(--amber)';
  return 'var(--red)';
};

const METHOD_STYLE: Record<string, React.CSSProperties> = {
  GET:  { background: 'rgba(34,197,94,0.08)',  color: 'var(--green)', border: '1px solid rgba(34,197,94,0.18)' },
  POST: { background: 'rgba(59,130,246,0.08)', color: 'var(--blue)',  border: '1px solid rgba(59,130,246,0.18)' },
};

/* ── Component ───────────────────────────────────────── */
const Sandbox: React.FC = () => {
  const [keys, setKeys] = useState<KeyOption[]>([]);
  const [sets, setSets] = useState<SetOption[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [ep, setEp] = useState<Endpoint>(ENDPOINTS[0]);
  const [params, setParams] = useState<Record<string, string>>({});
  const [bodyOverride, setBodyOverride] = useState('');
  const [editBody, setEditBody] = useState(false);
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [active, setActive] = useState<LogEntry | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    portalApi.get('/api-keys/').then(r => {
      const k = r.data.data || [];
      setKeys(k);
      const first = k.find((x: KeyOption) => x.is_active);
      if (first) setSelectedKey(first.key_prefix + 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    }).catch(() => {});
    portalApi.get('/sets/').then(r => setSets(r.data.data || [])).catch(() => {});
  }, []);

  // Reset params and body when endpoint changes
  useEffect(() => {
    setParams({});
    setBodyOverride('');
    setEditBody(false);
  }, [ep.id]);

  const buildUrl = () => {
    let p = ep.path as string;
    if (params.room_id) p = p.replace(':room_id', params.room_id);
    if (params.set_id) p = p.replace(':set_id', params.set_id);
    if (params.question_id) p = p.replace(':question_id', params.question_id);
    if (params.report_id) p = p.replace(':report_id', params.report_id);
    if (params.batch_id) p = p.replace(':batch_id', params.batch_id);
    return API_BASE + p;
  };

  const currentBody = editBody ? bodyOverride : ep.buildBody(params);

  const send = async () => {
    setSending(true);
    const url = buildUrl();
    const t0 = Date.now();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (ep.auth === 'apikey' && selectedKey) headers['X-API-Key'] = selectedKey;
    else if (ep.auth === 'jwt') {
      const tok = localStorage.getItem('dev_access_token');
      if (tok) headers['Authorization'] = `Bearer ${tok}`;
    }

    let entry: LogEntry;
    try {
      const res = await axios({
        method: ep.method,
        url,
        headers,
        data: ep.method !== 'GET' ? JSON.parse(currentBody || '{}') : undefined,
        validateStatus: () => true,
      });
      entry = {
        id: Math.random().toString(36).slice(2),
        ts: new Date(),
        method: ep.method,
        path: ep.path as string,
        status: res.status,
        ms: Date.now() - t0,
        req: currentBody,
        res: JSON.stringify(res.data, null, 2),
      };
    } catch (err: any) {
      entry = {
        id: Math.random().toString(36).slice(2),
        ts: new Date(),
        method: ep.method,
        path: ep.path as string,
        status: null,
        ms: Date.now() - t0,
        req: currentBody,
        res: '',
        err: err.message,
      };
    }
    setLogs(prev => [entry, ...prev].slice(0, 20));
    setActive(entry);
    setSending(false);
  };

  const paramLabel = (p: string): string => ({
    set_id:          'set_id — UUID of the question set',
    room_id:         'room_id — from a create session response',
    question_id:     'question_id — UUID of a set question',
    report_id:       'report_id — UUID of a progress report row',
    candidate_name:  'candidate_name',
    candidate_email: 'candidate_email',
    webhook_url:     'webhook_url (optional)',
    session_room_ids: 'comma-separated room UUIDs (max 5)',
    batch_id:        'batch_id from POST progress-reports response',
  }[p] ?? p);

  return (
    <div className="flex h-full min-h-0">

      {/* ── Left: request builder ─────────────────────── */}
      <div
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{ width: 340, borderRight: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <h1 className="text-[14px] font-semibold text-white mb-0.5">API Sandbox</h1>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            Fire live requests against the SYM API.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* Endpoint list */}
          <div>
            <p className="label mb-2">Endpoint</p>
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {ENDPOINTS.map((e, i) => (
                <button
                  key={e.id}
                  onClick={() => setEp(e)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ep-btn"
                  style={{
                    background: ep.id === e.id ? 'var(--accent-subtle)' : 'var(--surface)',
                    borderBottom: i < ENDPOINTS.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <span className="badge text-[10px] font-bold font-mono flex-shrink-0" style={METHOD_STYLE[e.method]}>
                    {e.method}
                  </span>
                  <span
                    className="text-[12.5px] font-medium truncate"
                    style={{ color: ep.id === e.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {e.label}
                  </span>
                  {e.auth === 'jwt' && (
                    <span className="ml-auto text-[10px] flex-shrink-0" style={{ color: 'var(--text-faint)' }}>JWT</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Auth */}
          <div>
            <p className="label mb-2">
              {ep.auth === 'apikey' ? 'API Key' : 'Authentication'}
            </p>
            {ep.auth === 'apikey' ? (
              keys.length > 0 ? (
                <div className="relative">
                  <select
                    value={selectedKey}
                    onChange={e => setSelectedKey(e.target.value)}
                    className="field pr-8 appearance-none"
                  >
                    <option value="">Select an API key…</option>
                    {keys.map(k => (
                      <option
                        key={k.id}
                        value={k.key_prefix + 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'}
                      >
                        {k.label} · {k.mode} · {k.key_prefix}…
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                </div>
              ) : (
                <div className="rounded-md px-3 py-2.5 text-[12px]" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', color: 'var(--amber)' }}>
                  No API keys found. <a href="/api-keys" style={{ textDecoration: 'underline' }}>Create one first.</a>
                </div>
              )
            ) : (
              <div className="rounded-md px-3 py-2.5 text-[12px]" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', color: 'var(--green)' }}>
                Uses your current portal session (JWT).
              </div>
            )}
          </div>

          {/* Params */}
          {(ep.params as readonly string[]).length > 0 && (
            <div className="space-y-3">
              <p className="label">Parameters</p>
              {(ep.params as readonly string[]).map(p => (
                <div key={p}>
                  <label className="label text-[11px]">{paramLabel(p)}</label>
                  {p === 'set_id' && sets.length > 0 ? (
                    <div className="relative">
                      <select
                        value={params[p] || ''}
                        onChange={e => setParams(prev => ({ ...prev, [p]: e.target.value }))}
                        className="field pr-8 appearance-none"
                      >
                        <option value="">Select a set…</option>
                        {sets.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.question_count}/{s.question_count_limit} q)
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ) : (
                    <input
                      value={params[p] || ''}
                      onChange={e => setParams(prev => ({ ...prev, [p]: e.target.value }))}
                      placeholder={p === 'room_id' ? 'e4a1f923-…' : p === 'webhook_url' ? 'https://… (optional)' : ''}
                      className="field font-mono text-[12px]"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Body */}
          {ep.method === 'POST' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="label">Request Body</p>
                <button
                  onClick={() => { setEditBody(v => !v); if (!editBody) setBodyOverride(currentBody); }}
                  className="text-[11px] transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  {editBody ? 'Use auto' : 'Edit manually'}
                </button>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {editBody ? (
                  <textarea
                    value={bodyOverride}
                    onChange={e => setBodyOverride(e.target.value)}
                    rows={10}
                    className="w-full p-3 text-[12px] font-mono resize-none outline-none"
                    style={{ background: 'var(--surface)', color: 'var(--text-secondary)', caretColor: 'var(--accent)' }}
                  />
                ) : (
                  <pre
                    className="p-3 text-[12px] font-mono overflow-x-auto"
                    style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
                  >
                    {currentBody}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Send */}
          <button
            onClick={send}
            disabled={sending || (ep.auth === 'apikey' && !selectedKey)}
            className="btn btn-primary w-full justify-center"
          >
            {sending
              ? <><Loader2 size={13} className="animate-spin" /> Sending…</>
              : <><Send size={13} /> Send Request</>
            }
          </button>
        </div>
      </div>

      {/* ── Right: response ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Response header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Response
            </span>
            {active && (
              <>
                <span className="text-[13px] font-semibold font-mono" style={{ color: statusColor(active.status) }}>
                  {active.status ?? 'ERR'}
                </span>
                <span className="text-[12px] font-mono" style={{ color: 'var(--text-faint)' }}>
                  {active.ms}ms
                </span>
              </>
            )}
          </div>
          {active && (
            <button
              onClick={() => { navigator.clipboard.writeText(active.res || active.err || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="btn btn-ghost py-1 px-2 text-[12px]"
            >
              {copied ? <Check size={12} style={{ color: 'var(--green)' }} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>

        {/* Response body */}
        <div className="flex-1 overflow-y-auto p-5">
          {sending ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Loader2 size={18} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Waiting for response…</p>
            </div>
          ) : active ? (
            active.err ? (
              <div className="rounded-md px-4 py-3 text-[12.5px]" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', color: '#fca5a5', fontFamily: 'monospace' }}>
                {active.err}
              </div>
            ) : (
              <pre
                className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-words"
                style={{ color: 'var(--text-secondary)' }}
              >
                {active.res}
              </pre>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <p className="text-[13px] font-medium text-white mb-1">No response yet</p>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Select an endpoint and press Send Request.
              </p>
            </div>
          )}
        </div>

        {/* History */}
        {logs.length > 0 && (
          <div className="flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              <span className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                History
              </span>
              <button
                onClick={() => { setLogs([]); setActive(null); }}
                className="btn btn-ghost py-0.5 px-1.5 text-[11px]"
              >
                <Trash2 size={11} />
              </button>
            </div>
            <div className="max-h-36 overflow-y-auto" style={{ background: 'var(--surface)' }}>
              {logs.map(log => (
                <button
                  key={log.id}
                  onClick={() => setActive(log)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors log-row"
                  style={{
                    background: active?.id === log.id ? 'var(--surface-2)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span className="badge text-[9.5px] font-mono font-bold flex-shrink-0" style={METHOD_STYLE[log.method]}>
                    {log.method}
                  </span>
                  <span className="text-[11px] font-semibold font-mono flex-shrink-0" style={{ color: statusColor(log.status) }}>
                    {log.status ?? 'ERR'}
                  </span>
                  <span className="text-[11px] font-mono truncate flex-1" style={{ color: 'var(--text-muted)' }}>
                    {log.path}
                  </span>
                  <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
                    {log.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ep-btn:hover { background: var(--surface-2) !important; }
        .log-row:hover { background: var(--surface-2) !important; }
      `}</style>
    </div>
  );
};

export default Sandbox;

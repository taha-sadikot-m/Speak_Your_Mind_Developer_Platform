import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, TrendingUp, ChevronDown, ChevronRight, Trash2, RotateCcw, Search } from 'lucide-react';
import { progressReportApi } from '../services/api';

interface SummaryRow {
  id: string;
  batch_id: string;
  room_id: string;
  status: string;
  interview_duration_seconds: number | null;
  generated_at: string | null;
  created_at: string;
  error_message?: string;
}

interface LocationState {
  prefilled?: string[];
}

const terminal = (s: string) => s === 'DONE' || s === 'FAILED';

const ProgressReports: React.FC = () => {
  const location = useLocation();
  const prefilled = (location.state as LocationState | null)?.prefilled;

  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [browseRows, setBrowseRows] = useState<SummaryRow[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseErr, setBrowseErr] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ room_id: string; batch_id: string; status: string }>({
    room_id: '',
    batch_id: '',
    status: '',
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [detailCache, setDetailCache] = useState<Record<string, Record<string, unknown>>>({});

  useEffect(() => {
    if (prefilled?.length) {
      setInput(prefilled.join(', '));
    }
  }, [prefilled]);

  useEffect(() => {
    if (!batchId) return;
    let iv = 0;
    const poll = () => {
      progressReportApi
        .listByBatch(batchId)
        .then((res) => {
          const data = res.data.data as SummaryRow[];
          setRows(data);
          if (data.length && data.every((r) => terminal(r.status)) && iv) {
            window.clearInterval(iv);
            iv = 0;
          }
        })
        .catch(() => {});
    };
    poll();
    iv = window.setInterval(poll, 4000);
    return () => {
      if (iv) window.clearInterval(iv);
    };
  }, [batchId]);

  const parseIds = (): string[] => {
    const parts = input
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of parts) {
      if (seen.has(p)) continue;
      seen.add(p);
      out.push(p);
    }
    return out.slice(0, 5);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ids = parseIds();
    setErr(null);
    if (ids.length < 1 || ids.length > 5) {
      setErr('Enter 1 to 5 unique session room UUIDs (comma or space separated).');
      return;
    }
    setSubmitting(true);
    progressReportApi
      .generate(ids)
      .then((res) => {
        const payload = res.data.data as { batch_id: string; reports: SummaryRow[] };
        setBatchId(payload.batch_id);
        setRows(payload.reports || []);
      })
      .catch((e: { response?: { data?: { message?: string } } }) => {
        setErr(e.response?.data?.message || 'Request failed');
      })
      .finally(() => setSubmitting(false));
  };

  const loadBrowse = () => {
    setBrowseErr(null);
    setBrowseLoading(true);
    const params: Record<string, string> = {};
    if (filters.room_id.trim()) params.room_id = filters.room_id.trim();
    if (filters.batch_id.trim()) params.batch_id = filters.batch_id.trim();
    if (filters.status.trim()) params.status = filters.status.trim().toUpperCase();
    progressReportApi
      .list(params)
      .then((res) => setBrowseRows(res.data.data || []))
      .catch((e: { response?: { data?: { message?: string } } }) => {
        setBrowseErr(e.response?.data?.message || 'Failed to load reports.');
      })
      .finally(() => setBrowseLoading(false));
  };

  const loadDetail = async (reportId: string) => {
    if (detailCache[reportId]) return;
    try {
      const res = await progressReportApi.get(reportId);
      const payload = res.data.data as { report?: Record<string, unknown> };
      const report = payload.report;
      setDetailCache((c) => ({ ...c, [reportId]: report && typeof report === 'object' ? report : {} }));
    } catch {
      setDetailCache((c) => ({ ...c, [reportId]: { _error: true } }));
    }
  };

  const statusStyle = (s: string): React.CSSProperties => {
    if (s === 'DONE') return { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.22)' };
    if (s === 'FAILED') return { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.22)' };
    if (s === 'PROCESSING') return { background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.22)' };
    return { background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.22)' };
  };

  return (
    <div className="page">
      <Link to="/sessions" className="btn-ghost mb-5 -ml-1 inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft size={13} /> Sessions
      </Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="page-header mb-6">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-500/10 border border-brand-500/20 flex-shrink-0">
            <TrendingUp size={18} className="text-brand-400" />
          </div>
          <div className="min-w-0">
            <h1 className="page-title">Progress reports</h1>
            <p className="page-desc max-w-2xl">
              Generate timing- and trajectory-focused narratives for up to five <strong className="text-slate-300">COMPLETED</strong>{' '}
              interviews at once. SYM orders sessions by completion time for longitudinal context. Each session stores its own report;
              poll by <code className="text-[11px] font-mono text-brand-400">batch_id</code> or fetch later by <code className="text-[11px] font-mono text-brand-400">report_id</code>.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="glass-card rounded-2xl p-6 mb-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Session room IDs (1–5 UUIDs)
            </span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. paste up to five room UUIDs, comma or newline separated"
              rows={3}
              className="w-full rounded-xl bg-slate-900/80 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-brand-500/40"
            />
          </label>
          {err && <p className="text-sm text-red-400">{err}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={submitting} className="btn-primary px-5 py-2.5 text-sm inline-flex items-center gap-2">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
              {submitting ? 'Starting…' : 'Generate batch'}
            </button>
            <span className="text-xs text-slate-500">{parseIds().length} / 5 ids parsed</span>
          </div>
        </form>
      </div>

      {/* Browse / manage existing reports */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Browse & manage</p>
            <p className="text-xs text-slate-500 mt-1">
              Filter stored reports by room, batch, or status. You can delete any report row (history-safe).
            </p>
          </div>
          <button
            type="button"
            onClick={loadBrowse}
            disabled={browseLoading}
            className="btn-secondary text-xs py-2 px-3 inline-flex items-center gap-2"
          >
            {browseLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Search
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            value={filters.room_id}
            onChange={(e) => setFilters((p) => ({ ...p, room_id: e.target.value }))}
            placeholder="room_id (optional)"
            className="field font-mono text-xs"
          />
          <input
            value={filters.batch_id}
            onChange={(e) => setFilters((p) => ({ ...p, batch_id: e.target.value }))}
            placeholder="batch_id (optional)"
            className="field font-mono text-xs"
          />
          <input
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            placeholder="status (PENDING | PROCESSING | DONE | FAILED)"
            className="field font-mono text-xs"
          />
        </div>
        {browseErr && <p className="text-xs text-red-400 mt-3">{browseErr}</p>}

        <div className="mt-4 space-y-2">
          {browseLoading ? (
            <div className="skeleton h-20 rounded-xl" />
          ) : browseRows.length === 0 ? (
            <p className="text-xs text-slate-600">No reports match these filters yet.</p>
          ) : (
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              {browseRows.slice(0, 50).map((r) => (
                <div key={r.id} className="px-4 py-3 border-b border-white/[0.06] last:border-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono text-slate-400 truncate">{r.room_id}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase" style={statusStyle(r.status)}>
                        {r.status}
                      </span>
                      <span className="text-[11px] text-slate-600 font-mono truncate">
                        {r.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      className="btn-ghost text-xs py-2 px-3 inline-flex items-center gap-2 border border-white/10 rounded-xl"
                      onClick={() => {
                        setBatchId(r.batch_id);
                        setRows([]); // will be filled by poll
                      }}
                    >
                      View batch
                    </button>
                    <button
                      type="button"
                      className="btn-danger text-xs py-2 px-3 inline-flex items-center gap-2"
                      onClick={() => {
                        if (!window.confirm('Delete this progress report row? This cannot be undone.')) return;
                        progressReportApi
                          .delete(r.id)
                          .then(() => setBrowseRows((prev) => prev.filter((x) => x.id !== r.id)))
                          .catch(() => setBrowseErr('Delete failed.'));
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {batchId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-white">
              Batch <code className="text-xs font-mono text-brand-400">{batchId}</code>
            </p>
            {rows.length > 0 && !rows.every((r) => terminal(r.status)) && (
              <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin text-blue-400" /> Polling every 4s…
              </span>
            )}
          </div>
          <div className="divide-y divide-white/[0.05]">
            {rows.map((r) => (
              <div key={r.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-slate-400 truncate mb-1">{r.room_id}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase" style={statusStyle(r.status)}>
                        {r.status}
                      </span>
                      {r.interview_duration_seconds != null && (
                        <span className="text-[11px] text-slate-500">
                          Wall time: {r.interview_duration_seconds}s
                        </span>
                      )}
                      {r.error_message ? (
                        <span className="text-[11px] text-red-400 truncate max-w-md">{r.error_message}</span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={r.status !== 'DONE'}
                    onClick={() => {
                      const next = !expanded[r.id];
                      setExpanded((e) => ({ ...e, [r.id]: next }));
                      if (next) void loadDetail(r.id);
                    }}
                    className="btn-ghost text-xs inline-flex items-center gap-1 py-2 px-3 disabled:opacity-40"
                  >
                    {expanded[r.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Narrative
                  </button>
                  <button
                    type="button"
                    className="btn-danger text-xs py-2 px-3 inline-flex items-center gap-2"
                    onClick={() => {
                      if (!window.confirm('Delete this progress report row? This cannot be undone.')) return;
                      progressReportApi
                        .delete(r.id)
                        .then(() => setRows((prev) => prev.filter((x) => x.id !== r.id)))
                        .catch(() => setErr('Delete failed.'));
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
                {expanded[r.id] && r.status === 'DONE' && (
                  <div className="mt-4 rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 text-sm text-slate-300 leading-relaxed space-y-3">
                    {detailCache[r.id] && !(detailCache[r.id] as { _error?: boolean })._error ? (
                      <>
                        {((detailCache[r.id] as any).headline || (detailCache[r.id] as any).title) && (
                          <p className="font-semibold text-white">
                            {String((detailCache[r.id] as any).headline ?? (detailCache[r.id] as any).title)}
                          </p>
                        )}
                        {((detailCache[r.id] as any).coachExecutiveSummary || (detailCache[r.id] as any).executive_summary) && (
                          <p>
                            {String(
                              (detailCache[r.id] as any).coachExecutiveSummary ??
                                (detailCache[r.id] as any).executive_summary ??
                                ''
                            )}
                          </p>
                        )}
                        {((detailCache[r.id] as any).coachPlan || (detailCache[r.id] as any).recommended_practice) && (
                          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                              Coach plan (highlights)
                            </p>
                            {Array.isArray((detailCache[r.id] as any).coachPlan?.priorityFocusForNext7Days) && (
                              <ul className="text-sm text-slate-300 space-y-1">
                                {(detailCache[r.id] as any).coachPlan.priorityFocusForNext7Days.slice(0, 5).map((x: any, i: number) => (
                                  <li key={i}>- {String(x)}</li>
                                ))}
                              </ul>
                            )}
                            {Array.isArray((detailCache[r.id] as any).recommended_practice) && (
                              <ul className="text-sm text-slate-300 space-y-1">
                                {(detailCache[r.id] as any).recommended_practice.slice(0, 5).map((x: any, i: number) => (
                                  <li key={i}>- {String(x)}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                        {((detailCache[r.id] as any).detailed_narrative as string) && (
                          <p className="whitespace-pre-wrap text-slate-400">{String((detailCache[r.id] as any).detailed_narrative)}</p>
                        )}
                        {((detailCache[r.id] as any).encouragementNote as string) && (
                          <p className="whitespace-pre-wrap text-slate-400">{String((detailCache[r.id] as any).encouragementNote)}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-500 text-xs">Loading or unavailable…</p>
                    )}
                    <p className="text-[11px] text-slate-600 pt-2 border-t border-white/[0.06]">
                      Full JSON: GET <code className="text-brand-400">/api/v1/dev-portal/progress-reports/{'{id}'}/</code>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-xs text-slate-500 leading-relaxed">
        <p className="font-semibold text-slate-400 mb-2 text-[11px] uppercase tracking-wider">Developer API (X-API-Key)</p>
        <p>
          <code className="text-brand-400">POST /api/v1/developer/progress-reports/</code> with body{' '}
          <code className="text-slate-400">{`{"session_room_ids":["uuid",...]}`}</code>. Poll{' '}
          <code className="text-brand-400">GET …/progress-reports/?batch_id=…</code> or retrieve a stored report by{' '}
          <code className="text-brand-400">GET …/progress-reports/{'{report_id}'}/</code>. Per-session shortcut:{' '}
          <code className="text-brand-400">GET …/sessions/{'{room_id}'}/progress-report/</code> (latest).
        </p>
      </div>
    </div>
  );
};

export default ProgressReports;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Copy, Check, Loader2, RefreshCw, TrendingUp, RotateCcw } from 'lucide-react';
import { sessionApi } from '../services/api';

interface Answer {
  question_index: number; question_text: string; answer_text: string;
  score: number | null; feedback: string | null; asked_at: string; answered_at: string | null;
}
interface Session {
  room_id: string; set_name: string; candidate_name: string; candidate_email: string;
  candidate_metadata: Record<string, unknown>; status: string; room_url: string;
  expires_at: string; started_at: string | null; completed_at: string | null;
  webhook_url: string | null; overall_score: number | null; verdict: string | null;
  analysis_status: string; analysis: Record<string, unknown>; answers: Answer[];
  created_at: string;
  progress_report_latest?: {
    report_id: string;
    batch_id: string;
    status: string;
    generated_at: string | null;
  } | null;
}

const VERDICT: Record<string, { color: string; bg: string; border: string }> = {
  STRONG_HIRE: { color: '#4ade80', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)' },
  HIRE:        { color: '#4ade80', bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.18)' },
  WEAK_HIRE:   { color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  NO_HIRE:     { color: '#f87171', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)' },
};

const scoreColor = (s: number) => s >= 80 ? '#4ade80' : s >= 60 ? '#fbbf24' : '#f87171';

const SessionDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [analysisWorking, setAnalysisWorking] = useState(false);
  const [analysisErr, setAnalysisErr] = useState<string | null>(null);
  const [regenerateWorking, setRegenerateWorking] = useState(false);
  const [progressPreview, setProgressPreview] = useState<Record<string, unknown> | null>(null);
  const [progressPreviewLoading, setProgressPreviewLoading] = useState(false);

  const loadSession = React.useCallback(() => {
    if (!roomId) return Promise.resolve();
    return sessionApi.get(roomId).then(res => setSession(res.data.data));
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    loadSession().catch(console.error).finally(() => setLoading(false));
  }, [roomId, loadSession]);

  // If analysis is still queued, poll briefly after load (e.g. another tab triggered run-analysis).
  useEffect(() => {
    if (!session || session.status !== 'COMPLETED') return;
    if (session.analysis_status !== 'PENDING' && session.analysis_status !== 'PROCESSING') return;
    const t = window.setInterval(() => {
      void loadSession();
    }, 8000);
    return () => window.clearInterval(t);
  }, [session?.analysis_status, session?.status, loadSession]);

  useEffect(() => {
    const pr = session?.progress_report_latest;
    if (!pr || (pr.status !== 'PENDING' && pr.status !== 'PROCESSING')) return;
    const t = window.setInterval(() => {
      void loadSession();
    }, 5000);
    return () => window.clearInterval(t);
  }, [session?.progress_report_latest?.status, loadSession]);

  if (loading) return (
    <div className="flex items-center justify-center h-72">
      <Loader2 size={20} className="animate-spin text-brand-400" />
    </div>
  );
  if (!session) return (
    <div className="page">
      <button onClick={() => navigate('/sessions')} className="btn-ghost mb-4"><ArrowLeft size={13} /> Sessions</button>
      <p className="text-slate-500 text-sm">Session not found.</p>
    </div>
  );

  const analysis = session.analysis as any;
  const perQuestionByIndex: Record<number, any> = Array.isArray(analysis?.per_question)
    ? (analysis.per_question as any[]).reduce((acc, p) => {
        if (typeof p?.question_index === 'number') acc[p.question_index] = p;
        return acc;
      }, {} as Record<number, any>)
    : {};
  const vs = session.verdict ? VERDICT[session.verdict] : null;

  return (
    <div className="page">
      <button onClick={() => navigate('/sessions')} className="btn-ghost mb-5 -ml-1">
        <ArrowLeft size={13} /> Sessions
      </button>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-7 mb-4 relative overflow-hidden">
        <div className="gradient-topline" />
        <div className="flex items-start justify-between gap-8 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-display font-bold text-white">{session.candidate_name}</h1>
              {vs && session.verdict && (
                <span className="badge font-bold" style={{ background: vs.bg, color: vs.color, border: `1px solid ${vs.border}` }}>
                  {session.verdict.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mb-1">{session.candidate_email}</p>
            <p className="text-xs text-slate-600">Set: {session.set_name}</p>
            {analysis?.assessment_verdict && (
              <p className="text-xs text-slate-500 mt-2">
                Interview assessment (same scale as SYM mock interviews):{' '}
                <span className="text-slate-300 font-semibold">
                  {String(analysis.assessment_verdict).replace(/_/g, ' ')}
                </span>
              </p>
            )}

            {session.candidate_metadata && Object.keys(session.candidate_metadata).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(session.candidate_metadata).map(([k, v]) => (
                  <span key={k} className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                    <span className="text-brand-400">{k}</span>
                    <span className="text-slate-600">: </span>
                    <span className="text-green-400">{String(v)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Score */}
          <div className="text-center flex-shrink-0">
            {session.overall_score !== null ? (
              <>
                <p className="font-display font-bold leading-none tabular-nums"
                  style={{ fontSize: 64, letterSpacing: '-0.05em', color: scoreColor(session.overall_score) }}>
                  {session.overall_score}
                </p>
                <p className="text-xs text-slate-600 mt-2">out of 100</p>
              </>
            ) : (
              <>
                <p className="font-display font-bold text-slate-700 leading-none" style={{ fontSize: 56 }}>—</p>
                <p className="text-xs text-slate-600 mt-2">no score</p>
              </>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/[0.06]">
          {[
            { label: 'Status',    value: session.status },
            { label: 'Analysis',  value: session.analysis_status },
            { label: 'Created',   value: new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
            { label: 'Completed', value: session.completed_at ? new Date(session.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10.5px] uppercase tracking-wider text-slate-600 mb-1">{label}</p>
              <p className="text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Room URL */}
        <div className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/[0.07]">
          <code className="flex-1 text-xs font-mono text-slate-400 truncate">{session.room_url}</code>
          <button onClick={() => { navigator.clipboard.writeText(session.room_url); setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000); }} className="btn-ghost py-1 px-2">
            {copiedUrl ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          </button>
          <a href={session.room_url} target="_blank" rel="noopener noreferrer" className="btn-ghost py-1 px-2">
            <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>

      {/* Progress report (batch API — timing / trajectory narrative) */}
      {session.status === 'COMPLETED' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl px-5 py-4 mb-4 flex flex-col lg:flex-row lg:items-center gap-4"
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <TrendingUp size={16} className="text-brand-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Candidate progress report</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Optional longitudinal narrative using interview wall time and per-question pacing. Submit up to five completed room IDs;
                SYM orders them by completion time and stores one report per session for later retrieval.
              </p>
              {session.progress_report_latest && (
                <p className="text-[11px] text-slate-600 mt-2 font-mono">
                  Latest:{' '}
                  <span className="text-slate-400">{session.progress_report_latest.status}</span>
                  {session.progress_report_latest.generated_at && (
                    <> · {new Date(session.progress_report_latest.generated_at).toLocaleString()}</>
                  )}
                </p>
              )}
              {progressPreview &&
                (typeof (progressPreview as any).coachExecutiveSummary === 'string' ||
                  typeof (progressPreview as any).executive_summary === 'string' ||
                  typeof (progressPreview as any).executiveSummary === 'string') && (
                <p className="text-xs text-slate-400 mt-3 leading-relaxed border-t border-white/[0.06] pt-3">
                  {String(
                    (progressPreview as any).coachExecutiveSummary ??
                      (progressPreview as any).executive_summary ??
                      (progressPreview as any).executiveSummary ??
                      ''
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end lg:flex-shrink-0">
            {session.progress_report_latest?.status === 'DONE' && (
              <button
                type="button"
                disabled={progressPreviewLoading}
                onClick={() => {
                  if (!roomId) return;
                  setProgressPreviewLoading(true);
                  sessionApi
                    .getProgressReport(roomId)
                    .then((res) => {
                      const rep = (res.data.data as { report?: Record<string, unknown> }).report;
                      setProgressPreview(rep && typeof rep === 'object' ? rep : {});
                    })
                    .catch(console.error)
                    .finally(() => setProgressPreviewLoading(false));
                }}
                className="btn-ghost text-xs py-2 px-3 inline-flex items-center gap-2 border border-white/10 rounded-xl"
              >
                {progressPreviewLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                {progressPreview ? 'Refresh narrative' : 'Load narrative'}
              </button>
            )}
              <button
                type="button"
                className="btn-ghost text-xs py-2 px-3 inline-flex items-center gap-2 border border-white/10 rounded-xl"
                onClick={() => {
                  if (!roomId) return;
                  const done = session.progress_report_latest?.status === 'DONE';
                  const ok = done
                    ? window.confirm('Regenerate progress report? A new report row will be created and becomes the latest.')
                    : true;
                  if (!ok) return;
                  sessionApi
                    .runProgressReport(roomId, { regenerate: done })
                    .then(() => loadSession())
                    .catch(() => {});
                }}
              >
                <RotateCcw size={14} className="text-brand-400" />
                {session.progress_report_latest ? 'Regenerate' : 'Generate now'}
              </button>
            <Link
              to="/progress-reports"
              state={{ prefilled: [session.room_id] }}
              className="btn-primary text-xs py-2 px-4 text-center"
            >
              {session.progress_report_latest ? 'New batch' : 'Generate'}
            </Link>
          </div>
        </motion.div>
      )}

      {/* Analysis pending / failed — offer server-side run (no Celery required) */}
      {session.status === 'COMPLETED' &&
        (session.analysis_status === 'PENDING' || session.analysis_status === 'FAILED') && (
        <div
          className="glass-card rounded-xl px-5 py-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3"
          style={{ borderColor: 'rgba(245,158,11,0.25)' }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-200">
              {session.analysis_status === 'FAILED' ? 'AI analysis failed' : 'AI analysis not started yet'}
            </p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              This usually means the background worker was not running when the interview finished. You can run
              analysis now from the portal (uses your server&apos;s Gemini key; may take 10–30 seconds).
            </p>
            {analysisErr && <p className="text-xs text-red-400 mt-2">{analysisErr}</p>}
          </div>
          <button
            type="button"
            disabled={analysisWorking}
            onClick={() => {
              if (!roomId) return;
              setAnalysisErr(null);
              setAnalysisWorking(true);
              sessionApi
                .runAnalysis(roomId)
                .then(res => setSession(res.data.data))
                .catch((e: { response?: { data?: { message?: string } } }) => {
                  setAnalysisErr(e.response?.data?.message || 'Request failed');
                })
                .finally(() => setAnalysisWorking(false));
            }}
            className="btn-primary whitespace-nowrap px-4 py-2.5 text-sm shrink-0"
          >
            {analysisWorking ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Running…
              </span>
            ) : (
              'Run analysis now'
            )}
          </button>
        </div>
      )}

      {/* Analysis processing */}
      {session.analysis_status === 'PROCESSING' && (
        <div className="glass-card rounded-xl px-5 py-3.5 mb-4 flex items-center gap-3" style={{ borderColor: 'rgba(59,130,246,0.2)' }}>
          <Loader2 size={14} className="animate-spin text-blue-400 flex-shrink-0" />
          <p className="text-sm text-blue-300">AI analysis in progress — typically takes 15–30 seconds.</p>
        </div>
      )}

      {/* AI Analysis */}
      {session.analysis_status === 'DONE' && analysis && (
        <div className="glass-card rounded-2xl overflow-hidden mb-4">
          <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.05] flex flex-wrap items-center justify-between gap-3">
            <p className="section-title mb-0">AI Analysis</p>
            {session.status === 'COMPLETED' && (
              <button
                type="button"
                disabled={regenerateWorking}
                onClick={() => {
                  if (
                    !window.confirm(
                      'Re-run Gemini analysis for this session? Current results will be replaced (SYM interview–aligned scoring). May take up to two minutes.'
                    )
                  ) {
                    return;
                  }
                  if (!roomId) return;
                  setAnalysisErr(null);
                  setRegenerateWorking(true);
                  sessionApi
                    .runAnalysis(roomId, { regenerate: true })
                    .then(res => setSession(res.data.data))
                    .catch((e: { response?: { data?: { message?: string } } }) => {
                      setAnalysisErr(e.response?.data?.message || 'Regeneration failed');
                    })
                    .finally(() => setRegenerateWorking(false));
                }}
                className="btn-ghost inline-flex items-center gap-2 py-2 px-3 text-xs font-medium text-slate-300 hover:text-white border border-white/10 rounded-xl hover:bg-white/[0.04]"
              >
                {regenerateWorking ? (
                  <Loader2 size={14} className="animate-spin text-brand-400" />
                ) : (
                  <RefreshCw size={14} className="text-brand-400" />
                )}
                Regenerate analysis
              </button>
            )}
          </div>
          {analysis.summary && (
            <div className="px-6 py-5 border-b border-white/[0.05]">
              <p className="text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
            </div>
          )}
          {analysis.detailed_feedback && (
            <div className="px-6 py-5 border-b border-white/[0.05]">
              <p className="section-title mb-3">Detailed feedback</p>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{analysis.detailed_feedback}</p>
            </div>
          )}
          {(analysis.strengths?.length > 0 || analysis.weaknesses?.length > 0) && (
            <div className="grid sm:grid-cols-2 border-b border-white/[0.05]">
              {analysis.strengths?.length > 0 && (
                <div className="px-6 py-5 border-r border-white/[0.04]">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-green-500 mb-3">Strengths</p>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-green-400 mt-0.5">+</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.weaknesses?.length > 0 && (
                <div className="px-6 py-5">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-red-400 mb-3">Areas to improve</p>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-red-400 mt-0.5">−</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {analysis.competency_breakdown && typeof analysis.competency_breakdown === 'object' && (
            <div className="px-6 py-5 border-b border-white/[0.05]">
              <p className="section-title mb-4">Competency breakdown</p>
              <p className="text-[11px] text-slate-600 mb-4 leading-relaxed">
                Same dimensions as the main SYM interview scorer: technical skills, communication, problem solving, cultural fit (0–10 each, with notes).
              </p>
              <div className="space-y-5">
                {Object.entries(analysis.competency_breakdown as Record<string, { score?: number; notes?: string }>).map(([key, v]) => (
                  <div key={key} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <div className="flex justify-between items-baseline gap-3 mb-1">
                      <span className="text-xs font-semibold text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-bold tabular-nums text-white">
                        {typeof v?.score === 'number' ? `${v.score}/10` : '—'}
                      </span>
                    </div>
                    {v?.notes ? (
                      <p className="text-sm text-slate-400 leading-relaxed">{v.notes}</p>
                    ) : (
                      <p className="text-xs text-slate-600 italic">No notes</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {analysis.skill_ladder && typeof analysis.skill_ladder === 'object' && (
            <div className="px-6 py-5 border-b border-white/[0.05]">
              <p className="section-title mb-4">Skill ladder</p>
              <p className="text-[11px] text-slate-600 mb-4">
                Same ladder model as SYM interviews (clarity, confidence, content, consistency → overall level).
              </p>
              <div className="flex flex-wrap gap-8 items-end mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-600 mb-1">Level</p>
                  <p className="text-2xl font-display font-bold text-white">{String((analysis.skill_ladder as any).level)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-600 mb-1">Session score</p>
                  <p className="text-xl font-bold tabular-nums text-brand-400">{Number((analysis.skill_ladder as any).score ?? 0)}/100</p>
                </div>
                {(analysis.skill_ladder as any).next_level && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-600 mb-1">Next level</p>
                    <p className="text-sm font-medium text-slate-300">{String((analysis.skill_ladder as any).next_level)}</p>
                  </div>
                )}
              </div>
              {(analysis.skill_ladder as any).dimension_percentages && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries((analysis.skill_ladder as any).dimension_percentages as Record<string, number>).map(([k, val]) => (
                    <div key={k} className="rounded-lg bg-white/[0.03] px-3 py-2 border border-white/[0.06]">
                      <p className="text-[10px] uppercase text-slate-600 mb-1">{k}</p>
                      <p className="text-sm font-bold tabular-nums text-slate-200">{Math.round(Number(val))}%</p>
                    </div>
                  ))}
                </div>
              )}
              {typeof (analysis.skill_ladder as any).progress_percent === 'number' && (
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                    <span>Progress toward next level</span>
                    <span>{Math.round((analysis.skill_ladder as any).progress_percent)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-500 transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(0, Number((analysis.skill_ladder as any).progress_percent)))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {analysis.competency_scores && (
            <div className="px-6 py-5 border-b border-white/[0.05]">
              <p className="section-title mb-5">Overall competency (0–100)</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(analysis.competency_scores).map(([k, v]) => {
                  const val = v as number;
                  const col = scoreColor(val);
                  return (
                    <div key={k}>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-xs text-slate-400 capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-bold tabular-nums" style={{ color: col }}>{val}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, background: col }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {(analysis.communication_style_notes || analysis.standout_moment || analysis.interview_completeness) && (
            <div className="px-6 py-5 border-b border-white/[0.05] space-y-4">
              {analysis.communication_style_notes && (
                <div>
                  <p className="section-title mb-2">Communication style</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{analysis.communication_style_notes}</p>
                </div>
              )}
              {analysis.standout_moment && (
                <div>
                  <p className="section-title mb-2">Standout moment</p>
                  <p className="text-sm text-slate-400 leading-relaxed italic">{analysis.standout_moment}</p>
                </div>
              )}
              {analysis.interview_completeness && (
                <div>
                  <p className="section-title mb-2">
                    Interview completeness · <span className="text-slate-400 font-normal">{String(analysis.interview_completeness)}</span>
                  </p>
                  {analysis.completeness_note && (
                    <p className="text-sm text-slate-500">{analysis.completeness_note}</p>
                  )}
                </div>
              )}
            </div>
          )}
          {analysis.improvement_suggestions?.length > 0 && (
            <div className="px-6 py-5">
              <p className="section-title mb-3">Suggestions</p>
              <ul className="space-y-2">
                {analysis.improvement_suggestions.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-slate-600 mt-0.5">→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Transcript */}
      {session.answers.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.05]">
            <p className="section-title mb-0">Transcript · {session.answers.length} questions</p>
          </div>
          {session.answers.map((a, i) => (
            <div key={a.question_index} className="px-6 py-5 border-b border-white/[0.04] last:border-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <span className="text-[11px] font-mono font-bold text-slate-700 w-5 flex-shrink-0 mt-0.5">
                    {String(a.question_index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm font-medium text-slate-100 leading-relaxed">{a.question_text}</p>
                </div>
                {a.score !== null && (
                  <span className="text-sm font-bold tabular-nums flex-shrink-0"
                    style={{ color: a.score >= 7 ? '#4ade80' : a.score >= 5 ? '#fbbf24' : '#f87171' }}>
                    {a.score}/10
                  </span>
                )}
              </div>
              <div className="ml-8">
                <p
                  className="text-sm leading-relaxed px-4 py-3 rounded-xl mb-2"
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    color: a.answer_text ? '#94a3b8' : '#475569',
                    fontStyle: a.answer_text ? 'normal' : 'italic',
                  }}
                >
                  {a.answer_text || 'No answer provided'}
                </p>
                {a.feedback && (
                  <p className="text-xs text-slate-500 italic">
                    <span className="text-brand-400 not-italic font-medium">AI: </span>{a.feedback}
                  </p>
                )}
                {perQuestionByIndex[a.question_index]?.better_answer && (
                  <p className="text-xs text-slate-500 mt-2 pl-1 border-l-2 border-brand-500/40">
                    <span className="text-slate-600 not-italic font-medium">Stronger answer example: </span>
                    {perQuestionByIndex[a.question_index].better_answer}
                  </p>
                )}
                {perQuestionByIndex[a.question_index]?.focus_area && (
                  <p className="text-[10px] text-slate-600 mt-1">
                    Competency focus: {perQuestionByIndex[a.question_index].focus_area}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionDetail;

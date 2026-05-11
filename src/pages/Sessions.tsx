import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, PlaySquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { sessionApi } from '../services/api';

interface Session {
  room_id: string; set_name: string; candidate_name: string;
  candidate_email: string; status: string; overall_score: number | null;
  verdict: string | null; analysis_status: string; created_at: string;
}

const STATUS: Record<string, React.CSSProperties> = {
  PENDING:     { background: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' },
  IN_PROGRESS: { background: 'rgba(59,130,246,0.1)',  color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' },
  COMPLETED:   { background: 'rgba(34,197,94,0.1)',   color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' },
  EXPIRED:     { background: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.07)' },
  ABORTED:     { background: 'rgba(239,68,68,0.08)',  color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' },
};

const VERDICT_COLOR: Record<string, string> = {
  STRONG_HIRE: '#4ade80', HIRE: '#4ade80', WEAK_HIRE: '#fbbf24', NO_HIRE: '#f87171',
};

const ANALYSIS_STATUS: Record<string, React.CSSProperties> = {
  PENDING:    { background: 'rgba(245,158,11,0.08)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.22)' },
  PROCESSING: { background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.22)' },
  DONE:       { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.22)' },
  FAILED:     { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.22)' },
};

const scoreColor = (s: number) => s >= 80 ? '#4ade80' : s >= 60 ? '#fbbf24' : '#f87171';

const Sessions: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filter) params.status = filter;
    sessionApi.list(params)
      .then(res => setSessions(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const visible = sessions.filter(s =>
    !search ||
    s.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
    s.candidate_email.toLowerCase().includes(search.toLowerCase()) ||
    s.set_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Sessions</h1>
          <p className="page-desc">
            Interview sessions created via your API keys. Analysis uses the same SYM scoring model as the main mock interview flow; re-run from the session detail page when needed.
          </p>
        </div>
        {!loading && (
          <span className="badge mt-1 text-slate-500 bg-white/5 border border-white/10 flex-shrink-0">
            {sessions.length} total
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by candidate or set…"
            className="field pl-10"
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="field" style={{ width: 'auto', minWidth: 150, flex: 'none' }}>
          <option value="">All statuses</option>
          {['PENDING','IN_PROGRESS','COMPLETED','EXPIRED','ABORTED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : visible.length === 0 ? (
        <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-20 text-center">
          <PlaySquare size={36} className="text-slate-700 mb-4" />
          <p className="text-base font-bold text-white mb-2">
            {sessions.length === 0 ? 'No sessions yet' : 'No results'}
          </p>
          <p className="text-sm text-slate-500 max-w-xs">
            {sessions.length === 0
              ? 'Create sessions via POST /api/v1/developer/sessions/ using your API key.'
              : 'Try adjusting your search or filter.'
            }
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid px-5 py-3 bg-white/[0.02] border-b border-white/[0.05]"
            style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.35fr) 104px 88px 72px 84px 20px' }}
          >
            {['Candidate', 'Set', 'Interview', 'Analysis', 'Score', 'Date', ''].map(h => (
              <span key={h} className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600">{h}</span>
            ))}
          </div>

          {visible.map((s, i) => (
            <motion.div
              key={s.room_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => navigate(`/sessions/${s.room_id}`)}
              className="grid items-center px-5 py-3.5 cursor-pointer border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors"
              style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.35fr) 104px 88px 72px 84px 20px' }}
            >
              <div className="min-w-0 pr-3">
                <p className="text-sm font-medium text-slate-100 truncate">{s.candidate_name}</p>
                <p className="text-xs text-slate-500 truncate">{s.candidate_email}</p>
              </div>
              <div className="min-w-0 pr-3">
                <p className="text-xs text-slate-400 truncate">{s.set_name}</p>
              </div>
              <div>
                <span className="badge text-[10.5px]" style={STATUS[s.status] ?? STATUS.EXPIRED}>
                  {s.status.replace('_', ' ')}
                </span>
              </div>
              <div className="min-w-0">
                <span
                  className="badge text-[10px] max-w-full truncate block"
                  style={ANALYSIS_STATUS[s.analysis_status] ?? ANALYSIS_STATUS.PENDING}
                  title={s.analysis_status}
                >
                  {s.analysis_status === 'DONE' ? 'Done' : s.analysis_status === 'PROCESSING' ? '…' : s.analysis_status}
                </span>
              </div>
              <div>
                {s.overall_score !== null ? (
                  <div>
                    <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(s.overall_score) }}>
                      {s.overall_score}
                    </span>
                    <span className="text-[10px] text-slate-600 ml-0.5">/100</span>
                    {s.verdict && (
                      <p className="text-[10px] mt-0.5" style={{ color: VERDICT_COLOR[s.verdict] ?? '#64748b' }}>
                        {s.verdict.replace(/_/g, ' ')}
                      </p>
                    )}
                  </div>
                ) : <span className="text-slate-600">—</span>}
              </div>
              <div className="text-xs text-slate-600 tabular-nums">
                {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <ChevronRight size={13} className="text-slate-600" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;

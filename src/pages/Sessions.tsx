import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, PlaySquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { sessionApi } from '../services/api';
import EmptyState from '../components/EmptyState';
import StatusBadge, { scoreColor, VERDICT_COLOR } from '../components/StatusBadge';
import { DataRow, DataTable } from '../components/DataTable';

interface Session {
  room_id: string; set_name: string; candidate_name: string;
  candidate_email: string; status: string; overall_score: number | null;
  verdict: string | null; analysis_status: string; created_at: string;
}

const COLUMNS = 'minmax(0,2fr) minmax(0,1.35fr) 104px 88px 72px 84px 20px';

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
          <span className="badge mt-1 flex-shrink-0">{sessions.length} total</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
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
        <EmptyState
          icon={PlaySquare}
          title={sessions.length === 0 ? 'No sessions yet' : 'No results'}
          description={sessions.length === 0
            ? 'Create sessions via POST /api/v1/developer/sessions/ using your API key.'
            : 'Try adjusting your search or filter.'}
        />
      ) : (
        <DataTable
          columns={COLUMNS}
          headers={['Candidate', 'Set', 'Interview', 'Analysis', 'Score', 'Date', '']}
          minWidth={860}
        >
          {visible.map((s, i) => (
            <motion.div key={s.room_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
              <DataRow columns={COLUMNS} onClick={() => navigate(`/sessions/${s.room_id}`)}>
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-medium text-sym-navy truncate">{s.candidate_name}</p>
                  <p className="text-xs text-sym-muted truncate">{s.candidate_email}</p>
                </div>
                <div className="min-w-0 pr-3">
                  <p className="text-xs text-sym-muted truncate">{s.set_name}</p>
                </div>
                <div>
                  <StatusBadge status={s.status} className="text-[10.5px]">{s.status.replace('_', ' ')}</StatusBadge>
                </div>
                <div className="min-w-0">
                  <StatusBadge status={s.analysis_status} className="text-[10px] max-w-full truncate" title={s.analysis_status}>
                    {s.analysis_status === 'DONE' ? 'Done' : s.analysis_status === 'PROCESSING' ? '…' : s.analysis_status}
                  </StatusBadge>
                </div>
                <div>
                  {s.overall_score !== null ? (
                    <div>
                      <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(s.overall_score) }}>
                        {s.overall_score}
                      </span>
                      <span className="text-[10px] text-sym-muted ml-0.5">/100</span>
                      {s.verdict && (
                        <p className="text-[10px] mt-0.5" style={{ color: VERDICT_COLOR[s.verdict] ?? '#6b7280' }}>
                          {s.verdict.replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>
                  ) : <span className="text-sym-muted">—</span>}
                </div>
                <div className="text-xs text-sym-muted tabular-nums">
                  {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <ChevronRight size={13} className="text-gray-300" />
              </DataRow>
            </motion.div>
          ))}
        </DataTable>
      )}
    </div>
  );
};

export default Sessions;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FolderOpen, Key, PlaySquare, BookOpen, FlaskConical, CheckCircle, TrendingUp } from 'lucide-react';
import { dashboardApi } from '../services/api';
import { getUser } from '../services/auth';
import Alert from '../components/Alert';

interface Stats {
  total_sessions: number;
  completed_sessions: number;
  in_progress_sessions: number;
  sessions_this_month: number;
  average_score: number | null;
  total_question_sets: number;
  active_question_sets: number;
  api_keys_active: number;
  limits: { max_questions_per_set: number; sessions_per_day: number; sessions_per_month: number };
}

const KPI: React.FC<{ label: string; value: string | number; note: string; accent?: boolean }> = ({
  label, value, note, accent
}) => (
  <div className="glass-card rounded-xl p-6 flex flex-col justify-between" style={{ minHeight: 140 }}>
    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400 mb-4">{label}</p>
    <div>
      <p
        className={`font-display font-bold leading-none tabular-nums mb-2 ${accent ? 'text-sym-gold-dark' : 'text-sym-navy'}`}
        style={{ fontSize: 40, letterSpacing: '-0.03em' }}
      >
        {value}
      </p>
      <p className="text-xs text-sym-muted">{note}</p>
    </div>
  </div>
);

const QuotaBar: React.FC<{ label: string; used: number; limit: number }> = ({ label, used, limit }) => {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const color = pct >= 90 ? '#b91c1c' : pct >= 70 ? '#92400e' : '#012a6c';
  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-xs font-mono text-sym-muted tabular-nums">{used} / {limit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(to right, ${color}, ${color}cc)` }}
        />
      </div>
    </div>
  );
};

const QuickAction: React.FC<{ to: string; icon: React.ElementType; label: string; desc: string }> = ({
  to, icon: Icon, label, desc
}) => (
  <Link
    to={to}
    className="flex items-center gap-3 py-3 px-1 border-b border-gray-100 group transition-all last:border-0"
  >
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-sym-navy-tint border border-sym-navy/10 group-hover:bg-sym-navy group-hover:border-sym-navy transition-all">
      <Icon size={14} className="text-sym-navy group-hover:text-sym-gold transition-colors" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-sym-navy">{label}</p>
      <p className="text-xs text-sym-muted">{desc}</p>
    </div>
    <ArrowRight size={13} className="text-gray-300 group-hover:text-sym-navy group-hover:translate-x-0.5 transition-all" />
  </Link>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    dashboardApi.stats()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.full_name?.split(' ')[0] ?? 'Developer';

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-sym-gold" />
          <span className="text-xs text-sym-muted font-medium">{greeting}</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-sym-navy" style={{ letterSpacing: '-0.025em' }}>
          {firstName}
        </h1>
        <p className="text-sym-muted text-sm mt-1">{user?.organization_name} · Developer Account</p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            {[1,2].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
          </div>
        </div>
      ) : stats ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <KPI label="Total Sessions" value={stats.total_sessions} note="all time" />
            <KPI
              label="Completed"
              value={stats.completed_sessions}
              note={`${stats.total_sessions > 0 ? Math.round((stats.completed_sessions / stats.total_sessions) * 100) : 0}% rate`}
            />
            <KPI
              label="Avg Score"
              value={stats.average_score ?? '—'}
              note="out of 100"
              accent={stats.average_score !== null && stats.average_score >= 70}
            />
            <KPI label="Active Keys" value={stats.api_keys_active} note={`${stats.active_question_sets} sets`} />
          </div>

          {/* Second row */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Quota */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-sym-navy font-display">API Quota</h2>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-emerald-700" />
                  <span className="text-[11px] text-sym-muted">Operational</span>
                </div>
              </div>
              <QuotaBar label="Sessions today" used={0} limit={stats.limits.sessions_per_day} />
              <QuotaBar label="Sessions this month" used={stats.sessions_this_month} limit={stats.limits.sessions_per_month} />
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-700">Max questions / set</span>
                <span className="text-sm font-bold text-sym-navy tabular-nums">{stats.limits.max_questions_per_set}</span>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h2 className="text-sm font-bold text-sym-navy font-display mb-4">Quick Actions</h2>
              <QuickAction to="/sets"     icon={FolderOpen}   label="Question Sets"  desc="Create and manage interview sets" />
              <QuickAction to="/api-keys" icon={Key}          label="API Keys"       desc="Manage credentials" />
              <QuickAction to="/sessions" icon={PlaySquare}   label="Sessions"       desc="Browse interview history" />
              <QuickAction to="/progress-reports" icon={TrendingUp} label="Progress reports" desc="Batch timing & trajectory narratives" />
              <QuickAction to="/docs"     icon={BookOpen}     label="API Reference"  desc="Endpoint documentation" />
              <QuickAction to="/sandbox"  icon={FlaskConical} label="Sandbox"        desc="Test live API requests" />
            </div>
          </div>

          {/* Active sessions banner */}
          {stats.in_progress_sessions > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Alert tone="info" className="justify-between">
                <div className="flex items-center justify-between gap-4 w-full">
                  <p>
                    <strong>{stats.in_progress_sessions}</strong> session{stats.in_progress_sessions !== 1 ? 's' : ''} currently in progress
                  </p>
                  <Link to="/sessions" className="text-xs font-semibold text-sym-navy flex items-center gap-1">
                    View <ArrowRight size={11} />
                  </Link>
                </div>
              </Alert>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <Alert>Failed to load dashboard data.</Alert>
      )}
    </div>
  );
};

export default Dashboard;

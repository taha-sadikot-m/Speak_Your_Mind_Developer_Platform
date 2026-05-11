import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FolderOpen, Key, PlaySquare, BookOpen, FlaskConical, CheckCircle, TrendingUp } from 'lucide-react';
import { dashboardApi } from '../services/api';
import { getUser } from '../services/auth';

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
  <div className="glass-card rounded-2xl p-6 flex flex-col justify-between" style={{ minHeight: 140 }}>
    <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-4">{label}</p>
    <div>
      <p
        className={`font-display font-bold leading-none tabular-nums mb-2 ${accent ? 'text-brand-400' : 'text-white'}`}
        style={{ fontSize: 40, letterSpacing: '-0.03em' }}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500">{note}</p>
    </div>
  </div>
);

const QuotaBar: React.FC<{ label: string; used: number; limit: number }> = ({ label, used, limit }) => {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#0ea5e9';
  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-xs font-mono text-slate-500 tabular-nums">{used} / {limit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5">
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
    className="flex items-center gap-3 py-3 px-1 border-b border-white/[0.05] group transition-all last:border-0"
  >
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 group-hover:border-brand-500/30 group-hover:bg-brand-500/5 transition-all">
      <Icon size={14} className="text-slate-400 group-hover:text-brand-400 transition-colors" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{label}</p>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
    <ArrowRight size={13} className="text-slate-600 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
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
      {/* Blobs */}
      <div className="fixed top-0 left-1/3 w-72 h-72 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none animate-blob" />
      <div className="fixed bottom-0 right-1/4 w-72 h-72 bg-accent-600/10 rounded-full blur-[100px] pointer-events-none animate-blob animation-delay-2000" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
          </span>
          <span className="text-xs text-slate-500 font-medium">{greeting}</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white" style={{ letterSpacing: '-0.025em' }}>
          {firstName}
        </h1>
        <p className="text-slate-400 text-sm mt-1">{user?.organization_name} · Developer Account</p>
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
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-white font-display">API Quota</h2>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-green-400" />
                  <span className="text-[11px] text-slate-500">Operational</span>
                </div>
              </div>
              <QuotaBar label="Sessions today" used={0} limit={stats.limits.sessions_per_day} />
              <QuotaBar label="Sessions this month" used={stats.sessions_this_month} limit={stats.limits.sessions_per_month} />
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <span className="text-sm text-slate-300">Max questions / set</span>
                <span className="text-sm font-bold text-white tabular-nums">{stats.limits.max_questions_per_set}</span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white font-display mb-4">Quick Actions</h2>
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
              className="mt-4 glass-card rounded-xl px-5 py-3.5 flex items-center justify-between border-blue-500/20"
              style={{ borderColor: 'rgba(59,130,246,0.2)' }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <p className="text-sm text-slate-300">
                  <strong className="text-white">{stats.in_progress_sessions}</strong> session{stats.in_progress_sessions !== 1 ? 's' : ''} currently in progress
                </p>
              </div>
              <Link to="/sessions" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                View <ArrowRight size={11} />
              </Link>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <p className="text-slate-500 text-sm">Failed to load dashboard data.</p>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Copy, Check, Trash2, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { apiKeyApi } from '../services/api';

interface APIKey {
  id: string; label: string; key_prefix: string; mode: 'SANDBOX' | 'LIVE';
  is_active: boolean; requests_per_minute: number;
  requests_today: number; requests_this_month: number;
  last_used_at: string | null; created_at: string;
}

const ModePill: React.FC<{ mode: string }> = ({ mode }) => (
  <span
    className="badge text-[10.5px]"
    style={mode === 'LIVE'
      ? { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }
      : { background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }
    }
  >
    {mode}
  </span>
);

const CopyBtn: React.FC<{ text: string }> = ({ text }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      className="btn-ghost py-1 px-2"
    >
      {done ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
    </button>
  );
};

/* Create form */
const CreateForm: React.FC<{
  onDone: (data: { key: string; webhook_secret: string; label: string } | null) => void;
}> = ({ onDone }) => {
  const [form, setForm] = useState({ label: '', mode: 'SANDBOX', requests_per_minute: 30 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) { setError('Label is required.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await apiKeyApi.create(form as any);
      onDone({ key: res.data.data.key, webhook_secret: res.data.data.webhook_secret, label: form.label });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create key.');
    } finally { setLoading(false); }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="glass-card rounded-2xl p-6 mb-5"
    >
      <h3 className="text-sm font-bold text-white font-display mb-5">New API Key</h3>
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-300">
          {error}
        </div>
      )}
      <div className="flex gap-3 flex-wrap mb-5">
        <div className="flex-1 min-w-40 space-y-1.5">
          <label className="label">Label</label>
          <input
            value={form.label}
            onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
            placeholder="e.g. Production"
            className="field"
          />
        </div>
        <div className="w-32 space-y-1.5">
          <label className="label">Mode</label>
          <select value={form.mode} onChange={e => setForm(p => ({ ...p, mode: e.target.value }))} className="field">
            <option value="SANDBOX">Sandbox</option>
            <option value="LIVE">Live</option>
          </select>
        </div>
        <div className="w-28 space-y-1.5">
          <label className="label">Req / min</label>
          <input
            type="number" min={1} max={600}
            value={form.requests_per_minute}
            onChange={e => setForm(p => ({ ...p, requests_per_minute: +e.target.value }))}
            className="field"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary py-2.5 px-5 text-sm">
          {loading ? 'Creating…' : 'Create Key'}
        </button>
        <button type="button" onClick={() => onDone(null)} className="btn-secondary py-2.5 px-5 text-sm">
          Cancel
        </button>
      </div>
    </motion.form>
  );
};

/* Revealed banner */
const RevealedBanner: React.FC<{
  data: { key: string; webhook_secret: string; label: string };
  onClose: () => void;
}> = ({ data, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-5 rounded-2xl p-6"
    style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}
  >
    <div className="flex items-start justify-between mb-3">
      <p className="text-sm font-bold text-white">"{data.label}" created — save these values now</p>
      <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Dismiss</button>
    </div>
    <p className="text-xs text-slate-400 mb-5 leading-relaxed">
      These values are shown <strong className="text-slate-200">only once</strong>. Store them securely before closing this banner.
    </p>
    {[{ label: 'API Key', value: data.key }, { label: 'Webhook Secret', value: data.webhook_secret }].map(({ label, value }) => (
      <div key={label} className="mb-3">
        <p className="label mb-2">{label}</p>
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 bg-slate-900/60 border border-white/10">
          <code className="flex-1 text-xs font-mono text-slate-300 break-all leading-relaxed">{value}</code>
          <CopyBtn text={value} />
        </div>
      </div>
    ))}
  </motion.div>
);

/* Key row */
const KeyRow: React.FC<{ apiKey: APIKey; onRefresh: () => void }> = ({ apiKey: k, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await apiKeyApi.update(k.id, { is_active: !k.is_active });
    onRefresh();
  };
  const del = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Revoke "${k.label}"? This is permanent.`)) return;
    await apiKeyApi.revoke(k.id); onRefresh();
  };

  return (
    <div
      className="border-b border-white/[0.05] last:border-0"
      style={{ opacity: k.is_active ? 1 : 0.5 }}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <Shield size={14} className={k.is_active ? 'text-brand-400' : 'text-slate-600'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-white">{k.label}</span>
            <ModePill mode={k.mode} />
            {!k.is_active && (
              <span className="badge text-[10px] bg-white/5 text-slate-500 border border-white/10">revoked</span>
            )}
          </div>
          <code className="text-[11px] font-mono text-slate-600 tracking-wider">
            {k.key_prefix}{'•'.repeat(20)}
          </code>
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={toggle} className="btn-ghost text-xs py-1 px-3">
            {k.is_active ? 'Disable' : 'Enable'}
          </button>
          <button onClick={del} className="btn-danger py-1 px-2">
            <Trash2 size={12} />
          </button>
        </div>
        {expanded
          ? <ChevronUp size={13} className="text-slate-600 flex-shrink-0" />
          : <ChevronDown size={13} className="text-slate-600 flex-shrink-0" />
        }
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 px-5 py-4 bg-white/[0.02] border-t border-white/[0.04]">
              {[
                { label: 'Requests today',    value: k.requests_today },
                { label: 'This month',        value: k.requests_this_month },
                { label: 'Rate limit',        value: `${k.requests_per_minute}/min` },
              ].map(({ label, value }, i) => (
                <div key={label} className={i < 2 ? 'border-r border-white/[0.06] pr-4 mr-4' : ''}>
                  <p className="text-[10.5px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-xl font-bold font-display text-white tabular-nums">{value}</p>
                </div>
              ))}
              {k.last_used_at && (
                <p className="col-span-3 mt-3 pt-3 border-t border-white/[0.04] text-[11px] text-slate-600">
                  Last used {new Date(k.last_used_at).toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Page */
const APIKeys: React.FC = () => {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [revealed, setRevealed] = useState<{ key: string; webhook_secret: string; label: string } | null>(null);

  const fetchKeys = () => {
    apiKeyApi.list().then(r => setKeys(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchKeys(); }, []);

  const handleCreated = (data: typeof revealed) => {
    setShowCreate(false);
    if (data) { setRevealed(data); fetchKeys(); }
  };

  return (
    <div className="page">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">API Keys</h1>
          <p className="page-desc">Credentials for authenticating public API requests.</p>
        </div>
        {!showCreate && (
          <button onClick={() => { setShowCreate(true); setRevealed(null); }} className="btn-primary py-2.5 px-5 text-sm flex-shrink-0">
            <Plus size={14} /> New Key
          </button>
        )}
      </div>

      {revealed && <RevealedBanner data={revealed} onClose={() => setRevealed(null)} />}
      {showCreate && <CreateForm onDone={handleCreated} />}

      {/* Usage snippet */}
      <div className="glass-card rounded-xl px-4 py-3 mb-5">
        <code className="text-xs font-mono text-slate-400 break-all">
          <span className="text-slate-200">curl </span>
          <span className="text-brand-400">-H</span>
          {' "X-API-Key: sym_live_…" '}
          <span className="text-slate-600">https://api.speakyourmind.app/api/v1/developer/sessions/</span>
        </code>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : keys.length === 0 ? (
        <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-16 px-8 text-center">
          <Shield size={32} className="text-slate-700 mb-4" />
          <p className="text-base font-bold text-white mb-2">No API keys yet</p>
          <p className="text-sm text-slate-500">Create your first key to start building with the SYM API.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {keys.map(k => <KeyRow key={k.id} apiKey={k} onRefresh={fetchKeys} />)}
        </div>
      )}
    </div>
  );
};

export default APIKeys;

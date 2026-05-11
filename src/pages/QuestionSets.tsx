import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, ChevronRight, FolderOpen } from 'lucide-react';
import { setApi } from '../services/api';

interface QuestionSet {
  id: string; name: string; description: string;
  logo_url: string; question_count_limit: number; is_active: boolean;
  question_count: number; created_at: string;
}

const QuestionSets: React.FC = () => {
  const navigate = useNavigate();
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', logo_url: '', question_count_limit: 5 });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchSets = () => {
    setApi.list().then(res => setSets(res.data.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchSets(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setError(''); setCreating(true);
    try {
      const res = await setApi.create(form);
      navigate(`/sets/${res.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create set.');
    } finally { setCreating(false); }
  };

  const handleDelete = async (s: QuestionSet, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${s.name}"?`)) return;
    try { await setApi.delete(s.id); fetchSets(); } catch {}
  };

  const f = (key: keyof typeof form) => ({
    value: form[key] as string | number,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: key === 'question_count_limit' ? +e.target.value : e.target.value })),
  });

  return (
    <div className="page">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Question Sets</h1>
          <p className="page-desc">Define interview question sets. Each set maps to a <code className="icode">set_id</code> in the API.</p>
        </div>
        {!showCreate && (
          <button onClick={() => setShowCreate(true)} className="btn-primary py-2.5 px-5 text-sm flex-shrink-0">
            <Plus size={14} /> New Set
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="glass-card rounded-2xl p-6 mb-5"
        >
          <h3 className="text-sm font-bold text-white font-display mb-5">New Question Set</h3>
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-300">{error}</div>
          )}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="label">Name <span className="text-red-400">*</span></label>
              <input {...f('name')} type="text" placeholder="Frontend Engineer Interview" className="field" />
            </div>
            <div className="space-y-1.5">
              <label className="label">Logo URL</label>
              <input {...f('logo_url')} type="url" placeholder="https://…/logo.png" className="field" />
            </div>
            <div className="space-y-1.5">
              <label className="label">Max questions</label>
              <input {...f('question_count_limit')} type="number" min={1} className="field" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="label">Description</label>
              <textarea {...f('description')} placeholder="Describe this interview set…" rows={2} className="field resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="btn-primary py-2.5 px-5 text-sm">
              {creating ? 'Creating…' : 'Create & Add Questions'}
            </button>
            <button type="button" onClick={() => { setShowCreate(false); setError(''); }} className="btn-secondary py-2.5 px-5 text-sm">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : sets.length === 0 ? (
        <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen size={36} className="text-slate-700 mb-4" />
          <p className="text-base font-bold text-white mb-2">No question sets</p>
          <p className="text-sm text-slate-500 max-w-xs">Create a set and add interview questions to start creating sessions.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="grid px-5 py-3 bg-white/[0.02] border-b border-white/[0.05]"
            style={{ gridTemplateColumns: '2fr 140px 80px 56px' }}
          >
            {['Name', 'Questions', 'Status', ''].map(h => (
              <span key={h} className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600">{h}</span>
            ))}
          </div>
          {sets.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/sets/${s.id}`)}
              className="grid items-center px-5 py-4 cursor-pointer border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors"
              style={{ gridTemplateColumns: '2fr 140px 80px 56px', opacity: s.is_active ? 1 : 0.5 }}
            >
              <div className="min-w-0 pr-3">
                <p className="text-sm font-semibold text-white truncate">{s.name}</p>
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-sm font-bold text-white tabular-nums">{s.question_count}</span>
                  <span className="text-xs text-slate-600">/ {s.question_count_limit}</span>
                </div>
                <div className="h-1 w-16 rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-600 transition-all"
                    style={{ width: `${s.question_count_limit > 0 ? (s.question_count / s.question_count_limit) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <span
                  className="badge text-[10.5px]"
                  style={s.is_active
                    ? { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }
                    : { background: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={e => handleDelete(s, e)} className="btn-danger py-1 px-2"><Trash2 size={12} /></button>
                <ChevronRight size={13} className="text-slate-600" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionSets;

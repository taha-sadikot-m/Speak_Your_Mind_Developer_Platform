import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, ChevronRight, FolderOpen } from 'lucide-react';
import { setApi } from '../services/api';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { DataRow, DataTable } from '../components/DataTable';

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
          className="glass-card rounded-xl p-6 mb-5"
        >
          <h3 className="text-sm font-bold text-sym-navy font-display mb-5">New Question Set</h3>
          {error && <Alert className="mb-4">{error}</Alert>}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="label">Name <span className="text-red-700">*</span></label>
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
        <EmptyState
          icon={FolderOpen}
          title="No question sets"
          description="Create a set and add interview questions to start creating sessions."
        />
      ) : (
        <DataTable columns="2fr 140px 80px 56px" headers={['Name', 'Questions', 'Status', '']} minWidth={560}>
          {sets.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
              <DataRow
                columns="2fr 140px 80px 56px"
                onClick={() => navigate(`/sets/${s.id}`)}
                style={{ opacity: s.is_active ? 1 : 0.5 }}
              >
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-semibold text-sym-navy truncate">{s.name}</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-sm font-bold text-sym-navy tabular-nums">{s.question_count}</span>
                    <span className="text-xs text-sym-muted">/ {s.question_count_limit}</span>
                  </div>
                  <div className="h-1 w-16 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-sym-navy transition-all"
                      style={{ width: `${s.question_count_limit > 0 ? (s.question_count / s.question_count_limit) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <StatusBadge status={s.is_active ? 'ACTIVE' : 'EXPIRED'}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </div>
                <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={e => handleDelete(s, e)} className="btn-danger py-1 px-2"><Trash2 size={12} /></button>
                  <ChevronRight size={13} className="text-gray-300" />
                </div>
              </DataRow>
            </motion.div>
          ))}
        </DataTable>
      )}
    </div>
  );
};

export default QuestionSets;

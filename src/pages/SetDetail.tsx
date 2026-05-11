import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Save, Copy, Check, Loader2 } from 'lucide-react';
import { setApi } from '../services/api';

interface Question {
  id: string; text: string; question_type: string; order: number; time_limit_seconds: number;
}
interface QuestionSet {
  id: string; name: string; description: string;
  logo_url: string; question_count_limit: number; is_active: boolean;
  question_count: number; questions: Question[];
}

const TYPES = ['BEHAVIORAL', 'TECHNICAL', 'SITUATIONAL', 'CUSTOM'];

const SetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [set, setSet] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setApi.get(id)
      .then(res => {
        const data: QuestionSet = res.data.data;
        setSet(data);
        setQuestions(data.questions.map(q => ({
          text: q.text, question_type: q.question_type, order: q.order, time_limit_seconds: q.time_limit_seconds,
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const addQ   = () => setQuestions(prev => [...prev, { text: '', question_type: 'BEHAVIORAL', order: prev.length, time_limit_seconds: 120 }]);
  const removeQ = (i: number) => setQuestions(prev => prev.filter((_, idx) => idx !== i).map((q, idx) => ({ ...q, order: idx })));
  const updateQ = (i: number, key: string, value: string | number) =>
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [key]: value } : q));

  const handleSave = async () => {
    if (!id) return;
    const empty = questions.findIndex(q => !q.text.trim());
    if (empty !== -1) { setError(`Question ${empty + 1} cannot be empty.`); return; }
    setError(''); setSaving(true);
    try {
      await setApi.replaceQuestions(id, questions.map((q, i) => ({ ...q, order: i })));
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save questions.');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-72">
      <Loader2 size={20} className="animate-spin text-brand-400" />
    </div>
  );
  if (!set) return (
    <div className="page">
      <button onClick={() => navigate('/sets')} className="btn-ghost mb-4"><ArrowLeft size={13} /> Sets</button>
      <p className="text-slate-500 text-sm">Question set not found.</p>
    </div>
  );

  const atLimit = questions.length >= set.question_count_limit;

  return (
    <div className="page" >
      <button onClick={() => navigate('/sets')} className="btn-ghost mb-5 -ml-1"><ArrowLeft size={13} /> Sets</button>

      {/* Set info card */}
      <div className="glass-card rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-display font-bold text-white mb-1">{set.name}</h1>
            {set.description && <p className="text-sm text-slate-400 mb-3">{set.description}</p>}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-600">set_id</span>
              <code className="text-[11px] font-mono text-slate-400">{set.id}</code>
              <button
                onClick={() => { navigator.clipboard.writeText(set.id); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="btn-ghost py-0.5 px-1.5"
              >
                {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-slate-500 tabular-nums">{questions.length} / {set.question_count_limit}</span>
            <button onClick={handleSave} disabled={saving} className="btn-primary py-2.5 px-5 text-sm">
              {saving ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
               : saved ? <><Check size={12} /> Saved</>
               : <><Save size={12} /> Save</>}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      {/* Questions */}
      <div className="space-y-3 mb-3">
        {questions.length === 0 && (
          <div className="glass-card rounded-2xl py-14 text-center">
            <p className="text-sm text-slate-500">No questions yet. Add your first question below.</p>
          </div>
        )}
        {questions.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.05]">
              <span className="text-[11px] font-mono font-bold text-slate-600 w-5">{String(i + 1).padStart(2, '0')}</span>
              <select
                value={q.question_type}
                onChange={e => updateQ(i, 'question_type', e.target.value)}
                className="field py-1 px-2 text-xs"
                style={{ width: 'auto', flex: 'none' }}
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Limit</span>
                <input
                  type="number" min={10} max={600}
                  value={q.time_limit_seconds}
                  onChange={e => updateQ(i, 'time_limit_seconds', +e.target.value)}
                  className="field py-1 px-2 text-xs text-center font-mono"
                  style={{ width: 60, flex: 'none' }}
                />
                <span>sec</span>
              </div>
              <div className="flex-1" />
              <button onClick={() => removeQ(i)} className="btn-danger py-1 px-2"><Trash2 size={12} /></button>
            </div>
            {/* Text */}
            <textarea
              value={q.text}
              onChange={e => updateQ(i, 'text', e.target.value)}
              placeholder="Enter your interview question…"
              rows={2}
              className="w-full bg-transparent outline-none px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-y font-sans leading-relaxed"
              style={{ caretColor: '#0ea5e9' }}
            />
          </motion.div>
        ))}
      </div>

      {/* Add / limit */}
      {!atLimit ? (
        <button
          onClick={addQ}
          className="w-full py-3 rounded-xl text-sm text-slate-500 border border-dashed border-white/10 hover:border-brand-500/40 hover:text-brand-400 hover:bg-brand-500/5 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Question
        </button>
      ) : (
        <p className="text-center text-xs text-slate-600 py-3">
          Maximum {set.question_count_limit} questions reached for your plan.
        </p>
      )}
    </div>
  );
};

export default SetDetail;

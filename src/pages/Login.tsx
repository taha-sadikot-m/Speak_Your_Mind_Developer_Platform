import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Zap, BarChart2 } from 'lucide-react';
import { authApi } from '../services/api';
import { saveSession } from '../services/auth';
import Alert from '../components/Alert';

const FEATURES = [
  { icon: Zap, label: 'Programmatic sessions' },
  { icon: BarChart2, label: 'AI analysis' },
  { icon: ShieldCheck, label: 'Secure API keys' },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      saveSession(res.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Incorrect email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sym-surface flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-xl shadow-sym-navy/10 overflow-hidden grid lg:grid-cols-2 min-h-[520px]">
        <div className="hidden lg:flex flex-col justify-between bg-sym-navy text-white p-10">
          <img src="/images/sym-logo.png" alt="Speak Your Mind" className="h-12 w-auto object-contain self-start bg-white rounded-lg px-3 py-1" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sym-gold mb-3">Developer Portal</p>
            <h1 className="text-4xl font-display font-bold text-white leading-tight">Build interviews on SYM.</h1>
            <p className="mt-4 text-white/80 text-sm leading-relaxed">
              Question sets, API keys, candidate rooms, and analysis reports for partner teams.
            </p>
          </div>
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-white/85">
                <Icon size={16} className="text-sym-gold" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 lg:p-10 relative">
          <div className="gradient-topline lg:hidden" />
          <div className="lg:hidden flex justify-center mb-6">
            <img src="/images/sym-logo.png" alt="Speak Your Mind" className="h-12 w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-display font-bold text-sym-navy mb-2">Sign in</h2>
          <p className="text-sym-muted text-sm mb-8">Use the developer account issued by your SYM administrator.</p>

          {error && <Alert className="mb-5">{error}</Alert>}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="dev@company.com"
                  className="field field-icon"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="field field-icon"
                />
              </div>
            </div>
            <button type="submit" disabled={loading || !email || !password} className="btn-primary w-full py-3.5">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>
          <p className="mt-6 pt-6 border-t border-gray-200 text-xs text-sym-muted text-center">
            Credentials are provisioned by your SYM system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

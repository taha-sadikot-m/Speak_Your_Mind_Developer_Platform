import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, ArrowRight, Loader2, Mic2,
  AlertCircle, ShieldCheck, Zap, BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '../services/api';
import { saveSession } from '../services/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

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
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-4">

      {/* Background grid — matches main frontend exactly */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
          maskImage: 'radial-gradient(ellipse at center, transparent 20%, black)',
        }}
      />

      {/* Animated blobs — matches main frontend */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[128px] animate-blob pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-[128px] animate-blob animation-delay-2000 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative group cursor-pointer" onClick={() => navigate('/login')}>
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-accent-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-200" />
            <div className="relative bg-slate-900 p-3 rounded-full text-white border border-slate-700">
              <Mic2 size={28} />
            </div>
          </div>
        </div>

        {/* Card — glass-card matching main frontend */}
        <div className="glass-card p-8 md:p-10 rounded-3xl relative overflow-hidden">
          {/* Top gradient line */}
          <div className="gradient-topline" />

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-white mb-2">Developer Portal</h2>
            <p className="text-slate-400 text-sm">Sign in with your developer account credentials.</p>
          </div>

          {/* Features row */}
          <div className="flex gap-3 mb-8 justify-center flex-wrap">
            {[
              { icon: Zap,       label: 'Programmatic Sessions' },
              { icon: BarChart2, label: 'AI Analysis'           },
              { icon: ShieldCheck, label: 'Secure API Keys'     },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300"
              >
                <Icon size={11} className="text-brand-400" />
                {label}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 mb-5"
            >
              <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="label">Email address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={17} className="text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
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

            <div className="space-y-1.5">
              <label className="label">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={17} className="text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
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

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full py-3.5"
            >
              {loading
                ? <Loader2 size={18} className="animate-spin" />
                : <><span>Sign In</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-xs text-slate-500">
              Credentials are provisioned by your SYM system administrator.
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-8 text-center text-slate-600 text-xs">
          By signing in you agree to the SYM{' '}
          <a href="#" className="text-slate-400 hover:text-white underline transition-colors">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-slate-400 hover:text-white underline transition-colors">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

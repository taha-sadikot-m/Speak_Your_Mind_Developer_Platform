import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Key, FolderOpen, PlaySquare,
  LogOut, Menu, X, BookOpen, FlaskConical, Mic2, TrendingUp
} from 'lucide-react';
import { logout, getUser } from '../services/auth';

const NAV_PRIMARY = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sets',      icon: FolderOpen,      label: 'Question Sets' },
  { to: '/api-keys',  icon: Key,             label: 'API Keys' },
  { to: '/sessions',  icon: PlaySquare,      label: 'Sessions' },
  { to: '/progress-reports', icon: TrendingUp, label: 'Progress reports' },
];

const NAV_DEV = [
  { to: '/docs',    icon: BookOpen,     label: 'API Reference' },
  { to: '/sandbox', icon: FlaskConical, label: 'Sandbox' },
];

const NavItem: React.FC<{
  to: string; icon: React.ElementType; label: string; onClick?: () => void;
}> = ({ to, icon: Icon, label, onClick }) => (
  <NavLink to={to} onClick={onClick} end={to === '/dashboard'}>
    {({ isActive }) => (
      <div
        className={`
          flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm font-medium
          transition-all duration-150 cursor-pointer select-none
          ${isActive
            ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
          }
        `}
      >
        <Icon size={15} className={isActive ? 'text-brand-400' : 'text-slate-500'} />
        <span>{label}</span>
      </div>
    )}
  </NavLink>
);

const SidebarContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const user = getUser();
  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = (user?.full_name ?? 'Dev')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full glass-nav">

      {/* Wordmark */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-accent-500 rounded-full blur opacity-50"></div>
            <div className="relative bg-slate-900 p-1.5 rounded-full border border-slate-700">
              <Mic2 size={16} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-white font-display leading-none">SYM</p>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">DevPortal</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-4">
        <div>
          <p className="px-5 mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">
            Platform
          </p>
          {NAV_PRIMARY.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}
        </div>
        <div className="border-t border-white/[0.05] pt-4">
          <p className="px-5 mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">
            Developer
          </p>
          {NAV_DEV.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-gradient-to-br from-brand-500 to-accent-600 text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{user?.full_name}</p>
            <p className="text-[11px] text-slate-500 truncate leading-tight">{user?.organization_name}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn-ghost w-full justify-start text-[13px] text-slate-500 hover:text-red-400"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block flex-shrink-0 w-56">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: -224 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10 w-56 h-full"
          >
            <SidebarContent onClose={() => setOpen(false)} />
          </motion.aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 glass-nav border-b border-white/[0.06]">
          <button onClick={() => setOpen(true)} className="text-slate-400">
            <Menu size={18} />
          </button>
          <span className="text-sm font-bold text-white font-display">SYM DevPortal</span>
        </div>

        <main className="flex-1 overflow-y-auto relative">
          {/* Subtle grid overlay on all pages */}
          <div
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.03)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
              maskImage: 'radial-gradient(ellipse at 50% 0%, transparent 20%, black)',
            }}
          />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

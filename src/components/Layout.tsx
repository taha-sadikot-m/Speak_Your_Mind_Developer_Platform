import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Key, FolderOpen, PlaySquare,
  LogOut, Menu, X, BookOpen, FlaskConical, TrendingUp
} from 'lucide-react';
import { logout, getUser } from '../services/auth';

const NAV_PRIMARY = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sets', icon: FolderOpen, label: 'Question Sets' },
  { to: '/api-keys', icon: Key, label: 'API Keys' },
  { to: '/sessions', icon: PlaySquare, label: 'Sessions' },
  { to: '/progress-reports', icon: TrendingUp, label: 'Progress reports' },
];

const NAV_DEV = [
  { to: '/docs', icon: BookOpen, label: 'API Reference' },
  { to: '/sandbox', icon: FlaskConical, label: 'Sandbox' },
];

const NavItem: React.FC<{
  to: string; icon: React.ElementType; label: string; onClick?: () => void;
}> = ({ to, icon: Icon, label, onClick }) => (
  <NavLink to={to} onClick={onClick} end={to === '/dashboard'}>
    {({ isActive }) => (
      <div
        className={`
          flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm font-medium
          transition-colors cursor-pointer select-none border
          ${isActive
            ? 'bg-sym-navy text-white border-sym-navy'
            : 'text-sym-muted hover:text-sym-navy hover:bg-sym-navy/5 border-transparent'
          }
        `}
      >
        <Icon size={15} className={isActive ? 'text-sym-gold' : 'text-sym-muted'} />
        <span>{label}</span>
      </div>
    )}
  </NavLink>
);

const Brand: React.FC = () => (
  <div className="flex items-center gap-2.5 min-w-0">
    <img src="/images/sym-logo.png" alt="Speak Your Mind" className="h-9 w-auto object-contain" />
    <div className="min-w-0">
      <p className="text-sm font-bold text-sym-navy font-display leading-none">Developer Portal</p>
      <p className="text-[10px] text-sym-muted leading-none mt-1">Speak Your Mind</p>
    </div>
  </div>
);

const SidebarContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const user = getUser();
  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = (user?.full_name ?? 'Dev')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <Brand />
        {onClose && (
          <button onClick={onClose} className="text-sym-muted hover:text-sym-navy min-h-[44px] min-w-[44px]">
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto space-y-4">
        <div>
          <p className="px-5 mb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400">Platform</p>
          {NAV_PRIMARY.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}
        </div>
        <div className="border-t border-gray-200 pt-4">
          <p className="px-5 mb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-gray-400">Developer</p>
          {NAV_DEV.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}
        </div>
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-sym-gold text-sym-navy">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sym-navy truncate leading-tight">{user?.full_name}</p>
            <p className="text-[11px] text-sym-muted truncate leading-tight">{user?.organization_name}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn-ghost w-full justify-start text-[13px] text-red-600 hover:bg-red-50 hover:text-red-600"
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
    <div className="flex h-screen overflow-hidden bg-sym-surface">
      <aside className="hidden lg:block flex-shrink-0 w-60">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10 w-60 h-full"
          >
            <SidebarContent onClose={() => setOpen(false)} />
          </motion.aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setOpen(true)} className="text-sym-navy min-h-[44px] min-w-[44px]" aria-label="Open menu">
            <Menu size={18} />
          </button>
          <Brand />
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

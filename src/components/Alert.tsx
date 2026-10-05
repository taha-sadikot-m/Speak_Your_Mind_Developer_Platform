import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

type AlertTone = 'error' | 'success' | 'warning' | 'info';

const TONE: Record<AlertTone, string> = {
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  info: 'bg-sym-navy-tint text-sym-navy border-sym-navy/15',
};

const Alert: React.FC<{ tone?: AlertTone; children: React.ReactNode; className?: string }> = ({
  tone = 'error', children, className = '',
}) => {
  const Icon = tone === 'success' ? CheckCircle : tone === 'info' ? Info : AlertCircle;
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${TONE[tone]} ${className}`}>
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export default Alert;

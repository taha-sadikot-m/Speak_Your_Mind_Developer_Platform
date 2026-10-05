import React from 'react';

export type BadgeTone = 'success' | 'warning' | 'error' | 'neutral' | 'info';

export const TONE_STYLE: Record<BadgeTone, React.CSSProperties> = {
  success: { background: 'rgba(16, 185, 129, 0.12)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.25)' },
  warning: { background: 'rgba(254, 213, 1, 0.20)', color: '#92400e', border: '1px solid rgba(254, 213, 1, 0.40)' },
  error: { background: 'rgba(239, 68, 68, 0.10)', color: '#b91c1c', border: '1px solid rgba(239, 68, 68, 0.25)' },
  neutral: { background: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' },
  info: { background: 'rgba(1, 42, 108, 0.08)', color: '#012a6c', border: '1px solid rgba(1, 42, 108, 0.15)' },
};

export const scoreColor = (score: number) => (score >= 80 ? '#047857' : score >= 60 ? '#92400e' : '#b91c1c');

export const VERDICT_COLOR: Record<string, string> = {
  STRONG_HIRE: '#047857',
  HIRE: '#047857',
  WEAK_HIRE: '#92400e',
  NO_HIRE: '#b91c1c',
};

export function toneForStatus(status: string): BadgeTone {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
    case 'DONE':
    case 'ACTIVE':
    case 'STRONG_HIRE':
    case 'HIRE':
    case 'GET':
      return 'success';
    case 'PENDING':
    case 'WEAK_HIRE':
      return 'warning';
    case 'IN_PROGRESS':
    case 'PROCESSING':
    case 'POST':
    case 'PATCH':
      return 'info';
    case 'FAILED':
    case 'ABORTED':
    case 'NO_HIRE':
    case 'DELETE':
      return 'error';
    default:
      return 'neutral';
  }
}

const StatusBadge: React.FC<{
  children: React.ReactNode;
  tone?: BadgeTone;
  status?: string;
  className?: string;
  title?: string;
}> = ({ children, tone, status, className = '', title }) => (
  <span
    className={`badge ${className}`}
    style={TONE_STYLE[tone ?? toneForStatus(status ?? String(children))]}
    title={title}
  >
    {children}
  </span>
);

export default StatusBadge;

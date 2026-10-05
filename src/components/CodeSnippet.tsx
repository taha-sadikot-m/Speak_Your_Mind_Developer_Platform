import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CodeSnippet: React.FC<{ value: string; className?: string }> = ({ value, className = '' }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`flex items-center gap-2 rounded-lg border border-gray-200 border-l-[3px] border-l-sym-gold bg-[#F9FAFB] px-4 py-3 ${className}`}>
      <code className="flex-1 min-w-0 text-xs font-mono text-sym-navy break-all">{value}</code>
      <button
        type="button"
        className="btn-ghost py-1 px-2"
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
      </button>
    </div>
  );
};

export default CodeSnippet;

import React from 'react';

export const DataTable: React.FC<{
  columns: string;
  headers: string[];
  minWidth?: number;
  children: React.ReactNode;
}> = ({ columns, headers, minWidth = 640, children }) => (
  <div className="glass-card rounded-xl overflow-x-auto">
    <div style={{ minWidth }}>
      <div
        className="grid px-5 py-3 bg-[#F9FAFB] border-b border-gray-200"
        style={{ gridTemplateColumns: columns }}
      >
        {headers.map(header => (
          <span key={header} className="text-[10px] font-bold uppercase tracking-widest text-sym-muted">
            {header}
          </span>
        ))}
      </div>
      {children}
    </div>
  </div>
);

export const DataRow: React.FC<{
  columns: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ columns, onClick, style, children }) => (
  <div
    onClick={onClick}
    className="grid items-center px-5 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
    style={{ gridTemplateColumns: columns, ...style }}
  >
    {children}
  </div>
);

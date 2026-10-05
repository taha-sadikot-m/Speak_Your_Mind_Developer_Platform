import React from 'react';

const EmptyState: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <div className="glass-card rounded-xl flex flex-col items-center justify-center py-20 text-center px-6">
    <Icon size={36} className="text-gray-300 mb-4" />
    <p className="text-base font-bold text-sym-navy mb-2">{title}</p>
    <p className="text-sm text-sym-muted max-w-xs">{description}</p>
  </div>
);

export default EmptyState;

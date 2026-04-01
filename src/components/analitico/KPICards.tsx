import React from 'react';

export interface KPIItem { label: string; value: string | number; }

export const KPICards: React.FC<{ items: KPIItem[] }> = ({ items }) => (
  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
    {items.map((k) => (
      <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <div className="text-xs text-slate-500">{k.label}</div>
        <div className="text-2xl font-bold text-slate-800 mt-1">{k.value}</div>
      </div>
    ))}
  </div>
);

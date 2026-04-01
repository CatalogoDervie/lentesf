import React from 'react';
import { SurgeryRow } from '../../types/analytics.types';

function toCsv(rows: SurgeryRow[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const body = rows.map((r) => headers.map((h) => JSON.stringify((r as Record<string, unknown>)[h] ?? '')).join(','));
  return [headers.join(','), ...body].join('\n');
}

export const ExportButton: React.FC<{ rows: SurgeryRow[] }> = ({ rows }) => {
  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard_analitico_filtrado.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  return <button onClick={exportCsv} className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Exportar CSV</button>;
};

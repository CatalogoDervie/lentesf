import React, { useMemo, useState } from 'react';
import { SurgeryRow } from '../../types/analytics.types';

const PAGE_SIZE = 20;

export const HighPerformanceTable: React.FC<{ rows: SurgeryRow[] }> = ({ rows }) => {
  const [sortKey, setSortKey] = useState<keyof SurgeryRow>('pedidoLente');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = String(a[sortKey] ?? '');
      const vb = String(b[sortKey] ?? '');
      return va.localeCompare(vb, 'es') * sortDir;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const slice = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = (k: keyof SurgeryRow) => {
    if (k === sortKey) setSortDir(sortDir === 1 ? -1 : 1);
    else { setSortKey(k); setSortDir(1); }
  };

  const badge = (s: SurgeryRow['lensStatus']) => ({
    Pedido: 'bg-amber-100 text-amber-800',
    'En Tránsito': 'bg-blue-100 text-blue-800',
    'En Clínica': 'bg-indigo-100 text-indigo-800',
    Implantada: 'bg-emerald-100 text-emerald-800',
  }[s]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {(['paciente', 'medico', 'clinica', 'tipoCirugia', 'lensStatus', 'pedidoLente', 'fechaFacturada'] as Array<keyof SurgeryRow>).map((k) => (
                <th key={k} onClick={() => toggleSort(k)} className="px-3 py-2 text-left cursor-pointer hover:text-blue-700">{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r, idx) => (
              <tr key={r.id} className={idx % 2 ? 'bg-slate-50/50' : 'bg-white'}>
                <td className="px-3 py-2">{r.paciente}</td>
                <td className="px-3 py-2">{r.medico}</td>
                <td className="px-3 py-2">{r.clinica}</td>
                <td className="px-3 py-2">{r.tipoCirugia}</td>
                <td className="px-3 py-2"><span className={`px-2 py-1 rounded-full text-xs ${badge(r.lensStatus)}`}>{r.lensStatus}</span></td>
                <td className="px-3 py-2">{r.pedidoLente.slice(0, 10)}</td>
                <td className="px-3 py-2">{r.fechaFacturada?.slice(0, 10) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-t bg-slate-50">
        <span>Página {safePage}/{pages} · {rows.length} filas</span>
        <div className="flex gap-2">
          <button className="px-2 py-1 border rounded" onClick={() => setPage(Math.max(1, safePage - 1))}>Anterior</button>
          <button className="px-2 py-1 border rounded" onClick={() => setPage(Math.min(pages, safePage + 1))}>Siguiente</button>
        </div>
      </div>
    </div>
  );
};

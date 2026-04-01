import React from 'react';
import { LensStatus, ObraSocial } from '../../types/analytics.types';

export interface FiltersState {
  medico: string;
  tipoCirugia: string;
  mes: string;
  anio: string;
  lensStatus: '' | LensStatus;
  obraSocial: '' | ObraSocial;
}

interface Props {
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
  medicos: string[];
}

export const FiltersPanel: React.FC<Props> = ({ filters, onChange, medicos }) => {
  const set = (k: keyof FiltersState, v: string) => onChange({ ...filters, [k]: v as never });
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
      <select value={filters.medico} onChange={(e) => set('medico', e.target.value)} className="px-2 py-2 border rounded-md">
        <option value="">Médico</option>{medicos.map((m) => <option key={m}>{m}</option>)}
      </select>
      <select value={filters.tipoCirugia} onChange={(e) => set('tipoCirugia', e.target.value)} className="px-2 py-2 border rounded-md">
        <option value="">Tipo cirugía</option><option>Catarata</option><option>Vitrectomía</option>
      </select>
      <select value={filters.mes} onChange={(e) => set('mes', e.target.value)} className="px-2 py-2 border rounded-md">
        <option value="">Mes</option>{Array.from({ length: 12 }).map((_, i) => <option key={i + 1} value={String(i + 1)}>{i + 1}</option>)}
      </select>
      <select value={filters.anio} onChange={(e) => set('anio', e.target.value)} className="px-2 py-2 border rounded-md">
        <option value="">Año</option><option>2025</option><option>2026</option>
      </select>
      <select value={filters.lensStatus} onChange={(e) => set('lensStatus', e.target.value)} className="px-2 py-2 border rounded-md">
        <option value="">Estado lente</option><option>Pedido</option><option>En Tránsito</option><option>En Clínica</option><option>Implantada</option>
      </select>
      <select value={filters.obraSocial} onChange={(e) => set('obraSocial', e.target.value)} className="px-2 py-2 border rounded-md">
        <option value="">Obra social</option><option>PAMI</option><option>OSER</option><option>PARTICULAR</option>
      </select>
      <button onClick={() => onChange({ medico: '', tipoCirugia: '', mes: '', anio: '', lensStatus: '', obraSocial: '' })} className="px-2 py-2 rounded-md bg-slate-100 hover:bg-slate-200">Limpiar</button>
    </div>
  );
};

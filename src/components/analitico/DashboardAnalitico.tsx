import React, { useMemo, useState } from 'react';
import { FiltersPanel, FiltersState } from './FiltersPanel';
import { KPICards } from './KPICards';
import { HighPerformanceTable } from './HighPerformanceTable';
import { VolumeChart, OutlierScatter } from './ChartsPanel';
import { ExportButton } from './ExportButton';
import { mockDataAnalitico } from '../../data/mockDataAnalitico';
import { SurgeryRow } from '../../types/analytics.types';
import { daysBetween, mean, median, mode, percentiles } from '../../utils/stats.utils';

const initFilters: FiltersState = { medico: '', tipoCirugia: '', mes: '', anio: '', lensStatus: '', obraSocial: '' };

function applyFilters(rows: SurgeryRow[], f: FiltersState): SurgeryRow[] {
  return rows.filter((r) => {
    const d = new Date(r.pedidoLente);
    if (f.medico && r.medico !== f.medico) return false;
    if (f.tipoCirugia && r.tipoCirugia !== f.tipoCirugia) return false;
    if (f.mes && d.getMonth() + 1 !== Number(f.mes)) return false;
    if (f.anio && d.getFullYear() !== Number(f.anio)) return false;
    if (f.lensStatus && r.lensStatus !== f.lensStatus) return false;
    if (f.obraSocial && r.obraSocial !== f.obraSocial) return false;
    return true;
  });
}

export const DashboardAnalitico: React.FC = () => {
  const [filters, setFilters] = useState<FiltersState>(initFilters);

  const filtered = useMemo(() => applyFilters(mockDataAnalitico, filters), [filters]);

  const dSupply = filtered.map((r) => daysBetween(r.pedidoLente, r.reciboLente)).filter((v): v is number => v != null);
  const dPlan = filtered.map((r) => daysBetween(r.lenteEnClinica, r.fechaProgramada)).filter((v): v is number => v != null);
  const dExec = filtered.map((r) => daysBetween(r.fechaProgramada, r.fechaRealizada)).filter((v): v is number => v != null);
  const dAdmin = filtered.map((r) => daysBetween(r.fechaRealizada, r.fechaFacturada)).filter((v): v is number => v != null);

  const p90Supply = percentiles(dSupply).p90;
  const p90Plan = percentiles(dPlan).p90;
  const p90Exec = percentiles(dExec).p90;
  const p90Admin = percentiles(dAdmin).p90;

  const delayRows = [
    ...dSupply.map((d) => ({ etapa: 'Supply', dias: d, outlier: d > p90Supply ? 1 : 0 })),
    ...dPlan.map((d) => ({ etapa: 'Planificación', dias: d, outlier: d > p90Plan ? 1 : 0 })),
    ...dExec.map((d) => ({ etapa: 'Ejecución', dias: d, outlier: d > p90Exec ? 1 : 0 })),
    ...dAdmin.map((d) => ({ etapa: 'Administración', dias: d, outlier: d > p90Admin ? 1 : 0 })),
  ];

  const monthly = useMemo(() => {
    const map = new Map<string, { total: number; vitrectomias: number }>();
    filtered.forEach((r) => {
      const d = new Date(r.fechaRealizada || r.pedidoLente);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const prev = map.get(k) || { total: 0, vitrectomias: 0 };
      prev.total += 1;
      if (r.tipoCirugia === 'Vitrectomía') prev.vitrectomias += 1;
      map.set(k, prev);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([mes, v]) => ({ mes, ...v }));
  }, [filtered]);

  const medicos = useMemo(() => [...new Set(mockDataAnalitico.map((r) => r.medico))], []);

  return (
    <div className="p-4 md:p-6 bg-slate-100 min-h-screen space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Analítico</h1>
          <p className="text-slate-500 text-sm">Cross-filtering global para operaciones, demoras y facturación.</p>
        </div>
        <ExportButton rows={filtered} />
      </div>

      <FiltersPanel filters={filters} onChange={setFilters} medicos={medicos} />

      <KPICards items={[
        { label: 'Media Supply', value: mean(dSupply).toFixed(1) },
        { label: 'Mediana Planificación', value: median(dPlan).toFixed(1) },
        { label: 'Moda Administración', value: mode(dAdmin).toFixed(1) },
        { label: 'P90 Ejecución', value: p90Exec.toFixed(1) },
        { label: 'Outliers detectados', value: delayRows.filter((r) => r.outlier === 1).length },
      ]} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <VolumeChart data={monthly} />
        <OutlierScatter data={delayRows} />
      </div>

      <HighPerformanceTable rows={filtered} />
    </div>
  );
};

export default DashboardAnalitico;

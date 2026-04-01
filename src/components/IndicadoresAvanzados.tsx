import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, LabelList,
} from 'recharts';
import { mockCirugias } from '../data/mockData';
import {
  calcularDemorasPedidoLlegada,
  calcularDemorasLlegadaProgramacion,
  calcularDemorasProgramacionFacturacion,
  calcularDemorasCirugiaOjo1PedidoOjo2,
  calcularAnalisisVitrectomias,
} from '../utils/metrics';
import { Cirugia, ObraSocial } from '../types/cirugia.types';

const COLORS = {
  CDU: '#3B82F6',
  Gualeguaychu: '#10B981',
  Vitrectomias: '#8B5CF6',
  OtrasCirugias: '#6B7280',
  Alerta: '#EF4444',
};

function filtrarPorFechaYObra(data: Cirugia[], desde: string, hasta: string, obra: ObraSocial | 'TODAS', soloBilat: boolean): Cirugia[] {
  return data.filter((c) => {
    const f = new Date(c.pedido_lente);
    if (desde && f < new Date(desde)) return false;
    if (hasta && f > new Date(hasta)) return false;
    if (obra !== 'TODAS' && c.obra_social !== obra) return false;
    if (soloBilat && !c.es_bilateral) return false;
    return true;
  });
}

function tablaDemoras(title: string, cdu: { media: number; mediana: number; cantidad: number }, gchu: { media: number; mediana: number; cantidad: number }) {
  const chartData = [
    { metrica: 'Media', CDU: cdu.media, Gualeguaychú: gchu.media },
    { metrica: 'Mediana', CDU: cdu.mediana, Gualeguaychú: gchu.mediana },
  ];
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" label={{ value: 'Días', position: 'insideBottom', offset: -5 }} />
          <YAxis type="category" dataKey="metrica" />
          <Tooltip formatter={(value: number) => `${value} días`} />
          <Legend />
          <Bar dataKey="CDU" fill={COLORS.CDU} name="CDU" />
          <Bar dataKey="Gualeguaychú" fill={COLORS.Gualeguaychu} name="Gualeguaychú" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs">Clínica</th>
              <th className="px-4 py-2 text-left text-xs">Media</th>
              <th className="px-4 py-2 text-left text-xs">Mediana</th>
              <th className="px-4 py-2 text-left text-xs">Casos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            <tr><td className="px-4 py-2">CDU</td><td className="px-4 py-2">{cdu.media}</td><td className="px-4 py-2">{cdu.mediana}</td><td className="px-4 py-2">{cdu.cantidad}</td></tr>
            <tr><td className="px-4 py-2">Gualeguaychú</td><td className="px-4 py-2">{gchu.media}</td><td className="px-4 py-2">{gchu.mediana}</td><td className="px-4 py-2">{gchu.cantidad}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const IndicadoresAvanzados: React.FC = () => {
  const [desde, setDesde] = useState('2024-01-01');
  const [hasta, setHasta] = useState('2024-03-31');
  const [obra, setObra] = useState<ObraSocial | 'TODAS'>('TODAS');
  const [soloBilaterales, setSoloBilaterales] = useState(false);

  const data = useMemo(() => filtrarPorFechaYObra(mockCirugias, desde, hasta, obra, soloBilaterales), [desde, hasta, obra, soloBilaterales]);

  const pedidoLlegada = useMemo(() => calcularDemorasPedidoLlegada(data), [data]);
  const llegadaProgramacion = useMemo(() => calcularDemorasLlegadaProgramacion(data), [data]);
  const programacionFacturacion = useMemo(() => calcularDemorasProgramacionFacturacion(data), [data]);
  const bilateral = useMemo(() => calcularDemorasCirugiaOjo1PedidoOjo2(data), [data]);
  const vit = useMemo(() => calcularAnalisisVitrectomias(data), [data]);

  const bilatData = [
    { clinica: 'CDU', Media: bilateral.CDU.media, Mediana: bilateral.CDU.mediana, Casos: bilateral.CDU.cantidad },
    { clinica: 'Gualeguaychú', Media: bilateral['Gualeguaychú'].media, Mediana: bilateral['Gualeguaychú'].mediana, Casos: bilateral['Gualeguaychú'].cantidad },
  ];

  const donaData = [
    { name: 'Vitrectomías', value: vit.total.vitrectomias, color: COLORS.Vitrectomias },
    { name: 'Otras cirugías', value: vit.total.otras, color: COLORS.OtrasCirugias },
  ];

  const apiladoData = [
    { clinica: 'CDU', Vitrectomías: vit.CDU.vitrectomias, 'Otras cirugías': vit.CDU.otras },
    { clinica: 'Gualeguaychú', Vitrectomías: vit['Gualeguaychú'].vitrectomias, 'Otras cirugías': vit['Gualeguaychú'].otras },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Indicadores Operativos</h1>
        <p className="text-gray-600">Análisis de demoras y facturación - CDU vs Gualeguaychú</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="px-3 py-2 border rounded-lg" />
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="px-3 py-2 border rounded-lg" />
          <select value={obra} onChange={(e) => setObra(e.target.value as ObraSocial | 'TODAS')} className="px-3 py-2 border rounded-lg">
            <option value="TODAS">Todas</option><option value="PAMI">PAMI</option><option value="OSER">OSER</option><option value="PARTICULAR">PARTICULAR</option>
          </select>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={soloBilaterales} onChange={(e) => setSoloBilaterales(e.target.checked)} />Solo bilaterales</label>
          <span className="text-sm text-gray-500">Última actualización: {new Date().toLocaleString('es-AR')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {tablaDemoras('Pedido → Llegada de lente', pedidoLlegada.CDU, pedidoLlegada['Gualeguaychú'])}
        {tablaDemoras('Llegada → Programación', llegadaProgramacion.CDU, llegadaProgramacion['Gualeguaychú'])}
        {tablaDemoras('Programación → Facturación', programacionFacturacion.CDU, programacionFacturacion['Gualeguaychú'])}
      </div>

      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Cirugía 1er ojo → Pedido lente 2do ojo (casos bilaterales)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bilatData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="clinica" />
            <YAxis label={{ value: 'Días', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: number) => `${value} días`} />
            <Legend />
            <ReferenceLine y={30} stroke={COLORS.Alerta} strokeDasharray="3 3" label="Umbral: 30 días" />
            <Bar dataKey="Media" fill={COLORS.CDU} />
            <Bar dataKey="Mediana" fill={COLORS.Gualeguaychu} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow relative">
          <h3 className="text-lg font-semibold mb-4">Vitrectomías vs Total facturado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={donaData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}>
                {donaData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value} cirugías`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center"><div className="text-3xl font-bold">{vit.total.total_facturadas}</div><div className="text-xs text-gray-500">Total facturadas</div></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Facturación por clínica (apilado)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={apiladoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="clinica" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Vitrectomías" stackId="a" fill={COLORS.Vitrectomias} />
              <Bar dataKey="Otras cirugías" stackId="a" fill={COLORS.OtrasCirugias}><LabelList dataKey="Otras cirugías" position="inside" fill="#fff" /></Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default IndicadoresAvanzados;

import React from 'react';
import { ComposedChart, Bar, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const VolumeChart: React.FC<{ data: Array<{ mes: string; total: number; vitrectomias: number }> }> = ({ data }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
    <h3 className="font-semibold mb-2">Vitrectomías vs Total mensual</h3>
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" fill="#3B82F6" />
        <Line type="monotone" dataKey="vitrectomias" stroke="#8B5CF6" strokeWidth={3} />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
);

export const OutlierScatter: React.FC<{ data: Array<{ etapa: string; dias: number; outlier: number }> }> = ({ data }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
    <h3 className="font-semibold mb-2">Distribución de demoras (outliers marcados)</h3>
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart>
        <CartesianGrid />
        <XAxis type="category" dataKey="etapa" name="Etapa" />
        <YAxis type="number" dataKey="dias" name="Días" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter data={data.filter((d) => d.outlier === 0)} fill="#10B981" />
        <Scatter data={data.filter((d) => d.outlier === 1)} fill="#EF4444" />
      </ScatterChart>
    </ResponsiveContainer>
  </div>
);

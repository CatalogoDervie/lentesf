'use strict';

import { DB, estado, alertas } from './state.js';
import { escapeHtml, diffDays } from './utils.js';

export function renderFacturacion() {
  const view = document.getElementById('factView');
  if (!view) return;

  const pendientes = DB.rows.filter(r => estado(r) === 'REALIZADA - FALTA FACTURAR');
  const urgentes = pendientes.filter(r => alertas(r).some(a => a.severity === 'red'));
  const byObra = Object.entries(pendientes.reduce((acc, r) => {
    const k = r.obraSocial || 'Sin obra social';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]);

  view.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px;flex-wrap:wrap;margin-bottom:10px">
      <div>
        <div style="font-size:20px;font-weight:800;color:#0f172a">Facturación operativa</div>
        <div style="font-size:12px;color:#64748b">Vista de trabajo para cerrar casos realizados y todavía no facturados.</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px">
      ${[['Pendientes de facturar', pendientes.length], ['Urgentes', urgentes.length], ['Demora promedio (días)', Math.round(pendientes.reduce((a, r) => a + (diffDays(new Date(), r.fechaCir) || 0), 0) / Math.max(1, pendientes.length))], ['Obras sociales involucradas', byObra.length]].map(([k,v]) => `<div class="stat"><div class="stat-k">${k}</div><div class="stat-n">${v}</div></div>`).join('')}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:12px">
        <div style="font-size:13px;font-weight:800;margin-bottom:8px">Pendientes por obra social</div>
        ${byObra.length ? byObra.map(([k,v]) => `<div style="display:grid;grid-template-columns:1fr auto;gap:8px;padding:6px 0;border-top:1px solid #f1f5f9"><span style="font-size:12px">${escapeHtml(k)}</span><strong style="font-size:12px">${v}</strong></div>`).join('') : '<div style="font-size:12px;color:#94a3b8">Sin pendientes.</div>'}
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:12px">
        <div style="font-size:13px;font-weight:800;margin-bottom:8px">Nota analítica</div>
        <div style="font-size:12px;color:#475569;line-height:1.45">El análisis histórico mensual, evolución de facturación y vitrectomías está centralizado exclusivamente en la pestaña <strong>Indicadores</strong>, para evitar duplicaciones entre módulos.</div>
      </div>
    </div>

    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:12px">
      <div style="font-size:13px;font-weight:800;margin-bottom:8px">Casos realizados sin facturar</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead><tr><th style="padding:6px 8px;background:#f8fafc;text-align:left">Paciente</th><th style="padding:6px 8px;background:#f8fafc;text-align:left">Obra social</th><th style="padding:6px 8px;background:#f8fafc;text-align:left">Fecha cirugía</th><th style="padding:6px 8px;background:#f8fafc;text-align:right">Días</th></tr></thead>
        <tbody>
          ${pendientes.length ? pendientes.sort((a,b)=>(diffDays(new Date(), b.fechaCir)||0)-(diffDays(new Date(), a.fechaCir)||0)).map(r => `<tr style="border-top:1px solid #f1f5f9"><td style="padding:6px 8px">${escapeHtml(r.nombre || '—')}</td><td style="padding:6px 8px">${escapeHtml(r.obraSocial || '—')}</td><td style="padding:6px 8px">${escapeHtml(r.fechaCir || '—')}</td><td style="padding:6px 8px;text-align:right">${diffDays(new Date(), r.fechaCir) || 0}</td></tr>`).join('') : '<tr><td colspan="4" style="padding:14px;text-align:center;color:#94a3b8">No hay pendientes de facturación.</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

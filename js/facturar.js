// facturar.js — vista operativa para generar documentación de pacientes listas para facturar

'use strict';

import { DB, estado, getDioptria, filtered, WORKFLOW_KEYS } from './state.js';
import { connectorStartJob, connectorPollJob, renderJobStatus } from './connector.js';
import { hoyISO, toast, escapeHtml, escapeAttr } from './utils.js';

const LS_BASE = 'facturar_base_dir';
const LS_OUT = 'facturar_output_dir';
let selectedIds = new Set();

function getBaseDir() { return localStorage.getItem(LS_BASE) || 'C:\\Users\\xd\\Desktop\\FACO-VITRE'; }
function getOutputDir() { return localStorage.getItem(LS_OUT) || 'C:\\Users\\xd\\Desktop\\FACO-VITRE\\SALIDA'; }
function setBaseDir(v) { localStorage.setItem(LS_BASE, (v || '').trim()); }
function setOutputDir(v) { localStorage.setItem(LS_OUT, (v || '').trim()); }

function rowsFacturar() {
  return filtered({ includeQuickFilter: false, includeEstadoSelect: false, stateKeys: [WORKFLOW_KEYS.REALIZADA_FALTA_FACTURAR] })
    .slice()
    .sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' }));
}


function buildPacientePayload(row) {
  return {
    id: row.id || '',
    nombre_completo: String(row.nombre || '').trim(),
    dni: String(row.dni || '').trim(),
    afiliado: String(row.afiliado || '').trim(),
    fecha: String(row.fechaCir || row.fechaFacturada || hoyISO()).trim(),
    ojo_operado: String(row.ojo || '').trim().toUpperCase(),
    dioptria: String(getDioptria(row) || '').trim(),
    tiene_vitrectomia: !!row.extraVitrectomia,
    clinica: String(row.clinica || '').trim(),
    obra_social: String(row.obraSocial || '').trim()
  };
}

function getSelectedRows(allRows) {
  return allRows.filter(r => selectedIds.has(String(r.id)));
}

function validateRows(rows) {
  return rows.map(r => {
    const faltan = [];
    if (!String(r.nombre || '').trim()) faltan.push('nombre');
    if (!String(r.dni || '').trim()) faltan.push('DNI');
    if (!String(r.afiliado || '').trim()) faltan.push('afiliado');
    if (!String(r.ojo || '').trim()) faltan.push('ojo');
    if (!String(getDioptria(r) || '').trim()) faltan.push('dioptría');
    if (!String(r.fechaCir || '').trim()) faltan.push('fecha cirugía');
    return { row: r, faltan };
  }).filter(x => x.faltan.length);
}

function renderRows() {
  const tbody = document.getElementById('facturarTbody');
  const rows = rowsFacturar();
  [...selectedIds].forEach(id => { if (!rows.some(r => String(r.id) === id)) selectedIds.delete(id); });
  if (!tbody) return;
  tbody.innerHTML = rows.length ? rows.map((r, i) => `
    <tr>
      <td><input type="checkbox" class="facturar-row" data-id="${escapeAttr(r.id)}" ${selectedIds.has(String(r.id)) ? 'checked' : ''}></td>
      <td>${i + 1}</td>
      <td>${escapeHtml(r.nombre || '—')}</td>
      <td>${escapeHtml(r.dni || '—')}</td>
      <td>${escapeHtml(r.afiliado || '—')}</td>
      <td>${escapeHtml(r.clinica || '—')}</td>
      <td><strong>${escapeHtml(r.ojo || '—')}</strong></td>
      <td>${escapeHtml(getDioptria(r) || '—')}</td>
      <td>${escapeHtml(r.fechaCir || '—')}</td>
      <td>${r.extraVitrectomia ? 'Sí' : 'No'}</td>
      <td><span class="badge ${escapeAttr(estado(r) === 'REALIZADA - FALTA FACTURAR' ? 'b6' : 'b3')}">${escapeHtml(estado(r) || '—')}</span></td>
    </tr>`).join('') : '<tr><td colspan="11"><div class="empty">No hay pacientes para facturar con los filtros globales actuales (búsqueda, clínica y obra social).</div></td></tr>';

  document.getElementById('facturarCount').textContent = String(rows.length);
  const selected = rows.filter(r => selectedIds.has(String(r.id))).length;
  document.getElementById('facturarSelected').textContent = String(selected);
  const chkAll = document.getElementById('facturarChkAll');
  if (chkAll) chkAll.checked = !!rows.length && selected === rows.length;

  tbody.querySelectorAll('.facturar-row').forEach(chk => chk.addEventListener('change', ev => {
    const id = String(ev.target.dataset.id || '');
    if (ev.target.checked) selectedIds.add(id); else selectedIds.delete(id);
    renderRows();
  }));
}

function attachEvents() {
  document.getElementById('facturarBaseDir')?.addEventListener('change', e => setBaseDir(e.target.value));
  document.getElementById('facturarOutputDir')?.addEventListener('change', e => setOutputDir(e.target.value));
  document.getElementById('facturarRefresh')?.addEventListener('click', renderRows);
  document.getElementById('facturarClearSel')?.addEventListener('click', () => { selectedIds.clear(); renderRows(); });
  document.getElementById('facturarSelectAll')?.addEventListener('click', () => { rowsFacturar().forEach(r => selectedIds.add(String(r.id))); renderRows(); });
  document.getElementById('facturarChkAll')?.addEventListener('change', e => {
    if (e.target.checked) rowsFacturar().forEach(r => selectedIds.add(String(r.id)));
    else rowsFacturar().forEach(r => selectedIds.delete(String(r.id)));
    renderRows();
  });
  document.getElementById('facturarRun')?.addEventListener('click', ejecutarFacturacionDocs);
  document.getElementById('facturarBack')?.addEventListener('click', () => document.querySelector('.tablink[data-tab="tabla"]')?.click());
}

async function ejecutarFacturacionDocs() {
  const allRows = rowsFacturar();
  const rows = getSelectedRows(allRows);
  if (!rows.length) { toast('Seleccioná al menos un paciente para generar documentación'); return; }

  const base_dir = (document.getElementById('facturarBaseDir')?.value || '').trim();
  const output_dir = (document.getElementById('facturarOutputDir')?.value || '').trim();
  if (!base_dir || !output_dir) { toast('Completá carpeta local y carpeta de salida'); return; }

  const invalid = validateRows(rows);
  if (invalid.length) {
    const detalle = invalid.map(x => `${x.row.nombre || x.row.id}: ${x.faltan.join(', ')}`).join(' | ');
    renderJobStatus('facturarJobStatus', 'err', `❌ Hay pacientes con datos incompletos: ${detalle}`);
    toast('Hay pacientes con datos incompletos. Revisá nombre, DNI, afiliado, ojo, dioptría y fecha de cirugía.');
    return;
  }

  const resumen = rows.map(r => `• ${r.nombre || '—'} · ${r.ojo || '—'} · ${r.fechaCir || '—'}${r.extraVitrectomia ? ' · Vitrectomía' : ''}`).join('\n');
  if (!confirm(`Se va a generar documentación para ${rows.length} paciente(s):

${resumen}`)) return;

  const pacientes = rows.map(buildPacientePayload);
  const payload = {
    base_dir,
    output_dir,
    source: 'github_facturar_tab',
    pacientes
  };

  const btn = document.getElementById('facturarRun');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Ejecutando...'; }
  renderJobStatus('facturarJobStatus', 'run', `⏳ Enviando ${pacientes.length} paciente(s) al conector local...`);

  try {
    const jobId = await connectorStartJob('facturar_docs', payload);
    renderJobStatus('facturarJobStatus', 'run', `⏳ Job iniciado: ${String(jobId).slice(0, 8)}`);
    const result = await connectorPollJob(jobId, s => {
      const done = s?.done ?? s?.processed ?? s?.completed_count;
      const total = s?.total ?? pacientes.length;
      const extra = done != null ? ` (${done}/${total})` : '';
      renderJobStatus('facturarJobStatus', 'run', `⏳ Ejecutando${extra}`);
    });

    const out = result?.output_dir || output_dir;
    renderJobStatus('facturarJobStatus', 'ok', `✅ Documentación generada en: ${out}`);
    toast('✅ Documentación generada correctamente');
  } catch (err) {
    const msg = String(err?.message || 'Error ejecutando facturación documental');
    renderJobStatus('facturarJobStatus', /conector local no detectado|no se pudo conectar/i.test(msg) ? 'off' : 'err', `❌ ${msg}`);
    toast(`❌ ${msg}`);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '▶ Generar documentación'; }
  }
}

export function renderFacturar() {
  const el = document.getElementById('facturarView');
  if (!el) return;
  el.innerHTML = `
    <div class="wa-wrap" style="display:grid;gap:12px">
      <div class="wa-topline">
        <h3 class="wa-title">Facturar · Documentación local</h3>
        <button id="facturarBack" class="btn">← Volver a tabla</button>
      </div>

      <div style="font-size:12px;color:#475569;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px">
        Esta vista toma <strong>solo pacientes en estado REALIZADA - FALTA FACTURAR</strong>. Para ejecutar la documentación tenés que <strong>seleccionar explícitamente</strong> los pacientes.
      </div>

      <div class="wa-grid">
        <div class="wa-card span-6">
          <h4>Configuración local</h4>
          <div style="display:grid;gap:8px">
            <label style="font-size:12px">Carpeta local de plantillas e imágenes
              <input id="facturarBaseDir" type="text" value="${escapeAttr(getBaseDir())}" style="width:100%">
            </label>
            <label style="font-size:12px">Carpeta local de salida
              <input id="facturarOutputDir" type="text" value="${escapeAttr(getOutputDir())}" style="width:100%">
            </label>
            <div style="font-size:12px;color:#64748b">Esta carpeta local debe contener: <strong>OD.docx</strong>, <strong>OI.docx</strong>, <strong>ARM Y AV.docx</strong>, <strong>Protocolo...</strong> y las imágenes <strong>DR *.jpg</strong>.</div>
          </div>
        </div>

        <div class="wa-card span-6">
          <h4>Acciones</h4>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button id="facturarRun" class="btn primary">▶ Generar documentación</button>
            <button id="facturarSelectAll" class="btn">Seleccionar filtrados</button>
            <button id="facturarClearSel" class="btn">Limpiar selección</button>
            <button id="facturarRefresh" class="btn">↺ Actualizar</button>
          </div>
          <div id="facturarJobStatus" style="font-size:12px;color:#64748b;margin-top:10px">Listo para ejecutar en conector local.</div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:12px">
            <div class="stat"><div class="stat-n" id="facturarCount">0</div><div class="stat-l">Realizadas visibles</div></div>
            <div class="stat"><div class="stat-n" id="facturarSelected">0</div><div class="stat-l">Seleccionados</div></div>
          </div>
        </div>
      </div>

      <div class="tablewrap">
        <div class="table-scroll">
          <table class="wa-table">
            <thead>
              <tr>
                <th><input id="facturarChkAll" type="checkbox"></th>
                <th>#</th>
                <th>Paciente</th>
                <th>DNI</th>
                <th>Afiliado</th>
                <th>Clínica</th>
                <th>Ojo</th>
                <th>Dioptría</th>
                <th>Fecha</th>
                <th>Vitrectomía</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody id="facturarTbody"></tbody>
          </table>
        </div>
      </div>
    </div>`;

  attachEvents();
  renderRows();
}

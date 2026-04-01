'use strict';

import { estado, getDioptria, filtered, WORKFLOW_KEYS, stateKey } from './state.js';
import { escapeHtml, escapeAttr } from './utils.js';

const KEY = 'pedir_lente_screen_filter';

function getModuleFilter() {
  const saved = localStorage.getItem(KEY) || WORKFLOW_KEYS.PEDIR_LENTE;
  return [
    WORKFLOW_KEYS.PEDIR_LENTE,
    WORKFLOW_KEYS.ESPERANDO_LENTE,
    WORKFLOW_KEYS.LLEGO_LENTE_PROGRAMAR,
    'ALL'
  ].includes(saved) ? saved : WORKFLOW_KEYS.PEDIR_LENTE;
}

function setModuleFilter(v) {
  localStorage.setItem(KEY, v);
}

function baseRows() {
  return filtered({
    includeQuickFilter: false,
    includeEstadoSelect: false,
    stateKeys: [
      WORKFLOW_KEYS.PEDIR_LENTE,
      WORKFLOW_KEYS.ESPERANDO_LENTE,
      WORKFLOW_KEYS.LLEGO_LENTE_PROGRAMAR,
    ]
  });
}

function rowsFor(filterKey) {
  const rows = baseRows();
  if (filterKey === 'ALL') return rows;
  return rows.filter(p => stateKey(p) === filterKey);
}

function badgeFor(filterKey) {
  if (filterKey === WORKFLOW_KEYS.PEDIR_LENTE) return 'b2';
  if (filterKey === WORKFLOW_KEYS.ESPERANDO_LENTE) return 'b3';
  if (filterKey === WORKFLOW_KEYS.LLEGO_LENTE_PROGRAMAR) return 'b4';
  return 'b3';
}

export function renderPedirLente() {
  const view = document.getElementById('pedirLenteView');
  if (!view) return;

  const screen = getModuleFilter();
  const all = baseRows();
  const rows = rowsFor(screen);
  const counts = {
    [WORKFLOW_KEYS.PEDIR_LENTE]: all.filter(p => stateKey(p) === WORKFLOW_KEYS.PEDIR_LENTE).length,
    [WORKFLOW_KEYS.ESPERANDO_LENTE]: all.filter(p => stateKey(p) === WORKFLOW_KEYS.ESPERANDO_LENTE).length,
    [WORKFLOW_KEYS.LLEGO_LENTE_PROGRAMAR]: all.filter(p => stateKey(p) === WORKFLOW_KEYS.LLEGO_LENTE_PROGRAMAR).length,
  };

  const filterButtons = [
    { key: WORKFLOW_KEYS.PEDIR_LENTE, label: 'Pedir lente', n: counts[WORKFLOW_KEYS.PEDIR_LENTE] },
    { key: WORKFLOW_KEYS.ESPERANDO_LENTE, label: 'Esperando lente', n: counts[WORKFLOW_KEYS.ESPERANDO_LENTE] },
    { key: WORKFLOW_KEYS.LLEGO_LENTE_PROGRAMAR, label: 'Llegó lente - programar', n: counts[WORKFLOW_KEYS.LLEGO_LENTE_PROGRAMAR] },
    { key: 'ALL', label: 'Ver todo', n: all.length },
  ];

  view.innerHTML = `
    <div class="module-shell">
      <div class="module-topline">
        <div>
          <div class="module-title">Pedir lente</div>
          <div class="module-subtitle">Circuito operativo de lentes. Usa búsqueda, clínica y obra social de arriba, sin heredar la cola rápida de la tabla principal.</div>
        </div>
        <button class="btn primary" id="btnAbrirLentessModulo">🧿 Ejecutar Lentess con filtros actuales</button>
      </div>

      <div class="stats-mini-grid">
        <div class="stats-mini-card"><div class="stats-mini-label">Pedir lente</div><div class="stats-mini-value">${counts[WORKFLOW_KEYS.PEDIR_LENTE]}</div></div>
        <div class="stats-mini-card"><div class="stats-mini-label">Esperando lente</div><div class="stats-mini-value">${counts[WORKFLOW_KEYS.ESPERANDO_LENTE]}</div></div>
        <div class="stats-mini-card"><div class="stats-mini-label">Llegó lente - programar</div><div class="stats-mini-value">${counts[WORKFLOW_KEYS.LLEGO_LENTE_PROGRAMAR]}</div></div>
        <div class="stats-mini-card"><div class="stats-mini-label">Total módulo</div><div class="stats-mini-value">${all.length}</div></div>
      </div>

      <div class="module-chip-row">
        ${filterButtons.map(item => `<button class="stats-screen-btn ${screen === item.key ? 'active' : ''}" data-pl-filter="${escapeAttr(item.key)}">${escapeHtml(item.label)} <span class="stats-chip-count">${item.n}</span></button>`).join('')}
      </div>

      <div class="tablewrap compact-module-table">
        <div class="table-scroll">
          <table class="module-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Paciente</th>
                <th>Clínica</th>
                <th>Ojo</th>
                <th>Dioptría</th>
                <th>Obra social</th>
                <th>Fecha pedido</th>
                <th>Fecha llegó</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length ? rows.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${escapeHtml(p.nombre || '—')}<div class="cell-sub">DNI ${escapeHtml(p.dni || '—')} · Afiliado ${escapeHtml(p.afiliado || '—')}</div></td>
                  <td>${escapeHtml(p.clinica || '—')}</td>
                  <td>${escapeHtml(p.ojo || '—')}</td>
                  <td>${escapeHtml(getDioptria(p) || '—')}</td>
                  <td>${escapeHtml(p.obraSocial || '—')}</td>
                  <td>${escapeHtml(p.fechaSolLente || '—')}</td>
                  <td>${escapeHtml(p.fechaLlegaLente || '—')}</td>
                  <td><span class="badge ${badgeFor(stateKey(p))}">${escapeHtml(estado(p))}</span></td>
                </tr>`).join('') : `<tr><td colspan="9"><div class="empty">No hay pacientes en esta etapa con los filtros globales actuales.</div></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;

  view.querySelectorAll('[data-pl-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      setModuleFilter(btn.dataset.plFilter || WORKFLOW_KEYS.PEDIR_LENTE);
      renderPedirLente();
    });
  });

  document.getElementById('btnAbrirLentessModulo')?.addEventListener('click', () => {
    if (typeof window.abrirLentessModal === 'function') window.abrirLentessModal();
  });
}

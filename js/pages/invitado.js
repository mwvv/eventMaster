// ============================================================
//  INVITADO PAGE
// ============================================================
function renderInvitadoPage(id) {
  document.getElementById('topbarTitle').textContent = 'Catálogo de Eventos';
  document.getElementById('pageContent').innerHTML = `
    <div style="background:var(--info-bg);border:1px solid #b5d4f4;border-radius:var(--radius);padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:10px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--info-text)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span style="font-size:13px;color:var(--info-text)">Estás navegando como <strong>usuario invitado</strong> en modo solo lectura. Regístrate para reservar eventos.</span>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0">
        <button class="btn btn-outline btn-sm" onclick="volverAlLogin()">Iniciar sesión</button>
        <button class="btn btn-primary btn-sm" onclick="volverAlRegistro()">Registrarse</button>
      </div>
    </div>
    <div class="page-header">
      <div class="page-header-text"><h1>Catálogo de Eventos</h1><p>Explora los eventos disponibles</p></div>
    </div>
    <div class="filters-row">
      <div class="search-box">
        ${iconSearch()}<input type="text" class="form-control" id="searchInv" placeholder="Buscar evento..." oninput="filterInvitado()">
      </div>
      <select class="form-control form-select filter-select" id="filterInvTipo" onchange="filterInvitado()">
        <option value="">Todos los tipos</option>
        <option>Matrimonio</option><option>Cumpleaños</option><option>Corporativo</option>
      </select>
    </div>
    <div id="catalogoInvContainer" class="events-grid">
      ${EVENTOS.filter(e=>e.estado==='activo').map(e=>renderEventCardInvitado(e)).join('')}
    </div>
  `;
}

function renderEventCardInvitado(e) {
  const colors = { Matrimonio:'#fbeaf0', Cumpleaños:'#faeeda', Corporativo:'#e6f1fb', Otro:'#eaf3de' };
  const bg = colors[e.tipo] || '#f1efe8';
  return `
  <div class="event-card">
    <div class="event-card-img" style="background:${bg}">${e.emoji}</div>
    <div class="event-card-body">
      <div class="event-card-type">${e.tipo}</div>
      <div class="event-card-name">${e.nombre}</div>
      <div class="event-card-meta">
        <span>📅 ${formatDate(e.fecha)} · ${e.hora}</span>
        <span>📍 ${e.lugar.split(',')[0]}</span>
        <span>👥 ${e.capacidadDisp} cupos disponibles</span>
      </div>
    </div>
    <div class="event-card-footer">
      <div class="event-price">$${e.precioBase.toLocaleString('es-CL')}<span style="font-size:11px;font-weight:400;color:var(--text-muted)">/pers.</span></div>
      <button class="btn btn-outline btn-sm" onclick="promptRegistro()" title="Regístrate para reservar">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Reservar
      </button>
    </div>
  </div>`;
}

function filterInvitado() {
  const q    = document.getElementById('searchInv')?.value.toLowerCase() || '';
  const tipo = document.getElementById('filterInvTipo')?.value || '';
  const filtered = EVENTOS.filter(e => e.estado==='activo' && (!q || e.nombre.toLowerCase().includes(q)) && (!tipo || e.tipo===tipo));
  document.getElementById('catalogoInvContainer').innerHTML = filtered.length ?
    filtered.map(e=>renderEventCardInvitado(e)).join('') :
    '<div class="empty-state" style="grid-column:1/-1"><h3>Sin resultados</h3><p>Intenta con otros filtros.</p></div>';
}

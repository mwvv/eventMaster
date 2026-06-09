// ============================================================
//  CLIENTE PAGE DISPATCHER
// ============================================================
function renderClientePage(id) {
  const titleMap = { dashboard:'Mi panel', catalogo:'Catálogo de Eventos', 'mis-reservas':'Mis Reservas', 'mis-pagos':'Mis Pagos', notificaciones:'Notificaciones' };
  document.getElementById('topbarTitle').textContent = titleMap[id] || id;
  const pages = { dashboard: renderClienteDashboard, catalogo: renderCatalogoPage, 'mis-reservas': renderMisReservas, 'mis-pagos': renderMisPagos, notificaciones: renderNotificacionesPage };
  const fn = pages[id];
  if (fn) document.getElementById('pageContent').innerHTML = fn();
}

// ============================================================
//  DASHBOARD
// ============================================================
function renderClienteDashboard() {
  const misReservas = RESERVAS.filter(r=>r.idUsuario===STATE.user.id);
  const misPagos    = PAGOS.filter(p=>misReservas.find(r=>r.id===p.idReserva));
  return `
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-label">Mis reservas</div><div class="stat-value">${misReservas.length}</div></div>
    <div class="stat-card"><div class="stat-label">Confirmadas</div><div class="stat-value">${misReservas.filter(r=>r.estado==='confirmada').length}</div></div>
    <div class="stat-card"><div class="stat-label">Pagos completados</div><div class="stat-value">${misPagos.filter(p=>p.estado==='completado').length}</div></div>
    <div class="stat-card"><div class="stat-label">Eventos disponibles</div><div class="stat-value">${EVENTOS.filter(e=>e.estado==='activo').length}</div></div>
  </div>
  <div class="card">
    <div class="card-header"><span class="card-title">Eventos disponibles para reservar</span>
      <button class="btn btn-primary btn-sm" onclick="showPage('catalogo')">Ver catálogo completo</button>
    </div>
    <div class="card-body" style="padding:16px">
      <div class="events-grid">
        ${EVENTOS.filter(e=>e.estado==='activo').slice(0,3).map(e=>renderEventCard(e)).join('')}
      </div>
    </div>
  </div>`;
}

// ============================================================
//  CATÁLOGO
// ============================================================
function renderCatalogoPage() {
  return `
  <div class="page-header">
    <div class="page-header-text"><h1>Catálogo de Eventos</h1><p>Explora y reserva los eventos disponibles</p></div>
  </div>
  <div class="filters-row">
    <div class="search-box">
      ${iconSearch()}<input type="text" class="form-control" id="searchCat" placeholder="Buscar evento..." oninput="filterCatalogo()">
    </div>
    <select class="form-control form-select filter-select" id="filterCatTipo" onchange="filterCatalogo()">
      <option value="">Todos los tipos</option>
      <option>Matrimonio</option><option>Cumpleaños</option><option>Corporativo</option>
    </select>
  </div>
  <div id="catalogoContainer" class="events-grid">
    ${EVENTOS.filter(e=>e.estado==='activo').map(e=>renderEventCard(e)).join('')}
  </div>`;
}

function renderEventCard(e) {
  const colors = { Matrimonio:'#fbeaf0', Cumpleaños:'#faeeda', Corporativo:'#e6f1fb', Otro:'#eaf3de' };
  const bg = colors[e.tipo] || '#f1efe8';
  return `
  <div class="event-card" onclick="openReservarModal(${e.id})">
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
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openReservarModal(${e.id})">Reservar</button>
    </div>
  </div>`;
}

function filterCatalogo() {
  const q    = document.getElementById('searchCat')?.value.toLowerCase() || '';
  const tipo = document.getElementById('filterCatTipo')?.value || '';
  const filtered = EVENTOS.filter(e => e.estado==='activo' && (!q || e.nombre.toLowerCase().includes(q)) && (!tipo || e.tipo===tipo));
  document.getElementById('catalogoContainer').innerHTML = filtered.length ?
    filtered.map(e=>renderEventCard(e)).join('') :
    '<div class="empty-state" style="grid-column:1/-1"><h3>Sin resultados</h3><p>Intenta con otros filtros.</p></div>';
}

// ============================================================
//  RESERVA
// ============================================================
let _reservaPersonas = 1;

function openReservarModal(idEvento) {
  const ev = EVENTOS.find(e=>e.id===idEvento);
  if (!ev) return;
  if (!STATE.user) { showToast('Debes iniciar sesión para reservar.', 'warning'); return; }
  _reservaPersonas = 1;
  showModal(`Reservar: ${ev.nombre}`, `
    <div style="background:var(--surface);border-radius:var(--radius);padding:14px;margin-bottom:16px">
      <div class="flex items-center gap-3">
        <div style="font-size:28px">${ev.emoji}</div>
        <div>
          <div style="font-weight:500">${ev.nombre}</div>
          <div style="font-size:12px;color:var(--text-muted)">${formatDate(ev.fecha)} · ${ev.hora}</div>
          <div style="font-size:12px;color:var(--text-muted)">📍 ${ev.lugar}</div>
        </div>
      </div>
    </div>
    ${ev.capacidadDisp === 0 ? `
      <div class="alert alert-warning">Este evento no tiene cupos disponibles. ¿Deseas unirte a la lista de espera?</div>
      <button class="btn btn-accent btn-block" onclick="joinWaitlist(${idEvento})">Unirse a lista de espera</button>
    ` : `
      <div class="form-group">
        <label>Número de personas</label>
        <div class="flex items-center gap-3">
          <button class="btn btn-outline" onclick="cambiarPersonas(-1,${idEvento})" id="btnMenos">−</button>
          <span style="font-size:20px;font-weight:500;min-width:40px;text-align:center" id="numPersonas">1</span>
          <button class="btn btn-outline" onclick="cambiarPersonas(1,${idEvento})" id="btnMas">+</button>
          <span style="font-size:12px;color:var(--text-muted)">(máx. ${Math.min(ev.capacidadDisp,10)})</span>
        </div>
      </div>
      <div class="divider"></div>
      <div class="flex justify-between" style="font-size:14px">
        <span>Precio por persona:</span>
        <span>$${ev.precioBase.toLocaleString('es-CL')}</span>
      </div>
      <div class="flex justify-between mt-2" style="font-size:17px;font-family:'DM Serif Display',serif">
        <span>Total:</span>
        <span id="totalReserva">$${ev.precioBase.toLocaleString('es-CL')}</span>
      </div>
    `}
  `, ev.capacidadDisp > 0 ? () => procesarReserva(idEvento) : null, ev.capacidadDisp > 0 ? 'Confirmar y pagar' : null);
}

function cambiarPersonas(delta, idEvento) {
  const ev  = EVENTOS.find(e=>e.id===idEvento);
  const max = Math.min(ev?.capacidadDisp||1, 10);
  _reservaPersonas = Math.max(1, Math.min(max, _reservaPersonas + delta));
  document.getElementById('numPersonas').textContent = _reservaPersonas;
  document.getElementById('totalReserva').textContent = '$' + (ev.precioBase * _reservaPersonas).toLocaleString('es-CL');
}

function joinWaitlist(idEvento) {
  showToast('Te has unido a la lista de espera. Te notificaremos cuando haya disponibilidad.', 'success');
  closeModal();
}

function procesarReserva(idEvento) {
  const ev = EVENTOS.find(e=>e.id===idEvento);
  if (!ev || ev.capacidadDisp < _reservaPersonas) { showToast('Sin disponibilidad suficiente.', 'danger'); return; }
  const nuevaReserva = {
    id: RESERVAS.length + 1, idEvento, idUsuario: STATE.user.id,
    fechaReserva: new Date().toISOString().split('T')[0],
    cantPersonas: _reservaPersonas, estado: 'pendiente'
  };
  RESERVAS.push(nuevaReserva);
  ev.capacidadDisp -= _reservaPersonas;
  NOTIFICACIONES.unshift({ id:Date.now(), mensaje:`Reserva creada para ${ev.nombre}`, tipo:'reserva', leida:false, fecha:new Date().toLocaleString('es-CL'), idDestino:'cliente' });
  closeModal();
  _reservaPersonas = 1;
  setTimeout(() => abrirPagoModal(nuevaReserva.id), 300);
}

// ============================================================
//  PAGO
// ============================================================
function abrirPagoModal(idReserva) {
  const r  = RESERVAS.find(x=>x.id===idReserva);
  const ev = r ? EVENTOS.find(e=>e.id===r.idEvento) : null;
  if (!r || !ev) return;
  const monto = ev.precioBase * r.cantPersonas;
  window._metodoSel = 'credito';
  showModal('Realizar pago', `
    <div style="background:var(--surface);border-radius:var(--radius);padding:14px;margin-bottom:16px">
      <div style="font-weight:500;margin-bottom:4px">${ev.nombre}</div>
      <div style="font-size:12px;color:var(--text-muted)">${r.cantPersonas} persona(s) · ${formatDate(ev.fecha)}</div>
      <div style="font-size:20px;font-family:'DM Serif Display',serif;margin-top:8px">Total: $${monto.toLocaleString('es-CL')}</div>
    </div>
    <div class="payment-methods">
      <div class="payment-method-card selected" id="pm-credito" onclick="selectPM('credito')">
        <div class="method-icon">💳</div>
        <div class="method-name">Tarjeta de crédito</div>
      </div>
      <div class="payment-method-card" id="pm-debito" onclick="selectPM('debito')">
        <div class="method-icon">🏦</div>
        <div class="method-name">Tarjeta de débito</div>
      </div>
    </div>
    <div id="camposTarjeta">
      <div class="form-group"><label>Número de tarjeta</label><input type="text" class="form-control" id="cardNum" maxlength="19" placeholder="1234 5678 9012 3456" oninput="formatCard(this)"></div>
      <div class="grid-2">
        <div class="form-group"><label>Vencimiento</label><input type="text" class="form-control" placeholder="MM/AA" maxlength="5"></div>
        <div class="form-group"><label>CVV</label><input type="text" class="form-control" placeholder="123" maxlength="3"></div>
      </div>
      <div class="form-group"><label>Nombre en la tarjeta</label><input type="text" class="form-control" placeholder="${STATE.user.nombre} ${STATE.user.apellido}"></div>
    </div>
    <div id="pagoAlert" class="alert hidden"></div>
    <div style="font-size:11px;color:var(--text-hint);text-align:center;margin-top:8px">🔒 Pago procesado por WebPay/Flow · Conexión segura HTTPS/TLS</div>
  `, () => confirmarPago(idReserva, monto));
}

function selectPM(m) {
  window._metodoSel = m;
  document.querySelectorAll('.payment-method-card').forEach(el=>el.classList.remove('selected'));
  document.getElementById('pm-' + m).classList.add('selected');
}

function formatCard(el) {
  let v = el.value.replace(/\D/g,'').substring(0,16);
  el.value = v.replace(/(.{4})/g,'$1 ').trim();
}

function confirmarPago(idReserva, monto) {
  const cardNum = document.getElementById('cardNum').value.replace(/\s/g,'');
  const al      = document.getElementById('pagoAlert');
  if (cardNum.length < 16) { showAlert(al, 'Ingresa un número de tarjeta válido de 16 dígitos.'); return; }
  const reserva = RESERVAS.find(r=>r.id===idReserva);
  const ev      = EVENTOS.find(e=>e.id===reserva.idEvento);
  const pago = {
    id: PAGOS.length + 1, idReserva, monto, metodo: window._metodoSel,
    estado:'completado', fecha: new Date().toISOString().split('T')[0],
    numTrans: 'TXN-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4)
  };
  PAGOS.push(pago);
  reserva.estado = 'confirmada';
  NOTIFICACIONES.unshift({ id:Date.now(), mensaje:`Pago confirmado para ${ev?.nombre}. Nº: ${pago.numTrans}`, tipo:'pago', leida:false, fecha:new Date().toLocaleString('es-CL'), idDestino:'cliente' });
  closeModal();
  showToast(`¡Pago exitoso! Comprobante: ${pago.numTrans}`, 'success');
  renderClientePage('mis-reservas');
}

// ============================================================
//  MIS RESERVAS / MIS PAGOS
// ============================================================
function renderMisReservas() {
  const mis = RESERVAS.filter(r=>r.idUsuario===STATE.user.id);
  return `
  <div class="page-header">
    <div class="page-header-text"><h1>Mis reservas</h1></div>
    <button class="btn btn-primary btn-sm" onclick="showPage('catalogo')">${iconPlus()} Nueva reserva</button>
  </div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Evento</th><th>Personas</th><th>Fecha reserva</th><th>Estado</th><th>Pago</th><th>Acciones</th></tr></thead>
    <tbody>
      ${mis.length ? mis.map(r => {
        const ev   = EVENTOS.find(e=>e.id===r.idEvento);
        const pago = PAGOS.find(p=>p.idReserva===r.id);
        return `<tr>
          <td><strong>${ev?.nombre||'-'}</strong><br><span style="font-size:11px;color:var(--text-muted)">${formatDate(ev?.fecha)} · ${ev?.lugar?.split(',')[0]}</span></td>
          <td>${r.cantPersonas}</td>
          <td>${formatDate(r.fechaReserva)}</td>
          <td>${badgeReserva(r.estado)}</td>
          <td>${pago ? badgePago(pago.estado) : '<span class="badge badge-gray">Pendiente</span>'}</td>
          <td>${r.estado==='pendiente' && !pago ? `<button class="btn btn-accent btn-sm" onclick="abrirPagoModal(${r.id})">Pagar ahora</button>` : ''}</td>
        </tr>`;
      }).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px">No tienes reservas aún. <a onclick="showPage(\'catalogo\')" style="color:var(--brand);cursor:pointer">Explora el catálogo</a></td></tr>'}
    </tbody>
  </table></div></div>`;
}

function renderMisPagos() {
  const misR = RESERVAS.filter(r=>r.idUsuario===STATE.user.id);
  const misP = PAGOS.filter(p=>misR.find(r=>r.id===p.idReserva));
  return `
  <div class="page-header"><div class="page-header-text"><h1>Mis pagos</h1></div></div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Nº Transacción</th><th>Evento</th><th>Monto</th><th>Método</th><th>Estado</th><th>Fecha</th></tr></thead>
    <tbody>
      ${misP.length ? misP.map(p=>{
        const r  = misR.find(x=>x.id===p.idReserva);
        const ev = r ? EVENTOS.find(e=>e.id===r.idEvento) : null;
        return `<tr>
          <td><code style="font-size:11px">${p.numTrans||'—'}</code></td>
          <td>${ev?.nombre||'-'}</td>
          <td style="font-family:'DM Serif Display',serif;font-size:15px">$${p.monto.toLocaleString('es-CL')}</td>
          <td><span class="badge badge-brand">${p.metodo}</span></td>
          <td>${badgePago(p.estado)}</td>
          <td>${p.fecha||'—'}</td>
        </tr>`;
      }).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px">Sin historial de pagos.</td></tr>'}
    </tbody>
  </table></div></div>`;
}

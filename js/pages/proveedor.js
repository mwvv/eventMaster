// ============================================================
//  PROVEEDOR PAGE DISPATCHER
// ============================================================
function renderProveedorPage(id) {
  const titleMap = { dashboard:'Mi panel', 'mis-asignaciones':'Mis Asignaciones', 'perfil-servicios':'Perfil de Servicios', notificaciones:'Notificaciones' };
  document.getElementById('topbarTitle').textContent = titleMap[id] || id;
  const pages = { dashboard: renderProveedorDashboard, 'mis-asignaciones': renderMisAsignaciones, 'perfil-servicios': renderPerfilServicios, notificaciones: renderNotificacionesPage };
  const fn = pages[id];
  if (fn) document.getElementById('pageContent').innerHTML = fn();
}

// ============================================================
//  DASHBOARD
// ============================================================
function renderProveedorDashboard() {
  const p    = PROVEEDORES.find(x=>x.idUsuario===STATE.user.id);
  const misA = ASIGNACIONES.filter(a=>p&&a.idProveedor===p.id);
  return `
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-label">Asignaciones totales</div><div class="stat-value">${misA.length}</div></div>
    <div class="stat-card"><div class="stat-label">Aceptadas</div><div class="stat-value">${misA.filter(a=>a.estado==='aceptada').length}</div></div>
    <div class="stat-card"><div class="stat-label">Pendientes</div><div class="stat-value">${misA.filter(a=>a.estado==='pendiente').length}</div></div>
    <div class="stat-card"><div class="stat-label">Calificación</div><div class="stat-value">${p?.calificacion||'—'}</div></div>
  </div>
  <div class="card">
    <div class="card-header"><span class="card-title">Mis asignaciones recientes</span>
      <button class="btn btn-outline btn-sm" onclick="showPage('mis-asignaciones')">Ver todas</button>
    </div>
    ${p ? renderAsignacionesProveedor(p.id, true) : '<div class="empty-state"><h3>Perfil no configurado</h3><p>Configura tu perfil de servicios para recibir asignaciones.</p></div>'}
  </div>`;
}

// ============================================================
//  MIS ASIGNACIONES
// ============================================================
function renderMisAsignaciones() {
  const p = PROVEEDORES.find(x=>x.idUsuario===STATE.user.id);
  return `
  <div class="page-header"><div class="page-header-text"><h1>Mis asignaciones</h1><p>Eventos que tienes asignados</p></div></div>
  ${p ? renderAsignacionesProveedor(p.id, false) : '<div class="card"><div class="empty-state"><h3>Sin perfil de proveedor</h3><p>Configura tu perfil para recibir asignaciones.</p></div></div>'}`;
}

function renderAsignacionesProveedor(idProv, compact) {
  const misA = ASIGNACIONES.filter(a=>a.idProveedor===idProv);
  if (!misA.length) return '<div class="card-body"><p style="color:var(--text-muted);font-size:13px">Sin asignaciones aún.</p></div>';
  return `<div class="table-wrap"><table>
    <thead><tr><th>Evento</th><th>Servicio</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>
      ${misA.slice(0, compact?3:999).map(a=>{
        const ev = EVENTOS.find(e=>e.id===a.idEvento);
        return `<tr>
          <td><strong>${ev?.nombre||'-'}</strong><br><span style="font-size:11px;color:var(--text-muted)">${formatDate(ev?.fecha)}</span></td>
          <td>${a.servicio}</td>
          <td>${formatDate(a.fecha)}</td>
          <td>${badgeAsignacion(a.estado)}</td>
          <td>${a.estado==='pendiente'?`
            <div class="flex gap-2">
              <button class="btn btn-success btn-sm" onclick="provRespuesta(${a.id},'aceptada')">${iconCheck()} Aceptar</button>
              <button class="btn btn-danger btn-sm" onclick="provRespuesta(${a.id},'rechazada')">${iconX()} Rechazar</button>
            </div>`:''}
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

function provRespuesta(id, estado) {
  const a = ASIGNACIONES.find(x=>x.id===id);
  if (!a) return;
  a.estado = estado;
  NOTIFICACIONES.unshift({ id:Date.now(), mensaje:`Asignación respondida: ${estado}`, tipo:'asignacion', leida:false, fecha:new Date().toLocaleString('es-CL'), idDestino:'admin' });
  showToast(`Asignación ${estado} correctamente. Administrador notificado.`, 'success');
  renderProveedorPage('mis-asignaciones');
}

// ============================================================
//  PERFIL DE SERVICIOS
// ============================================================
function renderPerfilServicios() {
  const p = PROVEEDORES.find(x=>x.idUsuario===STATE.user.id) || { empresa:'', tipo:'Sonido', precio:0, servicios:'', calificacion:5.0, disponibilidad:true };
  return `
  <div class="page-header"><div class="page-header-text"><h1>Perfil de servicios</h1></div></div>
  <div class="card" style="max-width:600px">
    <div class="card-header"><span class="card-title">Información del proveedor</span></div>
    <div class="card-body">
      <div class="form-group"><label>Nombre de empresa</label><input type="text" id="ppEmpresa" class="form-control" value="${p.empresa}"></div>
      <div class="grid-2">
        <div class="form-group"><label>Tipo de servicio</label>
          <select id="ppTipo" class="form-control form-select">
            ${['Sonido','Decoración','Fotografía','Catering','Transporte','Otro'].map(t=>`<option ${p.tipo===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Precio base (CLP)</label><input type="number" id="ppPrecio" class="form-control" value="${p.precio}"></div>
      </div>
      <div class="form-group"><label>Descripción de servicios</label><textarea id="ppDesc" class="form-control">${p.servicios}</textarea></div>
      <label class="checkbox-row"><input type="checkbox" id="ppDisp" ${p.disponibilidad?'checked':''}> Disponible para nuevas asignaciones</label>
      <div class="mt-4"><button class="btn btn-primary" onclick="guardarPerfilProv()">Guardar cambios</button></div>
    </div>
  </div>`;
}

function guardarPerfilProv() {
  const empresa = document.getElementById('ppEmpresa').value.trim();
  const tipo    = document.getElementById('ppTipo').value;
  const precio  = parseInt(document.getElementById('ppPrecio').value) || 0;
  const desc    = document.getElementById('ppDesc').value;
  const disp    = document.getElementById('ppDisp').checked;
  if (!empresa) { showToast('Ingresa el nombre de tu empresa.', 'warning'); return; }
  if (precio <= 0) { showToast('El precio debe ser mayor a cero.', 'warning'); return; }
  let p = PROVEEDORES.find(x=>x.idUsuario===STATE.user.id);
  if (p) { Object.assign(p, {empresa, tipo, precio, servicios:desc, disponibilidad:disp}); }
  else   { PROVEEDORES.push({ id:PROVEEDORES.length+1, idUsuario:STATE.user.id, empresa, tipo, precio, servicios:desc, calificacion:5.0, disponibilidad:disp }); }
  showToast('Perfil de servicios actualizado. Los cambios son visibles para el administrador.', 'success');
  renderProveedorPage('perfil-servicios');
}

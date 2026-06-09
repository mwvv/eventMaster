// ============================================================
//  ADMIN PAGE DISPATCHER
// ============================================================
function renderAdminPage(id) {
  const pages = {
    dashboard:     renderAdminDashboard,
    eventos:       renderEventosPage,
    usuarios:      renderUsuariosPage,
    proveedores:   renderProveedoresPage,
    asignaciones:  renderAsignacionesPage,
    reservas:      renderReservasPage,
    pagos:         renderPagosPage,
    roles:         renderRolesPage,
    notificaciones:renderNotificacionesPage,
  };
  const titleMap = {
    dashboard:'Dashboard', eventos:'Gestión de Eventos', usuarios:'Gestión de Usuarios',
    proveedores:'Proveedores', asignaciones:'Asignaciones', reservas:'Reservas',
    pagos:'Pagos', roles:'Roles y Permisos', notificaciones:'Notificaciones',
  };
  document.getElementById('topbarTitle').textContent = titleMap[id] || id;
  const fn = pages[id];
  if (fn) { document.getElementById('pageContent').innerHTML = fn(); attachAdminEvents(id); }
}

function attachAdminEvents(id) {}

// ============================================================
//  DASHBOARD
// ============================================================
function renderAdminDashboard() {
  const totalEventos  = EVENTOS.filter(e=>e.estado!=='cancelado').length;
  const totalReservas = RESERVAS.length;
  const totalPagos    = PAGOS.filter(p=>p.estado==='completado').reduce((s,p)=>s+p.monto,0);
  const eventosActivos = EVENTOS.filter(e=>e.estado==='activo').length;
  return `
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--info-bg); color:var(--info-text)">${iconCalendar()}</div>
      <div class="stat-label">Eventos activos</div>
      <div class="stat-value">${eventosActivos}</div>
      <div class="stat-sub">de ${totalEventos} totales</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--success-bg); color:var(--success-text)">${iconBookmark()}</div>
      <div class="stat-label">Reservas totales</div>
      <div class="stat-value">${totalReservas}</div>
      <div class="stat-sub">${RESERVAS.filter(r=>r.estado==='confirmada').length} confirmadas</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--warning-bg); color:var(--warning-text)">${iconCreditCard()}</div>
      <div class="stat-label">Ingresos confirmados</div>
      <div class="stat-value">$${(totalPagos/1000000).toFixed(1)}M</div>
      <div class="stat-sub">CLP</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--danger-bg); color:var(--danger-text)">${iconUsers()}</div>
      <div class="stat-label">Usuarios activos</div>
      <div class="stat-value">${USERS.filter(u=>u.estado==='activo').length}</div>
      <div class="stat-sub">de ${USERS.length} registrados</div>
    </div>
  </div>
  <div class="grid-2" style="gap:20px">
    <div class="card">
      <div class="card-header">
        <span class="card-title">Próximos eventos</span>
        <button class="btn btn-outline btn-sm" onclick="showPage('eventos')">${iconCalendar()} Ver todos</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Evento</th><th>Fecha</th><th>Estado</th><th>Cupos</th></tr></thead>
          <tbody>
            ${EVENTOS.filter(e=>e.estado==='activo').map(e=>`
            <tr><td><strong>${e.nombre}</strong><br><span class="text-muted text-sm">${e.tipo}</span></td>
            <td>${formatDate(e.fecha)}</td>
            <td>${badgeEstado(e.estado)}</td>
            <td>${e.capacidadDisp}/${e.capacidadMax}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Asignaciones recientes</span></div>
      <div class="card-body" style="padding:0">
        ${ASIGNACIONES.map(a => {
          const ev = EVENTOS.find(e=>e.id===a.idEvento);
          const pr = PROVEEDORES.find(p=>p.id===a.idProveedor);
          return `<div style="padding:12px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between">
            <div>
              <div style="font-size:13px; font-weight:500">${pr?.empresa}</div>
              <div style="font-size:12px; color:var(--text-muted)">${ev?.nombre} · ${a.servicio}</div>
            </div>
            ${badgeAsignacion(a.estado)}
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}

// ============================================================
//  EVENTOS
// ============================================================
function renderEventosPage() {
  return `
  <div class="page-header">
    <div class="page-header-text"><h1>Eventos</h1><p>Gestiona todos los eventos de la plataforma</p></div>
    <button class="btn btn-primary" onclick="openEventoModal()">${iconPlus()} Nuevo evento</button>
  </div>
  <div class="filters-row">
    <div class="search-box">
      ${iconSearch()}<input type="text" class="form-control" id="searchEvento" placeholder="Buscar evento..." oninput="filterEventos()">
    </div>
    <select class="form-control form-select filter-select" id="filterTipo" onchange="filterEventos()">
      <option value="">Todos los tipos</option>
      <option>Matrimonio</option><option>Cumpleaños</option><option>Corporativo</option>
    </select>
    <select class="form-control form-select filter-select" id="filterEstado" onchange="filterEventos()">
      <option value="">Todos los estados</option>
      <option>activo</option><option>cancelado</option><option>finalizado</option>
    </select>
  </div>
  <div id="eventosContainer">
    ${renderEventosTable(EVENTOS)}
  </div>`;
}

function renderEventosTable(eventos) {
  if (!eventos.length) return `<div class="empty-state"><h3>No hay eventos</h3><p>Crea el primer evento con el botón de arriba.</p></div>`;
  return `<div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Evento</th><th>Tipo</th><th>Fecha</th><th>Lugar</th><th>Capacidad</th><th>Precio base</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>
      ${eventos.map(e=>`
      <tr>
        <td><strong>${e.nombre}</strong></td>
        <td><span class="badge badge-brand">${e.tipo}</span></td>
        <td>${formatDate(e.fecha)} ${e.hora}</td>
        <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.lugar}</td>
        <td>${e.capacidadDisp}/${e.capacidadMax}</td>
        <td>$${e.precioBase.toLocaleString('es-CL')}</td>
        <td>${badgeEstado(e.estado)}</td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" onclick="openEventoModal(${e.id})">${iconEdit()}</button>
            <button class="btn btn-danger btn-sm" onclick="cancelarEvento(${e.id})">${iconTrash()}</button>
          </div>
        </td>
      </tr>`).join('')}
    </tbody>
  </table></div></div>`;
}

function filterEventos() {
  const q      = document.getElementById('searchEvento')?.value.toLowerCase() || '';
  const tipo   = document.getElementById('filterTipo')?.value || '';
  const estado = document.getElementById('filterEstado')?.value || '';
  const filtered = EVENTOS.filter(e =>
    (!q      || e.nombre.toLowerCase().includes(q) || e.lugar.toLowerCase().includes(q)) &&
    (!tipo   || e.tipo === tipo) &&
    (!estado || e.estado === estado)
  );
  document.getElementById('eventosContainer').innerHTML = renderEventosTable(filtered);
}

function openEventoModal(id=null) {
  const ev = id ? EVENTOS.find(e=>e.id===id) : null;
  showModal(ev ? 'Editar evento' : 'Nuevo evento', `
    <div class="grid-2">
      <div class="form-group">
        <label>Nombre del evento</label>
        <input type="text" id="evNombre" class="form-control" value="${ev?.nombre||''}" placeholder="Ej: Boda García-Morales">
      </div>
      <div class="form-group">
        <label>Tipo de evento</label>
        <select id="evTipo" class="form-control form-select">
          ${['Matrimonio','Cumpleaños','Corporativo','Otro'].map(t=>`<option ${ev?.tipo===t?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="grid-2">
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" id="evFecha" class="form-control" value="${ev?.fecha||''}">
      </div>
      <div class="form-group">
        <label>Hora</label>
        <input type="time" id="evHora" class="form-control" value="${ev?.hora||''}">
      </div>
    </div>
    <div class="form-group">
      <label>Lugar</label>
      <input type="text" id="evLugar" class="form-control" value="${ev?.lugar||''}" placeholder="Ej: Casona Las Rosas, Vitacura">
    </div>
    <div class="grid-2">
      <div class="form-group">
        <label>Capacidad máxima</label>
        <input type="number" id="evCapacidad" class="form-control" value="${ev?.capacidadMax||''}" placeholder="100">
      </div>
      <div class="form-group">
        <label>Precio base (CLP)</label>
        <input type="number" id="evPrecio" class="form-control" value="${ev?.precioBase||''}" placeholder="500000">
      </div>
    </div>
    <div class="form-group">
      <label>Descripción</label>
      <textarea id="evDesc" class="form-control">${ev?.descripcion||''}</textarea>
    </div>
    <div id="eventoAlert" class="alert hidden"></div>
  `, () => guardarEvento(id));
}

function guardarEvento(id) {
  const nombre   = document.getElementById('evNombre').value.trim();
  const tipo     = document.getElementById('evTipo').value;
  const fecha    = document.getElementById('evFecha').value;
  const hora     = document.getElementById('evHora').value;
  const lugar    = document.getElementById('evLugar').value.trim();
  const capacidad = parseInt(document.getElementById('evCapacidad').value);
  const precio   = parseInt(document.getElementById('evPrecio').value);
  const desc     = document.getElementById('evDesc').value;
  const al       = document.getElementById('eventoAlert');
  if (!nombre || !fecha || !lugar || !capacidad || !precio) { showAlert(al,'Completa todos los campos obligatorios.'); return; }
  if (new Date(fecha) < new Date() && !id) { showAlert(al,'La fecha no puede ser pasada.'); return; }
  if (id) {
    const ev = EVENTOS.find(e=>e.id===id);
    Object.assign(ev, {nombre,tipo,fecha,hora,lugar,capacidadMax:capacidad,precioBase:precio,descripcion:desc});
    showToast('Evento actualizado correctamente.', 'success');
  } else {
    EVENTOS.push({ id:EVENTOS.length+1, nombre, tipo, fecha, hora, lugar, capacidadMax:capacidad, capacidadDisp:capacidad, precioBase:precio, estado:'activo', descripcion:desc, emoji:'🎉' });
    showToast('Evento creado correctamente.', 'success');
  }
  closeModal();
  renderAdminPage('eventos');
}

function cancelarEvento(id) {
  const ev = EVENTOS.find(e=>e.id===id);
  if (!ev) return;
  showConfirm(`¿Cancelar el evento "${ev.nombre}"?`, 'Esta acción notificará a todos los participantes.', () => {
    ev.estado = 'cancelado';
    NOTIFICACIONES.unshift({ id:Date.now(), mensaje:`Evento "${ev.nombre}" fue cancelado.`, tipo:'evento', leida:false, fecha:new Date().toLocaleString('es-CL'), idDestino:'all' });
    showToast('Evento cancelado y participantes notificados.', 'warning');
    renderAdminPage('eventos');
  });
}

// ============================================================
//  USUARIOS
// ============================================================
function renderUsuariosPage() {
  return `
  <div class="page-header">
    <div class="page-header-text"><h1>Usuarios</h1><p>Administra las cuentas de acceso al sistema</p></div>
    <button class="btn btn-primary" onclick="openUsuarioModal()">${iconPlus()} Nuevo usuario</button>
  </div>
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Teléfono</th><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          ${USERS.map(u=>`
          <tr>
            <td><div class="flex items-center gap-2">
              <div class="avatar ${u.rol==='admin'?'avatar-brand':u.rol==='proveedor'?'avatar-success':'avatar-accent'}">${(u.nombre[0]+u.apellido[0]).toUpperCase()}</div>
              <div><div style="font-weight:500">${u.nombre} ${u.apellido}</div></div>
            </div></td>
            <td style="color:var(--text-muted)">${u.email}</td>
            <td>${badgeRol(u.rol)}</td>
            <td>${u.telefono}</td>
            <td>${formatDate(u.fechaRegistro)}</td>
            <td>${u.estado==='activo'?'<span class="badge badge-success">Activo</span>':'<span class="badge badge-danger">Inactivo</span>'}</td>
            <td><div class="flex gap-2">
              <button class="btn btn-ghost btn-sm" onclick="openUsuarioModal(${u.id})">${iconEdit()}</button>
              ${u.id !== STATE.user.id ? `<button class="btn btn-danger btn-sm" onclick="toggleUsuario(${u.id})">${u.estado==='activo'?iconTrash():iconCheck()}</button>` : ''}
            </div></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function openUsuarioModal(id=null) {
  const u = id ? USERS.find(x=>x.id===id) : null;
  showModal(id ? 'Editar usuario' : 'Nuevo usuario', `
    <div class="grid-2">
      <div class="form-group"><label>Nombre</label><input type="text" id="uNombre" class="form-control" value="${u?.nombre||''}"></div>
      <div class="form-group"><label>Apellido</label><input type="text" id="uApellido" class="form-control" value="${u?.apellido||''}"></div>
    </div>
    <div class="form-group"><label>Correo electrónico</label><input type="email" id="uEmail" class="form-control" value="${u?.email||''}"></div>
    <div class="form-group"><label>Teléfono</label><input type="tel" id="uTel" class="form-control" value="${u?.telefono||''}"></div>
    <div class="form-group"><label>Rol</label>
      <select id="uRol" class="form-control form-select">
        <option value="admin"     ${u?.rol==='admin'    ?'selected':''}>Administrador</option>
        <option value="cliente"   ${u?.rol==='cliente'  ?'selected':''}>Cliente</option>
        <option value="proveedor" ${u?.rol==='proveedor'?'selected':''}>Proveedor</option>
      </select>
    </div>
    ${!id ? `<div class="form-group"><label>Contraseña temporal</label><input type="password" id="uPass" class="form-control" placeholder="Mínimo 8 caracteres"></div>` : ''}
    <div id="usuarioAlert" class="alert hidden"></div>
  `, () => guardarUsuario(id));
}

function guardarUsuario(id) {
  const nombre   = document.getElementById('uNombre').value.trim();
  const apellido = document.getElementById('uApellido').value.trim();
  const email    = document.getElementById('uEmail').value.trim();
  const tel      = document.getElementById('uTel').value.trim();
  const rol      = document.getElementById('uRol').value;
  const al       = document.getElementById('usuarioAlert');
  if (!nombre || !apellido || !email) { showAlert(al, 'Completa los campos obligatorios.'); return; }
  if (USERS.find(u => u.email === email && u.id !== id)) { showAlert(al, 'Este correo ya está registrado.'); return; }
  if (id) {
    const u = USERS.find(x=>x.id===id);
    Object.assign(u, {nombre, apellido, email, telefono:tel, rol});
    showToast('Usuario actualizado.', 'success');
  } else {
    const pass = document.getElementById('uPass')?.value || 'temp1234';
    USERS.push({ id:USERS.length+1, nombre, apellido, email, pass, rol, estado:'activo', telefono:tel, fechaRegistro:new Date().toISOString().split('T')[0] });
    showToast('Usuario creado correctamente.', 'success');
  }
  closeModal();
  renderAdminPage('usuarios');
}

function toggleUsuario(id) {
  const u = USERS.find(x=>x.id===id);
  if (!u) return;
  const action = u.estado === 'activo' ? 'desactivar' : 'activar';
  showConfirm(`¿${action.charAt(0).toUpperCase()+action.slice(1)} a ${u.nombre}?`, '', () => {
    u.estado = u.estado === 'activo' ? 'inactivo' : 'activo';
    showToast(`Usuario ${action==='desactivar'?'desactivado':'activado'}.`, 'success');
    renderAdminPage('usuarios');
  });
}

// ============================================================
//  PROVEEDORES
// ============================================================
function renderProveedoresPage() {
  return `
  <div class="page-header">
    <div class="page-header-text"><h1>Proveedores</h1><p>Directorio de proveedores de servicios</p></div>
    <button class="btn btn-primary" onclick="openProveedorModal()">${iconPlus()} Nuevo proveedor</button>
  </div>
  <div class="events-grid">
    ${PROVEEDORES.map(p=>`
    <div class="card" style="overflow:visible">
      <div class="card-body">
        <div class="flex items-center gap-3 mb-3">
          <div class="avatar avatar-success" style="width:44px;height:44px;font-size:16px">${p.empresa[0]}</div>
          <div>
            <div style="font-weight:500;font-size:14px">${p.empresa}</div>
            <span class="badge badge-brand">${p.tipo}</span>
          </div>
          <div style="margin-left:auto">
            ${p.disponibilidad?'<span class="badge badge-success">Disponible</span>':'<span class="badge badge-danger">No disponible</span>'}
          </div>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">${p.servicios}</div>
        <div class="flex items-center justify-between">
          <div style="font-size:13px">⭐ ${p.calificacion} / 5.0</div>
          <div style="font-family:'DM Serif Display',serif;font-size:15px;color:var(--brand)">$${p.precio.toLocaleString('es-CL')}</div>
        </div>
      </div>
      <div class="card-header" style="border-top:1px solid var(--border);border-bottom:none">
        <button class="btn btn-ghost btn-sm" onclick="openProveedorModal(${p.id})">${iconEdit()} Editar</button>
        <button class="btn btn-outline btn-sm" onclick="asignarProveedorDesde(${p.id})">${iconLink()} Asignar</button>
      </div>
    </div>`).join('')}
  </div>`;
}

function openProveedorModal(id=null) {
  const p = id ? PROVEEDORES.find(x=>x.id===id) : null;
  showModal(id ? 'Editar proveedor' : 'Nuevo proveedor', `
    <div class="form-group"><label>Nombre de empresa</label><input type="text" id="pEmpresa" class="form-control" value="${p?.empresa||''}"></div>
    <div class="grid-2">
      <div class="form-group"><label>Tipo de servicio</label>
        <select id="pTipo" class="form-control form-select">
          ${['Sonido','Decoración','Fotografía','Catering','Transporte','Otro'].map(t=>`<option ${p?.tipo===t?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Precio base (CLP)</label><input type="number" id="pPrecio" class="form-control" value="${p?.precio||''}"></div>
    </div>
    <div class="form-group"><label>Descripción de servicios</label><textarea id="pDesc" class="form-control">${p?.servicios||''}</textarea></div>
    <label class="checkbox-row"><input type="checkbox" id="pDisp" ${p?.disponibilidad?'checked':''}> Disponible para asignaciones</label>
  `, () => guardarProveedor(id));
}

function guardarProveedor(id) {
  const empresa = document.getElementById('pEmpresa').value.trim();
  const tipo    = document.getElementById('pTipo').value;
  const precio  = parseInt(document.getElementById('pPrecio').value) || 0;
  const desc    = document.getElementById('pDesc').value;
  const disp    = document.getElementById('pDisp').checked;
  if (!empresa) { showToast('Ingresa el nombre de la empresa.', 'warning'); return; }
  if (id) {
    const p = PROVEEDORES.find(x=>x.id===id);
    Object.assign(p, {empresa, tipo, precio, servicios:desc, disponibilidad:disp});
    showToast('Proveedor actualizado.', 'success');
  } else {
    PROVEEDORES.push({ id:PROVEEDORES.length+1, idUsuario:null, empresa, tipo, precio, servicios:desc, calificacion:5.0, disponibilidad:disp });
    showToast('Proveedor registrado correctamente.', 'success');
  }
  closeModal();
  renderAdminPage('proveedores');
}

function asignarProveedorDesde(idProv) {
  closeModal();
  renderAdminPage('asignaciones');
  setTimeout(() => openAsignacionModal(null, idProv), 100);
}

// ============================================================
//  ASIGNACIONES
// ============================================================
function renderAsignacionesPage() {
  return `
  <div class="page-header">
    <div class="page-header-text"><h1>Asignaciones</h1><p>Asignación de proveedores a eventos</p></div>
    <button class="btn btn-primary" onclick="openAsignacionModal()">${iconPlus()} Nueva asignación</button>
  </div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Evento</th><th>Proveedor</th><th>Servicio</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>
      ${ASIGNACIONES.map(a => {
        const ev = EVENTOS.find(e=>e.id===a.idEvento);
        const pr = PROVEEDORES.find(p=>p.id===a.idProveedor);
        return `<tr>
          <td><strong>${ev?.nombre||'-'}</strong></td>
          <td>${pr?.empresa||'-'}</td>
          <td>${a.servicio}</td>
          <td>${formatDate(a.fecha)}</td>
          <td>${badgeAsignacion(a.estado)}</td>
          <td>${a.estado==='pendiente'?`<div class="flex gap-2">
            <button class="btn btn-success btn-sm" onclick="responderAsignacion(${a.id},'aceptada')">${iconCheck()} Aceptar</button>
            <button class="btn btn-danger btn-sm" onclick="responderAsignacion(${a.id},'rechazada')">${iconX()} Rechazar</button>
          </div>`:''}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table></div></div>`;
}

function openAsignacionModal(id=null, idProvPre=null) {
  showModal('Nueva asignación', `
    <div class="form-group"><label>Evento</label>
      <select id="asEvento" class="form-control form-select">
        ${EVENTOS.filter(e=>e.estado==='activo').map(e=>`<option value="${e.id}">${e.nombre}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Proveedor</label>
      <select id="asProveedor" class="form-control form-select">
        ${PROVEEDORES.filter(p=>p.disponibilidad).map(p=>`<option value="${p.id}" ${p.id===idProvPre?'selected':''}>${p.empresa} (${p.tipo})</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Tipo de servicio solicitado</label><input type="text" id="asServicio" class="form-control" placeholder="Ej: Sonido y DJ"></div>
    <div class="form-group"><label>Fecha de asignación</label><input type="date" id="asFecha" class="form-control" value="${new Date().toISOString().split('T')[0]}"></div>
  `, () => {
    const idE  = parseInt(document.getElementById('asEvento').value);
    const idP  = parseInt(document.getElementById('asProveedor').value);
    const serv = document.getElementById('asServicio').value.trim();
    const fecha = document.getElementById('asFecha').value;
    if (!serv) { showToast('Especifica el tipo de servicio.', 'warning'); return; }
    ASIGNACIONES.push({ id:ASIGNACIONES.length+1, idEvento:idE, idProveedor:idP, servicio:serv, estado:'pendiente', fecha, nota:'' });
    NOTIFICACIONES.unshift({ id:Date.now(), mensaje:`Nueva asignación para ${EVENTOS.find(e=>e.id===idE)?.nombre}`, tipo:'asignacion', leida:false, fecha:new Date().toLocaleString('es-CL'), idDestino:'proveedor' });
    showToast('Asignación creada. Proveedor notificado.', 'success');
    closeModal();
    renderAdminPage('asignaciones');
  });
}

function responderAsignacion(id, estado) {
  const a = ASIGNACIONES.find(x=>x.id===id);
  if (!a) return;
  a.estado = estado;
  showToast(`Asignación ${estado==='aceptada'?'aceptada':'rechazada'} correctamente.`, estado==='aceptada'?'success':'warning');
  NOTIFICACIONES.unshift({ id:Date.now(), mensaje:`Asignación fue ${estado}`, tipo:'asignacion', leida:false, fecha:new Date().toLocaleString('es-CL'), idDestino:'admin' });
  renderAdminPage('asignaciones');
}

// ============================================================
//  RESERVAS
// ============================================================
function renderReservasPage() {
  return `
  <div class="page-header">
    <div class="page-header-text"><h1>Reservas</h1><p>Registro de reservas de clientes</p></div>
  </div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Evento</th><th>Cliente</th><th>Personas</th><th>Fecha reserva</th><th>Estado</th><th>Pago</th></tr></thead>
    <tbody>
      ${RESERVAS.map(r => {
        const ev   = EVENTOS.find(e=>e.id===r.idEvento);
        const cl   = USERS.find(u=>u.id===r.idUsuario);
        const pago = PAGOS.find(p=>p.idReserva===r.id);
        return `<tr>
          <td><span class="badge badge-gray">#${r.id}</span></td>
          <td><strong>${ev?.nombre||'-'}</strong></td>
          <td>${cl?.nombre} ${cl?.apellido||'-'}</td>
          <td>${r.cantPersonas} personas</td>
          <td>${formatDate(r.fechaReserva)}</td>
          <td>${badgeReserva(r.estado)}</td>
          <td>${pago ? badgePago(pago.estado) : '<span class="badge badge-gray">Sin pago</span>'}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table></div></div>`;
}

// ============================================================
//  PAGOS
// ============================================================
function renderPagosPage() {
  const total = PAGOS.filter(p=>p.estado==='completado').reduce((s,p)=>s+p.monto,0);
  return `
  <div class="page-header">
    <div class="page-header-text"><h1>Pagos</h1><p>Historial de transacciones del sistema</p></div>
  </div>
  <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">
    <div class="stat-card">
      <div class="stat-label">Total recaudado</div>
      <div class="stat-value">$${(total/1000000).toFixed(1)}M</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Transacciones completas</div>
      <div class="stat-value">${PAGOS.filter(p=>p.estado==='completado').length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Pendientes</div>
      <div class="stat-value">${PAGOS.filter(p=>p.estado==='pendiente').length}</div>
    </div>
  </div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Nº Transacción</th><th>Reserva</th><th>Monto</th><th>Método</th><th>Estado</th><th>Fecha</th></tr></thead>
    <tbody>
      ${PAGOS.map(p=>{
        const r  = RESERVAS.find(x=>x.id===p.idReserva);
        const ev = r ? EVENTOS.find(e=>e.id===r.idEvento) : null;
        return `<tr>
          <td><code style="font-size:11px">${p.numTrans||'—'}</code></td>
          <td>${ev?.nombre||'-'}</td>
          <td style="font-family:'DM Serif Display',serif;font-size:15px">$${p.monto.toLocaleString('es-CL')}</td>
          <td><span class="badge badge-brand">${p.metodo}</span></td>
          <td>${badgePago(p.estado)}</td>
          <td>${p.fecha?formatDate(p.fecha):'—'}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table></div></div>`;
}

// ============================================================
//  ROLES
// ============================================================
function renderRolesPage() {
  const roles = [
    { nombre:'Administrador',   desc:'Acceso completo al sistema. Gestiona eventos, usuarios, proveedores, reservas y pagos.',          permisos:['Gestión de eventos','Gestión de usuarios','Asignación de proveedores','Ver y gestionar reservas','Ver y gestionar pagos','Configurar roles'], color:'info' },
    { nombre:'Cliente',         desc:'Puede consultar el catálogo, reservar eventos y realizar pagos.',                                  permisos:['Consultar eventos','Reservar eventos','Realizar pagos','Ver sus reservas','Gestionar su perfil'], color:'warning' },
    { nombre:'Proveedor',       desc:'Puede ver sus asignaciones, responderlas y gestionar su perfil de servicios.',                     permisos:['Ver eventos asignados','Aceptar/rechazar asignaciones','Gestionar perfil de servicios','Recibir notificaciones'], color:'success' },
    { nombre:'Usuario Invitado',desc:'Acceso de solo lectura al catálogo de eventos públicos.',                                          permisos:['Consultar catálogo de eventos','Registrarse en la plataforma'], color:'gray' },
  ];
  return `
  <div class="page-header">
    <div class="page-header-text"><h1>Roles y permisos</h1><p>Control de acceso basado en roles (RBAC)</p></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">
    ${roles.map(r=>`
    <div class="card">
      <div class="card-header"><span class="card-title">${r.nombre}</span><span class="badge badge-${r.color}">${r.color==='info'?'Admin':r.nombre.split(' ')[0]}</span></div>
      <div class="card-body">
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${r.desc}</p>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${r.permisos.map(p=>`<div style="display:flex;align-items:center;gap:6px;font-size:12px"><span style="color:var(--success-text)">${iconCheck()}</span>${p}</div>`).join('')}
        </div>
      </div>
    </div>`).join('')}
  </div>`;
}

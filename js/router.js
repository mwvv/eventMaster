// ============================================================
//  NAV DEFINITIONS
// ============================================================
const NAV_ADMIN = [
  { label:'Principal', items:[
    { id:'dashboard',      icon:iconHome,       label:'Dashboard' },
  ]},
  { label:'Gestión', items:[
    { id:'eventos',        icon:iconCalendar,   label:'Eventos' },
    { id:'usuarios',       icon:iconUsers,      label:'Usuarios' },
    { id:'proveedores',    icon:iconTruck,      label:'Proveedores' },
    { id:'asignaciones',   icon:iconLink,       label:'Asignaciones' },
  ]},
  { label:'Finanzas', items:[
    { id:'reservas',       icon:iconBookmark,   label:'Reservas' },
    { id:'pagos',          icon:iconCreditCard, label:'Pagos' },
  ]},
  { label:'Sistema', items:[
    { id:'roles',          icon:iconShield,     label:'Roles y permisos' },
    { id:'notificaciones', icon:iconBell,       label:'Notificaciones', badge:2 },
  ]},
];

const NAV_CLIENTE = [
  { label:'Principal', items:[
    { id:'dashboard',      icon:iconHome,       label:'Mi panel' },
    { id:'catalogo',       icon:iconSearch,     label:'Catálogo de eventos' },
    { id:'mis-reservas',   icon:iconBookmark,   label:'Mis reservas' },
    { id:'mis-pagos',      icon:iconCreditCard, label:'Mis pagos' },
    { id:'notificaciones', icon:iconBell,       label:'Notificaciones', badge:1 },
  ]},
];

const NAV_PROVEEDOR = [
  { label:'Principal', items:[
    { id:'dashboard',        icon:iconHome,     label:'Mi panel' },
    { id:'mis-asignaciones', icon:iconLink,     label:'Mis asignaciones', badge:1 },
    { id:'perfil-servicios', icon:iconSettings, label:'Perfil de servicios' },
    { id:'notificaciones',   icon:iconBell,     label:'Notificaciones', badge:1 },
  ]},
];

const NAV_INVITADO = [
  { label:'Explorar', items:[
    { id:'catalogo-invitado', icon:iconSearch, label:'Catálogo de eventos' },
  ]},
];

// ============================================================
//  NAV BUILD & ROUTING
// ============================================================
function buildNav() {
  const navMap = { admin: NAV_ADMIN, cliente: NAV_CLIENTE, proveedor: NAV_PROVEEDOR, invitado: NAV_INVITADO };
  const nav = navMap[STATE.role] || NAV_ADMIN;
  const container = document.getElementById('navItems');
  container.innerHTML = nav.map(section => `
    <div class="nav-section">
      <div class="nav-section-label">${section.label}</div>
      ${section.items.map(item => `
        <div class="nav-item" id="nav-${item.id}" onclick="showPage('${item.id}')">
          ${item.icon()} ${item.label}
          ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('');
}

function showPage(id) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  const pages = { admin: renderAdminPage, cliente: renderClientePage, proveedor: renderProveedorPage, invitado: renderInvitadoPage };
  const r = pages[STATE.role];
  if (r) {
    r(id);
    const pc = document.getElementById('pageContent');
    pc.classList.remove('page-enter');
    void pc.offsetWidth;
    pc.classList.add('page-enter');
    if (typeof animatePageWidgets === 'function') animatePageWidgets();
  }
}

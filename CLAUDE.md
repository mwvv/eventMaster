# EventMaster Pro

## Descripción
Plataforma de gestión de eventos con roles diferenciados (Admin, Cliente, Proveedor, Invitado).
La maqueta de referencia visual está en `mockup/EventMasterPro_1.html` — úsala como guía fiel de diseño.

## Fase actual
Frontend estático — replica fiel de la maqueta original.
Sin backend, sin build tools, sin frameworks. Todo corre directo en el browser.
Los datos son hardcodeados en JS (igual que el mockup).

## Fase futura
Conectar backend Spring Boot 3 + JWT + MySQL.
El frontend ya debe estar preparado para que en fase 2 solo se reemplacen
los arrays de datos por llamadas `fetch()` a la API REST.

## Stack
- HTML5 + CSS3 + JavaScript vanilla (ES6+)
- Sin jQuery, sin React, sin frameworks
- Sin bundler ni build step

## Estructura de carpetas
```
eventmaster-pro/
├── CLAUDE.md
├── mockup/
│   └── EventMasterPro_1.html   ← referencia visual, NO modificar
├── index.html                  ← entrada principal
├── css/
│   └── styles.css              ← extraído del mockup, NO modificar variables CSS
└── js/
    ├── data.js                 ← datos hardcodeados (usuarios, eventos, etc.)
    ├── auth.js                 ← login, logout, roles, JWT mock
    ├── router.js               ← cambio de páginas sin backend
    ├── components.js           ← modales, toasts, badges reutilizables
    └── pages/
        ├── admin.js
        ├── cliente.js
        ├── proveedor.js
        └── invitado.js
```

## Entidades (datos hardcodeados en data.js)
- **Usuario** (id, nombre, apellido, email, password, rol, estado, telefono, fechaRegistro)
- **Evento** (id, nombre, tipo, fecha, hora, lugar, capacidadMax, capacidadDisp, precioBase, estado, descripcion, emoji)
- **Proveedor** (id, idUsuario, empresa, servicios, calificacion, disponibilidad, tipo, precio)
- **Asignacion** (id, idEvento, idProveedor, servicio, estado, fecha, nota)
- **Reserva** (id, idEvento, idUsuario, fechaReserva, cantPersonas, estado)
- **Pago** (id, idReserva, monto, metodo, estado, fecha, numTransaccion)
- **Notificacion** (id, mensaje, tipo, leida, fecha, destinatarioRol)

## Roles y páginas
- **admin** → dashboard, eventos, usuarios, proveedores, asignaciones, reservas, pagos, roles, notificaciones
- **cliente** → dashboard, catálogo eventos, mis reservas, pagos, notificaciones
- **proveedor** → dashboard, mis asignaciones, notificaciones
- **invitado** → solo catálogo (solo lectura, sin reservar)

## Design tokens (CSS) — NO cambiar nombres ni valores
```css
--brand: #1a2744;
--brand-light: #243560;
--accent: #e8a838;
--accent-dark: #c4892a;
--surface: #f5f4f0;
--card: #ffffff;
--border: #e2e0d8;
--text: #1a1a18;
--text-muted: #6b6960;
--text-hint: #a09e96;
--success-bg: #eaf3de;  --success-text: #3b6d11;
--danger-bg: #fcebeb;   --danger-text: #a32d2d;
--warning-bg: #faeeda;  --warning-text: #854f0b;
--info-bg: #e6f1fb;     --info-text: #185fa5;
--radius: 10px;
--radius-lg: 16px;
--shadow: 0 2px 12px rgba(26,39,68,0.08);
--shadow-lg: 0 8px 32px rgba(26,39,68,0.14);
--sidebar-w: 240px;
```
Fuentes: `DM Serif Display` (h1/h2/h3), `DM Sans` (body)

## Componentes reutilizables (replicar del mockup)
- `.btn` con variantes: `btn-primary`, `btn-accent`, `btn-outline`, `btn-danger`, `btn-ghost`, `btn-sm`, `btn-lg`, `btn-block`
- `.badge` con variantes: `badge-success`, `badge-danger`, `badge-warning`, `badge-info`, `badge-gray`
- `.stat-card` para métricas del dashboard
- `.event-card` para grilla de eventos
- `.modal-overlay` + `.modal` para formularios emergentes
- Toast (éxito/error/warning, auto-dismiss 3.5s)
- Stepper de 3 pasos para flujo de reserva + pago

## Convenciones
- Funciones y variables en inglés, comentarios en español
- Cada página es una función que retorna HTML como string e inyecta en `#pageContent`
- Los datos viven en `data.js` como arrays exportados — fácil de reemplazar por fetch en fase 2
- Soft delete simulado: filtrar por `estado !== 'inactivo'`, no eliminar del array

## Estados válidos
- Evento: `activo | finalizado | cancelado`
- Reserva: `pendiente | confirmada | cancelada`
- Pago: `pendiente | completado | rechazado`
- Asignacion: `pendiente | aceptada | rechazada`
- Usuario: `activo | inactivo`

## Seguridad (simulada en frontend)
- Login valida contra array de usuarios en data.js
- Bloqueo tras 5 intentos fallidos (15 min, usando Date.now())
- Rutas protegidas por rol: si el rol no tiene acceso a la página, redirige al dashboard

## Lo que NO debe tocar Claude Code
- `mockup/EventMasterPro_1.html` — solo lectura
- Variables CSS en `:root` de styles.css
- Lógica de bloqueo por intentos de login

## Preparación para fase 2 (backend)
Cuando se conecte el backend, el cambio será mínimo:
- `data.js` se reemplaza por llamadas `fetch('/api/...')`
- Se agrega manejo de JWT real en `auth.js`
- El resto del código no cambia

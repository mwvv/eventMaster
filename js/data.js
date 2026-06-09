// Fase 2: reemplazar cada array por fetch('/api/<entidad>') y eliminar este archivo

const USERS = [
  { id:1, nombre:'Valentina', apellido:'Acuña',    email:'admin@eventmaster.cl', pass:'admin123', rol:'admin',     estado:'activo',   telefono:'+56912345678', fechaRegistro:'2026-01-10' },
  { id:2, nombre:'Carlos',    apellido:'Mendoza',  email:'cliente@test.cl',      pass:'cli123',   rol:'cliente',   estado:'activo',   telefono:'+56987654321', fechaRegistro:'2026-02-15' },
  { id:3, nombre:'Proveedor', apellido:'Audio',    email:'proveedor@test.cl',    pass:'prov123',  rol:'proveedor', estado:'activo',   telefono:'+56911111111', fechaRegistro:'2026-01-20' },
  { id:4, nombre:'Angela',    apellido:'Vásquez',  email:'angela@eventmaster.cl',pass:'ang123',   rol:'admin',     estado:'activo',   telefono:'+56922222222', fechaRegistro:'2026-01-12' },
  { id:5, nombre:'María',     apellido:'González', email:'maria@gmail.com',      pass:'cli456',   rol:'cliente',   estado:'inactivo', telefono:'+56933333333', fechaRegistro:'2026-03-01' },
];

const EVENTOS = [
  { id:1, nombre:'Boda García-Morales',         tipo:'Matrimonio', fecha:'2026-09-15', hora:'18:00', lugar:'Casona Las Rosas, Vitacura',       capacidadMax:150, capacidadDisp:42,  precioBase:850000, estado:'activo',    descripcion:'Elegante matrimonio con vista al jardín',          emoji:'💍' },
  { id:2, nombre:'Cumpleaños de Empresa TechCorp', tipo:'Corporativo', fecha:'2026-07-22', hora:'20:00', lugar:'Salón Grand, Las Condes',        capacidadMax:80,  capacidadDisp:25,  precioBase:350000, estado:'activo',    descripcion:'Celebración aniversario corporativo',               emoji:'🏢' },
  { id:3, nombre:'Cumpleaños Infantil Luna',    tipo:'Cumpleaños', fecha:'2026-08-05', hora:'15:00', lugar:'Parque Central, Providencia',      capacidadMax:50,  capacidadDisp:18,  precioBase:180000, estado:'activo',    descripcion:'Fiesta temática de unicornios',                     emoji:'🎂' },
  { id:4, nombre:'Conferencia Innovación 2026', tipo:'Corporativo', fecha:'2026-10-10', hora:'09:00', lugar:'Centro de Eventos, Santiago',      capacidadMax:300, capacidadDisp:210, precioBase:95000,  estado:'activo',    descripcion:'Conferencia anual de tecnología e innovación',      emoji:'🎯' },
  { id:5, nombre:'Matrimonio Silva-Torres',     tipo:'Matrimonio', fecha:'2025-06-01', hora:'17:00', lugar:'Hacienda Los Andes',               capacidadMax:120, capacidadDisp:0,   precioBase:980000, estado:'finalizado', descripcion:'Matrimonio campestre',                              emoji:'💒' },
];

const PROVEEDORES = [
  { id:1, idUsuario:3,    empresa:'Audio & Sonido Pro',      servicios:'Sonido, DJ e iluminación profesional',    calificacion:4.8, disponibilidad:true,  tipo:'Sonido',      precio:450000 },
  { id:2, idUsuario:null, empresa:'Flores & Arte',           servicios:'Decoración floral y ambientación',         calificacion:4.9, disponibilidad:true,  tipo:'Decoración',  precio:320000 },
  { id:3, idUsuario:null, empresa:'Foto Moments',            servicios:'Fotografía y video profesional',           calificacion:4.7, disponibilidad:false, tipo:'Fotografía',  precio:580000 },
  { id:4, idUsuario:null, empresa:'Chef Events Catering',    servicios:'Servicio de catering y banquetes',         calificacion:4.6, disponibilidad:true,  tipo:'Catering',    precio:280000 },
];

const ASIGNACIONES = [
  { id:1, idEvento:1, idProveedor:1, servicio:'Sonido y DJ',          estado:'aceptada',  fecha:'2026-08-01', nota:'' },
  { id:2, idEvento:1, idProveedor:2, servicio:'Decoración floral',    estado:'pendiente', fecha:'2026-08-05', nota:'' },
  { id:3, idEvento:2, idProveedor:4, servicio:'Catering corporativo', estado:'rechazada', fecha:'2026-07-10', nota:'Sin disponibilidad esa fecha' },
  { id:4, idEvento:3, idProveedor:2, servicio:'Decoración temática',  estado:'aceptada',  fecha:'2026-07-15', nota:'' },
];

const RESERVAS = [
  { id:1, idEvento:1, idUsuario:2, fechaReserva:'2026-07-01', cantPersonas:2, estado:'confirmada' },
  { id:2, idEvento:2, idUsuario:2, fechaReserva:'2026-07-05', cantPersonas:5, estado:'pendiente'  },
  { id:3, idEvento:4, idUsuario:5, fechaReserva:'2026-07-10', cantPersonas:3, estado:'cancelada'  },
];

const PAGOS = [
  { id:1, idReserva:1, monto:1700000, metodo:'credito', estado:'completado', fecha:'2026-07-02', numTrans:'TXN-2026-0001' },
  { id:2, idReserva:2, monto:1750000, metodo:'debito',  estado:'pendiente',  fecha:null,         numTrans:null            },
];

const NOTIFICACIONES = [
  { id:1, mensaje:'Nueva reserva confirmada para Boda García-Morales',       tipo:'reserva',    leida:false, fecha:'2026-07-02 14:32', idDestino:'admin'     },
  { id:2, mensaje:'Proveedor Audio & Sonido Pro aceptó la asignación',       tipo:'asignacion', leida:false, fecha:'2026-07-01 10:15', idDestino:'admin'     },
  { id:3, mensaje:'Tu reserva para Boda García-Morales fue confirmada',      tipo:'pago',       leida:true,  fecha:'2026-07-02 14:35', idDestino:'cliente'   },
  { id:4, mensaje:'Nueva asignación para Conferencia Innovación 2026',       tipo:'asignacion', leida:false, fecha:'2026-07-08 09:00', idDestino:'proveedor' },
];

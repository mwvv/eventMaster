// ============================================================
//  STATE
// ============================================================
const STATE = {
  user: null,
  role: 'admin',
  loginAttempts: 0,
  lockedUntil: null,
};

// ============================================================
//  LOGIN / REGISTER
// ============================================================
let selectedRole = 'admin';

function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll('.role-pill').forEach(p => {
    p.classList.toggle('active', p.getAttribute('onclick') === `selectRole('${role}')`);
  });
  const demos = { admin:'admin@eventmaster.cl', cliente:'cliente@test.cl', proveedor:'proveedor@test.cl' };
  const passes = { admin:'admin123', cliente:'cli123', proveedor:'prov123' };
  document.getElementById('loginEmail').value = demos[role] || '';
  document.getElementById('loginPass').value = passes[role] || '';
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  const alert = document.getElementById('loginAlert');

  if (STATE.lockedUntil && Date.now() < STATE.lockedUntil) {
    const mins = Math.ceil((STATE.lockedUntil - Date.now()) / 60000);
    alert.textContent = `Cuenta bloqueada. Intenta en ${mins} minuto(s).`;
    alert.classList.remove('hidden');
    return;
  }
  if (!email || !pass) { showAlert(alert, 'Por favor completa todos los campos.'); return; }

  const user = USERS.find(u => u.email === email && u.pass === pass);
  if (!user) {
    STATE.loginAttempts++;
    if (STATE.loginAttempts >= 5) {
      STATE.lockedUntil = Date.now() + 15 * 60 * 1000;
      showAlert(alert, 'Cuenta bloqueada temporalmente por 15 minutos.');
    } else {
      showAlert(alert, `Credenciales incorrectas. Intento ${STATE.loginAttempts}/5.`);
    }
    return;
  }
  if (user.estado === 'inactivo') { showAlert(alert, 'Cuenta inhabilitada. Contacte al administrador.'); return; }

  STATE.loginAttempts = 0;
  STATE.user = user;
  STATE.role = user.rol;
  initApp();
}

function doRegister() {
  const nombre   = document.getElementById('regNombre').value.trim();
  const apellido = document.getElementById('regApellido').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const tel      = document.getElementById('regTelefono').value.trim();
  const pass     = document.getElementById('regPass').value;
  const pass2    = document.getElementById('regPass2').value;
  const alert    = document.getElementById('registerAlert');
  alert.className = 'alert hidden';

  if (!nombre || !apellido || !email || !pass) { showAlert(alert, 'Por favor completa todos los campos.', 'danger'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showAlert(alert, 'Formato de correo inválido.', 'danger'); return; }
  if (USERS.find(u => u.email === email)) { showAlert(alert, 'Este correo ya está registrado.', 'danger'); return; }
  if (pass.length < 8) { showAlert(alert, 'La contraseña debe tener al menos 8 caracteres.', 'danger'); return; }
  if (pass !== pass2) { showAlert(alert, 'Las contraseñas no coinciden.', 'danger'); return; }

  const newUser = {
    id: USERS.length + 1, nombre, apellido, email, pass, rol:'cliente',
    estado:'activo', telefono: tel, fechaRegistro: new Date().toISOString().split('T')[0]
  };
  USERS.push(newUser);
  showAlert(alert, '¡Cuenta creada exitosamente! Redirigiendo...', 'success');
  showToast('Bienvenido a EventMaster Pro. ¡Cuenta creada!', 'success');
  setTimeout(() => { STATE.user = newUser; STATE.role = 'cliente'; initApp(); }, 1500);
}

function showLogin() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('registerScreen').classList.add('hidden');
}

function showRegister() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('registerScreen').classList.remove('hidden');
}

function doLogout() {
  STATE.user = null;
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('authWrap').classList.add('hidden');
  document.getElementById('landingPage').classList.remove('hidden');
  showLogin();
  showToast('Sesión cerrada correctamente.', 'success');
}

// ============================================================
//  APP INIT
// ============================================================
function initApp() {
  document.getElementById('authWrap').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  const u = STATE.user;
  document.getElementById('sidebarAvatar').textContent = (u.nombre[0] + u.apellido[0]).toUpperCase();
  document.getElementById('sidebarName').textContent   = u.nombre + ' ' + u.apellido;
  document.getElementById('sidebarRole').textContent   = u.rol.charAt(0).toUpperCase() + u.rol.slice(1);
  buildNav();
  showPage('dashboard');
  showToast(`Bienvenido, ${u.nombre}. Sesión iniciada como ${u.rol}.`, 'success');
}

function entrarComoInvitado() {
  STATE.user = null;
  STATE.role = 'invitado';
  document.getElementById('authWrap').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  document.getElementById('sidebarAvatar').textContent = '?';
  document.getElementById('sidebarAvatar').style.background = '#f1efe8';
  document.getElementById('sidebarAvatar').style.color = '#5f5e5a';
  document.getElementById('sidebarName').textContent = 'Usuario Invitado';
  document.getElementById('sidebarRole').textContent = 'Solo lectura';
  buildNav();
  showPage('catalogo-invitado');
  setTimeout(() => { const el = document.getElementById('logoutLabel'); if (el) el.textContent = 'Volver al inicio'; }, 100);
}

function volverAlLogin() {
  STATE.role = 'admin';
  STATE.user = null;
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('authWrap').classList.remove('hidden');
  showLogin();
}

function volverAlRegistro() {
  STATE.role = 'admin';
  STATE.user = null;
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('authWrap').classList.remove('hidden');
  showRegister();
}

function promptRegistro() {
  showModal('Inicia sesión o regístrate', `
    <p style="color:var(--text-muted);font-size:14px;margin-bottom:20px">Para reservar un evento necesitas tener una cuenta en EventMaster Pro. Es rápido y gratuito.</p>
    <div style="display:flex;gap:10px">
      <button class="btn btn-outline" style="flex:1;justify-content:center" onclick="closeModal();volverAlLogin()">Iniciar sesión</button>
      <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="closeModal();volverAlRegistro()">Registrarse gratis</button>
    </div>
  `);
}

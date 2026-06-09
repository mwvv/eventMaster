// ============================================================
//  THEME
// ============================================================
function initTheme() {
  const saved = localStorage.getItem('em-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeButtons();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('em-theme', next);
  updateThemeButtons();
}

function updateThemeButtons() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.innerHTML = isDark ? _sunIcon() : _moonIcon();
    btn.title = isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
  });
}

function _sunIcon() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
}

function _moonIcon() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

// ============================================================
//  LANDING NAVIGATION
// ============================================================
function enterAsRole(role) {
  const landing = document.getElementById('landingPage');
  landing.style.animation = 'fadeOut .22s ease-out forwards';

  setTimeout(() => {
    landing.classList.add('hidden');
    landing.style.animation = '';

    if (role === 'invitado') {
      entrarComoInvitado();
    } else {
      document.getElementById('authWrap').classList.remove('hidden');
      selectRole(role);
      showLogin();
    }
  }, 210);
}

function goToLogin() {
  enterAsRole('admin');
}

// Inicializar tema al cargar (scripts están al final del body, DOM ya disponible)
initTheme();

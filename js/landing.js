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

// ============================================================
//  GSAP SCROLL ANIMATIONS
// ============================================================
function initLandingAnimations() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // — Hero: timeline de entrada en cascada —
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.landing-nav', {
      opacity: 0, y: -16, duration: 0.5,
    })
    .from('.landing-badge', {
      opacity: 0, y: 20, duration: 0.55,
    }, '-=0.25')
    .from('.landing-title', {
      opacity: 0, y: 32, duration: 0.65,
    }, '-=0.35')
    .from('.landing-desc', {
      opacity: 0, y: 22, duration: 0.55,
    }, '-=0.4')
    .from('.landing-role-card', {
      opacity: 0, y: 28, duration: 0.5,
      stagger: { amount: 0.3, ease: 'power1.in' },
    }, '-=0.3')
    .from('.landing-hint', {
      opacity: 0, y: 12, duration: 0.4,
    }, '-=0.15');

  // — Features strip: fade + slide al hacer scroll —
  gsap.from('.landing-feature', {
    scrollTrigger: {
      trigger: '.landing-features-inner',
      start: 'top 84%',
    },
    opacity: 0,
    y: 36,
    duration: 0.55,
    stagger: 0.1,
    ease: 'power2.out',
  });

  // — Footer: aparición suave —
  gsap.from('.landing-footer', {
    scrollTrigger: {
      trigger: '.landing-footer',
      start: 'top 98%',
    },
    opacity: 0,
    y: 10,
    duration: 0.45,
    ease: 'power2.out',
  });
}

// ============================================================
//  INIT
// ============================================================
// Inicializar tema al cargar (scripts están al final del body, DOM ya disponible)
initTheme();
initLandingAnimations();

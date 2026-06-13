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
    window.scrollTo(0, 0);

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

// Scroll suave hacia una sección (compensa la altura del nav fijo)
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 64;
  window.scrollTo({ top, behavior: 'smooth' });
}

// ============================================================
//  RENDER DINÁMICO (marquee + showcase desde data.js)
// ============================================================
// Duplica el contenido de cada pista para lograr el loop infinito (-50%)
function renderMarquee() {
  document.querySelectorAll('.marquee-track').forEach(track => {
    track.innerHTML += track.innerHTML;
  });
}

// Pinta los eventos activos de data.js en la pista horizontal
function renderShowcase() {
  const track = document.getElementById('showcaseTrack');
  if (!track || typeof EVENTOS === 'undefined') return;

  const gradients = {
    'Matrimonio':  'linear-gradient(135deg, #5e6ad2, #a78bfa)',
    'Corporativo': 'linear-gradient(135deg, #2563eb, #60a5fa)',
    'Cumpleaños':  'linear-gradient(135deg, #d97706, #fbbf24)',
  };
  const fmtPrice = p => '$' + p.toLocaleString('es-CL');

  track.innerHTML = EVENTOS.filter(e => e.estado === 'activo').map(e => {
    const ocupado = Math.round((e.capacidadMax - e.capacidadDisp) / e.capacidadMax * 100);
    return `
    <article class="showcase-card" onclick="enterAsRole('invitado')">
      <div class="showcase-card-visual" style="background:${gradients[e.tipo] || gradients['Corporativo']}"><span>${e.emoji}</span></div>
      <div class="showcase-card-body">
        <div class="showcase-card-type">${e.tipo}</div>
        <div class="showcase-card-name">${e.nombre}</div>
        <div class="showcase-card-meta">
          <span>📅 ${e.fecha} · ${e.hora} hrs</span>
          <span>📍 ${e.lugar}</span>
        </div>
        <div class="showcase-card-foot">
          <span class="showcase-price">${fmtPrice(e.precioBase)}</span>
          <span class="showcase-cap">${e.capacidadDisp} cupos disp.</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${ocupado}%"></div></div>
      </div>
    </article>`;
  }).join('') + `
    <div class="showcase-end-card" onclick="enterAsRole('invitado')">
      <span class="end-arrow">→</span>
      <span>Ver catálogo completo</span>
    </div>`;
}

// ============================================================
//  GSAP — ANIMACIONES DE SCROLL Y MICRO-INTERACCIONES
// ============================================================
function initLandingAnimations() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Nav con efecto glass al hacer scroll (barato, corre siempre)
  const nav = document.getElementById('landingNav');
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  const mm = gsap.matchMedia();

  mm.add({
    desktop: '(min-width: 900px)',
  }, (ctx) => {
    _heroIntro();
    _scrollEffects(ctx.conditions.desktop);
  });

  // Micro-interacciones solo con puntero fino (mouse)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    _initTilt();
    _initMagnetic();
    _initMouseParallax();
  }
}

// — Hero: cascada de entrada con máscara en el título —
function _heroIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.landing-nav',      { y: -16, opacity: 0, duration: .5 })
    .from('.landing-badge',    { y: 18, opacity: 0, duration: .5 }, '-=.25')
    .from('.title-line-inner', { yPercent: 115, duration: .85, stagger: .12, ease: 'power4.out' }, '-=.3')
    .from('.landing-desc',     { y: 20, opacity: 0, duration: .55 }, '-=.5')
    .from('.landing-role-card',{ y: 26, opacity: 0, duration: .5, stagger: .07 }, '-=.3')
    .from('.landing-hint',     { opacity: 0, duration: .4 }, '-=.2')
    .from('.scroll-cue',       { opacity: 0, duration: .5 }, '-=.1');
}

// — Reveal bidireccional 100% ligado al scroll —
// Entrada: el elemento aparece mientras cruza el borde inferior del viewport.
// Salida: se desvanece hacia arriba al cruzar el borde superior.
// Al invertir la dirección del scroll, ambos tweens se revierten solos (scrub).
function _scrubInOut(el, opts = {}) {
  const {
    y = 50, x = 0,
    inStart = 'top 96%', inEnd = 'top 68%',
    outStart = 'bottom 20%', outEnd = 'bottom 6%',
    skipOut = false,
  } = opts;

  gsap.fromTo(el,
    { y, x, opacity: 0 },
    {
      y: 0, x: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: el, start: inStart, end: inEnd, scrub: true },
    });

  if (skipOut) return;
  gsap.fromTo(el,
    { y: 0, x: 0, opacity: 1 },
    {
      y: -y * .6, opacity: 0, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: el, start: outStart, end: outEnd, scrub: true },
    });
}

// — Efectos ligados al scroll —
function _scrollEffects(desktop) {
  // Barra de progreso global
  gsap.to('#scrollProgress', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: '.landing', start: 'top top', end: 'bottom bottom', scrub: .3 },
  });

  // El hero se desvanece y sube al salir (parallax de salida)
  gsap.to('.landing-hero-inner', {
    y: -70, opacity: .12, ease: 'none',
    scrollTrigger: { trigger: '.landing-hero', start: 'top top', end: 'bottom 25%', scrub: true },
  });

  // Cabeceras de sección (la del showcase no hace fade de salida: la sección se pinea)
  gsap.utils.toArray('.section-head').forEach(el => {
    _scrubInOut(el, { y: 44, skipOut: !!el.closest('.landing-showcase') });
  });

  // Stats: suben escalonadas según su columna
  gsap.utils.toArray('.landing-stat').forEach((el, i) => {
    _scrubInOut(el, { y: 40 + i * 10 });
  });

  // Bento: cada card entra alternando izquierda/derecha
  gsap.utils.toArray('.bento-card').forEach((el, i) => {
    _scrubInOut(el, { y: 40, x: (i % 2 === 0 ? -1 : 1) * 36 });
  });

  // Barras del mini gráfico crecen con el scroll
  gsap.from('.chart-bar', {
    scaleY: 0, transformOrigin: 'bottom', stagger: .08, ease: 'none',
    scrollTrigger: { trigger: '.bento-chart', start: 'top 95%', end: 'top 55%', scrub: true },
  });

  // Mini toasts se deslizan con el scroll
  gsap.from('.mini-toast', {
    x: 46, opacity: 0, stagger: .1, ease: 'none',
    scrollTrigger: { trigger: '.bento-toasts', start: 'top 95%', end: 'top 55%', scrub: true },
  });

  // Contadores ligados al scroll: cuentan al bajar y descuentan al subir
  gsap.utils.toArray('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, ease: 'none',
      onUpdate: () => { el.textContent = obj.v.toFixed(decimals); },
      scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 60%', scrub: true },
    });
  });

  // Showcase: sección pineada con desplazamiento horizontal (solo desktop)
  const track = document.getElementById('showcaseTrack');
  const viewport = document.querySelector('.showcase-viewport');
  if (track && viewport && desktop) {
    const getDist = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    gsap.to(track, {
      x: () => -getDist(), ease: 'none',
      scrollTrigger: {
        trigger: '.landing-showcase',
        start: 'top top',
        end: () => '+=' + getDist(),
        pin: true, scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  // Cómo funciona: la línea se dibuja con el scroll y los pasos entran desde la izquierda
  gsap.fromTo('#howLineFill', { scaleY: 0 }, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.how-steps', start: 'top 75%', end: 'bottom 55%', scrub: true },
  });
  gsap.utils.toArray('.how-step').forEach(step => {
    _scrubInOut(step, { y: 24, x: -40 });
  });

  // Testimonios: alternan el lado de entrada
  gsap.utils.toArray('.testimonial-card').forEach((el, i) => {
    _scrubInOut(el, { y: 36, x: (i - 1) * 30 });
  });

  // CTA y footer (sin fade de salida: están al final de la página)
  _scrubInOut('.cta-box', { y: 50, skipOut: true });
  _scrubInOut('.footer-inner', { y: 30, skipOut: true });
}

// — Tilt 3D + spotlight en las tarjetas de rol —
function _initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    gsap.set(card, { transformPerspective: 700 });
    const rotX = gsap.quickTo(card, 'rotationX', { duration: .4, ease: 'power2.out' });
    const rotY = gsap.quickTo(card, 'rotationY', { duration: .4, ease: 'power2.out' });
    const lift = gsap.quickTo(card, 'y',         { duration: .3, ease: 'power2.out' });

    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      rotY(px * 10);
      rotX(-py * 10);
      // posición del spotlight (var CSS usada por ::after)
      card.style.setProperty('--mx', ((px + .5) * 100) + '%');
      card.style.setProperty('--my', ((py + .5) * 100) + '%');
    });
    card.addEventListener('mouseenter', () => lift(-6));
    card.addEventListener('mouseleave', () => { rotX(0); rotY(0); lift(0); });
  });
}

// — Botón magnético del CTA —
function _initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(btn => {
    const qx = gsap.quickTo(btn, 'x', { duration: .3, ease: 'power2.out' });
    const qy = gsap.quickTo(btn, 'y', { duration: .3, ease: 'power2.out' });
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * .3);
      qy((e.clientY - r.top - r.height / 2) * .3);
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1, .45)' });
    });
  });
}

// — Parallax de orbes siguiendo al mouse (sobre el wrapper, el orbe sigue flotando) —
function _initMouseParallax() {
  const layers = [
    ['.orb-wrap-1',  30],
    ['.orb-wrap-2', -45],
    ['.orb-wrap-3',  20],
  ].map(([sel, depth]) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return {
      x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power2.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power2.out' }),
      depth,
    };
  }).filter(Boolean);

  window.addEventListener('mousemove', e => {
    const nx = e.clientX / window.innerWidth - .5;
    const ny = e.clientY / window.innerHeight - .5;
    layers.forEach(l => { l.x(nx * l.depth); l.y(ny * l.depth); });
  }, { passive: true });
}

// ============================================================
//  INIT
// ============================================================
// Scripts al final del body: el DOM ya está disponible
initTheme();
renderMarquee();
renderShowcase();
initLandingAnimations();

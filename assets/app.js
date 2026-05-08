/* =========================================================
   Belmar Developments — shared interactions
   ========================================================= */

/* ---- Tweaks panel ---- */

const TWEAK_DEFAULTS = {
  "palette": "forest",
  "dark": false
};

function loadTweaks() {
  try {
    const saved = JSON.parse(localStorage.getItem('belmar:tweaks') || 'null');
    return Object.assign({}, TWEAK_DEFAULTS, saved || {});
  } catch (e) { return Object.assign({}, TWEAK_DEFAULTS); }
}

function applyTweaks(t) {
  document.body.dataset.palette = t.palette;
  document.body.classList.toggle('dark', !!t.dark);
}

function setTweak(key, val) {
  const t = loadTweaks();
  t[key] = val;
  localStorage.setItem('belmar:tweaks', JSON.stringify(t));
  applyTweaks(t);
  renderTweaksPanel();
}

function renderTweaksPanel() {
  const root = document.getElementById('tweaks-root');
  if (!root) return;
  const t = loadTweaks();
  const palettes = [
    { id: 'forest',    name: 'Forest',   s1: '#11201a', s2: '#8a6d3a' },
    { id: 'slate',     name: 'Slate',    s1: '#14202e', s2: '#9a5a3a' },
    { id: 'stone',     name: 'Stone',    s1: '#2a2a23', s2: '#6b7d5a' },
    { id: 'charcoal',  name: 'Charcoal', s1: '#1d1d1c', s2: '#8e3a2a' }
  ];
  root.innerHTML = `
    <div class="tweaks-head">
      <h4>Tweaks</h4>
      <button class="tweaks-close" aria-label="Close">×</button>
    </div>
    <div class="tweak-section">
      <div class="tweak-label">Palette</div>
      <div class="palette-row">
        ${palettes.map(p => `
          <button class="palette-swatch ${t.palette === p.id ? 'active' : ''}"
                  data-palette="${p.id}"
                  style="--s1:${p.s1};--s2:${p.s2}"
                  title="${p.name}"></button>
        `).join('')}
      </div>
    </div>
    <div class="tweak-section">
      <div class="tweak-label">Mode</div>
      <div class="toggle-row">
        <span>${t.dark ? 'Evening' : 'Daylight'}</span>
        <button class="toggle ${t.dark ? 'on' : ''}" data-toggle="dark"></button>
      </div>
    </div>
  `;
  root.querySelectorAll('.palette-swatch').forEach(btn => {
    btn.addEventListener('click', () => setTweak('palette', btn.dataset.palette));
  });
  root.querySelector('.toggle[data-toggle="dark"]').addEventListener('click', () => {
    setTweak('dark', !loadTweaks().dark);
  });
  root.querySelector('.tweaks-close').addEventListener('click', () => {
    root.classList.remove('open');
  });
}

function initTweaks() {
  applyTweaks(loadTweaks());
  if (!document.getElementById('tweaks-root')) {
    const root = document.createElement('div');
    root.id = 'tweaks-root';
    document.body.appendChild(root);
  }
  renderTweaksPanel();
}

/* ---- Reveal-on-scroll ---- */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
}

/* ---- Top nav scroll state ---- */
function initTopNav() {
  const nav = document.querySelector('.top-nav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---- Property hero image rotation ---- */
function initHeroRotation() {
  const stack = document.querySelector('.hero-img-stack');
  if (!stack) return;
  const imgs = Array.from(stack.querySelectorAll('img'));
  if (imgs.length < 2) return;
  let i = 0;
  imgs[0].classList.add('active');
  setInterval(() => {
    imgs[i].classList.remove('active');
    i = (i + 1) % imgs.length;
    imgs[i].classList.add('active');
  }, 5500);
}

/* ---- Sticky property nav scroll-spy + smooth scroll ---- */
function initPropNav() {
  const nav = document.querySelector('.prop-nav');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll('.prop-nav-link'));
  links.forEach(link => {
    link.addEventListener('click', () => {
      const id = link.dataset.target;
      const el = document.getElementById(id);
      if (!el) return;
      const navH = nav.getBoundingClientRect().height;
      const y = el.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
  document.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.scrollTo;
      const el = document.getElementById(id);
      if (!el) return;
      const navH = (nav?.getBoundingClientRect().height || 0);
      const y = el.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
  const sections = links
    .map(l => document.getElementById(l.dataset.target))
    .filter(Boolean);
  if (!('IntersectionObserver' in window) || sections.length === 0) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.dataset.target === en.target.id));
      }
    });
  }, { rootMargin: '-30% 0px -65% 0px', threshold: 0 });
  sections.forEach(s => io.observe(s));
}

/* ---- Gallery tabs + lightbox ---- */
function initGallery() {
  const wrap = document.querySelector('[data-gallery]');
  if (!wrap) return;
  const tabs = wrap.querySelectorAll('.gallery-tab');
  const items = wrap.querySelectorAll('.gallery-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      items.forEach(it => {
        const show = cat === 'all' || it.dataset.cat === cat;
        it.style.display = show ? '' : 'none';
      });
    });
  });

  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg = lb.querySelector('.lightbox-img');
  const lbCounter = lb.querySelector('.lightbox-counter');
  let visible = [];
  let idx = 0;
  const refreshVisible = () => {
    visible = Array.from(items).filter(i => i.style.display !== 'none');
  };
  const open = (item) => {
    refreshVisible();
    idx = visible.indexOf(item);
    if (idx < 0) idx = 0;
    show();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const show = () => {
    if (!visible[idx]) return;
    const src = visible[idx].querySelector('img').src;
    lbImg.src = src;
    lbCounter.textContent = `${idx + 1} / ${visible.length}`;
  };
  const close = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  };
  items.forEach(it => it.addEventListener('click', () => open(it)));
  lb.querySelector('.lightbox-close').addEventListener('click', close);
  lb.querySelector('.lightbox-prev').addEventListener('click', (e) => {
    e.stopPropagation(); idx = (idx - 1 + visible.length) % visible.length; show();
  });
  lb.querySelector('.lightbox-next').addEventListener('click', (e) => {
    e.stopPropagation(); idx = (idx + 1) % visible.length; show();
  });
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') { idx = (idx - 1 + visible.length) % visible.length; show(); }
    if (e.key === 'ArrowRight') { idx = (idx + 1) % visible.length; show(); }
  });
}

/* ---- Floor plan switcher ---- */
function initFloorplans() {
  const wrap = document.querySelector('[data-floorplans]');
  if (!wrap) return;
  const items = wrap.querySelectorAll('.floorplan-item');
  const display = wrap.querySelector('.floorplan-display');
  if (!display) return;

  const renderPlan = (plan) => {
    const data = JSON.parse(plan.dataset.plan);
    display.querySelector('[data-fp-name]').textContent = data.name;
    display.querySelector('[data-fp-status]').textContent = data.status;
    const svgWrap = display.querySelector('[data-fp-svg]');
    if (data.img) {
      svgWrap.innerHTML = '<img src="' + data.img + '" alt="' + data.name + ' floor plan" style="width:100%;height:auto;border-radius:4px;" />';
    } else {
      svgWrap.innerHTML = data.svg;
    }
    display.querySelector('[data-fp-beds]').textContent = data.beds;
    display.querySelector('[data-fp-baths]').textContent = data.baths;
    display.querySelector('[data-fp-sqft]').textContent = data.sqft;
    display.querySelector('[data-fp-price]').textContent = data.price;
  };
  items.forEach(it => {
    it.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      it.classList.add('active');
      renderPlan(it);
    });
  });
  if (items[0]) { items[0].classList.add('active'); renderPlan(items[0]); }
}

/* ---- Site plan ---- */
function initSitePlan() {
  const wrap = document.querySelector('[data-siteplan]');
  if (!wrap) return;
  const detail = wrap.querySelector('.unit-detail');
  if (!detail) return;
  const units = wrap.querySelectorAll('.unit-rect[data-unit]');
  const renderUnit = (u) => {
    const data = JSON.parse(u.dataset.unit);
    detail.querySelector('[data-u-status]').textContent = data.status.toUpperCase();
    detail.querySelector('[data-u-num]').textContent = data.unit;
    detail.querySelector('[data-u-plan]').textContent = data.plan;
    detail.querySelector('[data-u-beds]').textContent = data.beds;
    detail.querySelector('[data-u-baths]').textContent = data.baths;
    detail.querySelector('[data-u-sqft]').textContent = data.sqft;
    detail.querySelector('[data-u-price]').textContent = data.price;

    const statusEl = detail.querySelector('[data-u-status]');
    statusEl.style.color =
      data.status === 'available' ? 'var(--accent)' :
      data.status === 'hold' ? '#d4a574' : 'var(--ink-mute)';
  };
  units.forEach(u => {
    u.addEventListener('click', () => {
      units.forEach(uu => uu.removeAttribute('stroke-width'));
      u.setAttribute('stroke-width', '3');
      renderUnit(u);
    });
  });
  const first = wrap.querySelector('.unit-rect.unit-available');
  if (first) {
    first.setAttribute('stroke-width', '3');
    renderUnit(first);
  }
}

/* ---- Neighbourhood map ---- */
function initMap() {
  const wrap = document.querySelector('[data-map]');
  if (!wrap) return;
  const cats = wrap.querySelectorAll('.map-cat');
  const pins = wrap.querySelectorAll('.map-pin[data-cat]');
  const items = wrap.querySelectorAll('.map-list-item');
  let activeCat = 'all';

  const filter = () => {
    pins.forEach(p => {
      const show = activeCat === 'all' || p.dataset.cat === activeCat;
      p.style.display = show ? '' : 'none';
    });
    items.forEach(i => {
      const show = activeCat === 'all' || i.dataset.cat === activeCat;
      i.style.display = show ? '' : 'none';
    });
  };
  cats.forEach(c => {
    c.addEventListener('click', () => {
      cats.forEach(cc => cc.classList.remove('active'));
      c.classList.add('active');
      activeCat = c.dataset.cat;
      filter();
    });
  });

  const highlight = (id) => {
    pins.forEach(p => p.classList.toggle('active', p.dataset.id === id));
    items.forEach(i => i.classList.toggle('active', i.dataset.id === id));
  };
  pins.forEach(p => p.addEventListener('click', () => highlight(p.dataset.id)));
  items.forEach(i => i.addEventListener('click', () => highlight(i.dataset.id)));
}

/* ---- FAQ ---- */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => item.classList.toggle('open'));
  });
}

/* ---- Register form ---- */
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  const realtorRadios = form.querySelectorAll('input[name="realtor"]');
  const realtorFields = form.querySelector('.realtor-fields');
  realtorRadios.forEach(r => {
    r.addEventListener('change', () => {
      realtorFields.classList.toggle('show', r.value === 'yes' && r.checked);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('.form-field').forEach(f => f.classList.remove('error'));

    const get = (n) => form.querySelector(`[name="${n}"]`);
    const required = ['firstName', 'lastName', 'email', 'phone', 'homeType'];
    required.forEach(n => {
      const el = get(n);
      if (!el || !el.value.trim()) {
        el?.closest('.form-field')?.classList.add('error');
        ok = false;
      }
    });
    const email = get('email');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.closest('.form-field').classList.add('error');
      ok = false;
    }
    const realtorYes = form.querySelector('input[name="realtor"][value="yes"]');
    if (realtorYes && realtorYes.checked) {
      ['realtorName', 'brokerage'].forEach(n => {
        const el = get(n);
        if (!el?.value.trim()) {
          el?.closest('.form-field')?.classList.add('error');
          ok = false;
        }
      });
    }
    if (!form.querySelector('input[name="realtor"]:checked')) ok = false;

    if (!ok) return;

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    const data = new FormData(form);
    data.append('_source', document.title);

    fetch('https://formspree.io/f/nbelmar@onni.com', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    }).then(res => {
      if (res.ok) {
        form.style.display = 'none';
        document.getElementById('register-success').classList.add('show');
      } else {
        btn.disabled = false;
        btn.textContent = 'Register Now';
        alert('Something went wrong. Please try again.');
      }
    }).catch(() => {
      btn.disabled = false;
      btn.textContent = 'Register Now';
      alert('Connection error. Please try again.');
    });
  });
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  initTweaks();
  initTopNav();
  initReveal();
  initHeroRotation();
  initPropNav();
  initGallery();
  initFloorplans();
  initSitePlan();
  initMap();
  initFAQ();
  initRegisterForm();
});

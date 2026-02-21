const SUPPORTED = ['en','de'];
const DEFAULT = 'en';

function detectBrowserLang() {
  const nav = navigator.language || navigator.userLanguage || '';
  if (!nav) return DEFAULT;
  if (nav.toLowerCase().startsWith('de')) return 'de';
  return 'en';
}

async function loadTranslations(lang) {
  try {
    const res = await fetch(`/assets/lang/${lang}.json`);
    if (!res.ok) throw new Error('Missing translations');
    return await res.json();
  } catch (e) {
    if (lang !== DEFAULT) return loadTranslations(DEFAULT);
    return {};
  }
}

function applyTranslations(trans) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (trans[key]) {
      if (el.tagName === 'TITLE') document.title = trans[key];
      else el.textContent = trans[key];
    }
  });
}

function setHtmlLang(lang) {
  document.documentElement.lang = lang;
}

function populateSelector(current, translations) {
  const container = document.getElementById('lang-select');
  if (!container) return;
  const toggle = container.querySelector('.lang-toggle');
  const list = container.querySelector('.lang-options');

  const opts = {
    en: { label: 'English', img: '/assets/img/flags/gb.svg' },
    de: { label: 'Deutsch', img: '/assets/img/flags/de.svg' }
  };

  list.innerHTML = '';
  Object.keys(opts).forEach(code => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.dataset.lang = code;
    const img = document.createElement('img');
    img.src = opts[code].img;
    img.className = 'flag';
    img.alt = '';
    const span = document.createElement('span');
    span.textContent = opts[code].label;
    li.appendChild(img);
    li.appendChild(span);
    li.addEventListener('click', async () => {
      localStorage.setItem('site-lang', code);
      const tr = await loadTranslations(code);
      setHtmlLang(code);
      applyTranslations(tr);
      // update toggle display
      toggle.querySelector('.flag').src = opts[code].img;
      toggle.querySelector('.lang-label').textContent = opts[code].label;
      list.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    });
    list.appendChild(li);
  });

  // initialize toggle label/img
  if (opts[current]) {
    toggle.querySelector('.flag').src = opts[current].img;
    toggle.querySelector('.lang-label').textContent = opts[current].label;
  }

  toggle.addEventListener('click', () => {
    const open = list.hidden;
    list.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  });

  // close when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      list.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

async function initI18n() {
  const saved = localStorage.getItem('site-lang');
  const detected = detectBrowserLang();
  const lang = saved && SUPPORTED.includes(saved) ? saved : (SUPPORTED.includes(detected) ? detected : DEFAULT);
  const tr = await loadTranslations(lang);
  setHtmlLang(lang);
  applyTranslations(tr);
  populateSelector(lang, tr);
}

document.addEventListener('DOMContentLoaded', () => {
  initI18n().catch(() => {});
});

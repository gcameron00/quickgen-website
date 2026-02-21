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
  const sel = document.getElementById('lang-select');
  if (!sel) return;
  sel.innerHTML = '';
  const opts = {
    en: 'English',
    de: 'Deutsch'
  };
  SUPPORTED.forEach(code => {
    const o = document.createElement('option');
    o.value = code;
    o.textContent = opts[code] || code;
    if (code === current) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener('change', async (e) => {
    const lang = e.target.value;
    localStorage.setItem('site-lang', lang);
    const tr = await loadTranslations(lang);
    setHtmlLang(lang);
    applyTranslations(tr);
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

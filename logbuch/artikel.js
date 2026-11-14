// Sprachumschalter für einzelne Logbuch-Beiträge.
// Jeder Beitrag hat einen Block <div data-content="de"> und optional <div data-content="en">.
// Fehlt der englische Block, bleibt der deutsche sichtbar und ein Hinweis erscheint.
var UI = {
  de: { back: '‹ Logbuch', backLong: '‹ Zurück zum Logbuch', onlyOther: 'Dieser Beitrag ist nur auf Englisch verfügbar.' },
  en: { back: '‹ Log', backLong: '‹ Back to the log', onlyOther: 'This entry is only available in German.' }
};

function setLang(lang) {
  var t = UI[lang];
  var blocks = document.querySelectorAll('[data-content]');
  var hasLang = document.querySelector('[data-content="' + lang + '"]') !== null;
  var shown = hasLang ? lang : (lang === 'en' ? 'de' : 'en');

  blocks.forEach(function (el) { el.hidden = el.getAttribute('data-content') !== shown; });
  document.documentElement.lang = shown;

  var notice = document.getElementById('lang-notice');
  if (notice) {
    notice.hidden = hasLang;
    notice.textContent = t.onlyOther;
  }
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var v = t[el.getAttribute('data-i18n')];
    if (typeof v === 'string') el.textContent = v;
  });
  document.querySelectorAll('.lang button').forEach(function (btn) {
    btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
  });
  try { localStorage.setItem('lang', lang); } catch (e) {}
}

document.querySelectorAll('.lang button').forEach(function (btn) {
  btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang')); });
});

var startLang = 'de';
try { if (localStorage.getItem('lang') === 'en') startLang = 'en'; } catch (e) {}
setLang(startLang);

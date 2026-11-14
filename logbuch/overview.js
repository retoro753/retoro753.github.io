var TEXTS = {
  de: {
    home: '‹ Startseite',
    title: 'Logbuch',
    intro: 'CTF-Writeups ohne Flags und kurze Notizen: Erkenntnisse, Tipps und Erfahrungen rund um Linux, Security und Technik.',
    searchLabel: 'Suche',
    typeLabel: 'Art',
    typeWriteups: 'Writeups',
    typeNotes: 'Notizen',
    diffLabel: 'Schwierigkeit',
    all: 'Alle',
    soon: 'Erster Eintrag in Arbeit',
    noMatch: 'Nichts gefunden',
    labels: { writeup: 'WRITEUP', notiz: 'NOTIZ' },
    files: function (n) { return n + ' Datei(en)'; }
  },
  en: {
    home: '‹ Home',
    title: 'Log',
    intro: 'CTF writeups without flags and short notes: findings, tips and experiences around Linux, security and tech.',
    searchLabel: 'Search',
    typeLabel: 'Type',
    typeWriteups: 'Writeups',
    typeNotes: 'Notes',
    diffLabel: 'Difficulty',
    all: 'All',
    soon: 'First entry in progress',
    noMatch: 'Nothing found',
    labels: { writeup: 'WRITEUP', notiz: 'NOTE' },
    files: function (n) { return n + ' file(s)'; }
  }
};

var lang = 'de';
var entries = [];
var activeTag = '';

function fmtDate(iso) {
  var p = String(iso).split('-');
  return lang === 'de' && p.length === 3 ? p[2] + '.' + p[1] + '.' + p[0] : iso;
}

function metaLine(e) {
  var parts = ['[' + (TEXTS[lang].labels[e.type] || e.type) + ']'];
  if (e.type === 'writeup') { parts.push(e.platform, e.difficulty); }
  parts.push(fmtDate(e.date));
  if (e.tags && e.tags.length) parts.push(e.tags.join(', '));
  return parts.filter(Boolean).join(' · ');
}

function render() {
  var t = TEXTS[lang];
  var q = document.getElementById('search').value.trim().toLowerCase();
  var type = document.getElementById('type').value;
  var diff = document.getElementById('difficulty').value;

  var shown = entries.filter(function (e) {
    var text = (e.title + ' ' + (e.platform || '') + ' ' + (e.tags || []).join(' ')).toLowerCase();
    return (!q || text.indexOf(q) !== -1)
      && (!type || e.type === type)
      && (!diff || e.difficulty === diff)
      && (!activeTag || (e.tags || []).indexOf(activeTag) !== -1);
  });

  var box = document.getElementById('results');
  box.textContent = '';
  shown.forEach(function (e) {
    var row = document.createElement('div');
    row.className = 'entry';
    var a = document.createElement('a');
    a.href = e.slug + '.html';
    a.textContent = e.title;
    var meta = document.createElement('span');
    meta.textContent = metaLine(e);
    row.appendChild(a);
    row.appendChild(meta);
    box.appendChild(row);
  });

  var empty = document.getElementById('empty');
  empty.hidden = shown.length > 0;
  empty.firstElementChild.textContent = entries.length ? t.noMatch : t.soon;
  document.getElementById('count').textContent = t.files(shown.length);
}

function buildTags() {
  var all = [];
  entries.forEach(function (e) {
    (e.tags || []).forEach(function (tag) { if (all.indexOf(tag) === -1) all.push(tag); });
  });
  all.sort();
  var box = document.getElementById('tags');
  box.textContent = '';
  all.forEach(function (tag) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = tag;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      activeTag = activeTag === tag ? '' : tag;
      box.querySelectorAll('button').forEach(function (x) {
        x.setAttribute('aria-pressed', x.textContent === activeTag ? 'true' : 'false');
      });
      render();
    });
    box.appendChild(b);
  });
}

function setLang(l) {
  lang = l;
  var t = TEXTS[l];
  document.documentElement.lang = l;
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var v = t[el.getAttribute('data-i18n')];
    if (typeof v === 'string') el.textContent = v;
  });
  document.querySelectorAll('.lang button').forEach(function (btn) {
    btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === l ? 'true' : 'false');
  });
  try { localStorage.setItem('lang', l); } catch (e) {}
  render();
}

document.querySelectorAll('.lang button').forEach(function (btn) {
  btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang')); });
});
document.getElementById('search').addEventListener('input', render);
document.getElementById('type').addEventListener('change', render);
document.getElementById('difficulty').addEventListener('change', render);

// Link wie logbuch/?art=notiz öffnet direkt gefiltert
try {
  var art = new URLSearchParams(location.search).get('art');
  if (art === 'writeup' || art === 'notiz') document.getElementById('type').value = art;
} catch (e) {}

try { if (localStorage.getItem('lang') === 'en') lang = 'en'; } catch (e) {}
setLang(lang);

fetch('eintraege.json')
  .then(function (r) { return r.ok ? r.json() : []; })
  .then(function (data) {
    entries = (Array.isArray(data) ? data : []).sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });
    document.getElementById('filters').hidden = entries.length === 0;
    buildTags();
    render();
  })
  .catch(function () {});

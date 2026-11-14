  var TEXTS = {
    de: {
      home: '‹ Startseite',
      intro: 'CTF-Lösungswege ohne Flags: wie ich vorgegangen bin, was nicht geklappt hat und was ich gelernt habe.',
      searchLabel: 'Suche',
      diffLabel: 'Schwierigkeit',
      all: 'Alle',
      soon: 'Erstes Writeup in Arbeit',
      noMatch: 'Nichts gefunden',
      files: function (n) { return n + ' Datei(en)'; }
    },
    en: {
      home: '‹ Home',
      intro: "CTF walkthroughs without flags: how I approached it, what didn't work and what I learned.",
      searchLabel: 'Search',
      diffLabel: 'Difficulty',
      all: 'All',
      soon: 'First writeup in progress',
      noMatch: 'Nothing found',
      files: function (n) { return n + ' file(s)'; }
    }
  };

  var lang = 'de';
  var writeups = [];
  var activeTag = '';

  function fmtDate(iso) {
    var p = String(iso).split('-');
    return lang === 'de' && p.length === 3 ? p[2] + '.' + p[1] + '.' + p[0] : iso;
  }

  function render() {
    var t = TEXTS[lang];
    var q = document.getElementById('search').value.trim().toLowerCase();
    var diff = document.getElementById('difficulty').value;

    var shown = writeups.filter(function (w) {
      var text = (w.title + ' ' + w.platform + ' ' + (w.tags || []).join(' ')).toLowerCase();
      return (!q || text.indexOf(q) !== -1)
        && (!diff || w.difficulty === diff)
        && (!activeTag || (w.tags || []).indexOf(activeTag) !== -1);
    });

    var box = document.getElementById('results');
    box.textContent = '';
    shown.forEach(function (w) {
      var row = document.createElement('div');
      row.className = 'entry';
      var a = document.createElement('a');
      a.href = w.slug + '.html';
      a.textContent = w.title;
      var meta = document.createElement('span');
      meta.textContent = [w.platform, w.difficulty, fmtDate(w.date), (w.tags || []).join(', ')].join(' · ');
      row.appendChild(a);
      row.appendChild(meta);
      box.appendChild(row);
    });

    var empty = document.getElementById('empty');
    empty.hidden = shown.length > 0;
    empty.firstElementChild.textContent = writeups.length ? t.noMatch : t.soon;
    document.getElementById('count').textContent = t.files(shown.length);
  }

  function buildTags() {
    var all = [];
    writeups.forEach(function (w) {
      (w.tags || []).forEach(function (tag) { if (all.indexOf(tag) === -1) all.push(tag); });
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
  document.getElementById('difficulty').addEventListener('change', render);

  try { if (localStorage.getItem('lang') === 'en') lang = 'en'; } catch (e) {}
  setLang(lang);

  fetch('writeups.json')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (data) {
      writeups = (Array.isArray(data) ? data : []).sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date));
      });
      document.getElementById('filters').hidden = writeups.length === 0;
      buildTags();
      render();
    })
    .catch(function () {});

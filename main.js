  // Texte für beide Sprachen
  var TEXTS = {
    de: {
      navProjects: 'Projekte',
      intro: 'Kleine Projekte und Cybersecurity.',
      kakeibo: 'Haushaltsbuch nach der japanischen Kakeibo-Methode: Einnahmen und Ausgaben festhalten und bewusster sparen.',
      clrty: 'Blog über ein bewussteres Leben: weniger, aber besser.',
      open: 'Öffnen ›',
      nextProject: 'nächstes Projekt …',
      soon: 'Kommt bald',
      writeupsIntro: 'CTF-Lösungswege ohne Flags: wie ich vorgegangen bin, was nicht geklappt hat und was ich gelernt habe.',
      writeupsSoon: 'Erstes Writeup in Arbeit',
      allWriteups: 'Alle Writeups ›',
      files: '0 Datei(en)',
      contact: 'Kontakt',
      showMail: 'E-Mail anzeigen',
      footer: 'Gebaut mit HTML & CSS · gehostet auf GitHub Pages'
    },
    en: {
      navProjects: 'Projects',
      intro: 'Small projects and cybersecurity.',
      kakeibo: 'A budgeting book based on the Japanese kakeibo method: track income and spending and save more mindfully.',
      clrty: 'A blog about living more intentionally: less, but better.',
      open: 'Open ›',
      nextProject: 'next project …',
      soon: 'Coming soon',
      writeupsIntro: "CTF walkthroughs without flags: how I approached it, what didn't work and what I learned.",
      writeupsSoon: 'First writeup in progress',
      allWriteups: 'All writeups ›',
      files: '0 file(s)',
      contact: 'Contact',
      showMail: 'Show email',
      footer: 'Built with HTML & CSS · hosted on GitHub Pages'
    }
  };

  // Neueste Writeups aus writeups/writeups.json
  var currentLang = 'de';
  var WRITEUPS = [];

  function fmtDate(iso) {
    var p = String(iso).split('-');
    return currentLang === 'de' && p.length === 3 ? p[2] + '.' + p[1] + '.' + p[0] : iso;
  }

  function renderWriteups() {
    var box = document.getElementById('latest-writeups');
    box.textContent = '';
    WRITEUPS.slice(0, 5).forEach(function (w) {
      var row = document.createElement('div');
      row.className = 'entry';
      var a = document.createElement('a');
      a.href = 'writeups/' + w.slug + '.html';
      a.textContent = w.title;
      var meta = document.createElement('span');
      meta.textContent = [w.platform, w.difficulty, fmtDate(w.date), (w.tags || []).join(', ')].join(' · ');
      row.appendChild(a);
      row.appendChild(meta);
      box.appendChild(row);
    });
    var n = WRITEUPS.length;
    document.getElementById('writeups-empty').hidden = n > 0;
    document.getElementById('writeups-all').hidden = n === 0;
    document.getElementById('writeups-count').textContent =
      currentLang === 'de' ? n + ' Datei(en)' : n + ' file(s)';
  }

  fetch('writeups/writeups.json')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (data) {
      WRITEUPS = (Array.isArray(data) ? data : []).sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date));
      });
      renderWriteups();
    })
    .catch(function () {});

  function setLang(lang) {
    currentLang = lang;
    var t = TEXTS[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t[el.getAttribute('data-i18n')];
    });
    document.querySelectorAll('.lang button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    try { localStorage.setItem('lang', lang); } catch (e) {}
    renderWriteups();
  }

  document.querySelectorAll('.lang button').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang')); });
  });

  // E-Mail erst per Klick zusammensetzen (Schutz vor einfachen Spam-Bots)
  document.getElementById('show-mail').addEventListener('click', function () {
    var parts = ['retro.overgrown542', 'silomails', 'com'];
    var addr = parts[0] + '@' + parts[1] + '.' + parts[2];
    var link = document.createElement('a');
    link.href = 'mailto:' + addr;
    link.textContent = addr;
    link.className = 'mail-link';
    var slot = document.getElementById('mail-slot');
    slot.innerHTML = '';
    slot.appendChild(link);
  });

  // Gespeicherte Sprache wiederherstellen
  try {
    var saved = localStorage.getItem('lang');
    if (saved === 'en') setLang('en');
  } catch (e) {}

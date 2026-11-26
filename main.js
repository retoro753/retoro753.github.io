  // Texte für beide Sprachen
  var TEXTS = {
    de: {
      navProjects: 'Projekte',
      intro: 'Projekte, Notizen und Writeups.',
      kakeibo: 'Haushaltsbuch nach der japanischen Kakeibo-Methode: Einnahmen und Ausgaben festhalten und bewusster sparen.',
      clrty: 'Blog über ein bewussteres Leben: weniger, aber besser.',
      open: 'Öffnen ›',
      primetime: 'Krypto-Helfer für die Kommandozeile, gebaut für CTF-Aufgaben: rechnet RSA und Diffie-Hellman Schritt für Schritt aus und zeigt den Rechenweg. Mit Faktorisieren von n und einem CTF-Modus, der aus n, e und c direkt den Klartext holt.',
      github: 'Auf GitHub ›',
      nextProject: 'nächstes Projekt …',
      soon: 'Kommt bald',
      navLog: 'Logbuch',
      welcome: 'Willkommen auf meiner Homepage!',
      visitors: 'Du bist Besucher Nr.',
      breaking: '+++ EILMELDUNG +++',
      privacy: 'Datenschutz',
      logIntro: 'CTF-Writeups ohne Flags und kurze Notizen: Erkenntnisse, Tipps und Erfahrungen rund um Linux, Security und Technik.',
      logSoon: 'Erster Eintrag in Arbeit',
      allLog: 'Ganzes Logbuch ›',
      labels: { writeup: 'WRITEUP', notiz: 'NOTIZ' },
      files: '1 Datei(en)',
      contact: 'Kontakt',
      showMail: 'E-Mail anzeigen',
      footer: 'Gebaut mit HTML & CSS · gehostet auf GitHub Pages'
    },
    en: {
      navProjects: 'Projects',
      intro: 'Projects, notes and writeups.',
      kakeibo: 'A budgeting book based on the Japanese kakeibo method: track income and spending and save more mindfully.',
      clrty: 'A blog about living more intentionally: less, but better.',
      open: 'Open ›',
      primetime: 'A command-line crypto helper built for CTF challenges: works through RSA and Diffie-Hellman step by step and shows the math. Includes factoring n and a CTF mode that recovers the plaintext straight from n, e and c.',
      github: 'On GitHub ›',
      nextProject: 'next project …',
      soon: 'Coming soon',
      navLog: 'Log',
      welcome: 'Welcome to my homepage!',
      visitors: 'You are visitor no.',
      breaking: '+++ BREAKING +++',
      privacy: 'Privacy',
      logIntro: 'CTF writeups without flags and short notes: findings, tips and experiences around Linux, security and tech.',
      logSoon: 'First entry in progress',
      allLog: 'Full log ›',
      labels: { writeup: 'WRITEUP', notiz: 'NOTE' },
      files: '1 file(s)',
      contact: 'Contact',
      showMail: 'Show email',
      footer: 'Built with HTML & CSS · hosted on GitHub Pages'
    }
  };

  // Neueste Logbuch-Einträge aus logbuch/eintraege.json
  var currentLang = 'de';
  var ENTRIES = [];

  function fmtDate(iso) {
    var p = String(iso).split('-');
    return currentLang === 'de' && p.length === 3 ? p[2] + '.' + p[1] + '.' + p[0] : iso;
  }

  function metaLine(e) {
    var parts = ['[' + (TEXTS[currentLang].labels[e.type] || e.type) + ']'];
    if (e.type === 'writeup') { parts.push(e.platform, e.difficulty); }
    parts.push(fmtDate(e.date));
    if (e.tags && e.tags.length) parts.push(e.tags.join(', '));
    return parts.filter(Boolean).join(' · ');
  }

  function renderLog() {
    var box = document.getElementById('latest-log');
    box.textContent = '';
    ENTRIES.slice(0, 5).forEach(function (e) {
      var row = document.createElement('div');
      row.className = 'entry';
      var a = document.createElement('a');
      a.href = 'logbuch/' + e.slug + '.html';
      a.textContent = (currentLang === 'en' && e.title_en) || e.title;
      var meta = document.createElement('span');
      meta.textContent = metaLine(e);
      row.appendChild(a);
      row.appendChild(meta);
      box.appendChild(row);
    });
    var n = ENTRIES.length;
    document.getElementById('log-empty').hidden = n > 0;
    document.getElementById('log-all').hidden = n === 0;
    document.getElementById('log-count').textContent =
      currentLang === 'de' ? n + ' Datei(en)' : n + ' file(s)';
  }

  fetch('logbuch/eintraege.json')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (data) {
      ENTRIES = (Array.isArray(data) ? data : []).sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date));
      });
      renderLog();
    })
    .catch(function () {});

  // Ticker: freier Text aus logbuch/ticker.json (echte News oder Spaß)
  var TICKER = null;
  function renderTicker() {
    var ticker = document.getElementById('ticker');
    var t = TICKER;
    var text = t && t.aktiv ? (currentLang === 'en' ? (t.text_en || t.text) : t.text) : '';
    if (!text) { ticker.hidden = true; return; }
    document.getElementById('ticker-text').textContent = text;
    var label = currentLang === 'en' ? (t.label_en || t.label || '') : (t.label || '');
    document.querySelector('#ticker .ticker-label').textContent = label;
    if (t.href) { ticker.setAttribute('href', t.href); }
    else { ticker.removeAttribute('href'); }
    ticker.hidden = false;
  }

  fetch('logbuch/ticker.json')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) { TICKER = data; renderTicker(); })
    .catch(function () {});

  function setLang(lang) {
    currentLang = lang;
    var t = TEXTS[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t[el.getAttribute('data-i18n')];
      if (typeof v === 'string') el.textContent = v;
    });
    document.querySelectorAll('.lang button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    try { localStorage.setItem('lang', lang); } catch (e) {}
    renderLog();
    renderTicker();
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

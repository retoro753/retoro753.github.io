// Besucherzähler über GoatCounter (retr0.goatcounter.com).
// 1. Zählt den Seitenaufruf mit einem unsichtbaren 1x1-Bild, ohne fremdes Skript und ohne Cookies.
// 2. Zeigt die Gesamtzahl im Retro-Zählwerk an, falls die Seite einen #visitor-counter hat.
(function () {
  var GC = 'https://retr0.goatcounter.com';

  // Nur auf der echten Website zählen, nicht beim lokalen Testen
  if (location.hostname === 'retoro753.github.io') {
    var pixel = new Image();
    pixel.src = GC + '/count?p=' + encodeURIComponent(location.pathname);
  }

  var box = document.getElementById('visitor-digits');
  if (!box) return;

  fetch(GC + '/counter/TOTAL.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var digits = String(data.count).replace(/\D/g, '');
      while (digits.length < 6) digits = '0' + digits;
      box.textContent = '';
      digits.split('').forEach(function (d) {
        var span = document.createElement('span');
        span.className = 'digit';
        span.textContent = d;
        box.appendChild(span);
      });
      document.getElementById('visitor-counter').hidden = false;
    })
    .catch(function () { /* Zähler bleibt ausgeblendet */ });
})();

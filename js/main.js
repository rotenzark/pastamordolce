/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'pastamordolce', // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    hours: {
      0: [],
      1: [['16:00', '19:30']],
      2: [['16:00', '19:30']],
      3: [['16:00', '19:30']],
      4: [['16:00', '19:30']],
      5: [['16:00', '19:30']],
      6: [['16:00', '19:30']]
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "i.cosa": "Fresh pasta and pastry · since 1991",
      "i.skip": "Skip",
      "m.nav": "Sections",
      "m.top": "Pastamordolce, back to the top",
      "m.lingua": "Language",
      "m.menu": "Open the menu",
      "m.lightbox": "Enlarged photo",
      "m.chiudi": "Close",
      "n.forme": "The shapes",
      "n.dolce": "Sweets",
      "n.vasetti": "Jars",
      "n.dove": "Where",
      "n.storia": "Since 1991",
      "n.chiama": "Call",
      "n.chiama2": "Call 348&nbsp;650&nbsp;7183",
      "h.eti": "Fresh pasta and pastry · since 1991",
      "h.t": "Shape and <em>filling.</em>",
      "h.p": "Cappelletti, caramelle, half-moons, fish ravioloni, tortelli, red wine tagliatelle: our fresh pasta. And next to it the pastry counter, from made-to-order cakes to panettoni. At Via Privata Metauro 11, open in the afternoon only: Monday to Saturday, 4pm to 7:30pm.",
      "h.chiama": "Call 348&nbsp;650&nbsp;7183",
      "h.strada": "Directions",
      "h.fz": "Enlarge the photo of the cappelletti",
      "h.fa": "Cappelletti under a shower of flour, with the rolling pin behind",
      "h.ff": "Cappelletti, just closed",
      "f0.eti": "Fresh pasta",
      "f0.t": "The shapes",
      "f0.p": "One sheet, eight shapes, each with its own fillings: from the Emilian tradition to the Ligurian one, from the sea to the mountains.",
      "f1.n": "Cappelletti",
      "f1.r": "Emilian style",
      "f2.n": "Caramelle",
      "f2.r": "meat · amatriciana · wild boar",
      "f3.n": "Half-moons",
      "f3.r": "cacio e pepe · stracchino and rocket",
      "f4.n": "Ravioloni",
      "f4.r": "sea bass · buffalo mozzarella",
      "f5.n": "Ravioli",
      "f5.r": "grouper · salt cod · burrata · porcini mushrooms · basil and pine nuts",
      "f6.n": "Black maremmani",
      "f6.r": "squid ink pasta, swordfish filling",
      "f7.n": "Tortelli",
      "f7.r": "little-trunk shaped, potato and taleggio · chestnuts, lardo and honey",
      "f8.n": "Tagliatelle",
      "f8.r": "red, with wine · and squid ink paccheri",
      "f0.nota": "The shapes stay, the fillings change with the seasons and the holidays (at New Year, cotechino ravioli): ask at the counter for today's.",
      "f0.z1": "Enlarge the photo of the ravioli and tortelli",
      "f0.a1": "Tortelli and ravioli with crimped edges on an engraved silver plate",
      "f0.z2": "Enlarge the photo of the cappelletti",
      "f0.a2": "Cappelletti with scalloped edges and casarecce on dark wood, with a dusting of flour",
      "f0.z3": "Enlarge the photo of the tortelli on the plate",
      "f0.a3": "Tortelli on a purple cream with a grind of pepper",
      "d0.eti": "Pastry",
      "d0.t": "Sweets",
      "d0.p": "A dessert is a shape and a filling too: a mango dome, a strawberry and custard tart, a panettone.",
      "d1.z": "Enlarge the photo of the pistachio cake",
      "d1.a": "Pistachio glazed cake with the Pastamordolce chocolate plaque",
      "d1.t": "Made to order",
      "d1.p": "Cakes for birthdays, graduations, anniversaries and parties, designed around your tastes: we make your wishes come true. Order them by phone.",
      "d2.z": "Enlarge the photo of the mango single portion",
      "d2.a": "Mango single-portion cake with raspberries, a blueberry, a blackberry and the Pastamordolce chocolate medallion",
      "d2.t": "Spoon desserts and single portions",
      "d2.p": "Mango semifreddo, mascarpone cake, Sicilian cassata, strawberries and custard, the ciambella. And single portions, one each.",
      "d3.z": "Enlarge the photo of the strawberry tart",
      "d3.a": "Strawberry and custard tart with the Pastamordolce chocolate medallion",
      "d3.t": "Tarts",
      "d3.p": "Fresh fruit, strawberries and custard, lemon and meringue. And at Carnival, chiacchiere.",
      "d4.z": "Enlarge the photo of the wrapped panettoni",
      "d4.a": "Panettoni wrapped in burgundy paper with gold ribbons, among poinsettias",
      "d4.t": "Leavened cakes",
      "d4.p": "Panettone and pandoro at Christmas; the veneziana for New Year and the colomba at Easter, naturally leavened.",
      "v.z": "Enlarge the photo of the jars",
      "v.a": "Pastamordolce jars of peposo, cinta senese ragù, pappa al pomodoro and wild boar stew between two crystal decanters",
      "v.eti": "To go with it",
      "v.t": "Jars",
      "v.p": "Artisan ragù and sauces, ready to warm up for the pasta of the day:",
      "v.l1": "Chianina beef ragù",
      "v.l2": "wild boar ragù",
      "v.l3": "Black Angus ragù",
      "v.l4": "duck ragù",
      "v.l5": "cinta senese pork ragù",
      "v.l6": "peposo beef stew",
      "v.l7": "sugo alla barrocciaia",
      "v.l8": "pappa al pomodoro, vegan",
      "s.z": "Enlarge the photo of the pastry wheel and the red tagliatelle",
      "s.a": "Red wine tagliatelle, a fluted brass pastry wheel with a wooden handle and an old press",
      "s.eti": "Our story",
      "s.t": "Since 1991",
      "s.p1": "Pastamordolce was born in 1991 working with the chefs of some of Milan's starred hotels, and with the restaurants looking for pasta and desserts for their menus. Then the shop, on a private street between Via Giambellino and Via Lorenteggio.",
      "s.p2": "Fresh pasta is a dough of flour and water, with or without eggs: simple, handed down from mother to daughter. The shape, the filling and the hand do the rest.",
      "s.q": "“Our mission is to treat every product as if it were unique.”",
      "r.eti": "4.8 on Google · 82 reviews",
      "r.t": "People who know us",
      "rc.1": "This afternoon we went to this fantastic little place looking for some fresh pasta.<br>Walking into the shop I was immediately charmed by the furniture and the boxes of sweets, every corner was set up in a very refined way.<br>We were welcomed by a very helpful lady, and thanks to her guidance we managed to choose the best kind of pasta for the lunch I have in mind.<br>Finally, she offered us some exceptional chiacchiere, which I promptly decided to buy.<br>Thank you so much<br>See you soon",
      "rc.f1": "Sam Evans · 2 years ago · 5 stars",
      "rc.2": "Beautiful shop<br>Great attention to detail<br>It doesn't even feel like being in a shop<br>Very good fresh pasta but the sweets even more so :)<br>The owner is very kind<br>I'll definitely be back",
      "rc.f2": "Stefano Vioni · 3 years ago · 5 stars",
      "rc.3": "A lovely place with a family atmosphere, where you are welcomed by the owner who even advises you on how to cook her products. The quality of the products is superb, I've tried everything including the sweets and it's all delicious. A place to definitely keep in mind and come back to.",
      "rc.f3": "Luciana Persegoni · 3 years ago · 5 stars",
      "rc.4": "Excellent cappelletti! Small, compact, with a balanced filling, they hold up well when cooked. Used to the Emilian cooking of my mother and aunts, they're among the best I've ever bought. I'll soon try the meatless ravioli and others too, the choice is very wide. Truly a great discovery, which I recommend",
      "rc.f4": "Anita Cavigioli · 4 years ago · 5 stars",
      "rc.5": "I ordered my graduation cake from the Pastamordolce pastry shop. Right away I was amazed at how they try to get to know the tastes of the person in front of them to create a cake just for them, and that's a real strength! I felt pampered!<br>The cake was for twenty people, chocolate with strawberries.. What can I say, everyone went crazy for it, so much that it was all wiped out without a single crumb left.<br>I got loads of compliments, I'll definitely be back! :)",
      "rc.f5": "Giulia Manna · 4 years ago · 5 stars",
      "r.piede": "Public reviews on Google, translated from Italian.",
      "o.eti": "Where and when",
      "o.t": "Afternoons only",
      "o.cap": "Opening hours",
      "o.lun": "Monday",
      "o.mar": "Tuesday",
      "o.mer": "Wednesday",
      "o.gio": "Thursday",
      "o.ven": "Friday",
      "o.sab": "Saturday",
      "o.dom": "Sunday",
      "o.chiuso": "closed",
      "o.p": "Via Privata Metauro 11, about 200 metres from the Tolstoj stop on the M4. Look for the burgundy sign and the entrance with the red carpet.",
      "o.q": "“The place is a bit hidden but the effort to find it is absolutely worth it!”",
      "o.qf": "Alessandro, Google review",
      "o.tel": "Phone",
      "o.ord": "Orders",
      "o.ordv": "Cakes and holiday specialities: by phone",
      "o.pag": "Payments",
      "o.pagv": "Credit and debit cards, contactless",
      "o.chiama": "Call",
      "o.btn": "Directions",
      "o.fz": "Enlarge the photo of the entrance",
      "o.fa": "The entrance at number 11 with the burgundy Pastamordolce sign, fresh pasta and pastry, and the red carpet in the hallway",
      "o.ff": "The entrance at number 11",
      "o.mappa": "Map: Pastamordolce, Via Privata Metauro 11, Milan",
      "q.t": "Questions",
      "q.1t": "Are you open in the morning too?",
      "q.1p": "No: we open in the afternoon only, Monday to Saturday from 4pm to 7:30pm. We're closed on Sundays.",
      "q.2t": "Can I order a cake?",
      "q.2p": "Yes, by phone: 348&nbsp;650&nbsp;7183. Cakes for birthdays, graduations and parties, made to order.",
      "q.3t": "Which fillings are there today?",
      "q.3p": "They change with the seasons and the holidays: ask at the counter or call before coming.",
      "q.4t": "Do you use preservatives?",
      "q.4p": "No: the packaged fresh pasta is in a protective atmosphere, with no added preservatives.",
      "q.5t": "How do I get there?",
      "q.5p": "We're at number 11 of Via Privata Metauro, about 200 metres from the Tolstoj stop on the M4. Look for the burgundy sign and the red carpet.",
      "q.6t": "Can I pay by card?",
      "q.6p": "Yes: credit and debit cards, contactless too.",
      "z.orari": "Monday to Saturday from 4pm to 7:30pm · closed on Sunday",
      "z.cred": "Demo site by <a href=\"https://bespokestud.io\" rel=\"noopener\">Bespoke Studio</a> · texts from their Google listing, their Instagram profile and their old website; public reviews on Google (September 2026); photographs by the owner from the Google listing.",
      "x.nav": "Quick actions",
      "x.chiama": "Call",
      "x.mappa": "Map",
      "x.forme": "Shapes",
      "x.orari": "Hours"
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  // ── FIRMA «la rotella» (#206 Pastamordolce) ──
  // Stato finale in HTML/CSS: ravioli già tagliati (tessere staccate e smerlate, foto dell'apertura senza il lembo di sfoglia).
  // Con GSAP e senza reduced-motion il JS rimette la sfoglia intera (le otto tessere accostate col transform, senza festoni, sulla
  // sfoglia gialla) e, quando entra in vista, una rotella dentellata di ottone col manico di legno corre lungo i tagli: prima il
  // bordo, poi le righe e le colonne; la linea del taglio resta dietro di lei; poi i ravioli si staccano e lo sfrido sparisce.
  // La foto dell'apertura viene rifilata allo stesso modo dopo l'intro. Stato in data-sfoglia / data-rotella: intera → taglia → tagliata.
  var NS = 'http://www.w3.org/2000/svg';
  var MARGINE = 22; // lo sfrido attorno alla sfoglia (css: .sfoglia::before inset -22px)
  var el = function (tag, attrs, padre) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(n);
    return n;
  };
  // il disco dentellato: n archi attorno a un cerchio
  var smerlo = function (r, n, a) {
    var d = '';
    for (var i = 0; i < n; i++) {
      var t0 = i / n * Math.PI * 2, t1 = (i + 1) / n * Math.PI * 2;
      d += (i ? '' : 'M' + (r * Math.cos(t0)).toFixed(2) + ' ' + (r * Math.sin(t0)).toFixed(2) + ' ') + 'A' + a + ' ' + a + ' 0 0 1 ' + (r * Math.cos(t1)).toFixed(2) + ' ' + (r * Math.sin(t1)).toFixed(2) + ' ';
    }
    return d + 'Z';
  };
  var RAGGIO = 13;
  var creaRotella = function (svg) {
    var g = el('g', { 'class': 'rotella', opacity: '0' }, svg);
    var manico = el('g', { 'class': 'rotella__manico' }, g);
    el('line', { x1: 0, y1: 0, x2: 30, y2: 0, stroke: '#8C8A86', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, manico);
    el('rect', { x: 26, y: -4.5, width: 7, height: 9, rx: 2, fill: '#B8913F' }, manico);
    el('rect', { x: 32, y: -7.5, width: 46, height: 15, rx: 7.5, fill: '#8A5A2E' }, manico);
    el('rect', { x: 36, y: -5, width: 38, height: 3, rx: 1.5, fill: '#A87444', opacity: '.7' }, manico);
    var disco = el('g', { 'class': 'rotella__disco' }, g);
    el('path', { d: smerlo(RAGGIO, 20, 2.4), fill: '#D2AD5F', stroke: '#8E6B28', 'stroke-width': 1 }, disco);
    el('circle', { r: RAGGIO - 5, fill: 'none', stroke: '#A98635', 'stroke-width': 1.2 }, disco);
    el('line', { x1: -(RAGGIO - 6), y1: 0, x2: RAGGIO - 6, y2: 0, stroke: '#A98635', 'stroke-width': 1 }, disco);
    el('circle', { r: 2.6, fill: '#6E5320' }, disco);
    return { g: g, manico: manico, disco: disco };
  };
  // il taglio della rotella: una linea a zig-zag lungo una spezzata (lati del bordo o righe/colonne)
  var zigzag = function (punti) {
    var d = '', lato = 0;
    for (var i = 0; i < punti.length - 1; i++) {
      var a = punti[i], b = punti[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      var ux = dx / L, uy = dy / L, nx = -uy, ny = ux, passi = Math.max(2, Math.round(L / 7));
      for (var s = 0; s <= passi; s++) {
        if (i > 0 && s === 0) continue;
        var t = s / passi, off = (s === 0 || s === passi) ? 0 : (lato++ % 2 ? 2 : -2);
        d += (d ? ' L' : 'M') + (a[0] + dx * t + nx * off).toFixed(1) + ' ' + (a[1] + dy * t + ny * off).toFixed(1);
      }
    }
    return d;
  };
  var lunghezza = function (punti) { var L = 0; for (var i = 0; i < punti.length - 1; i++) L += Math.hypot(punti[i + 1][0] - punti[i][0], punti[i + 1][1] - punti[i][1]); return L; };
  var puntoA = function (punti, d) {
    for (var i = 0; i < punti.length - 1; i++) {
      var a = punti[i], b = punti[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (d <= L || i === punti.length - 2) { var t = L ? Math.min(1, d / L) : 0; return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) }; }
      d -= L;
    }
  };
  // fa correre la rotella lungo i tagli, in sequenza; ogni taglio lascia la sua linea
  var corri = function (tl, svg, rot, tagli, velocita) {
    tagli.forEach(function (punti, i) {
      var L = lunghezza(punti);
      var linea = el('path', { d: zigzag(punti), fill: 'none', stroke: '#5C1A25', 'stroke-width': 1.3, 'stroke-opacity': '.55', 'stroke-linejoin': 'round', 'class': 'taglio__linea' }, svg);
      svg.appendChild(rot.g); // la rotella resta sopra le linee
      var Lz = linea.getTotalLength();
      linea.style.strokeDasharray = Lz; linea.style.strokeDashoffset = Lz;
      var p = { t: 0 };
      var metti = function () {
        var q = puntoA(punti, p.t * L);
        rot.g.setAttribute('transform', 'translate(' + q.x.toFixed(1) + ' ' + q.y.toFixed(1) + ') scale(1.3)');
        rot.manico.setAttribute('transform', 'rotate(' + (q.ang * 180 / Math.PI + 210).toFixed(1) + ')');
        rot.disco.setAttribute('transform', 'rotate(' + ((p.t * L / (RAGGIO * 1.3)) * 180 / Math.PI).toFixed(1) + ')');
        linea.style.strokeDashoffset = (Lz * (1 - p.t)).toFixed(1);
      };
      tl.call(function () { p.t = 0; metti(); });
      if (i === 0) tl.to(rot.g, { opacity: 1, duration: 0.2 });
      else tl.fromTo(rot.g, { opacity: 0.35 }, { opacity: 1, duration: 0.12 });
      tl.to(p, { t: 1, duration: Math.max(0.3, L / velocita), ease: 'power1.inOut', onUpdate: metti });
    });
  };
  var nuovoSvg = function (contenitore, fuori) {
    var r = contenitore.getBoundingClientRect();
    var svg = el('svg', { 'class': 'taglio', 'aria-hidden': 'true', width: r.width + fuori * 2, height: r.height + fuori * 2, viewBox: (-fuori) + ' ' + (-fuori) + ' ' + (r.width + fuori * 2) + ' ' + (r.height + fuori * 2) });
    svg.style.cssText = 'position:absolute;left:' + (-fuori) + 'px;top:' + (-fuori) + 'px;overflow:visible;pointer-events:none;z-index:5';
    contenitore.appendChild(svg);
    return svg;
  };

  // 1) la sfoglia delle forme
  var sfoglia = document.querySelector('[data-sfoglia]');
  var tessere = sfoglia ? Array.prototype.slice.call(sfoglia.querySelectorAll('.forma')) : [];
  var griglia = function () {
    var righe = [], colonne = [];
    tessere.forEach(function (t) {
      var top = t.offsetTop, left = t.offsetLeft;
      if (righe.indexOf(top) < 0) righe.push(top);
      if (colonne.indexOf(left) < 0) colonne.push(left);
    });
    righe.sort(function (a, b) { return a - b; }); colonne.sort(function (a, b) { return a - b; });
    return { righe: righe, colonne: colonne };
  };
  // accosta le tessere verso il centro della griglia: la sfoglia torna intera senza cambiare l'altezza della pagina
  var accosta = function () {
    var cs = getComputedStyle(sfoglia), gx = parseFloat(cs.columnGap) || 0, gy = parseFloat(cs.rowGap) || 0, g = griglia();
    var C = g.colonne.length, R = g.righe.length;
    tessere.forEach(function (t) {
      var c = g.colonne.indexOf(t.offsetLeft), r = g.righe.indexOf(t.offsetTop);
      gsap.set(t, { x: ((C - 1) / 2 - c) * gx, y: ((R - 1) / 2 - r) * gy });
    });
    sfoglia.style.setProperty('--sx', ((C - 1) / 2 * gx) + 'px');
    sfoglia.style.setProperty('--sy', ((R - 1) / 2 * gy) + 'px');
  };
  var taglia = function () {
    if (!sfoglia || sfoglia.getAttribute('data-sfoglia') !== 'intera') return;
    sfoglia.setAttribute('data-sfoglia', 'taglia');
    var base = sfoglia.getBoundingClientRect();
    var rett = tessere.map(function (t) { var r = t.getBoundingClientRect(); return { l: r.left - base.left, t: r.top - base.top, r: r.right - base.left, b: r.bottom - base.top }; });
    var L = Math.min.apply(null, rett.map(function (q) { return q.l; })), T = Math.min.apply(null, rett.map(function (q) { return q.t; }));
    var Rr = Math.max.apply(null, rett.map(function (q) { return q.r; })), B = Math.max.apply(null, rett.map(function (q) { return q.b; }));
    var xs = [], ys = [];
    rett.forEach(function (q) {
      if (q.r < Rr - 2 && !xs.some(function (x) { return Math.abs(x - q.r) < 2; })) xs.push(q.r);
      if (q.b < B - 2 && !ys.some(function (y) { return Math.abs(y - q.b) < 2; })) ys.push(q.b);
    });
    xs.sort(function (a, b) { return a - b; }); ys.sort(function (a, b) { return a - b; });
    var tagli = [[[L, T], [Rr, T], [Rr, B], [L, B], [L, T]]];
    ys.forEach(function (y, i) { tagli.push(i % 2 ? [[Rr, y], [L, y]] : [[L, y], [Rr, y]]); });
    xs.forEach(function (x, i) { tagli.push(i % 2 ? [[x, B], [x, T]] : [[x, T], [x, B]]); });
    var svg = nuovoSvg(sfoglia, MARGINE + 30);
    var rot = creaRotella(svg);
    var tl = gsap.timeline({ onComplete: function () { sfoglia.setAttribute('data-sfoglia', 'tagliata'); svg.remove(); } });
    corri(tl, svg, rot, tagli, 2000);
    tl.to(rot.g, { opacity: 0, duration: 0.25 });
    tl.call(function () { sfoglia.classList.remove('is-intera'); });
    tl.to(tessere, { x: 0, y: 0, duration: 0.8, ease: 'back.out(1.3)', stagger: 0.04 }, '<');
    tl.to(svg.querySelectorAll('.taglio__linea'), { opacity: 0, duration: 0.4 }, '<');
  };
  if (hasGsap && !reducedMotion && sfoglia && tessere.length) {
    sfoglia.classList.add('is-intera');
    sfoglia.setAttribute('data-sfoglia', 'intera');
    accosta();
    window.addEventListener('resize', function () { if (sfoglia.getAttribute('data-sfoglia') === 'intera') accosta(); });
    if (hasST) ScrollTrigger.create({ trigger: sfoglia, start: 'top 72%', once: true, onEnter: taglia });
    else taglia();
    // rete di sicurezza: se la sfoglia è già in vista e per qualunque motivo non è partita, parte da sola
    setTimeout(function () { var r = sfoglia.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) taglia(); }, 6000);
  }

  // 2) la foto dell'apertura: il lembo di sfoglia attorno al raviolo, rifilato dopo l'intro
  var ravioloApertura = document.querySelector('[data-rotella]');
  var lembo = ravioloApertura ? ravioloApertura.querySelector('.raviolo__sfoglia') : null;
  var rifila = function () {
    if (!ravioloApertura || ravioloApertura.getAttribute('data-rotella') !== 'intera') return;
    ravioloApertura.setAttribute('data-rotella', 'taglia');
    var r = ravioloApertura.getBoundingClientRect(), f = 9;
    var svg = nuovoSvg(ravioloApertura, 60);
    var rot = creaRotella(svg);
    var tl = gsap.timeline({ onComplete: function () { ravioloApertura.setAttribute('data-rotella', 'tagliata'); svg.remove(); } });
    corri(tl, svg, rot, [[[-f, -f], [r.width + f, -f], [r.width + f, r.height + f], [-f, r.height + f], [-f, -f]]], 900);
    tl.to(rot.g, { opacity: 0, duration: 0.25 });
    tl.to(lembo, { opacity: 0, scale: 1.04, duration: 0.6, ease: 'power2.out' }, '<');
    tl.to(svg.querySelectorAll('.taglio__linea'), { opacity: 0, duration: 0.4 }, '<');
  };
  if (hasGsap && !reducedMotion && ravioloApertura && lembo) {
    ravioloApertura.setAttribute('data-rotella', 'intera');
    gsap.set(lembo, { opacity: 1 });
    setTimeout(function () { if (!document.getElementById('intro')) rifila(); }, 7000);
  }

  // lo stato degli orari compare due volte (apertura e «Solo il pomeriggio»): il secondo copia il primo, anche al cambio lingua
  var stato1 = document.getElementById('orarioStato'), stato2 = document.getElementById('orarioStato2');
  if (stato1 && stato2) {
    var copiaStato = function () { stato2.textContent = stato1.textContent; };
    copiaStato();
    if ('MutationObserver' in window) new MutationObserver(copiaStato).observe(stato1, { childList: true, characterData: true, subtree: true });
  }
  window.bespokeHeroEntrance = function () {
    if (!hasGsap || reducedMotion) return;
    gsap.delayedCall(0.3, rifila);
    gsap.from('.apertura__t', { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all' });
    gsap.from('.apertura__p, .apertura .stato, .apertura .azioni', { y: 16, opacity: 0, duration: 0.7, delay: 0.2, stagger: 0.08, ease: 'power2.out', clearProps: 'all' });
  };
})();

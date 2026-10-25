/* PROFIT® · Landing de suscripción.
   Todo el contenido sale de data/*.json: este archivo no tiene textos, precios ni datos de producto propios.
   Reglas: un valor "pendiente" no se muestra; los campos internos (notas, _leeme, precio.regla, etc.) nunca se renderizan.
   Patrón IIFE sin módulos: cada init va envuelto en safe() para que una falla no rompa el resto. */
(function () {
  "use strict";

  var VERSION = (function () {
    var s = document.currentScript && document.currentScript.src.match(/[?&]v=([^&]+)/);
    return s ? s[1] : String(Date.now());
  })();
  var DATA = {};
  var state = { slug: null, freq: null, img: 0 };
  var ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';

  // ---------- Utilidades ----------

  function safe(fn, name) {
    try { return fn(); } catch (e) { console.error("[PROFIT] falló " + name, e); }
  }

  function pend(v) {
    if (v === null || v === undefined) return true;
    if (typeof v === "string") return v.trim() === "" || v.trim().toLowerCase().indexOf("pendiente") === 0;
    return false;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fill(tpl, vars) {
    return tpl.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] !== undefined ? vars[k] : ""; });
  }

  // Redondeo hacia arriba: nunca publicar un precio por debajo del PVP sugerido.
  function precioRedondeado(n) { return Math.ceil(n); }
  function fmtPrecio(n) {
    return "$ " + precioRedondeado(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });
  }

  function slot(name) { return document.querySelector('[data-slot="' + name + '"]'); }

  function storage(fn) { try { return fn(window.sessionStorage); } catch (e) { return null; } }

  // Encabezado de sección numerado, como en la web expo: índice a la izquierda, contenido a la derecha.
  function seccion(t, id, cuerpo, extraHead, ancha) {
    return '<div class="w"><div class="mv' + (ancha ? " mv--full" : "") + '">' +
      '<div class="idx rv"><span class="n">' + esc(t.numero || "") + '</span><span class="t lbl">' + esc(t.etiqueta || "") + "</span></div>" +
      "<div>" +
        '<h2 class="dsp h2 rv" id="' + id + '">' + esc(t.titulo) + "</h2>" +
        (t.bajada ? '<p class="txt rv">' + esc(t.bajada) + "</p>" : "") +
        (extraHead || "") +
        cuerpo +
      "</div>" +
    "</div></div>";
  }

  // ---------- UTM y atribución ----------

  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var utm = (function () {
    var saved = storage(function (s) { return JSON.parse(s.getItem("profit_utm") || "null"); }) || {};
    var params = new URLSearchParams(location.search);
    var fresh = {};
    UTM_KEYS.forEach(function (k) { if (params.get(k)) fresh[k] = params.get(k); });
    if (Object.keys(fresh).length) {
      saved = fresh;
      storage(function (s) { s.setItem("profit_utm", JSON.stringify(fresh)); });
    }
    return saved;
  })();

  function withUtm(url) {
    try {
      var u = new URL(url);
      Object.keys(utm).forEach(function (k) { if (!u.searchParams.has(k)) u.searchParams.set(k, utm[k]); });
      return u.toString();
    } catch (e) { return url; }
  }

  function origen(code) { return "[WEB · " + code + " · " + (utm.utm_source || "directo") + "]"; }

  function waNumero() { return String(DATA.marca.whatsapp_comercial).replace(/\D/g, ""); }
  function waLink(msg) { return "https://wa.me/" + waNumero() + "?text=" + encodeURIComponent(msg); }

  // ---------- Medición ----------

  function track(name, params) {
    params = params || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, params));
    try {
      if (window.gtag) window.gtag("event", name, params);
      if (window.ttq) window.ttq.track(name, params);
      if (window.fbq) window.fbq("trackCustom", name, params);
    } catch (e) { /* un píxel caído no rompe la página */ }
  }

  // Los píxeles se cargan después de la primera interacción para no afectar la carga inicial.
  function loadPixels() {
    var m = DATA.sus.medicion || {};
    var loaded = false;
    function load() {
      if (loaded) return;
      loaded = true;
      if (!pend(m.ga4_id)) {
        var s = document.createElement("script");
        s.async = true;
        s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(m.ga4_id);
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag("js", new Date());
        window.gtag("config", m.ga4_id);
      }
      if (!pend(m.tiktok_pixel_id)) {
        /* TikTok Pixel (snippet oficial, compactado) */
        !function (w, d, t) { w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"]; ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; }; for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]); ttq.load = function (e) { var n = "https://analytics.tiktok.com/i18n/pixel/events.js"; ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = n; ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); var o = d.createElement("script"); o.type = "text/javascript"; o.async = !0; o.src = n + "?sdkid=" + e + "&lib=" + t; var a = d.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a); }; ttq.load(m.tiktok_pixel_id); ttq.page(); }(window, document, "ttq");
      }
      if (!pend(m.meta_pixel_id)) {
        /* Meta Pixel (snippet oficial, compactado) */
        !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
        window.fbq("init", m.meta_pixel_id);
        window.fbq("track", "PageView");
      }
    }
    ["pointerdown", "keydown", "scroll", "touchstart"].forEach(function (ev) {
      window.addEventListener(ev, load, { once: true, passive: true });
    });
  }

  // ---------- Datos derivados ----------

  function producto(slug) { return DATA.productos.find(function (p) { return p.slug === slug; }); }
  function linea(id) { return DATA.lineas.find(function (l) { return l.id === id; }); }
  function lineasOrdenadas() { return DATA.lineas.slice().sort(function (a, b) { return a.orden - b.orden; }); }

  function productosDeLinea(id) {
    var l = linea(id);
    return l ? l.productos.map(producto).filter(Boolean) : [];
  }

  function lineaColor(l, fondo) {
    return fondo === "oscuro" ? l.color_pantalla_sobre_oscuro : l.color_pantalla_sobre_claro;
  }

  function lineaVars(l) {
    return "--c:" + lineaColor(l, "claro") + ";--c-osc:" + lineaColor(l, "oscuro");
  }

  function porciones(p) {
    var d = (p.datos_rotulo || []).find(function (x) { return /porciones|ingestas/i.test(x.etiqueta) && /^\d+$/.test(x.valor); });
    return d ? { n: parseInt(d.valor, 10), unidad: d.etiqueta } : null;
  }

  function frecuenciaSugerida(p) {
    var por = porciones(p);
    var opciones = DATA.sus.frecuencias_dias;
    if (!por || por.n > 90) return null;
    return opciones.reduce(function (best, f) { return Math.abs(f - por.n) < Math.abs(best - por.n) ? f : best; }, opciones[0]);
  }

  function precioVisible(p) {
    return p.precio && p.precio.publicar !== false && typeof p.precio.pvp_sugerido === "number";
  }

  // Promo de suscripción vigente, o null. Tiene fecha de cierre real (igual para todos): pasada esa hora, deja de aplicarse.
  function promo() {
    var pr = DATA.sus.promo;
    if (!pr || !pr.activa || !(pr.descuento_pct > 0)) return null;
    var cierre = pend(pr.cierre) ? null : new Date(pr.cierre);
    if (cierre && isNaN(cierre.getTime())) cierre = null;
    if (cierre && Date.now() >= cierre.getTime()) return null;
    return { pct: pr.descuento_pct, cierre: cierre, t: pr.textos };
  }

  function precioSuscripcion(p) {
    var pr = promo();
    var base = p.precio.pvp_sugerido;
    return pr ? Math.ceil(base * (1 - pr.pct / 100)) : precioRedondeado(base);
  }

  // Precio de suscripción con el sugerido tachado cuando hay promo. Formato compacto para tarjetas y barra fija.
  function precioCompacto(p) {
    var pr = promo();
    return (pr ? "<s>" + fmtPrecio(p.precio.pvp_sugerido) + "</s> " : "") + "<strong>" + fmtPrecio(precioSuscripcion(p)) + "</strong>";
  }

  function restante() {
    var pr = promo();
    return pr && pr.cierre ? Math.max(0, pr.cierre.getTime() - Date.now()) : 0;
  }

  function cuentaHtml() {
    var pr = promo();
    var ms = restante();
    var s = Math.floor(ms / 1000);
    var dos = function (n) { return String(n).padStart(2, "0"); };
    return '<span class="cd" role="timer">' +
      "<b>" + dos(Math.floor(s / 3600)) + "</b><i>" + esc(pr.t.horas) + "</i>" +
      "<b>" + dos(Math.floor(s % 3600 / 60)) + "</b><i>" + esc(pr.t.minutos) + "</i>" +
      "<b>" + dos(s % 60) + "</b><i>" + esc(pr.t.segundos) + "</i></span>";
  }

  // Un solo reloj para todos los contadores de la página. Al llegar a cero se vuelve a dibujar todo sin la promo.
  function initCuenta() {
    var pr = promo();
    if (!pr || !pr.cierre) return;
    var timer = setInterval(function () {
      if (!promo()) {
        clearInterval(timer);
        safe(renderTopbar, "barra superior");
        safe(renderHero, "hero");
        safe(renderComo, "cómo funciona");
        safe(renderFaq, "preguntas");
        select(state.slug);
        document.querySelectorAll(".rv").forEach(function (el) { el.classList.add("in"); });
        return;
      }
      var html = cuentaHtml();
      document.querySelectorAll("[data-countdown]").forEach(function (el) { el.innerHTML = html; });
    }, 1000);
  }

  function packshot(p, w) {
    if (pend(p.packshot)) return null;
    var base = p.packshot.replace(/^\//, "").replace(/\.png$/i, "");
    return "public/" + base.replace("packshots/", "packshots/web/") + "-" + w + ".jpg";
  }

  function imgTag(p, w, attrs) {
    var src = packshot(p, w);
    if (!src) return '<div class="placeholder">' + esc(DATA.sus.textos.selector.packshot_pendiente) + "</div>";
    return '<img src="' + esc(src) + '" srcset="' + esc(packshot(p, 384)) + " 384w, " + esc(packshot(p, 768)) + ' 768w" sizes="(min-width: 900px) 360px, 60vw" alt="' +
      esc(p.nombre + " " + p.variante) + '" width="768" height="1376" ' + (attrs || "") + ">";
  }

  function nombreCompleto(p) { return p.nombre + " " + p.variante; }

  function ctaSuscripcion(p, freq) {
    var t = DATA.sus.textos.selector;
    var plan = (DATA.sus.planes[p.slug] || {})[String(freq)];
    if (precioVisible(p) && !pend(plan)) {
      return { href: withUtm(plan), label: t.boton_mp, via: "mercadopago", wa: false };
    }
    var msg = precioVisible(p)
      ? "Hola, quiero suscribirme a " + nombreCompleto(p) + ", cada " + freq + " días. " + origen("suscripcion · " + p.slug)
      : "Hola, quiero consultar por la suscripción a " + nombreCompleto(p) + ". " + origen("suscripcion · " + p.slug);
    return { href: waLink(msg), label: precioVisible(p) ? t.boton_whatsapp : t.boton_consulta, via: "whatsapp", wa: true };
  }

  // Los sellos que ya aparecen en la franja de confianza no se repiten en el encabezado.
  function enFranja(sello) { return /libre de gluten|industria argentina/i.test(sello); }

  // ---------- Animaciones: revelado y cifras ----------

  var io = null;
  function initReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".rv").forEach(function (el) { el.classList.add("in"); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        if (e.target.matches("[data-count]")) contar(e.target);
        e.target.querySelectorAll("[data-count]").forEach(contar);
        io.unobserve(e.target);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    observarNuevos();
    // Red de seguridad: a los 6 s se muestra todo lo que siga oculto.
    setTimeout(function () { document.querySelectorAll(".rv:not(.in)").forEach(function (el) { el.classList.add("in"); }); }, 6000);
  }

  function observarNuevos() {
    if (!io) return;
    document.querySelectorAll(".rv:not(.in):not([data-obs])").forEach(function (el) {
      el.setAttribute("data-obs", "");
      io.observe(el);
    });
  }

  // Cuenta desde 0 hasta la cifra del rótulo. El texto final ya está en el HTML: si no corre, se lee igual.
  function contar(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    var m = el.textContent.match(/^(\d+)(.*)$/);
    if (!m) return;
    var fin = parseInt(m[1], 10), resto = m[2], t0 = null, dur = 900;
    if (fin < 2) return;
    function paso(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      var v = Math.round(fin * (1 - Math.pow(1 - k, 3)));
      el.textContent = v + resto;
      if (k < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  // ---------- Nav y menú mobile ----------

  function renderMenu() {
    var t = DATA.sus.textos;
    var links = t.menu.map(function (m) { return '<a href="#' + esc(m.ancla) + '">' + esc(m.texto) + "</a>"; }).join("");
    slot("menu").innerHTML = links;
    slot("menu-cta").textContent = t.menu_cta;
    renderTopbar();

    var mm = slot("menu-mobile");
    mm.innerHTML = t.menu.map(function (m) { return '<a class="mm__item" href="#' + esc(m.ancla) + '">' + esc(m.texto) + "</a>"; }).join("") +
      '<a class="btn btn--inv" href="#suscripcion">' + esc(t.menu_cta) + "</a>";
    var burger = document.querySelector(".nav__burger");
    function toggle(open) {
      mm.hidden = !open;
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("lock", open);
    }
    burger.addEventListener("click", function () { toggle(mm.hidden); });
    mm.addEventListener("click", function (e) { if (e.target.closest("a")) toggle(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !mm.hidden) toggle(false); });

    var nav = document.getElementById("nav");
    var onScroll = function () { nav.classList.toggle("s", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function renderTopbar() {
    var pr = promo();
    var bar = slot("topbar");
    bar.classList.toggle("topbar--promo", !!pr);
    if (!pr) { bar.textContent = DATA.sus.textos.barra_superior; return; }
    bar.innerHTML = pr.cierre
      ? '<span>' + esc(fill(pr.t.barra, { pct: pr.pct })) + '</span> <span data-countdown>' + cuentaHtml() + "</span>"
      : esc(fill(pr.t.barra_sin_cierre, { pct: pr.pct }));
  }

  // ---------- Secciones fijas ----------

  function renderHero() {
    var t = DATA.sus.textos.hero;
    var pr = promo();
    var p = producto(DATA.sus.producto_inicial);
    var l = linea(p.linea);
    var dato = (p.datos_rotulo || [])[0];
    slot("hero").innerHTML =
      '<div class="hero__in">' +
        '<div class="hero__copy">' +
          '<p class="lbl rv"><span class="dot"></span>' + esc(t.etiqueta) + "</p>" +
          '<h1 class="dsp hero__title rv">' + esc(DATA.marca.concepto_campana) + "</h1>" +
          '<p class="hero__sub rv">' + esc(t.bajada) + "</p>" +
          (pr ? '<p class="hero__promo rv"><span class="lbl">' + esc(fill(pr.t.etiqueta_hero, { pct: pr.pct })) + "</span>" +
            (pr.cierre ? '<span class="lbl hero__termina">' + esc(pr.t.termina) + '</span><span data-countdown>' + cuentaHtml() + "</span>" : "") + "</p>" : "") +
          '<div class="hero__acts rv">' +
            '<a class="btn btn--inv" href="#suscripcion">' + esc(t.boton) + "</a>" +
            '<a class="btn btn--gd" href="#como-funciona">' + esc(t.boton_secundario) + "</a>" +
          "</div>" +
        "</div>" +
        '<div class="hero__media" style="' + lineaVars(l) + ";--acento:" + lineaColor(l, "claro") + '">' +
          imgTag(p, 768, 'fetchpriority="high"') +
          (dato ? '<div class="hero__cifra rv"><span class="cifra" data-count>' + esc(dato.valor) + "</span><span>" + esc(dato.etiqueta) + "</span></div>" : "") +
        "</div>" +
      "</div>" +
      '<div class="sist" role="group" aria-label="Líneas">' +
        lineasOrdenadas().map(function (x) {
          return '<button type="button" data-linea="' + esc(x.id) + '" style="' + lineaVars(x) + '">' +
            '<span class="t"><span class="dot"></span>' + esc(x.nombre) + '</span><span class="s">' + esc(x.momento) + "</span></button>";
        }).join("") +
      "</div>";
  }

  function renderTira() {
    var items = lineasOrdenadas().map(function (l) {
      return '<span style="' + lineaVars(l) + '"><b>●</b>' + esc(l.nombre) + (pend(l.frase_vigente) ? "" : " · " + esc(l.frase_vigente)) + "</span>";
    }).join("");
    // Duplicada para que la animación haga el bucle sin salto.
    slot("tira").innerHTML = '<div class="tira__tr">' + items + items + items + items + "</div>";
  }

  function renderEmpezar() {
    var t = DATA.sus.textos.por_donde_empezar;
    slot("empezar").innerHTML = seccion(t, "empezar-t",
      '<div class="ruta rv">' +
        t.opciones.map(function (o) {
          var l = linea(o.linea);
          return '<button type="button" data-linea="' + esc(o.linea) + '" style="' + lineaVars(l) + '">' +
            '<span class="q">' + esc(o.necesidad) + "</span>" +
            '<span class="a">' + esc(o.respuesta) + "</span>" +
            '<span class="go"><span class="dot"></span>' + esc(t.boton) + " " + esc(l.nombre) + "</span>" +
          "</button>";
        }).join("") +
      "</div>");
  }

  function renderComo() {
    var t = DATA.sus.textos.como_funciona;
    slot("como").innerHTML = seccion(t, "como-t",
      '<ol class="pasos rv">' +
        t.pasos.filter(function (p) { return !pend(p.texto); }).map(function (p, i) {
          var pr = promo();
          var texto = pr && p.texto_promo ? fill(p.texto_promo, { pct: pr.pct }) : p.texto;
          return '<li class="paso"><span class="cifra">' + String(i + 1).padStart(2, "0") + "</span><div>" +
            '<h3 class="h3">' + esc(p.titulo) + "</h3><p>" + esc(texto) + "</p></div></li>";
        }).join("") +
      "</ol>");
  }

  function renderLineas() {
    var t = DATA.sus.textos.lineas;
    slot("lineas").innerHTML = seccion(t, "lineas-t",
      '<div class="lin">' +
        lineasOrdenadas().map(function (l) {
          var n = productosDeLinea(l.id).length;
          return '<button type="button" class="lrow rv" data-linea="' + esc(l.id) + '" style="' + lineaVars(l) + '">' +
            "<div>" +
              '<div class="nm"><span class="dot"></span><h3 class="dsp">' + esc(l.nombre) + "</h3></div>" +
              (pend(l.frase_vigente) ? "" : '<span class="cop">' + esc(l.frase_vigente) + "</span>") +
            "</div>" +
            '<p class="ds">' + esc(l.momento) + ". " + esc(l.que_es) + "</p>" +
            '<span class="go">' + esc(n === 1 ? t.producto : fill(t.productos, { n: n })) + " " + ARROW + "</span>" +
          "</button>";
        }).join("") +
      "</div>");
  }

  function renderMarca() {
    var t = DATA.sus.textos.marca;
    slot("marca").innerHTML = seccion(t, "marca-t",
      '<p class="txt rv">' + esc(t.texto) + "</p>" +
      '<div class="pull rv"><p class="dsp">' + esc(DATA.marca.firma) + "</p></div>" +
      '<div class="prin">' +
        t.principios.map(function (p) {
          return '<div class="p rv"><h3 class="h3">' + esc(p.titulo) + "</h3><p>" + esc(p.texto) + "</p></div>";
        }).join("") +
      "</div>");
  }

  function renderQuienes() {
    var t = DATA.sus.textos.quienes_somos;
    var vars = { productos: DATA.productos.length, lineas: DATA.lineas.length };
    var hechos = t.hechos.filter(function (h) { return !pend(h.texto); });
    var certs = t.certificaciones.filter(function (c) { return !pend(c.texto); });
    slot("quienes").innerHTML = seccion(t, "quienes-t",
      '<p class="txt rv">' + esc(t.texto) + "</p>" +
      '<div class="hechos rv">' +
        hechos.map(function (h) {
          return '<div><p class="k"' + (/^\{/.test(h.cifra) ? " data-count" : "") + ">" + esc(fill(h.cifra, vars)) + '</p><p class="v">' + esc(fill(h.texto, vars)) + "</p></div>";
        }).join("") +
      "</div>" +
      (certs.length ? '<div class="cert rv"><span class="lbl">' + esc(t.certificaciones_titulo) + '</span><div class="cg">' +
        certs.map(function (c) { return '<div><p class="c1">' + esc(c.titulo) + '</p><p class="c2">' + esc(c.texto) + "</p></div>"; }).join("") +
      "</div></div>" : ""));
  }

  function renderNoLeer() {
    var t = DATA.sus.textos.lo_que_no_vas_a_leer;
    var li = function (m, x) { return '<li><span class="m">' + m + "</span><span>" + esc(x) + "</span></li>"; };
    slot("noleer").innerHTML = seccion(t, "noleer-t",
      '<div class="nd rv">' +
        '<div class="c no"><span class="lbl">' + esc(t.no_titulo) + "</span><ul>" + t.no.map(function (x) { return li("✕", x); }).join("") + "</ul></div>" +
        '<div class="c si"><span class="lbl">' + esc(t.si_titulo) + "</span><ul>" + t.si.map(function (x) { return li("→", x); }).join("") + "</ul></div>" +
      "</div>");
  }

  function renderUnaVez() {
    var t = DATA.sus.textos.una_vez;
    var mlUrl = DATA.marca.mercado_libre_tienda_oficial_url;
    var puntos = DATA.puntos.puntos || [];
    var provincias = puntos.map(function (p) { return p.provincia; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }).sort();

    var cuerpo =
      '<p class="txt rv">' + esc(t.texto) + "</p>" +
      '<ul class="cl rv">' + t.canales.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" +
      '<div class="unavez__ctas rv">' +
        (!pend(mlUrl) ? '<a class="btn" data-track="click_mercadolibre" href="' + esc(withUtm(mlUrl)) + '" target="_blank" rel="noopener">' + esc(t.boton_ml) + "</a>" : "") +
        (puntos.length ? "" : '<a class="btn btn--wa" data-track="click_donde_comprar" href="' + esc(waLink(t.mensaje_whatsapp + ". " + origen("donde-comprar"))) + '" target="_blank" rel="noopener">' + esc(t.boton_whatsapp) + "</a>") +
      "</div>" +
      (puntos.length ? "" : '<p class="compra__nota rv" style="margin-top:14px">' + esc(t.sin_puntos) + "</p>");

    if (puntos.length) {
      cuerpo +=
        '<div class="fm filtro"><label for="prov">' + esc(t.filtro) + '</label><select id="prov"><option value="">' + esc(t.filtro_todas) + "</option>" +
          provincias.map(function (p) { return '<option value="' + esc(p) + '">' + esc(p) + "</option>"; }).join("") +
        '</select></div><ul class="puntos" id="puntos"></ul>';
    }
    slot("unavez").innerHTML = seccion(Object.assign({}, t, { bajada: null }), "unavez-t", cuerpo);

    if (puntos.length) {
      var lista = document.getElementById("puntos");
      var renderPuntos = function (prov) {
        lista.innerHTML = puntos.filter(function (p) { return !prov || p.provincia === prov; }).map(function (p) {
          return '<li class="punto"><strong>' + esc(p.nombre) + "</strong><small>" +
            esc([p.direccion, p.localidad, p.provincia].filter(function (x) { return !pend(x); }).join(", ")) + "</small>" +
            (!pend(p.maps_url) ? '<a class="lnk" data-track="click_donde_comprar" href="' + esc(p.maps_url) + '" target="_blank" rel="noopener">' + esc(t.mapa) + "</a>" : "") +
          "</li>";
        }).join("");
      };
      renderPuntos("");
      document.getElementById("prov").addEventListener("change", function (e) { renderPuntos(e.target.value); });
    }
  }

  function renderFaq() {
    var t = DATA.sus.textos.preguntas;
    slot("faq").innerHTML = seccion(t, "faq-t",
      '<div class="faq rv">' +
        t.lista.map(function (q) {
          var pr = promo();
          return { p: q.p, r: pr && q.r_promo ? fill(q.r_promo, { pct: pr.pct }) : q.r };
        }).filter(function (q) { return !pend(q.r); }).map(function (q) {
          return "<details><summary>" + esc(q.p) + "</summary><p>" + esc(q.r) + "</p></details>";
        }).join("") +
      "</div>");
  }

  function renderVender() {
    var t = DATA.sus.textos.quiero_vender;
    var c = t.campos;
    var campo = function (id, label, input) { return '<label for="v-' + id + '">' + esc(label) + "</label>" + input; };
    slot("vender").innerHTML = seccion(Object.assign({}, t, { bajada: null }), "vender-t",
      '<div class="com">' +
        "<div>" +
          '<p class="txt rv">' + esc(t.texto) + "</p>" +
          '<ul class="cl rv">' + t.lista.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" +
        "</div>" +
        '<form class="fm rv" id="form-vender" novalidate>' +
          '<h3 class="h3">' + esc(t.form_titulo) + "</h3>" +
          campo("comercio", c.comercio, '<input id="v-comercio" name="comercio" required autocomplete="organization">') +
          campo("tipo", c.tipo, '<select id="v-tipo" name="tipo" required><option value=""></option>' +
            t.tipos.map(function (x) { return "<option>" + esc(x) + "</option>"; }).join("") + "</select>") +
          campo("localidad", c.localidad, '<input id="v-localidad" name="localidad" required autocomplete="address-level2">') +
          campo("nombre", c.nombre, '<input id="v-nombre" name="nombre" required autocomplete="name">') +
          campo("whatsapp", c.whatsapp, '<input id="v-whatsapp" name="whatsapp" type="tel" inputmode="tel" required autocomplete="tel">') +
          '<button class="btn btn--wa btn--block" type="submit">' + esc(t.boton) + "</button>" +
          '<p class="nt">' + esc(t.promesa) + "</p>" +
        "</form>" +
      "</div>");

    document.getElementById("form-vender").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target;
      var vacios = Array.prototype.filter.call(f.elements, function (el) { return el.required && !el.value.trim(); });
      Array.prototype.forEach.call(f.elements, function (el) { if (el.required) el.classList.toggle("err", !el.value.trim()); });
      if (vacios.length) { vacios[0].focus(); return; }
      var v = function (n) { return f.elements[n].value.trim(); };
      var msg = "Hola, quiero vender PROFIT. Comercio: " + v("comercio") + ". Tipo: " + v("tipo") +
        ". Localidad: " + v("localidad") + ". Contacto: " + v("nombre") + ". WhatsApp: " + v("whatsapp") + ". " + origen("mayorista");
      track("lead_mayorista", { tipo: v("tipo") });
      window.open(waLink(msg), "_blank", "noopener");
    });
  }

  function renderFooter() {
    var m = DATA.marca;
    var t = DATA.sus.textos;
    var tf = t.footer;
    var waVisible = "+" + waNumero().replace(/^(\d{2})(\d)(\d{2})(\d{4})(\d{4})$/, "$1 $2 $3 $4-$5");
    var redes = [
      !pend(m.instagram) ? '<li><a href="https://instagram.com/' + esc(m.instagram.replace("@", "")) + '" target="_blank" rel="noopener">Instagram</a></li>' : "",
      !pend(m.tiktok) ? '<li><a href="https://tiktok.com/' + esc(m.tiktok) + '" target="_blank" rel="noopener">TikTok</a></li>' : ""
    ].join("");
    slot("footer").innerHTML =
      '<div class="w">' +
        '<div class="fc">' +
          '<a href="' + esc(waLink(t.whatsapp_flotante + ". " + origen("footer"))) + '" target="_blank" rel="noopener" data-track="click_whatsapp">' +
            '<span class="k lbl">' + esc(tf.whatsapp) + '</span><p class="v">' + esc(waVisible) + '</p><p class="d">' + esc(tf.whatsapp_detalle) + "</p></a>" +
          (!pend(m.email) ? '<a href="mailto:' + esc(m.email) + '"><span class="k lbl">' + esc(tf.email) + '</span><p class="v">' + esc(m.email) + "</p></a>" : "") +
          '<div><span class="k lbl">' + esc(tf.elaborado) + '</span><p class="v">' + esc(m.elaborador) + '</p><p class="d">' + esc(m.origen) +
            (!pend(m.cuit) ? " · CUIT " + esc(m.cuit) : "") + "</p></div>" +
        "</div>" +
        '<div class="fg">' +
          '<div class="br"><img src="public/brand/profit-logo-blanco.png" alt="PROFIT" width="120" height="30" loading="lazy"><p>' + esc(m.esencia) + "</p></div>" +
          '<div><span class="lbl">' + esc(tf.secciones) + "</span><ul>" +
            t.menu.map(function (x) { return '<li><a href="#' + esc(x.ancla) + '">' + esc(x.texto) + "</a></li>"; }).join("") + redes + "</ul></div>" +
          '<div><span class="lbl">' + esc(tf.legales) + "</span><ul>" +
            '<li><a href="' + esc(waLink(t.arrepentimiento.mensaje + " " + origen("arrepentimiento"))) + '" target="_blank" rel="noopener">' + esc(t.arrepentimiento.link) + "</a></li>" +
            '<li><a href="' + esc(t.defensa_consumidor.url) + '" target="_blank" rel="noopener">' + esc(t.defensa_consumidor.texto) + "</a></li>" +
          "</ul></div>" +
        "</div>" +
        '<p class="footer__leyenda">' + esc(m.leyenda_obligatoria_suplementos) + "</p>" +
        '<p class="leg">' + esc(m.disclaimer_footer_web_expo) + "</p>" +
        '<div class="fb"><p>© ' + new Date().getFullYear() + " " + esc(m.marca) + " · " + esc(m.elaborador) + "</p><p>" + esc(m.origen) + "</p></div>" +
      "</div>";
  }

  function renderWaFloat() {
    slot("wa-float").href = waLink(DATA.sus.textos.whatsapp_flotante + ". " + origen(state.slug || "general"));
  }

  // ---------- Selector y secciones que dependen del producto ----------

  function renderSelectorFrame() {
    var t = DATA.sus.textos.selector;
    slot("selector").innerHTML = seccion(Object.assign({}, t, { bajada: null }), "selector-t",
      '<div class="sel rv">' +
        '<div class="sel__steps">' +
          '<div><span class="sel__label lbl" id="lbl-linea">' + esc(t.paso_linea) + '</span><div class="tabs" role="group" aria-labelledby="lbl-linea" id="sel-lineas"></div></div>' +
          '<div><span class="sel__label lbl" id="lbl-prod">' + esc(t.paso_producto) + '</span><div class="opts" role="group" aria-labelledby="lbl-prod" id="sel-grupos"></div></div>' +
          '<div id="sel-variantes-wrap"><span class="sel__label lbl" id="lbl-var">' + esc(t.paso_variante) + '</span><div class="opts" role="group" aria-labelledby="lbl-var" id="sel-variantes"></div></div>' +
        "</div>" +
        '<article class="ficha" id="ficha" aria-live="polite"></article>' +
      "</div>", "", true);

    slot("selector").addEventListener("click", function (e) {
      var b;
      if ((b = e.target.closest("[data-sel-linea]"))) {
        var primero = productosDeLinea(b.dataset.selLinea)[0];
        if (primero) select(primero.slug);
      } else if ((b = e.target.closest("[data-sel-slug]"))) {
        select(b.dataset.selSlug);
        track("select_variant", { item_id: b.dataset.selSlug });
      } else if ((b = e.target.closest("[data-freq]"))) {
        state.freq = parseInt(b.dataset.freq, 10);
        renderFicha(false);
        renderSticky();
      } else if ((b = e.target.closest("[data-img]"))) {
        state.img = parseInt(b.dataset.img, 10);
        renderFicha(false);
      }
    });
  }

  function renderSelectorSteps() {
    var p = producto(state.slug);

    document.getElementById("sel-lineas").innerHTML = lineasOrdenadas().map(function (l) {
      return '<button type="button" class="tab" data-sel-linea="' + esc(l.id) + '" aria-pressed="' + (l.id === p.linea) + '" style="' + lineaVars(l) + '">' +
        '<span class="dot"></span>' + esc(l.nombre) + "</button>";
    }).join("");

    var enLinea = productosDeLinea(p.linea);
    var grupos = [];
    enLinea.forEach(function (x) { if (grupos.indexOf(x.grupo) < 0) grupos.push(x.grupo); });
    document.getElementById("sel-grupos").innerHTML = grupos.map(function (g) {
      var primero = enLinea.find(function (x) { return x.grupo === g; });
      return '<button type="button" class="opt" data-sel-slug="' + esc(primero.slug) + '" aria-pressed="' + (g === p.grupo) + '">' + esc(primero.nombre) + "</button>";
    }).join("");

    var variantes = enLinea.filter(function (x) { return x.grupo === p.grupo; });
    var nombresDistintos = variantes.some(function (x) { return x.nombre !== variantes[0].nombre; });
    document.getElementById("sel-variantes-wrap").hidden = variantes.length < 2;
    document.getElementById("sel-variantes").innerHTML = variantes.map(function (x) {
      return '<button type="button" class="opt" data-sel-slug="' + esc(x.slug) + '" aria-pressed="' + (x.slug === p.slug) + '">' +
        esc(nombresDistintos ? x.nombre : x.variante) + (nombresDistintos ? "<small>" + esc(x.variante) + "</small>" : "") + "</button>";
    }).join("");
  }

  // Divide el modo de uso del rótulo en hasta 3 pasos, sin reescribirlo.
  function pasosDeUso(texto) {
    var partes = texto.replace(/\.\s+/g, ".\n").split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (partes.length > 3) partes = partes.slice(0, 2).concat(partes.slice(2).join(" "));
    return partes;
  }

  function renderFicha(animar) {
    var t = DATA.sus.textos.selector;
    var p = producto(state.slug);
    var l = linea(p.linea);
    var por = porciones(p);
    var sugerida = frecuenciaSugerida(p);
    var cta = ctaSuscripcion(p, state.freq);
    var datos = p.datos_rotulo || [];
    var sellos = (p.sellos_rotulo || []).filter(function (s) { return !pend(s); });
    var gluten = sellos.some(function (s) { return /libre de gluten/i.test(s); });

    var galeria =
      '<div class="galeria">' +
        '<div class="galeria__main">' +
          (state.img === 0 ? imgTag(p, 768) : '<div class="placeholder">' + esc(t.foto_pendiente) + "</div>") +
        "</div>" +
        '<div class="galeria__thumbs">' +
          '<button type="button" class="galeria__thumb" data-img="0" aria-pressed="' + (state.img === 0) + '" aria-label="Packshot">' +
            (packshot(p, 384) ? '<img src="' + esc(packshot(p, 384)) + '" alt="" width="64" height="80" loading="lazy">' : "<span>" + esc(t.packshot_pendiente) + "</span>") +
          "</button>" +
          '<button type="button" class="galeria__thumb" data-img="1" aria-pressed="' + (state.img === 1) + '" aria-label="' + esc(t.foto_pendiente) + '"><span>' + esc(t.foto_pendiente) + "</span></button>" +
        "</div>" +
        '<p class="firma lbl">' + esc(DATA.marca.firma) + "</p>" +
      "</div>";

    var datosHtml = datos.length ?
      '<div class="datos">' + datos.map(function (d, i) {
        return '<div class="dato' + (i === 0 ? " dato--main" : "") + '"><span class="cifra"' + (animar ? " data-count" : "") + ">" + esc(d.valor) + "</span>" +
          (d.etiqueta ? "<span>" + esc(d.etiqueta) + "</span>" : "") + "</div>";
      }).join("") + "</div>" : "";

    var sellosHeader = sellos.filter(function (s) { return !enFranja(s); });

    var frecuencias =
      '<div><span class="sel__label lbl" id="lbl-freq">' + esc(t.paso_frecuencia) + "</span>" +
      '<div class="opts" role="radiogroup" aria-labelledby="lbl-freq">' +
        DATA.sus.frecuencias_dias.map(function (f) {
          return '<button type="button" role="radio" class="opt" data-freq="' + f + '" aria-checked="' + (f === state.freq) + '">' +
            esc(fill(t.frecuencia_opcion, { n: f })) +
            (f === sugerida && por ? "<small>" + esc(fill(t.frecuencia_sugerida, { n: por.n, unidad: por.unidad })) + "</small>" : "") +
          "</button>";
        }).join("") +
      "</div></div>";

    var pr = promo();
    var cada = esc(fill(t.frecuencia_opcion, { n: state.freq }).toLowerCase());
    var precio;
    if (!precioVisible(p)) {
      precio = '<p class="precio--consulta">' + esc(t.precio_no_disponible) + "</p>";
    } else if (pr) {
      // Precio sugerido tachado y precio de suscripción resaltado; el contador va debajo si la promo tiene cierre.
      precio =
        '<div class="precio-promo">' +
          '<p class="precio__antes"><span class="lbl">' + esc(pr.t.precio_anterior) + "</span> <s>" + fmtPrecio(p.precio.pvp_sugerido) + "</s></p>" +
          '<p class="precio"><span class="cifra">' + fmtPrecio(precioSuscripcion(p)) + '</span><span class="precio__tag">' + esc(fill(pr.t.etiqueta_precio, { pct: pr.pct })) + "</span></p>" +
          '<p class="precio__micro">' + esc(pr.t.precio_microcopy) + " · " + cada + "</p>" +
          (pr.cierre ? '<p class="cuenta"><span class="lbl">' + esc(pr.t.termina) + '</span><span data-countdown>' + cuentaHtml() + "</span></p>" : "") +
        "</div>";
    } else {
      precio = '<p class="precio"><span class="cifra">' + fmtPrecio(p.precio.pvp_sugerido) + "</span><small>" + esc(t.precio_microcopy) + " · " + cada + "</small></p>";
    }

    var mlUrl = p.compra && p.compra.modo === "ml" && !pend(p.compra.ml_url) ? p.compra.ml_url : null;
    var unaVez = mlUrl
      ? '<a class="lnk" data-track="click_mercadolibre" data-item="' + esc(p.slug) + '" href="' + esc(withUtm(mlUrl)) + '" target="_blank" rel="noopener">' + esc(t.link_una_vez) + " " + ARROW + "</a>"
      : '<a class="lnk" href="#una-vez">' + esc(t.link_una_vez) + " " + ARROW + "</a>";

    var franja = [
      esc(t.franja_confianza.elaborado + " " + DATA.marca.elaborador),
      esc(DATA.marca.origen),
      gluten ? esc(t.franja_confianza.sello_gluten) : "",
      !pend(p.rnpa) ? esc(t.franja_confianza.rnpa + " " + p.rnpa) : ""
    ].filter(Boolean);

    // Secciones de la ficha según el brief: Qué tiene, Cómo se toma, Registros y rótulo. Sin datos, no se muestran.
    var queTiene = (!pend(p.ingredientes) || !pend(p.tabla_nutricional)) ?
      '<div class="fsub"><p class="lbl">' + esc(t.que_tiene) + "</p>" +
        (!pend(p.ingredientes) ? "<p><strong>" + esc(t.ingredientes) + ":</strong> " + esc(p.ingredientes) + "</p>" : "") +
        (!pend(p.tabla_nutricional) ? "<p><strong>" + esc(t.tabla_nutricional) + ":</strong> " + esc(p.tabla_nutricional) + "</p>" : "") +
      "</div>" : "";
    var comoSeToma = !pend(p.modo_de_uso) ?
      '<div class="fsub"><p class="lbl">' + esc(t.como_se_toma) + '</p><ol class="pasos-uso">' +
        pasosDeUso(p.modo_de_uso).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol></div>" : "";
    // La denominación se publica recién cuando se verificó contra el rótulo (se borra denominacion_estado).
    var denominacion = !pend(p.denominacion_rotulo) && !p.denominacion_estado ? p.denominacion_rotulo : null;
    var registros = (denominacion || !pend(p.rnpa)) ?
      '<div class="fsub"><p class="lbl">' + esc(t.registros) + '</p><dl class="registros">' +
        (!pend(p.rnpa) ? "<dt>" + esc(t.franja_confianza.rnpa) + "</dt><dd>" + esc(p.rnpa) + "</dd>" : "") +
        (denominacion ? "<dt>" + esc(t.denominacion) + "</dt><dd>" + esc(denominacion) + "</dd>" : "") +
      "</dl></div>" : "";

    var ficha = document.getElementById("ficha");
    ficha.setAttribute("style", lineaVars(l) + ";--acento:" + lineaColor(l, "claro"));
    ficha.innerHTML =
      galeria +
      '<div class="info">' +
        "<div>" +
          '<p class="chip"><span class="dot"></span>' + esc(l.nombre) + " <small>" + esc(l.momento) + "</small></p>" +
          '<h3 class="dsp info__nombre">' + esc(p.nombre) + "</h3>" +
          '<p class="info__variante">' + esc(p.variante) + "</p>" +
        "</div>" +
        datosHtml +
        (sellosHeader.length ? '<ul class="sellos">' + sellosHeader.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" : "") +
        '<div class="compra" id="compra">' +
          frecuencias +
          precio +
          '<a class="btn btn--block' + (cta.wa ? " btn--wa" : "") + '" id="cta-suscribir" href="' + esc(cta.href) + '" target="_blank" rel="noopener">' + esc(cta.label) + "</a>" +
          (cta.wa ? '<p class="compra__nota">' + esc(t.nota_whatsapp) + "</p>" : "") +
          "<div>" + unaVez + "</div>" +
        "</div>" +
        '<ul class="franja">' + franja.map(function (f) { return "<li>" + f + "</li>"; }).join("") + "</ul>" +
        queTiene + comoSeToma + registros +
        (p.es_suplemento_dietario ? '<p class="leyenda">' + esc(DATA.marca.leyenda_obligatoria_suplementos) + "</p>" : "") +
      "</div>";

    if (animar) {
      ficha.classList.remove("swap");
      void ficha.offsetWidth;
      ficha.classList.add("swap");
      ficha.querySelectorAll("[data-count]").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) contar(el);
        else if (io) { el.classList.add("rv-count"); io.observe(el); }
      });
    }

    document.getElementById("cta-suscribir").addEventListener("click", function () {
      track(cta.wa ? "click_whatsapp" : "click_suscripcion", { item_id: p.slug, frecuencia: state.freq, via: cta.via });
    });
  }

  function renderCuando() {
    var t = DATA.sus.textos.cuando_se_toma;
    var p = producto(state.slug);
    var nuevo = !slot("cuando").firstChild;
    var lista = lineasOrdenadas().map(function (l) {
      var on = l.id === p.linea;
      return '<li class="' + (on ? "" : "off") + '" style="' + lineaVars(l) + '">' +
        '<span class="mo lbl">' + esc(l.momento) + "</span>" +
        "<div>" +
          '<p class="ln"><span class="dot"></span>' + esc(l.nombre) + "</p>" +
          (pend(l.frase_vigente) ? "" : '<p class="fr">' + esc(l.frase_vigente) + "</p>") +
          (on ? '<span class="aca">' + esc(p.nombre) + "</span>" : "") +
        "</div>" +
      "</li>";
    }).join("");
    if (nuevo) slot("cuando").innerHTML = seccion(t, "cuando-t", '<ol class="ciclo rv" id="ciclo-lista">' + lista + "</ol>");
    else document.getElementById("ciclo-lista").innerHTML = lista;
  }

  function renderCiclo() {
    var t = DATA.sus.textos.completa_el_ciclo;
    var p = producto(state.slug);
    var items = (p.cross_sell || []).map(producto).filter(Boolean);
    var el = slot("ciclo");
    el.hidden = !items.length;
    if (!items.length) return;
    var cards = items.map(function (x) {
      var l = linea(x.linea);
      return '<div class="card" style="' + lineaVars(l) + '">' +
        '<div class="card__im">' + imgTag(x, 384, 'loading="lazy"') + "</div>" +
        '<div class="card__body">' +
          '<span class="chip"><span class="dot"></span>' + esc(l.nombre) + " <small>" + esc(l.momento) + "</small></span>" +
          '<h3 class="h3">' + esc(x.nombre) + "</h3>" +
          "<p>" + esc(x.variante) + "</p>" +
          (precioVisible(x) ? '<p class="card__precio">' + precioCompacto(x) + "</p>" : "") +
          '<button type="button" class="lnk" data-ciclo="' + esc(x.slug) + '">' + esc(t.boton) + " " + ARROW + "</button>" +
        "</div>" +
      "</div>";
    }).join("");
    if (!el.firstChild) el.innerHTML = seccion(t, "ciclo-t", '<div class="cards rv" id="ciclo-cards">' + cards + "</div>");
    else document.getElementById("ciclo-cards").innerHTML = cards;
  }

  function renderOpiniones() {
    var t = DATA.sus.textos.opiniones;
    var reales = (DATA.resenas.resenas || []).filter(function (r) { return !pend(r.texto) && !pend(r.url) && !pend(r.fecha); });
    var el = slot("opiniones");
    el.hidden = !reales.length;
    if (!reales.length) return;
    // Primero las del producto elegido; se muestran textuales, con fuente, fecha y link.
    reales.sort(function (a, b) { return (b.producto_slug === state.slug) - (a.producto_slug === state.slug); });
    el.innerHTML = seccion(t, "opiniones-t",
      '<div class="resenas">' +
        reales.slice(0, 6).map(function (r) {
          var px = producto(r.producto_slug);
          return '<blockquote class="resena">' +
            (r.estrellas ? '<span aria-label="' + r.estrellas + ' de 5">' + "★".repeat(r.estrellas) + "</span>" : "") +
            "<p>“" + esc(r.texto) + "”</p>" +
            '<p class="resena__meta">' + esc([r.autor_como_figura, r.fecha, px ? px.nombre : "", r.fuente].filter(Boolean).join(" · ")) +
              ' · <a class="lnk" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(t.link) + "</a></p>" +
          "</blockquote>";
        }).join("") +
      "</div>");
  }

  function renderSticky() {
    var p = producto(state.slug);
    var cta = ctaSuscripcion(p, state.freq);
    var t = DATA.sus.textos.selector;
    slot("sticky").innerHTML =
      '<div class="sticky__txt"><strong>' + esc(nombreCompleto(p)) + "</strong><span>" +
        (precioVisible(p) ? precioCompacto(p) + " · " + esc(fill(t.frecuencia_opcion, { n: state.freq }).toLowerCase()) : esc(t.precio_no_disponible)) +
      "</span></div>" +
      '<a class="btn' + (cta.wa ? " btn--wa" : "") + '" href="' + esc(cta.href) + '" target="_blank" rel="noopener" data-sticky-cta>' + esc(t.barra_fija_boton) + "</a>";
    slot("sticky").querySelector("[data-sticky-cta]").addEventListener("click", function () {
      track(cta.wa ? "click_whatsapp" : "click_suscripcion", { item_id: p.slug, frecuencia: state.freq, via: cta.via, origen: "barra_fija" });
    });
  }

  // La barra fija aparece en mobile cuando ni el hero ni el bloque de compra están a la vista.
  function watchSticky() {
    if (!("IntersectionObserver" in window)) return;
    var visibles = new Set();
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) visibles.add(e.target); else visibles.delete(e.target); });
      var show = visibles.size === 0;
      slot("sticky").hidden = !show;
      document.body.classList.toggle("has-sticky", show);
    });
    obs.observe(slot("hero"));
    obs.observe(document.getElementById("ficha"));
  }

  // ---------- SEO: datos estructurados ----------

  function renderSchema() {
    var base = pend(DATA.sus.seo && DATA.sus.seo.url_publica) ? location.origin + location.pathname : DATA.sus.seo.url_publica;
    var abs = function (path) { try { return new URL(path, base).toString(); } catch (e) { return path; } };
    var org = { "@type": "Organization", name: DATA.marca.elaborador, brand: { "@type": "Brand", name: "PROFIT" } };
    // Product sin aggregateRating: no se publican ratings sin reseñas reales.
    var items = DATA.productos.map(function (p, i) {
      var prod = {
        "@type": "Product",
        name: "PROFIT " + nombreCompleto(p),
        sku: p.slug,
        brand: { "@type": "Brand", name: "PROFIT" },
        manufacturer: org,
        category: (linea(p.linea) || {}).nombre,
        url: abs("?producto=" + p.slug)
      };
      if (packshot(p, 768)) prod.image = abs(packshot(p, 768));
      if (!pend(p.ean)) prod.gtin13 = p.ean;
      if (precioVisible(p)) {
        prod.offers = { "@type": "Offer", priceCurrency: "ARS", price: String(precioRedondeado(p.precio.pvp_sugerido)), url: abs("?producto=" + p.slug) };
      }
      return { "@type": "ListItem", position: i + 1, item: prod };
    });
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": [org, { "@type": "ItemList", itemListElement: items }] });
    document.head.appendChild(s);

    if (!pend(DATA.sus.seo && DATA.sus.seo.url_publica)) {
      var link = document.createElement("link");
      link.rel = "canonical";
      link.href = DATA.sus.seo.url_publica;
      document.head.appendChild(link);
      document.querySelector('meta[property="og:image"]').setAttribute("content", abs("public/og/og-profit.jpg"));
    }
  }

  // ---------- Selección ----------

  function select(slug, opts) {
    opts = opts || {};
    var p = producto(slug);
    if (!p) return;
    var cambio = slug !== state.slug;
    var primeraVez = !state.slug;
    state.slug = slug;
    state.img = 0;
    if (cambio || !state.freq) state.freq = frecuenciaSugerida(p) || DATA.sus.frecuencias_dias[0];

    var l = linea(p.linea);
    document.documentElement.style.setProperty("--acento", lineaColor(l, "claro"));
    document.documentElement.style.setProperty("--acento-osc", lineaColor(l, "oscuro"));

    safe(renderSelectorSteps, "pasos del selector");
    safe(function () { renderFicha(true); }, "ficha");
    safe(renderCuando, "cuándo se toma");
    safe(renderCiclo, "completá el ciclo");
    safe(renderOpiniones, "opiniones");
    safe(renderSticky, "barra fija");
    safe(renderWaFloat, "whatsapp flotante");
    observarNuevos();

    try {
      var u = new URL(location.href);
      u.searchParams.set("producto", slug);
      history.replaceState(null, "", u.toString());
    } catch (e) { /* sin history: no pasa nada */ }

    if (cambio) track("view_item", { item_id: slug, item_name: nombreCompleto(p), item_category: l.nombre });
    if (opts.scroll && !primeraVez) slot("selector").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function slugInicial() {
    var pedido = new URLSearchParams(location.search).get("producto");
    return producto(pedido) ? pedido : DATA.sus.producto_inicial;
  }

  // ---------- Arranque ----------

  function getJSON(path) {
    return fetch(path + "?v=" + VERSION).then(function (r) {
      if (!r.ok) throw new Error(path + " → " + r.status);
      return r.json();
    });
  }

  Promise.all([
    getJSON("data/productos.json"),
    getJSON("data/lineas.json"),
    getJSON("data/marca.json"),
    getJSON("data/resenas.json"),
    getJSON("data/puntos_de_venta.json"),
    getJSON("data/suscripcion.json")
  ]).then(function (r) {
    DATA.productos = r[0].productos;
    DATA.lineas = r[1].lineas;
    DATA.marca = r[2];
    DATA.resenas = r[3];
    DATA.puntos = r[4];
    DATA.sus = r[5];

    safe(renderMenu, "menú");
    safe(renderHero, "hero");
    safe(renderTira, "tira");
    safe(renderEmpezar, "por dónde empezar");
    safe(renderSelectorFrame, "selector");
    safe(renderComo, "cómo funciona");
    safe(renderLineas, "líneas");
    safe(renderMarca, "marca");
    safe(renderQuienes, "quiénes somos");
    safe(renderNoLeer, "lo que no vas a leer");
    safe(renderUnaVez, "una sola vez");
    safe(renderFaq, "preguntas");
    safe(renderVender, "quiero vender");
    safe(renderFooter, "footer");
    safe(initReveal, "revelado");

    select(slugInicial());
    safe(initCuenta, "cuenta regresiva");
    safe(watchSticky, "barra fija");
    safe(renderSchema, "datos estructurados");
    safe(loadPixels, "píxeles");

    // Cualquier botón con data-linea (hero, por dónde empezar, líneas) lleva a esa línea en el selector.
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-linea]");
      if (b) {
        var primero = productosDeLinea(b.dataset.linea)[0];
        if (primero) select(primero.slug, { scroll: true });
        return;
      }
      var c = e.target.closest("[data-ciclo]");
      if (c) { select(c.dataset.ciclo, { scroll: true }); return; }
      var a = e.target.closest("[data-track]");
      if (a) track(a.dataset.track, { item_id: a.dataset.item || state.slug });
      if (e.target.closest('[data-slot="wa-float"]')) track("click_whatsapp", { item_id: state.slug, origen: "flotante" });
    });
  }).catch(function (err) {
    console.error(err);
    var main = document.querySelector("main");
    main.innerHTML = '<p class="error">No pudimos cargar la página. Escribinos por WhatsApp al +54 9 11 6027-7603.</p>';
  });
})();

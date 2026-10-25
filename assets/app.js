/* PROFIT® · Landing de suscripción.
   Todo el contenido sale de data/*.json: este archivo no tiene textos, precios ni datos de producto propios.
   Reglas: un valor "pendiente" no se muestra; los campos internos (notas, _leeme, precio.regla, etc.) nunca se renderizan. */
(function () {
  "use strict";

  var DATA = {};
  var state = { slug: null, freq: null, img: 0 };

  // ---------- Utilidades ----------

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
  function fmtPrecio(n) {
    return "$ " + Math.ceil(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });
  }

  function slot(name) { return document.querySelector('[data-slot="' + name + '"]'); }

  function storage(fn) { try { return fn(window.sessionStorage); } catch (e) { return null; } }

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

  function waLink(msg) {
    var num = String(DATA.marca.whatsapp_comercial).replace(/\D/g, "");
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(msg);
  }

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

  function producto(slug) {
    return DATA.productos.find(function (p) { return p.slug === slug; });
  }

  function linea(id) {
    return DATA.lineas.find(function (l) { return l.id === id; });
  }

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

  function packshot(p, w) {
    if (pend(p.packshot)) return null;
    var base = p.packshot.replace(/^\//, "").replace(/\.png$/i, "");
    return "public/" + base.replace("packshots/", "packshots/web/") + "-" + w + ".jpg";
  }

  function imgTag(p, w, attrs) {
    var src = packshot(p, w);
    if (!src) return '<div class="placeholder">' + esc(DATA.sus.textos.selector.packshot_pendiente) + "</div>";
    var src2 = packshot(p, 768);
    return '<img src="' + esc(src) + '" srcset="' + esc(packshot(p, 384)) + " 384w, " + esc(src2) + ' 768w" alt="' +
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

  // ---------- Render: secciones fijas ----------

  function renderTopbar() {
    slot("topbar").textContent = DATA.sus.textos.barra_superior;
  }

  function renderHero() {
    var t = DATA.sus.textos.hero;
    var p = producto(DATA.sus.producto_inicial);
    var l = linea(p.linea);
    var dato = (p.datos_rotulo || [])[0];
    slot("hero").innerHTML =
      '<div class="wrap hero__in">' +
        '<div class="hero__copy">' +
          '<p class="eyebrow">' + esc(t.etiqueta) + "</p>" +
          '<h1 class="h1">' + esc(DATA.marca.concepto_campana) + "</h1>" +
          '<p class="lead">' + esc(t.bajada) + "</p>" +
          '<div class="hero__ctas">' +
            '<a class="btn" href="#suscripcion">' + esc(t.boton) + "</a>" +
            '<a class="btn btn--ghost" href="#como-funciona">' + esc(t.boton_secundario) + "</a>" +
          "</div>" +
        "</div>" +
        '<div class="hero__media" style="' + lineaVars(l) + ';--acento:' + lineaColor(l, "claro") + '">' +
          imgTag(p, 768, 'fetchpriority="high"') +
          (dato ? '<div class="hero__cifra"><span class="cifra">' + esc(dato.valor) + "</span><span>" + esc(dato.etiqueta) + "</span></div>" : "") +
        "</div>" +
      "</div>";
  }

  function renderEmpezar() {
    var t = DATA.sus.textos.por_donde_empezar;
    slot("empezar").innerHTML =
      '<div class="wrap">' +
        '<div class="section__head"><h2 class="h2" id="empezar-t">' + esc(t.titulo) + "</h2></div>" +
        '<div class="empezar">' +
          t.opciones.map(function (o) {
            var l = linea(o.linea);
            return '<button type="button" class="empezar__item" data-linea="' + esc(o.linea) + '" style="' + lineaVars(l) + '">' +
              '<span class="chip">' + esc(l.nombre) + "</span>" +
              '<span class="empezar__need">' + esc(o.necesidad) + "</span>" +
              '<span class="empezar__ans">' + esc(o.respuesta) + "</span>" +
              '<span class="empezar__go" aria-hidden="true">→</span>' +
            "</button>";
          }).join("") +
        "</div>" +
      "</div>";
    slot("empezar").addEventListener("click", function (e) {
      var b = e.target.closest("[data-linea]");
      if (!b) return;
      var primero = productosDeLinea(b.dataset.linea)[0];
      if (primero) select(primero.slug, { scroll: true });
    });
  }

  function renderComo() {
    var t = DATA.sus.textos.como_funciona;
    slot("como").innerHTML =
      '<div class="wrap">' +
        '<div class="section__head"><h2 class="h2" id="como-t">' + esc(t.titulo) + "</h2></div>" +
        '<ol class="pasos">' +
          t.pasos.filter(function (p) { return !pend(p.texto); }).map(function (p, i) {
            return '<li class="paso"><span class="cifra">' + (i + 1) + "</span><div>" +
              '<h3 class="h3">' + esc(p.titulo) + "</h3><p>" + esc(p.texto) + "</p></div></li>";
          }).join("") +
        "</ol>" +
      "</div>";
  }

  function renderNoLeer() {
    var t = DATA.sus.textos.lo_que_no_vas_a_leer;
    slot("noleer").innerHTML =
      '<div class="wrap">' +
        '<div class="section__head"><h2 class="h2" id="noleer-t">' + esc(t.titulo) + '</h2><p class="lead">' + esc(t.bajada) + "</p></div>" +
        '<div class="noleer">' +
          '<div class="noleer__no"><h3 class="h3">' + esc(t.no_titulo) + "</h3><ul>" +
            t.no.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
          '<div class="noleer__si"><h3 class="h3">' + esc(t.si_titulo) + "</h3><ul>" +
            t.si.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
        "</div>" +
      "</div>";
  }

  function renderUnaVez() {
    var t = DATA.sus.textos.una_vez;
    var mlUrl = DATA.marca.mercado_libre_tienda_oficial_url;
    var puntos = DATA.puntos.puntos || [];
    var provincias = puntos.map(function (p) { return p.provincia; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }).sort();

    var html =
      '<div class="wrap unavez">' +
        '<div class="section__head"><h2 class="h2" id="unavez-t">' + esc(t.titulo) + '</h2><p class="lead">' + esc(t.texto) + "</p></div>" +
        '<div class="unavez__ctas">' +
          (!pend(mlUrl) ? '<a class="btn" data-track="click_mercadolibre" href="' + esc(withUtm(mlUrl)) + '" target="_blank" rel="noopener">' + esc(t.boton_ml) + "</a>" : "") +
          (puntos.length ? "" : '<a class="btn btn--wa" data-track="click_donde_comprar" href="' + esc(waLink(t.mensaje_whatsapp + ". " + origen("donde-comprar"))) + '" target="_blank" rel="noopener">' + esc(t.boton_whatsapp) + "</a>") +
        "</div>" +
        (puntos.length ? "" : '<p class="compra__nota">' + esc(t.sin_puntos) + "</p>");

    if (puntos.length) {
      html +=
        '<div class="field filtro"><label for="prov">Provincia</label><select id="prov"><option value="">Todas</option>' +
          provincias.map(function (p) { return '<option value="' + esc(p) + '">' + esc(p) + "</option>"; }).join("") +
        '</select></div><ul class="puntos" id="puntos"></ul>';
    }
    html += "</div>";
    slot("unavez").innerHTML = html;

    if (puntos.length) {
      var lista = document.getElementById("puntos");
      var renderPuntos = function (prov) {
        lista.innerHTML = puntos.filter(function (p) { return !prov || p.provincia === prov; }).map(function (p) {
          return '<li class="punto"><strong>' + esc(p.nombre) + "</strong><small>" +
            esc([p.direccion, p.localidad, p.provincia].filter(function (x) { return !pend(x); }).join(", ")) + "</small>" +
            (!pend(p.maps_url) ? '<a class="link" data-track="click_donde_comprar" href="' + esc(p.maps_url) + '" target="_blank" rel="noopener">Ver en el mapa</a>' : "") +
          "</li>";
        }).join("");
      };
      renderPuntos("");
      document.getElementById("prov").addEventListener("change", function (e) { renderPuntos(e.target.value); });
    }
  }

  function renderFaq() {
    var t = DATA.sus.textos.preguntas;
    slot("faq").innerHTML =
      '<div class="wrap">' +
        '<div class="section__head"><h2 class="h2" id="faq-t">' + esc(t.titulo) + "</h2></div>" +
        '<div class="faq">' +
          t.lista.filter(function (q) { return !pend(q.r); }).map(function (q) {
            return "<details><summary>" + esc(q.p) + "</summary><p>" + esc(q.r) + "</p></details>";
          }).join("") +
        "</div>" +
      "</div>";
  }

  function renderVender() {
    var t = DATA.sus.textos.quiero_vender;
    var c = t.campos;
    slot("vender").innerHTML =
      '<div class="wrap vender">' +
        '<div class="section__head"><h2 class="h2" id="vender-t">' + esc(t.titulo) + '</h2><p class="lead">' + esc(t.texto) + "</p></div>" +
        '<form class="form" id="form-vender" novalidate>' +
          '<div class="field"><label for="v-comercio">' + esc(c.comercio) + '</label><input id="v-comercio" name="comercio" required autocomplete="organization"></div>' +
          '<div class="field"><label for="v-tipo">' + esc(c.tipo) + '</label><select id="v-tipo" name="tipo" required><option value=""></option>' +
            t.tipos.map(function (x) { return "<option>" + esc(x) + "</option>"; }).join("") + "</select></div>" +
          '<div class="field"><label for="v-localidad">' + esc(c.localidad) + '</label><input id="v-localidad" name="localidad" required autocomplete="address-level2"></div>' +
          '<div class="field"><label for="v-nombre">' + esc(c.nombre) + '</label><input id="v-nombre" name="nombre" required autocomplete="name"></div>' +
          '<div class="field"><label for="v-whatsapp">' + esc(c.whatsapp) + '</label><input id="v-whatsapp" name="whatsapp" type="tel" inputmode="tel" required autocomplete="tel"></div>' +
          '<button class="btn btn--wa btn--block" type="submit">' + esc(t.boton) + "</button>" +
          '<p class="form__promesa">' + esc(t.promesa) + "</p>" +
        "</form>" +
      "</div>";

    document.getElementById("form-vender").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target;
      var vacio = Array.prototype.find.call(f.elements, function (el) { return el.required && !el.value.trim(); });
      if (vacio) { vacio.focus(); return; }
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
    var redes = [
      !pend(m.instagram) ? '<a href="https://instagram.com/' + esc(m.instagram.replace("@", "")) + '" target="_blank" rel="noopener">Instagram</a>' : "",
      !pend(m.tiktok) ? '<a href="https://tiktok.com/' + esc(m.tiktok) + '" target="_blank" rel="noopener">TikTok</a>' : ""
    ].join("");
    slot("footer").innerHTML =
      '<div class="wrap footer__in">' +
        '<img src="public/brand/profit-logo-blanco.png" alt="PROFIT" width="120" height="30" loading="lazy">' +
        '<p class="footer__leyenda">' + esc(m.leyenda_obligatoria_suplementos) + "</p>" +
        '<p class="footer__disc">' + esc(m.disclaimer_footer_web_expo) + "</p>" +
        "<p>Elaborado por " + esc(m.elaborador) + " · " + esc(m.origen) +
          (!pend(m.cuit) ? " · CUIT " + esc(m.cuit) : "") +
          (!pend(m.email) ? ' · <a href="mailto:' + esc(m.email) + '">' + esc(m.email) + "</a>" : "") + "</p>" +
        '<div class="footer__links">' +
          '<a href="' + esc(waLink(t.arrepentimiento.mensaje + " " + origen("arrepentimiento"))) + '" target="_blank" rel="noopener">' + esc(t.arrepentimiento.link) + "</a>" +
          '<a href="' + esc(t.defensa_consumidor.url) + '" target="_blank" rel="noopener">' + esc(t.defensa_consumidor.texto) + "</a>" +
          redes +
        "</div>" +
        '<p class="footer__legal">© ' + new Date().getFullYear() + " " + esc(m.marca) + " · " + esc(m.elaborador) + "</p>" +
      "</div>";
  }

  function renderWaFloat() {
    var a = slot("wa-float");
    a.href = waLink(DATA.sus.textos.whatsapp_flotante + ". " + origen(state.slug || "general"));
  }

  // ---------- Render: selector y secciones que dependen del producto ----------

  function renderSelectorFrame() {
    var t = DATA.sus.textos.selector;
    slot("selector").innerHTML =
      '<div class="wrap">' +
        '<div class="section__head"><h2 class="h2" id="selector-t">' + esc(t.titulo) + "</h2></div>" +
        '<div class="sel">' +
          '<div class="sel__steps">' +
            '<div><span class="sel__label" id="lbl-linea">' + esc(t.paso_linea) + '</span><div class="tabs" role="group" aria-labelledby="lbl-linea" id="sel-lineas"></div></div>' +
            '<div><span class="sel__label" id="lbl-prod">' + esc(t.paso_producto) + '</span><div class="opts" role="group" aria-labelledby="lbl-prod" id="sel-grupos"></div></div>' +
            '<div id="sel-variantes-wrap"><span class="sel__label" id="lbl-var">' + esc(t.paso_variante) + '</span><div class="opts" role="group" aria-labelledby="lbl-var" id="sel-variantes"></div></div>' +
          "</div>" +
          '<article class="ficha" id="ficha" aria-live="polite"></article>' +
        "</div>" +
      "</div>";

    var root = slot("selector");
    root.addEventListener("click", function (e) {
      var b;
      if ((b = e.target.closest("[data-sel-linea]"))) {
        var primero = productosDeLinea(b.dataset.selLinea)[0];
        if (primero) select(primero.slug);
      } else if ((b = e.target.closest("[data-sel-slug]"))) {
        select(b.dataset.selSlug);
        track("select_variant", { item_id: b.dataset.selSlug });
      } else if ((b = e.target.closest("[data-freq]"))) {
        state.freq = parseInt(b.dataset.freq, 10);
        renderFicha();
        renderSticky();
      } else if ((b = e.target.closest("[data-img]"))) {
        state.img = parseInt(b.dataset.img, 10);
        renderFicha();
      }
    });
  }

  function renderSelectorSteps() {
    var p = producto(state.slug);
    var lineas = DATA.lineas.slice().sort(function (a, b) { return a.orden - b.orden; });

    document.getElementById("sel-lineas").innerHTML = lineas.map(function (l) {
      return '<button type="button" class="tab" data-sel-linea="' + esc(l.id) + '" aria-pressed="' + (l.id === p.linea) + '" style="' + lineaVars(l) + '">' +
        esc(l.nombre) + "</button>";
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

  function renderFicha() {
    var t = DATA.sus.textos.selector;
    var p = producto(state.slug);
    var l = linea(p.linea);
    var por = porciones(p);
    var sugerida = frecuenciaSugerida(p);
    var cta = ctaSuscripcion(p, state.freq);
    var datos = p.datos_rotulo || [];
    var sellos = (p.sellos_rotulo || []).filter(function (s) { return !pend(s); });

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
        '<p class="firma">' + esc(DATA.marca.firma) + "</p>" +
      "</div>";

    var datosHtml = datos.length ?
      '<div class="datos">' + datos.map(function (d, i) {
        return '<div class="dato' + (i === 0 ? " dato--main" : "") + '"><span class="cifra">' + esc(d.valor) + "</span>" +
          (d.etiqueta ? "<span>" + esc(d.etiqueta) + "</span>" : "") + "</div>";
      }).join("") + "</div>" : "";

    var frecuencias =
      '<div><span class="sel__label" id="lbl-freq">' + esc(t.paso_frecuencia) + '</span>' +
      '<div class="opts" role="radiogroup" aria-labelledby="lbl-freq">' +
        DATA.sus.frecuencias_dias.map(function (f) {
          return '<button type="button" role="radio" class="opt" data-freq="' + f + '" aria-checked="' + (f === state.freq) + '">' +
            esc(fill(t.frecuencia_opcion, { n: f })) +
            (f === sugerida && por ? "<small>" + esc(fill(t.frecuencia_sugerida, { n: por.n, unidad: por.unidad })) + "</small>" : "") +
          "</button>";
        }).join("") +
      "</div></div>";

    var precio = precioVisible(p)
      ? '<p class="precio"><span class="cifra">' + fmtPrecio(p.precio.pvp_sugerido) + "</span><small>" + esc(t.precio_microcopy) + " · " + esc(fill(t.frecuencia_opcion, { n: state.freq }).toLowerCase()) + "</small></p>"
      : '<p class="precio--consulta">' + esc(t.precio_no_disponible) + "</p>";

    var mlUrl = p.compra && p.compra.modo === "ml" && !pend(p.compra.ml_url) ? p.compra.ml_url : null;
    var unaVez = mlUrl
      ? '<a class="link" data-track="click_mercadolibre" data-item="' + esc(p.slug) + '" href="' + esc(withUtm(mlUrl)) + '" target="_blank" rel="noopener">' + esc(t.link_una_vez) + "</a>"
      : '<a class="link" href="#una-vez">' + esc(t.link_una_vez) + "</a>";

    var extras = [
      !pend(p.rnpa) ? "<p><strong>" + esc(t.rnpa) + ":</strong> " + esc(p.rnpa) + "</p>" : "",
      !pend(p.modo_de_uso) ? '<details class="extra"><summary>' + esc(t.modo_de_uso) + "</summary><p>" + esc(p.modo_de_uso) + "</p></details>" : "",
      !pend(p.ingredientes) ? '<details class="extra"><summary>' + esc(t.ingredientes) + "</summary><p>" + esc(p.ingredientes) + "</p></details>" : ""
    ].join("");

    var ficha = document.getElementById("ficha");
    ficha.setAttribute("style", lineaVars(l) + ";--acento:" + lineaColor(l, "claro"));
    ficha.innerHTML =
      galeria +
      '<div class="info">' +
        "<div>" +
          '<p class="chip">' + esc(l.nombre) + " <small>" + esc(l.momento) + "</small></p>" +
          '<h3 class="info__nombre">' + esc(p.nombre) + "</h3>" +
          '<p class="info__variante">' + esc(p.variante) + "</p>" +
        "</div>" +
        datosHtml +
        (sellos.length ? '<ul class="sellos">' + sellos.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" : "") +
        '<div class="compra" id="compra">' +
          frecuencias +
          precio +
          '<a class="btn btn--block' + (cta.wa ? " btn--wa" : "") + '" id="cta-suscribir" href="' + esc(cta.href) + '" target="_blank" rel="noopener">' + esc(cta.label) + "</a>" +
          (cta.wa ? '<p class="compra__nota">' + esc(t.nota_whatsapp) + "</p>" : "") +
          unaVez +
        "</div>" +
        extras +
        (p.es_suplemento_dietario ? '<p class="leyenda">' + esc(DATA.marca.leyenda_obligatoria_suplementos) + "</p>" : "") +
      "</div>";

    document.getElementById("cta-suscribir").addEventListener("click", function () {
      track(cta.wa ? "click_whatsapp" : "click_suscripcion", { item_id: p.slug, frecuencia: state.freq, via: cta.via });
    });
  }

  function renderCuando() {
    var t = DATA.sus.textos.cuando_se_toma;
    var p = producto(state.slug);
    var lineas = DATA.lineas.slice().sort(function (a, b) { return a.orden - b.orden; });
    slot("cuando").innerHTML =
      '<div class="wrap">' +
        '<div class="section__head"><h2 class="h2" id="cuando-t">' + esc(t.titulo) + '</h2><p class="lead">' + esc(t.bajada) + "</p></div>" +
        '<ol class="momentos">' +
          lineas.map(function (l) {
            var on = l.id === p.linea;
            return '<li class="momento' + (on ? " momento--on" : "") + '" style="' + lineaVars(l) + '">' +
              '<span class="momento__cuando">' + esc(l.momento) + "</span>" +
              '<span class="momento__linea"><span class="chip">' + esc(l.nombre) + "</span>" +
                (on ? '<span class="momento__aca">' + esc(p.nombre) + "</span>" : "") + "</span>" +
            "</li>";
          }).join("") +
        "</ol>" +
      "</div>";
  }

  function renderCiclo() {
    var t = DATA.sus.textos.completa_el_ciclo;
    var p = producto(state.slug);
    var items = (p.cross_sell || []).map(producto).filter(Boolean);
    var el = slot("ciclo");
    el.hidden = !items.length;
    if (!items.length) return;
    el.innerHTML =
      '<div class="wrap">' +
        '<div class="section__head"><h2 class="h2" id="ciclo-t">' + esc(t.titulo) + '</h2><p class="lead">' + esc(t.bajada) + "</p></div>" +
        '<div class="cards">' +
          items.map(function (x) {
            var l = linea(x.linea);
            return '<div class="card" style="' + lineaVars(l) + '">' +
              imgTag(x, 384, 'loading="lazy"') +
              '<div class="card__body">' +
                '<span class="chip">' + esc(l.nombre) + " <small>" + esc(l.momento) + "</small></span>" +
                '<h3 class="h3">' + esc(x.nombre) + "</h3>" +
                "<p>" + esc(x.variante) + (precioVisible(x) ? " · " + fmtPrecio(x.precio.pvp_sugerido) : "") + "</p>" +
                '<button type="button" class="btn btn--small btn--ghost" data-ciclo="' + esc(x.slug) + '">' + esc(t.boton) + "</button>" +
              "</div>" +
            "</div>";
          }).join("") +
        "</div>" +
      "</div>";
  }

  function renderOpiniones() {
    var t = DATA.sus.textos.opiniones;
    var reales = (DATA.resenas.resenas || []).filter(function (r) { return !pend(r.texto) && !pend(r.url) && !pend(r.fecha); });
    var el = slot("opiniones");
    el.hidden = !reales.length;
    if (!reales.length) return;
    // Primero las del producto elegido; las reseñas se muestran textuales, con fuente, fecha y link.
    reales.sort(function (a, b) { return (b.producto_slug === state.slug) - (a.producto_slug === state.slug); });
    el.innerHTML =
      '<div class="wrap">' +
        '<div class="section__head"><h2 class="h2" id="opiniones-t">' + esc(t.titulo) + "</h2></div>" +
        '<div class="resenas">' +
          reales.slice(0, 6).map(function (r) {
            var px = producto(r.producto_slug);
            return '<blockquote class="resena">' +
              (r.estrellas ? '<span aria-label="' + r.estrellas + ' de 5">' + "★".repeat(r.estrellas) + "</span>" : "") +
              "<p>“" + esc(r.texto) + "”</p>" +
              '<p class="resena__meta">' + esc([r.autor_como_figura, r.fecha, px ? px.nombre : "", r.fuente].filter(Boolean).join(" · ")) +
                ' · <a class="link" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(t.link) + "</a></p>" +
            "</blockquote>";
          }).join("") +
        "</div>" +
      "</div>";
  }

  function renderSticky() {
    var p = producto(state.slug);
    var cta = ctaSuscripcion(p, state.freq);
    var t = DATA.sus.textos.selector;
    slot("sticky").innerHTML =
      '<div class="sticky__txt"><strong>' + esc(nombreCompleto(p)) + "</strong><span>" +
        (precioVisible(p) ? fmtPrecio(p.precio.pvp_sugerido) + " · " + esc(fill(t.frecuencia_opcion, { n: state.freq }).toLowerCase()) : esc(t.precio_no_disponible)) +
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
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) visibles.add(e.target.id || "hero"); else visibles.delete(e.target.id || "hero"); });
      var show = visibles.size === 0;
      slot("sticky").hidden = !show;
      document.body.classList.toggle("has-sticky", show);
    });
    io.observe(slot("hero"));
    io.observe(document.getElementById("ficha"));
  }

  // ---------- Selección ----------

  function select(slug, opts) {
    opts = opts || {};
    var p = producto(slug);
    if (!p) return;
    var cambio = slug !== state.slug;
    state.slug = slug;
    state.img = 0;
    if (cambio || !state.freq) state.freq = frecuenciaSugerida(p) || DATA.sus.frecuencias_dias[0];

    var l = linea(p.linea);
    document.documentElement.style.setProperty("--acento", lineaColor(l, "claro"));
    document.documentElement.style.setProperty("--acento-osc", lineaColor(l, "oscuro"));

    renderSelectorSteps();
    renderFicha();
    renderCuando();
    renderCiclo();
    renderOpiniones();
    renderSticky();
    renderWaFloat();

    try {
      var u = new URL(location.href);
      u.searchParams.set("producto", slug);
      history.replaceState(null, "", u.toString());
    } catch (e) { /* sin history: no pasa nada */ }

    if (cambio) track("view_item", { item_id: slug, item_name: nombreCompleto(p), item_category: l.nombre });
    if (opts.scroll) slot("selector").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function slugInicial() {
    var pedido = new URLSearchParams(location.search).get("producto");
    return producto(pedido) ? pedido : DATA.sus.producto_inicial;
  }

  // ---------- Arranque ----------

  function getJSON(path) {
    return fetch(path, { cache: "no-cache" }).then(function (r) {
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

    renderTopbar();
    renderHero();
    renderEmpezar();
    renderSelectorFrame();
    renderComo();
    renderNoLeer();
    renderUnaVez();
    renderFaq();
    renderVender();
    renderFooter();

    select(slugInicial());
    watchSticky();
    loadPixels();

    slot("ciclo").addEventListener("click", function (e) {
      var b = e.target.closest("[data-ciclo]");
      if (b) select(b.dataset.ciclo, { scroll: true });
    });
    document.addEventListener("click", function (e) {
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

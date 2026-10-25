# PROFIT® · Sitio web · Reglas del proyecto

Claude Code lee este archivo en cada sesión. Son las reglas fijas del proyecto: si una tarea las contradice, frená y preguntá.

## 1. Qué estamos construyendo

El sitio de PROFIT®, una marca argentina de suplementación deportiva elaborada por Keating One S.R.L.

La referencia comercial es Aqualo (aqualo.store): una tienda en Shopify que recibe tráfico pago de TikTok y lo lleva a una ficha de producto larga que convierte en una sola visita. Copiamos esa **arquitectura de conversión**. No copiamos sus **promesas ni su urgencia falsa** (ver `docs/01_modelo_referencia_aqualo.md`).

Antes de tocar estructura, leé `docs/02_brief_sitio.md`. Antes de publicar, revisá `docs/03_pendientes_antes_de_publicar.md`.

## 2. Fases

- **Fase 1 (ahora): sin checkout propio.** El botón de compra de cada producto lleva a la **tienda oficial de Mercado Libre**, que vende a precio sugerido. También hay "Dónde comprar" (farmacias y dietéticas) y WhatsApp.
- **Fase 2 (solo si los dueños la aprueban): checkout propio.** No se construye hasta que alguien lo pida explícitamente.
- El modo de compra se decide **por producto** desde `data/productos.json` (`compra.modo`: `"ml"` | `"propio"` | `"consulta"`). Ningún componente puede tener el modo hardcodeado.
- **Landing de suscripción (pedida el 24/10/2026):** página externa, aparte del sitio principal, que vende la suscripción por producto con planes de Mercado Pago (`data/suscripcion.json`). Mientras falte el link de un plan, el botón abre WhatsApp con el pedido armado. Sin descuentos ni regalos sin OK de regulatorio.

## 3. Stack

- **Landing de suscripción**: sitio estático sin build (`index.html`, `assets/styles.css`, `assets/app.js`). Se sube tal cual a cualquier hosting estático. Prueba local: `tools/serve.ps1`.
- Sitio principal (más adelante): Next.js (App Router) + TypeScript + Tailwind CSS. Deploy en Vercel.
- Todo el contenido sale de `data/*.json`. No hardcodear textos, precios ni datos de producto en los componentes.
- Packshots optimizados en `public/packshots/web/` (`<slug>-768.jpg` y `<slug>-384.jpg`). Si se cambia un packshot, regenerar los dos JPG.
- `precio.publicar: false` oculta el precio de un producto. La denominación de venta aparece cuando se borra `denominacion_estado` (verificada contra el rótulo).
- Publicación: `.htaccess` en la raíz y `?v=AAAAMMDD` en los `<link>` y `<script>` de `index.html`; cambiar la fecha en cada deploy.
- Un `packshot` en `"pendiente…"` muestra el placeholder "PACKSHOT EN REVISIÓN".
- Mobile first: el tráfico entra desde TikTok e Instagram. El objetivo es Lighthouse mobile ≥ 90.
- Un campo con valor `"pendiente"` (o que empiece con `"pendiente"`) **no se renderiza**. La sección se oculta sin dejar huecos.
- Los campos `notas`, `_leeme`, `denominacion_estado`, `precio.regla`, `precio.fuente` y `precio.estado` son **internos**: nunca se muestran en la web.

## 4. Identidad

- **Logo**: siempre blanco o negro (`public/brand/`). Nunca se tiñe con un color de línea.
- **Base visual**: tinta `#0B0B0C`, hueso `#F2F1ED`, blanco. Los colores de línea (`data/lineas.json`) se usan solo como acento de navegación. Usá la variante de pantalla que corresponda al fondo (claro u oscuro).
- **Tipografía**: Montserrat (Google Fonts).
- **Estilo "Cadencia Clínica"**:
  - Retícula estricta, mucho aire, color solo para clasificar.
  - Una cifra protagonista por módulo (por ejemplo "5 g", "30 porciones").
  - Sin sombras, sin degradados, sin recuadros decorativos. Texto escaso.
- **Referencia visual existente**: `reference/profit_web_expo_ago2026.html`. Tomá su sistema (colores, bloques, "Por dónde empezar", "Lo que no vas a leer") con estas correcciones:
  - Montserrat en lugar de Archivo/Inter.
  - Sacar "Mejor que ayer".
  - Sacar la mención a la representación comercial en "Quiénes somos".
  - Reemplazar el WhatsApp placeholder.
- **Firma** "Rendimiento, constancia y bienestar." y **concepto** "Acá se viene a mejorar." **nunca en la misma sección**. Sugerencia: el concepto en la home y las landings de campaña; la firma en las fichas, junto al packshot.
- Frases retiradas, **no usar**: "Mejor que ayer" y "Metele".
- Las **frases de línea están en evaluación** (por ejemplo "Prendete", "Tu base"). Se leen de `lineas.json` y nunca se escriben a mano en un componente.
- **Fotos de producto**: solo los packshots reales de `public/packshots/`. Sin stock y sin imágenes generadas por IA. Si falta una foto de uso, poné un placeholder visible que diga "FOTO REAL PENDIENTE".
- **Marca**: en logos y títulos va el logo. En texto corrido se escribe **PROFIT®**.

## 5. Reglas ANMAT y CAA (no negociables)

Los suplementos dietarios se rigen por el Código Alimentario Argentino. Su publicidad, web incluida, se rige por la Disp. ANMAT 4980/05, Anexo IV.

1. **Leyenda obligatoria** en cada ficha de suplemento y en el footer: **"SUPLEMENTA DIETAS INSUFICIENTES. CONSULTE A SU MÉDICO Y/O FARMACÉUTICO."**
2. **Solo se publica lo que dice el rótulo**: composición, dosis, porciones, modo de uso, ingredientes y denominación. La regla es "ingrediente sí, adjetivo no".
3. **Prohibido** escribir:
   - Propiedades terapéuticas, o "cura", "trata" o "previene".
   - Cualquier enfermedad o condición patológica.
   - "Seguro", "bien tolerado" o "sin efectos".
   - Que reemplaza una comida.
   - "Venta libre".
   - Mensajes que generen miedo.
   - La palabra "natural" y sus variantes.
   - Plazos de resultados ("en 30 días", "desde la semana 3").
   - Antes y después.
   - "Alta absorción", "mejor descanso", "mayor concentración", "antiarrugas" o "rejuvenece".
   - Superioridad frente a otra marca.
4. **Prohibido** hacer concursos, sorteos o regalos, o dar "beneficios de cualquier índole" con suplementos (Anexo IV, ítem 5). **No copiar el "regalo en cada caja" de Aqualo.** Los descuentos de suscripción o de combos no se implementan sin el OK de regulatorio.
   - **Aprobado el 24/10/2026 (dueños y regulatorio):** 40% de descuento sobre el PVP sugerido para la suscripción, configurado en `data/suscripcion.json` → `promo`. Se muestra el sugerido tachado y el precio de suscripción resaltado.
5. **"Una cápsula por día"** solo donde el rótulo lo respalde. ONE trae 60 cápsulas para 30 porciones, así que en ese caso **no** se puede decir.
6. **Gelatina 100% Pura no es un suplemento** según su rótulo: no usar lenguaje de suplementación en su ficha.
7. No dirigirse a menores, embarazadas ni personas en lactancia.
8. Cualquier frase de beneficio nueva lleva el comentario `{/* VALIDAR REGULATORIO */}` y queda oculta detrás de un flag hasta que la aprueben.

## 6. Conversión: qué sí y qué no

**Sí**:

- Ficha larga con datos duros arriba y bloque de compra visible.
- Venta cruzada por el ciclo de entrenamiento (rojo lleva a azul).
- Preguntas frecuentes y botón flotante de WhatsApp con mensaje precargado.
- Prueba social **real**:
  - Reseñas literales de Mercado Libre con fecha y link.
  - Puntos de venta reales que aceptaron figurar.
  - Contenido de figuras públicas solo con los derechos de uso web confirmados.

**No**:

- Contadores de stock.
- Cuentas regresivas que se reinician por visitante. Solo se permite contar hasta una fecha y hora reales de cierre, iguales para todos (`promo.cierre`); al llegar a cero, la promo deja de aplicarse.
- "X personas comprando ahora".
- Banners de descuentos que no existen.
- Reseñas inventadas o reescritas.
- Ratings sin fuente.
- Garantías que la política no cumple.
- Números distintos entre páginas.
- Pop-ups que tapen la pantalla.

## 7. Confidencialidad

El sitio **nunca** menciona a Grupo Alfa ni a sus socios. Todo se comunica como gestionado por Keating One S.R.L.

## 8. Precios y datos

- Se publica solo `precio.pvp_sugerido`. **Nunca** el precio comercio. Nunca un precio por debajo del PVP sugerido, porque protege a farmacias y dietéticas. Única excepción: el precio de suscripción con la promo aprobada (ver sección 5.4).
- La regla del PVP es precio comercio × 1,21 × 1,45. Los precios del kit son de agosto/septiembre de 2026: hay que confirmar la lista vigente.
- El Whey tiene una alerta de precio en `notas`: no mostrar su precio hasta que se resuelva.
- WhatsApp comercial: +54 9 11 6027-7603.

## 9. Medición y atribución

- Conservar los parámetros `utm_*` de la URL de entrada y agregarlos a los links salientes (Mercado Libre y WhatsApp).
- El mensaje precargado de WhatsApp incluye un código de origen, por ejemplo `[WEB · creatina-monohidrato-300g · tiktok]`. Sirve para atribuir cada lead.
- Eventos a medir: `view_item`, `click_mercadolibre`, `click_whatsapp`, `lead_mayorista`, `click_donde_comprar`.
- Píxeles de GA4, TikTok y Meta, con IDs en variables de entorno (`.env.local`, nunca en el repo).

## 10. URLs estables para los QR del packaging

`/p/[slug]` redirige a la ficha del producto. **Un slug publicado no se cambia nunca**, porque está impreso en los envases.

## 11. Forma de trabajo

- Trabajar por etapas (ver el brief). Mostrá un plan antes de cada etapa y esperá el OK.
- Después de cada etapa: correr el build, revisar en mobile y hacer un commit con un mensaje claro.
- Si un dato falta, no lo inventes: dejalo `"pendiente"` y anotalo en `docs/03_pendientes_antes_de_publicar.md`.

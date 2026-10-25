# Pendientes antes de publicar

**B** = bloquea la publicación. **F2** = solo bloquea la Fase 2. El resto se puede publicar oculto.

## Decisiones

| # | Pendiente | Quién | Tipo |
|---|---|---|---|
| 1 | **¿Habrá venta directa con checkout propio?** Si es sí: quién la opera (stock, despacho, facturación, atención), a qué precio y cómo se atribuyen las ventas y los leads digitales (cláusula de WhatsApp por escrito) | Dueños | F2 |
| 2 | **Dominio definitivo**: profit.com, profitargentina.com o profitargentina.com.ar | Dueños | B |
| 3 | **Usuarios de redes**: @profit.argentina, @profitargentina o @profitsport (Instagram y TikTok) | Marketing | B |
| 4 | **Frases de línea**: las vigentes (Prendete / Tu base / Volvé antes / Bancá el impacto / Todos los días) o las alternativas del Manual v2 | Dueños y regulatorio | — (son configurables) |
| 5 | **Línea de la Gelatina** (Bienestar o Blindaje) | Dueños | — |

## Regulatorio

| # | Pendiente | Tipo |
|---|---|---|
| 6 | **RNE / RNPA de cada producto**, para la sección "Registros" | B |
| 7 | **Beneficio autorizado por producto**. Sin esto, la web solo muestra composición, dosis y modo de uso | B para cualquier frase de beneficio |
| 8 | Validar el texto vigente de la Disp. ANMAT 4980/05 (tiene modificaciones posteriores), en especial el ítem 5 del Anexo IV (regalos y beneficios) para suscripción y combos | F2 |
| 9 | Validar el copy de "Por dónde empezar" y de "Lo que no vas a leer" (por ejemplo, "Vitamina C, que contribuye a la formación normal de colágeno") | B |
| 10 | Derechos de uso en web del contenido de Ingrid Grudke y de las fotos de atletas o clubes | B para usarlos |

## Datos de producto

| # | Pendiente | Tipo |
|---|---|---|
| 11 | **Links de cada SKU en la tienda oficial de Mercado Libre** (`compra.ml_url`) | B |
| 12 | **Lista de precios vigente**. La del kit es de agosto/septiembre de 2026 | B |
| 13 | **Whey Protein**: el precio comercio ($49.900) está por debajo del costo de fábrica ($56.800). No publicar su precio hasta resolverlo | B para ese SKU |
| 14 | Modo de uso, ingredientes y tabla nutricional de cada SKU, copiados textual del rótulo | B (la sección se oculta mientras tanto) |
| 15 | Denominaciones de venta: verificar las que se leyeron del packshot y completar Creatina Naranja, Blue Citrus y Carbo Power | B |
| 16 | **Packshot de la Glutamina: el arte dice "5 g DE CRETATINA"**. Corregir el arte (también en el envase si está impreso así) antes de usarlo | B para ese SKU |
| 17 | Inconsistencias entre el catálogo y el rótulo (el kit usa el rótulo): Magnesio Citrato (catálogo: polvo 200 g; rótulo: 60 cápsulas), Glutamina (300 g contra 150 g), Carbo Power (1 kg cítrico contra 450 g Fruit Punch), Colágeno ACTION (360 g contra 390 g) | Unificar materiales |
| 18 | Presentaciones de Creatina que faltan (doypack 300 g, si sigue vigente): packshot y precio | — |
| 19 | Sobres nuevos (Vit C+D+Zinc, Magnesio+Potasio, Super C) y shakers: packshot, EAN, nombre y precio | — |
| 20 | Códigos de barras (EAN) para el schema de producto | — |

## Marca y legales

| # | Pendiente | Tipo |
|---|---|---|
| 21 | **CUIT de Keating One S.R.L.** La web expo dice 27-41801463-1, pero el prefijo 27 corresponde a una persona física. Verificar | B |
| 22 | Certificaciones a mostrar (ISO 22000, planta propia en Saladillo): confirmar con la fábrica, con documento | B para mostrarlas |
| 23 | Email público de contacto | — |
| 24 | Fotos **reales** de uso (lifestyle) para la galería y la home. Las de la web expo son de stock | — |
| 25 | Lista de puntos de venta que aceptan figurar en "Dónde comprar" | — |
| 26 | Reseñas reales de Mercado Libre para `data/resenas.json` | — |
| 27 | IDs de GA4, TikTok Pixel y Meta Pixel | — |

## Landing de suscripción

| # | Pendiente | Tipo |
|---|---|---|
| 28 | **Planes de suscripción de Mercado Pago**: crear un plan por producto y frecuencia (30 y 60 días) y pegar cada link en `data/suscripcion.json` → `planes`. Mientras tanto el botón abre WhatsApp | B para cobrar automático |
| 29 | **Operación de la suscripción**: quién despacha, plazos, costo de envío, facturación y atención. Completar el paso "Envío" y la pregunta de envío en `data/suscripcion.json` (hoy en "pendiente", ocultos) | B |
| 30 | **Botón de arrepentimiento** (Res. SCI 424/2020): hoy abre WhatsApp con el pedido armado. Validar el circuito de baja y devolución con legales | B |
| 31 | Confirmar con legales los textos "sin permanencia" y "la cancelás desde tu cuenta de Mercado Pago" (paso 4 de "Cómo funciona" y preguntas frecuentes) | B |
| 32 | Validar con regulatorio que la suscripción, sin descuento ni regalo, no se considera "beneficio" (Anexo IV, ítem 5). Ver también el #8 | B |
| 33 | Link de la tienda oficial de Mercado Libre (`marca.json` → `mercado_libre_tienda_oficial_url`) para "¿Preferís comprar una sola vez?" | — |
| 34 | Dominio o subdominio de la landing (por ejemplo, suscripcion.profitargentina.com.ar) y hosting | B |
| 35 | Sitemap: necesita el dominio (#34). Cargar `seo.url_publica` en `data/suscripcion.json` y sumar `Sitemap:` en `robots.txt` | — |
| 36 | Bloque "Blindaje y Bienestar: la misma molécula, dos historias" de la web expo: **no se usa**, porque las notas de Colágeno ACTION piden no mostrarlo nunca en la misma pieza que SKIN/GLOW. Si los dueños lo quieren, validar con regulatorio | — |
| 37 | "Quiénes somos": "Planta propia en Saladillo", ISO 22000 y RNE/RNPA quedan ocultos hasta tener el documento (#6 y #22) | B para mostrarlos |
| 38 | **Promo de suscripción 40%** (aprobada el 24/10/2026): crear los planes de Mercado Pago con el precio de suscripción (sugerido × 0,60, redondeado hacia arriba), no con el sugerido | B para cobrar automático |
| 39 | ~~Definir si el 40% se mantiene en todos los cobros~~ **Resuelto (25/10/2026):** quien se suscribe durante la promo conserva el 40% en todos los cobros del plan. Los planes de Mercado Pago de la promo deben mantener ese precio aunque la promo termine | — |
| 40 | Fecha de cierre de la promo (`promo.cierre` en `data/suscripcion.json`): hoy 25/10/2026 23:00 (hora Argentina). Al llegar a cero, el contador y el descuento desaparecen solos. Para extenderla, cambiar la fecha | — |

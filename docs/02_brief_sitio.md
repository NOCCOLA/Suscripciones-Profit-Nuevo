# Brief del sitio PROFIT® · Fase 1

## Objetivo

Que alguien que llega desde un anuncio o un QR del envase entienda en 10 segundos:

- qué es el producto,
- cuándo se toma,
- con qué se combina,
- dónde lo compra.

Hoy compra en la tienda oficial de Mercado Libre o en una farmacia o dietética cercana. Además, que un comercio que llega al sitio pueda pedir condiciones para vender PROFIT en un minuto.

**Métricas de la Fase 1:**

- clics hacia Mercado Libre por ficha,
- clics de WhatsApp,
- leads mayoristas,
- búsquedas en "Dónde comprar".

## Mapa del sitio

| Ruta | Página |
|---|---|
| `/` | Home |
| `/productos` | Catálogo completo, agrupado por línea |
| `/linea/[id]` | Página de cada línea (energia, fuerza, recuperacion, blindaje, bienestar) |
| `/producto/[slug]` | Ficha de producto (el corazón del modelo) |
| `/p/[slug]` | Redirección estable para los QR del envase. El slug no cambia nunca |
| `/donde-comprar` | Mercado Libre, puntos de venta por provincia y WhatsApp |
| `/quiero-vender` | Página mayorista: formulario que lleva a WhatsApp comercial |
| `/preguntas-frecuentes` | Preguntas frecuentes generales |
| `/legales/...` | Términos, privacidad y link a Defensa de las y los Consumidores |

## Ficha de producto: estructura, en este orden

Plantilla: `creatina-monohidrato-300g`. Todas las fichas salen de `data/productos.json`.

| # | Sección | Contenido | Equivale en Aqualo a |
|---|---|---|---|
| 0 | Barra superior | "Comprá en la tienda oficial de Mercado Libre o en farmacias y dietéticas de todo el país" | Envío gratis y cuotas |
| 1 | Header | Logo blanco o negro. Menú: Productos por línea, Por dónde empezar, Dónde comprar, Quiero vender PROFIT | Header |
| 2 | Galería | Packshot real, foto del rótulo o tabla nutricional (pendiente) y foto de uso real (placeholder "FOTO REAL PENDIENTE") | Galería |
| 3 | Encabezado | Chip de línea (color, nombre y momento), nombre, variante. **Datos duros grandes del rótulo** (`datos_rotulo`) y sellos (`sellos_rotulo`) | Título, rating y beneficios |
| 4 | Bloque de compra | Selector de presentación y sabor (productos del mismo `grupo`), precio sugerido, botón principal **"Comprar en Mercado Libre"** (pestaña nueva, con UTM), botón secundario "Consultar por WhatsApp" y link "Encontralo cerca tuyo". Microcopy: "Precio sugerido · Tienda oficial". **Sin contador de stock** | Bloque de compra |
| 5 | Franja de confianza | Elaborado por Keating One S.R.L. · Industria Argentina · Libre de gluten · RNPA (si existe) | Garantía y pago seguro |
| 6 | Qué tiene | Composición del rótulo. Una cifra protagonista. Ingrediente sí, adjetivo no | Descripción y activos |
| 7 | Cómo se toma | Modo de uso textual del rótulo, en hasta 3 pasos. Si está pendiente, se oculta | Cómo usar |
| 8 | Cuándo se toma | Los cinco momentos (antes y durante, durante, después, alrededor, todos los días) con la línea del producto resaltada. **Sin plazos de resultados** | Timeline mes 1/2/3 |
| 9 | Completá el ciclo | 2 tarjetas de `cross_sell`. Fuerza lleva a Recuperación ("si te llevás el rojo, te falta el azul"). **Blindaje y Bienestar nunca juntos** | Acondicionador y "Armá tu rutina" |
| 10 | Opiniones | Solo reseñas reales de Mercado Libre (`data/resenas.json`): texto literal, nombre como figura, fecha y link. Vacío significa que no se muestra | Carrusel de reseñas |
| 11 | Lo que no vas a leer | El bloque de la web expo: no vas a leer promesas, sí vas a leer dosis, porciones e ingredientes | Explicador del problema |
| 12 | Registros y rótulo | RNE/RNPA, denominación de venta (`denominacion_rotulo`), rótulo completo en imagen | Sección ANMAT |
| 13 | Preguntas frecuentes | Ver la lista de abajo | Preguntas frecuentes |
| 14 | Dónde comprar y Quiero vender | Mini bloque B2C (Mercado Libre y puntos de venta) y mini banner B2B | Envíos y mayoristas |
| 15 | Footer | Leyenda obligatoria, disclaimer, Keating One S.R.L., CUIT (cuando esté), links legales y redes | Footer |

**Botón flotante de WhatsApp** (todas las páginas): el mensaje precargado lleva el código de origen, por ejemplo `Hola, quiero consultar por Creatina Monohidrato 300 g [WEB · creatina-monohidrato-300g · tiktok]`.

### Preguntas frecuentes base (respuestas solo con datos del rótulo o de la marca)

- ¿Dónde lo compro? Tienda oficial de Mercado Libre, farmacias y dietéticas (link a Dónde comprar).
- ¿Cómo se toma? Modo de uso del rótulo.
- ¿Tiene TACC? "Libre de gluten", según el rótulo.
- ¿Con qué lo combino? El ciclo de líneas.
- ¿Quién lo elabora? Keating One S.R.L. Industria Argentina.
- ¿Lo puedo tomar si…? Siempre responder "Consultá a tu médico o farmacéutico". Sin consejo médico.
- Tengo un comercio, ¿cómo vendo PROFIT? Link a Quiero vender.

## Home

1. **Hero**: concepto "Acá se viene a mejorar.", una línea de bajada y dos botones (Ver productos y Dónde comprar), con el packshot de la Creatina.
2. **Por dónde empezar**: cuatro necesidades que llevan a cada línea. Se toma de la web expo **revisando el copy**:
   - "Juego al pádel o corro, y lo siento" sugiere dolor. Reemplazar por "Juego al pádel, corro o hago deportes de impacto".
   - "Es lo que más evidencia tiene y lo que mejor funciona" es una afirmación comparativa. Lleva `VALIDAR REGULATORIO`.
3. **Las cinco líneas**: el ciclo del entrenamiento, con el color como navegación.
4. **Producto héroe**: Creatina Monohidrato, con datos duros y botón a Mercado Libre.
5. **Lo que no vas a leer en nuestros envases.**
6. **Quiénes somos**: Keating One S.R.L., Industria Argentina. Solo certificaciones confirmadas (ver pendientes).
7. **Prueba social real**: puntos de venta que aceptaron figurar, clubes y contenido con derechos. Si no hay nada confirmado, la sección se oculta.
8. **Dónde comprar.**
9. **Quiero vender PROFIT.**
10. Footer.

## Página de línea (`/linea/[id]`)

- Encabezado con el color de la línea, el nombre, el momento y la frase (de `lineas.json`, en evaluación).
- Texto "qué es" y la grilla de productos.
- Una sugerencia de línea complementaria según el ciclo.

## Dónde comprar (`/donde-comprar`)

- **Tienda oficial de Mercado Libre**, como botón grande.
- **Puntos de venta** desde `data/puntos_de_venta.json`, con filtro por provincia y localidad. Si está vacío, mostrar: "Escribinos y te decimos dónde conseguirlo cerca tuyo" con un botón de WhatsApp.

## Quiero vender PROFIT (`/quiero-vender`)

Es la versión PROFIT de la página de mayoristas de Aqualo, pensada para el canal.

- **Para quién**: farmacias, dietéticas, distribuidores, tiendas deportivas, gimnasios y cadenas.
- **Qué ofrecemos** (texto de la web expo): condiciones mayoristas, material de exhibición y capacitación de producto para tu equipo.
- **Formulario**:
  - comercio o razón social,
  - tipo de negocio (Farmacia / Dietética / Distribuidor / Tienda deportiva / Gimnasio / Cadena / Otro),
  - localidad y provincia,
  - nombre de contacto,
  - WhatsApp.
- **Al enviar**: se abre `wa.me/5491160277603` con el mensaje armado: `Hola, quiero vender PROFIT. Comercio: … Tipo: … Localidad: … [WEB · mayorista · {utm_source}]`.
- Opcional en la Fase 1.5: también se guarda en una Google Sheet mediante un webhook de Apps Script, con la URL en una variable de entorno.
- Promesa: "Te respondemos en menos de 2 horas hábiles."
- **No publicar** precios, mínimos ni descuentos. Se mandan por lista.

## Medición

- GA4, TikTok Pixel y Meta Pixel, con IDs por variable de entorno y cargados después de la interacción para no afectar la performance.
- Eventos: `view_item`, `select_variant`, `click_mercadolibre`, `click_whatsapp`, `click_donde_comprar`, `lead_mayorista`.
- Los parámetros UTM se guardan en sessionStorage, con try/catch, y se agregan a los links salientes.

## SEO

- Metadata por ficha.
- `schema.org/Product` **sin** `aggregateRating` salvo que existan reseñas reales.
- Sitemap y robots.
- Imágenes OG generadas con el packshot y el color de la línea.

## Etapas de trabajo en Claude Code

| Etapa | Qué se hace | Listo cuando |
|---|---|---|
| 0 | Setup: Next.js, TypeScript, Tailwind, Montserrat, tokens de color, lectura de `data/`, layout, header y footer con la leyenda | `npm run build` sin errores y el footer muestra la leyenda |
| 1 | Ficha plantilla con `creatina-monohidrato-300g`, todas las secciones | Se ve bien en un celular de 375 px, no aparece ningún "pendiente" y los links llevan UTM |
| 2 | Todas las fichas desde JSON, selector de variantes por `grupo` y `/p/[slug]` | 20 fichas generadas y los QR redirigen |
| 3 | Home, `/productos`, `/linea/[id]` y "Por dónde empezar" | Navegación completa por línea |
| 4 | Dónde comprar, Quiero vender y botón flotante de WhatsApp con atribución | El mensaje de WhatsApp sale armado con el código de origen |
| 5 | SEO, analytics y performance | Lighthouse mobile ≥ 90 |
| 6 | Deploy en Vercel, dominio y checklist de `03_pendientes` | Cero bloqueantes abiertos |

## Fase 2: solo como referencia, no construir sin aprobación

- **Plataforma**:
  - **Shopify**, con tema propio hecho en Claude Code a partir de este mismo diseño (Aqualo usa Shopify).
  - O checkout propio con **Mercado Pago Checkout Pro** sobre este mismo Next.js.
- **Suscripción**: plan de suscripción de Mercado Pago por SKU (se crea sin código y se comparte por link o botón). Ojo: en Shopify, las apps de suscripción no cobran automáticamente con Mercado Pago.
- **Obligatorio con venta propia**:
  - botón de arrepentimiento visible (Res. SCI 424/2020, 10 días corridos),
  - políticas de envío y devolución coherentes con lo que se promete,
  - razón social y CUIT.
- **Operación**: stock, despacho (cotización con Pick and Log), facturación y atención. Necesita un responsable asignado antes de lanzar.
- **Precio**: siempre el precio sugerido. Cualquier descuento o beneficio necesita el OK de los dueños y de regulatorio.

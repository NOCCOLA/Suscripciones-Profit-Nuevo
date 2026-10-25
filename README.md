# Kit para construir la web de PROFIT® con Claude Code

## Landing de suscripción (lista para subir)

Es una página estática: no necesita Node ni compilar. Se sube la carpeta tal cual a cualquier hosting (Hostinger, Netlify, Vercel, cPanel, etc.). Tiene que servirse desde un servidor: abrir `index.html` con doble clic no carga los datos.

**Qué subir:** `index.html`, `assets/`, `data/` y `public/`. No hace falta subir `docs/`, `reference/`, `tools/` ni `CLAUDE.md`.

**Probar en tu computadora:**

```
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```

y abrir http://localhost:8080.

**Cómo funciona:**

- Todo el contenido sale de `data/`. Los textos de la landing, las frecuencias y los links de Mercado Pago están en `data/suscripcion.json`.
- Para activar el cobro automático, creá en Mercado Pago un plan de suscripción por producto y frecuencia (Suscripciones > Planes) y pegá su link en `planes`. Mientras un link diga `"pendiente"`, el botón abre WhatsApp con el pedido armado.
- Link directo a un producto para los anuncios: `?producto=<slug>`, por ejemplo `?producto=creatina-monohidrato-300g&utm_source=tiktok`. Los `utm_*` se guardan y viajan en el código de origen del mensaje de WhatsApp y en los links salientes.
- Píxeles: cargá los IDs de GA4, TikTok y Meta en `data/suscripcion.json` → `medicion`. Eventos: `view_item`, `select_variant`, `click_suscripcion`, `click_whatsapp`, `click_mercadolibre`, `click_donde_comprar`, `lead_mayorista`.
- Antes de publicar, revisá la sección "Landing de suscripción" de `docs/03_pendientes_antes_de_publicar.md`.

**Al subir cambios (Hostinger u otro Apache):**

- `.htaccess` evita que el hosting muestre una versión vieja: subilo siempre junto con la página.
- Cada vez que cambies `assets/styles.css` o `assets/app.js`, cambiá la fecha de `?v=` en `index.html` (por ejemplo `?v=20261101`). Los archivos de `data/` se piden con esa misma versión: si cambiás solo `data/`, el `.htaccess` ya evita que se sirvan viejos, pero cambiar la fecha también ayuda.
- Cuando esté el dominio, cargalo en `data/suscripcion.json` → `seo.url_publica` y sumá la línea `Sitemap:` en `robots.txt`.
- La imagen para compartir en redes (`public/og/og-profit.jpg`) se regenera con `powershell -ExecutionPolicy Bypass -File tools\og-image.ps1`.
- La denominación de venta de cada producto se muestra recién cuando se borra su `denominacion_estado` en `productos.json` (es decir, cuando ya se verificó contra el rótulo).

---

Este kit tiene todo lo que Claude Code necesita para armar el sitio. Las reglas de marca y las de ANMAT ya están cargadas, así que no hace falta repetirlas en cada pedido.

## Qué hay adentro

```
profit-web-kit/
├── CLAUDE.md                 ← reglas fijas (Claude Code lo lee solo en cada sesión)
├── docs/
│   ├── 01_modelo_referencia_aqualo.md   ← qué copiamos de Aqualo y qué no
│   ├── 02_brief_sitio.md                ← mapa del sitio, ficha de producto, etapas
│   └── 03_pendientes_antes_de_publicar.md
├── data/
│   ├── productos.json        ← 20 SKUs: línea, datos del rótulo, precio sugerido, venta cruzada
│   ├── lineas.json           ← 5 líneas: color, momento, frase
│   ├── marca.json            ← firma, concepto, contacto, leyendas
│   ├── puntos_de_venta.json  ← vacío (cargar solo los que aceptan figurar)
│   └── resenas.json          ← vacío (solo reseñas reales de Mercado Libre)
├── public/
│   ├── packshots/            ← 20 packshots reales, nombrados por slug
│   └── brand/                ← logo blanco y negro (PNG)
└── reference/
    └── profit_web_expo_ago2026.html     ← la web de la expo, como referencia visual
```

## Cómo arrancar (una sola vez)

1. **GitHub**: crear una cuenta (si no la tienen) y un repositorio vacío llamado `profit-web`.
2. **Vercel**: crear una cuenta con el mismo usuario de GitHub y conectar el repositorio. Cada cambio que se sube se publica solo en una URL de prueba.
3. **Claude Code**: abrirlo en la app de escritorio de Claude (pestaña Code) o en claude.ai/code, sobre el repositorio `profit-web`.
4. Copiar **todo el contenido de esta carpeta** en la raíz del repositorio. `CLAUDE.md` tiene que quedar en la raíz.
5. Pegar el **prompt de arranque** de abajo.

## Prompt de arranque (pegar tal cual)

```
Leé CLAUDE.md y todos los archivos de docs/ y data/. Mirá también reference/profit_web_expo_ago2026.html como referencia visual.

Después, sin escribir código todavía:
1. Resumime en 10 líneas qué vamos a construir y qué reglas no se pueden romper.
2. Listame los datos que faltan y que te van a bloquear en las etapas 0 y 1.
3. Proponeme el plan de la Etapa 0 (setup) en pasos concretos.

Esperá mi OK antes de empezar.
```

## Prompts por etapa (uno por vez, después de revisar la anterior)

**Etapa 1: ficha plantilla**

```
Etapa 1: construí la ficha de producto /producto/creatina-monohidrato-300g siguiendo la tabla "Ficha de producto" de docs/02_brief_sitio.md, sección por sección y en ese orden. Todo sale de data/. Lo que esté "pendiente" no se muestra. Mostrame cómo queda en mobile (375 px) y en desktop antes de seguir.
```

**Etapa 2: todas las fichas**

```
Etapa 2: generá todas las fichas desde productos.json, con el selector de presentación y sabor por "grupo" y la ruta /p/[slug] para los QR. Revisá que ninguna ficha rompa una regla de la sección 5 de CLAUDE.md y pasame un listado con lo que quedó oculto por falta de datos.
```

**Etapa 3: home y líneas**

```
Etapa 3: home, /productos y /linea/[id] según el brief. "Por dónde empezar" con el copy corregido que indica el brief.
```

**Etapa 4: dónde comprar, quiero vender y WhatsApp**

```
Etapa 4: /donde-comprar, /quiero-vender y el botón flotante de WhatsApp con el código de origen y los UTM, según el brief.
```

**Etapa 5: SEO y medición**

```
Etapa 5: SEO (metadata, schema Product sin rating, sitemap), eventos de medición con IDs por variables de entorno, y performance hasta Lighthouse mobile ≥ 90.
```

**Etapa 6: publicación**

```
Etapa 6: revisá docs/03_pendientes_antes_de_publicar.md, decime qué bloqueantes siguen abiertos y prepará el deploy a producción en Vercel.
```

## Cuando hay que cambiar datos

- **Precios, links de Mercado Libre, RNPA o modo de uso**: se editan solo en `data/productos.json`. Después pedile a Claude Code: "actualicé productos.json, revisá que todo compile y subilo".
- **Producto nuevo**: agregarlo a `productos.json`, poner el packshot en `public/packshots/` con el mismo slug y sumarlo a su línea en `lineas.json`.
- **No cambies el slug** de un producto ya publicado: está impreso en el QR del envase.

## Antes de publicar

Revisar `docs/03_pendientes_antes_de_publicar.md`. Los ítems marcados con **B** bloquean la publicación.

## Promo de suscripción

- Se configura en `data/suscripcion.json` → `promo`: `descuento_pct` (hoy 40), `cierre` (fecha y hora reales de fin, hora de Argentina) y `activa`.
- Se muestra el precio sugerido tachado y el precio de suscripción resaltado, en la ficha, en "Completá el ciclo" y en la barra fija del celular.
- La cuenta regresiva (horas, minutos y segundos) cuenta hasta `cierre`, igual para todos los visitantes. Al llegar a cero, el descuento deja de mostrarse y los precios vuelven al sugerido.
- Sin fecha de cierre (`"cierre": "pendiente"`), el descuento queda fijo y no hay contador.
- Los planes de Mercado Pago tienen que crearse con el precio de suscripción, no con el sugerido.

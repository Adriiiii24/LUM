---
name: LUM
description: Un texto convertido en grafo sobre un lienzo de puntos en blanco hueso, donde la lima marca, como un rotulador, lo que se recorrió y lo que se citó.
colors:
  markup: "#7fff00"
  on-markup: "#1a1a1a"
  bone: "#f9f6ee"
  paper: "#f9f6ee"
  paper-2: "#f0ece2"
  ink: "#1a1a1a"
  ink-2: "#4d4b46"
  ink-3: "#5e5c54"
  line: "rgb(26 26 26 / 0.2)"
  line-strong: "#77756a"
  grid: "rgb(26 26 26 / 0.13)"
  paper-dark: "#151514"
  paper-2-dark: "#1f1f1d"
  ink-dark: "#f4f1e8"
  ink-2-dark: "#c9c6bb"
  ink-3-dark: "#a19e93"
  line-dark: "rgb(244 241 232 / 0.18)"
  line-strong-dark: "#85837a"
  grid-dark: "rgb(244 241 232 / 0.1)"
  logo-lime: "#9df912"
  logo-ink: "#0e0c0d"
typography:
  wordmark:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(5.5rem, 15vw, 12.5rem)"
    fontWeight: 700
    lineHeight: 0.82
    letterSpacing: "-0.075em"
  statement:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 7vw, 6.5rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.05em"
  headline:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.045em"
  lede:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.6vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  figure:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 0.85
    letterSpacing: "-0.06em"
    fontFeature: "tnum"
  title:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "-0.03em"
  intro:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.375
  body-read:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.375
  button-caps:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.14em"
  eyebrow:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.18em"
  caps:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.65rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.18em"
  label-field:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.08em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.33
    fontFeature: "tnum"
rounded:
  none: "0px"
  xs: "3px"
  full: "9999px"
spacing:
  gutter: "16px"
  gutter-md: "24px"
  cell-y: "32px"
  section: "80px"
  section-md: "128px"
  dot-grid: "22px"
  header: "56px"
  header-md: "64px"
  band: "40px"
components:
  link-button-primary:
    backgroundColor: "{colors.markup}"
    textColor: "{colors.on-markup}"
    typography: "{typography.button-caps}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  link-button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  link-button-outline:
    textColor: "{colors.ink}"
    typography: "{typography.button-caps}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  link-button-outline-hover:
    backgroundColor: "{colors.markup}"
    textColor: "{colors.on-markup}"
  link-button-ink:
    backgroundColor: "{colors.on-markup}"
    textColor: "{colors.markup}"
    typography: "{typography.button-caps}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  link-button-ink-outline:
    textColor: "{colors.on-markup}"
    typography: "{typography.button-caps}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button-caps}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "36px"
  button-primary-disabled:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink-3}"
  button-secondary:
    textColor: "{colors.ink}"
    typography: "{typography.button-caps}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.paper-2}"
  toggle-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    height: "28px"
    padding: "0 8px"
  section-index:
    backgroundColor: "{colors.markup}"
    textColor: "{colors.on-markup}"
    typography: "{typography.mono}"
    padding: "2px 6px"
  tag:
    textColor: "{colors.ink}"
    typography: "{typography.caps}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "8px 10px"
  chip-citation:
    backgroundColor: "{colors.markup}"
    textColor: "{colors.on-markup}"
    typography: "{typography.mono}"
    rounded: "{rounded.xs}"
    height: "1.2rem"
    padding: "0 4px"
  chip-citation-unbacked:
    textColor: "{colors.ink}"
    rounded: "{rounded.xs}"
  title-block-status-active:
    backgroundColor: "{colors.markup}"
    textColor: "{colors.on-markup}"
  entity-symbol-agent:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    size: "18px / 22px / 26px"
  entity-symbol-hollow:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "18px / 22px / 26px"
  footer:
    backgroundColor: "{colors.markup}"
    textColor: "{colors.on-markup}"
---

# Design System: LUM

## Overview

**Creative North Star: "El rotulador sobre la trama"**

LUM es una hoja de trabajo en blanco hueso con una trama de puntos fija debajo de todo, como la pizarra donde se dibuja un grafo. Sobre esa trama, la estructura se traza con filetes de 1 px: cabecera fija, secciones en rejilla de 12 columnas (4 en móvil) y celdas separadas por filetes de control. La lima es un rotulador: subraya la palabra clave de cada titular, numera las secciones, llena la acción principal, avanza como barra de lectura bajo la cabecera y cubre el pie entero. Siempre va debajo de la tinta, nunca escrita sobre el hueso.

Dentro de la herramienta, la misma lima cambia de oficio y se vuelve evidencia: en la lámina, en la vista 3D y en la lista, solo marca lo que el recuperador recorrió y lo que la respuesta cita. El estado de cada nodo se dibuja además con un tipo de línea, y el tipo de entidad, con una ficha redonda (llena para quien actúa, hueca para el resto) que lleva un icono derivado del propio texto. Al pasar el ratón, el vecindario queda delante y el resto se aparta; el hover no usa lima.

Hay dos temas, claro (de partida) y oscuro; el oscuro invierte hueso y tinta y deja la lima y la tinta sobre lima iguales. Todo es plano y de esquinas vivas; la única sombra es dura y solo la llevan las piezas que flotan. El vídeo de la portada (Remotion) usa la misma paleta, los mismos titulares con rotulador y las mismas fichas.

**Qué cambia respecto a la versión anterior.** El fondo pasa del crema `#EDE8D0` al blanco hueso; la rejilla de filetes verticales se sustituye por la trama de puntos; la fórmula «antetítulo + palabra.» se sustituye por cabeceras con índice lima y titular en una frase con su palabra marcada; desaparecen la cinta de relojes, el carrusel, el menú a pantalla completa, el precargador de sala con contador y la marca gigante cortada en el pie. Entran la marca «lum» con un nodo citado por punto, el pipeline de nodos, la lectura del cajetín en la cabecera, la barra de progreso lima, el conmutador sol/luna, el cajón lateral en móvil, el precargador con un recorrido en miniatura y el pie lima con la frase fija. En la herramienta, los símbolos geométricos por tipo pasan a fichas redondas con icono, y se añaden la lectura del vecindario al pasar y la vista 3D.

**Qué se mantiene.** La lima bajo la tinta; la lima como «recorrido o citado» dentro de la lámina; el estado dibujado con tipo de línea; una sola sombra flotante; el suelo del 70 % para atenuar texto pequeño; esquinas a 0 px salvo el chip de cita.

**Key Characteristics:**
- Trama de puntos fija de 22 px bajo toda la página; estructura en filetes de 1 px sobre 12 columnas (4 en móvil).
- Rotulador lima en una sola palabra de cada titular, con la tinta fija encima.
- Space Grotesk para todo lo que se lee; Geist Mono con cifras tabulares para ids, zonas, cifras de dato y modelos.
- Lima en el sitio como superficie (acción principal, índices, pie, cifras); en la lámina, solo como evidencia.
- Fichas de entidad redondas con icono del texto: llenas para personas y organizaciones, huecas para el resto.
- Esquinas a 0 px; 3 px solo en el chip de cita; círculos solo en fichas, nodos del pipeline y el punto de la marca.
- Una sola sombra dura, solo en lo que flota.

## Colors

Tres tintas: blanco hueso, tinta casi negra y una lima eléctrica que nunca escribe sobre el hueso.

### Primary
- **Lima rotulador** (markup, `#7fff00`): igual en los dos temas. En el sitio: acción principal, índice de sección, palabra marcada de cada titular, raya de la sección activa y barra de progreso, estado de la lectura de cabecera, tema activo, bloque de cifras de la muestra, pie y selección de texto. En la lámina: halo de nodo, banda bajo arista, rótulo y fila citados, chip de cita, frase de evidencia en la fuente, triángulo de la revisión vista y celda ESTADO del cajetín mientras la IA trabaja. Sobre el hueso da 1,20:1; sobre el fondo oscuro, 14,1:1.
- **Tinta sobre lima** (on-markup, `#1a1a1a`): fija en los dos temas, porque sobre lima siempre hace falta oscuro (13,4:1). Es también la lima invertida: los botones de tinta del pie llevan la lima como texto sobre ella (13,4:1).

### Neutral
- **Blanco hueso** (paper, `#f9f6ee`): fondo de página, de paneles y de lo que flota; también el relleno que corta las aristas bajo los rótulos.
- **Hueso de banda** (paper-2, `#f0ece2`): hover de controles neutros, fondo del vídeo, figuras de artefacto del pipeline, fila seleccionada.
- **Tinta** (ink, `#1a1a1a`): texto principal (16,1:1), fichas llenas, anillos, aristas, botón principal de la herramienta, conmutadores activos y anillo de foco.
- **Tinta segunda** (ink-2, `#4d4b46`): prosa de lectura, entradillas, navegación en reposo (8,1:1; 7,4:1 sobre paper-2).
- **Tinta tercera** (ink-3, `#5e5c54`): etiquetas de campo, numeración, pies de figura, metadatos (6,2:1; 5,7:1 sobre paper-2).
- **Filete** (line, tinta al 20 %): divisiones internas del cajetín, la ficha, la leyenda y la lista. Decorativo (1,52:1).
- **Filete de control** (line-strong, `#77756a`): estructura de la página, bordes de botones, campos y paneles (4,3:1; 3,9:1 sobre paper-2).
- **Trama** (grid, tinta al 13 %): los puntos del lienzo de fondo. Decorativa (1,31:1).
- **Hueso fijo** (bone, `#f9f6ee`): relleno de las fichas huecas y del icono de las llenas cuando están sobre el halo lima; no cambia con el tema.

### Tema oscuro
- **Fondo** (paper-dark, `#151514`), **banda** (paper-2-dark, `#1f1f1d`), **tinta** (ink-dark, `#f4f1e8`, 16,2:1), **tinta segunda** (ink-2-dark, `#c9c6bb`, 10,7:1), **tinta tercera** (ink-3-dark, `#a19e93`, 6,8:1), **filete** (line-dark, hueso al 18 %), **filete de control** (line-strong-dark, `#85837a`, 4,8:1), **trama** (grid-dark, hueso al 10 %). La lima, la tinta sobre lima y el hueso fijo no cambian. La meta `theme-color` sigue al tema.

### Named Rules
**The Lime-Under-Ink Rule.** La lima nunca es texto, icono ni filete fino sobre el hueso (1,20:1): va debajo de la tinta fija (on-markup) como rotulador o como superficie llena. Texto lima solo sobre la tinta fija `on-markup`, nunca sobre la tinta del tema (en oscuro, la tinta es hueso: 1,15:1 sobre lima).

**The Evidence Rule.** En la lámina (2D, 3D y lista), la lima significa una sola cosa: lo que el recuperador recorrió y lo que la respuesta cita. Mientras se recorre, todo lo visitado lleva lima; en reposo, solo lo citado. El hover y la selección nunca encienden lima: se marcan con tinta (esquineras, vecindario delante).

**The Two Themes Rule.** El tema claro es el de partida; el oscuro solo invierte hueso y tinta. Todo color nuevo entra con su valor en los dos temas y su contraste medido en ambos.

## Typography

**Display Font:** Space Grotesk (con ui-sans-serif, system-ui)
**Body Font:** Space Grotesk
**Label/Mono Font:** Geist Mono (con ui-monospace, SFMono-Regular)

**Character:** Una grotesca geométrica muy apretada en los tamaños grandes (de -0,04 a -0,075 em) y muy abierta en las versales pequeñas (0,14 a 0,18 em); la mono solo para lo que es dato.

### Hierarchy
- **Wordmark** (700, clamp(5,5 rem, 15 vw, 12,5 rem), 0,82, -0,075 em): «lum» en la portada, con las letras subiendo una a una. En el precargador (2,25 rem) y el pie (1,875 rem) a -0,06 em.
- **Monograma** (logotipo definitivo, desde el 2026-10-14): la L, la U, la M y un punto que es el nodo citado. Fuente: `public/brand/lum-logo.svg`. Va en lima `#9df912` con tinta `#0e0c0d` (tokens `logo-lime` y `logo-ink`), dentro de su cuadro de campo. Solo en la cabecera: 36 px en móvil y 44 px desde md (40 px en el cajón). También es el icono de la pestaña. El resto de la web y el vídeo usan el wordmark.
- **Statement** (700, clamp(2,75 rem, 7 vw, 6,5 rem), 0,92, -0,05 em): la frase fija del pie, «Lo que se ilumina es verdad.».
- **Headline** (600; 2,6 rem, 3,75 rem desde md, 4,5 rem desde lg; 1; -0,045 em; máx. 17 ch): titular de sección, una frase en caja de oración con punto final y una palabra marcada.
- **Lede** (600, clamp(2 rem, 3,6 vw, 3,25 rem), 1,02, -0,04 em; máx. 15 ch): la promesa de la portada.
- **Figure** (700, 3,75 rem a 6 rem, 0,8-0,85, -0,06 em, cifras tabulares a dos dígitos): cifras del banco de evals y de la muestra.
- **Title** (600, 1,5 rem; 1,875 rem desde md; -0,03 em): pasos del pipeline, métricas, límites. Los pasos de uso, a 1,125-1,25 rem.
- **Intro** (400, 1,125 rem; 1,25 rem desde md; 1,375; máx. 56 ch; ink-2): entradilla bajo el titular.
- **Body-read** (400, 15 px, 1,625; 42-46 ch; ink-2): prosa de celdas.
- **Body** (400, 13-14 px): fuente, respuestas, ficha y campos de la herramienta.
- **Button-caps** (600, 0,75 rem, 0,14 em, mayúsculas): botones-enlace; 0,7 rem en botones de la herramienta y 0,72 rem en la navegación.
- **Eyebrow** (700, 0,7 rem, 0,18 em, mayúsculas): nombre de sección junto al índice, títulos de banda de los paneles, cabeceras de columna del pie y pestañas móviles.
- **Caps** (400, 0,65 rem, 0,18 em, mayúsculas): etiquetas de cifra, pies de figura, etiquetas del pipeline, lectura de la cabecera, colofón.
- **Label-field** (400, 10-11 px, 0,08 em, mayúsculas, ink-3): nombres de campo del cajetín, la lista y los formularios.
- **Mono** (Geist Mono 400, 11-12 px, cifras tabulares): índices, zonas, modelos, revisiones, recuentos, rutas de código, números de cita.

### Named Rules
**The One Marked Word Rule.** Cada titular es una frase completa en caja de oración con punto final, y una sola palabra (o grupo corto) lleva el rotulador lima. Sin JavaScript ya está marcada; con el observador, el trazo entra 0,25 s después que el titular.

**The Data Is Mono Rule.** Lo que es un identificador, una zona, un predicado de ruta, un modelo o un recuento va en Geist Mono con cifras tabulares; las cifras grandes de exhibición van en Space Grotesk tabular. La prosa nunca va en mono.

**The Measured Fade Rule.** El texto atenuado por opacidad no baja del 70 % de la tinta (6,2:1 sobre el hueso). Por debajo se usa ink-3. Los rótulos que se apartan en la lámina no se atenúan: se ocultan.

## Layout

Una sola página sobre una rejilla de 12 columnas (4 en móvil), con la trama de puntos fija debajo (22 px, desfasada 11 px) y el grano de papel fijo encima (3,5 %, multiplicar). Cabecera fija de 56 px (64 px desde md) con filetes verticales entre celdas; el contenido arranca bajo ella y el desplazamiento a anclas deja ese margen.

- **Márgenes:** 16 px en móvil, 24 px desde md (32 px en la portada desde lg). Celdas con 32 px verticales (40 px en límites).
- **Ritmo de sección:** 80 px de aire antes de cada sección, 128 px desde md. Cada sección abre con su cabecera: en 3 columnas, el índice lima y el nombre; en las 9 restantes, el titular y la entrada. En móvil, el índice va en una fila propia encima.
- **Portada:** 5 columnas para marca, promesa y acciones; 7 para el vídeo, entero y sin recortar: si la columna es más alta que el vídeo, el hueco lleva su misma trama a su escala. Alto de la ventana menos la cabecera desde md.
- **Herramienta:** a sangre, con la altura de la ventana menos la cabecera (mínimo 38 rem). Tres celdas desde xl (fuente 25 %, lámina, preguntas 25 %); en md, lámina más preguntas con la fuente como cajón; en móvil, pestañas.
- **Mallas:** pasos de uso en 3; pipeline en 2 y 4 desde xl; evals en 4 + 8 (3 + 9 desde lg); límites en 2 y 3 desde xl con filetes hechos de `gap: 1px` sobre el filete de control; cierre en 6 + 6.
- **Puntos de corte:** 48 rem (md), 64 rem (lg: navegación completa), 80 rem (xl: lectura del cajetín en la cabecera y tres celdas). El cajetín completo aparece cuando la lámina mide 38 rem (consulta de contenedor).

## Elevation & Depth

Plano por defecto. La profundidad la dan los filetes y el contraste hueso/banda; solo lo que flota sobre otra cosa lleva sombra, y es dura, sin desenfoque.

### Shadow Vocabulary
- **Flotante** (`box-shadow: 0.6rem 0.6rem 0 rgb(26 26 26 / 0.06)`; en oscuro `rgb(0 0 0 / 0.35)`): ficha de entidad, leyenda abierta, aviso de extracción, cajón de la fuente en tableta y cajón de navegación móvil.

### Named Rules
**The Only Floating Shadow Rule.** Una sola sombra, desplazada 0,6 rem y sin desenfoque, solo en piezas que flotan sobre la página o la lámina. Nada fijo en la página la lleva, tampoco la cabecera.

## Shapes

Rectángulos de esquina viva con filete de 1 px; el círculo queda para lo que es un nodo.

- **Esquinas:** 0 px en botones, campos, paneles, celdas, etiquetas, conmutadores y cajones; 3 px solo en el chip de cita.
- **Círculos:** fichas de entidad, nodos del pipeline y de los pasos de uso (borde de 2 px de tinta), nodos del precargador y el punto de la marca (lima con anillo de tinta de 0,045 em; en tinta sobre el pie).
- **Fichas de entidad:** círculo con trazo de 1,5 px e icono Phosphor en negrita al 60 % del diámetro. Tres tamaños por conexiones (18, 22 y 26 px para grado <2, 2-4 y ≥5).
- **Aristas:** rectas, de borde a borde, con punta triangular; 1 px de tinta al 55 % en reposo (3,8:1 sobre el hueso; 5,6:1 en el tema oscuro, por encima del 3:1 de WCAG 1.4.11).

### Named Rules
**The State Is A Line Type Rule.** El estado de un nodo lo lleva el anillo: doble de 1 px para la semilla, discontinuo (1,25 px, trazo 2,5/2) para lo recorrido y continuo de 2 px para lo citado. Las aristas siguen la misma gramática: discontinuas (4/3) al recorrerse y continuas de 1,6 px cuando unen dos citadas. Sobre lima, anillos y aristas pasan a la tinta fija. La lima acompaña, nunca sustituye.

**The Agent Is Filled Rule.** Quien actúa (persona u organización) va en ficha llena de tinta con el icono en hueso; el resto, en ficha hueca. El icono sale de lo que el texto dice de la entidad y, si no hay pistas, del tipo. Ningún tipo tiene color propio.

**The Hairline Rule.** La estructura del sitio se dibuja con el filete de control; las divisiones internas de la herramienta, con el filete; sobre el pie lima, con la tinta fija al 25 %.

## Components

### Buttons
Cuadrados, en versal espaciada, con flecha que avanza 4 px al pasar.
- **Shape:** esquinas vivas (0 px), 44 px de alto en el sitio, 36 px en la herramienta.
- **Primario del sitio:** lima llena con la tinta fija; al pasar, tinta llena con el hueso.
- **Contorno del sitio:** filete de control y tinta; al pasar, lima llena.
- **Sobre lima (pie):** tinta fija llena con texto lima; o solo el filete de tinta al 60 % (4,2:1), que se llena de tinta al pasar.
- **Primario de la herramienta:** tinta llena con el hueso; deshabilitado, banda con ink-3. Su hover pasa a lima con la tinta fija encima. Resuelto: el brief del 2026-10-07 reserva la lima para el botón principal, las insignias de estado y las microinteracciones; la Evidence Rule rige dentro de la lámina (2D, 3D y lista), no en los botones ni en las insignias de los paneles.
- **Secundario de la herramienta:** filete de control; al pasar, filete de tinta y banda.
- **Herramienta (icono):** 28 px, ink-2; al pasar, banda y tinta. Siempre con nombre accesible.
- **Hover / Focus:** transición de color de 150-200 ms; pulsar hunde 1 px. Foco: contorno de tinta de 2 px a 2 px de distancia, global.

### Chips
- **Índice de sección:** lima llena, Geist Mono 12 px seminegrita, tinta fija.
- **Etiqueta:** filete de control, caps; las rutas de código en mono de 11 px.
- **Cita:** lima llena, 3 px, mono de 11 px, 1,2 rem; sube 1 px al pasar. Sin respaldo del recorrido: borde discontinuo de tinta, sin lima.

### Cards / Containers
- **Corner Style:** 0 px.
- **Background:** hueso; banda para figuras de artefacto; lima solo en el bloque de cifras de la muestra y el pie.
- **Shadow Strategy:** ninguna, salvo lo flotante (ver Elevation & Depth).
- **Border:** filete de control.
- **Internal Padding:** 16 px en móvil, 24 px desde md; las figuras de artefacto, 12 px.

### Inputs / Fields
- **Style:** hueso, filete de control, 0 px, 14 px; la etiqueta de campo encima, en ink-3.
- **Focus:** contorno de tinta de 2 px pegado al campo.
- **Disabled:** opacidad 60 %.

### Navigation
- **Cabecera:** fija, hueso, filete inferior de control. El monograma a la izquierda; desde xl, la lectura del lienzo en celdas de cajetín (estado en lima, grafo, modelo y revisión, oculta a lectores de pantalla porque el cajetín ya lo anuncia); desde lg, la navegación en button-caps con una raya lima de 3 px bajo la sección activa o al pasar (entra de izquierda a derecha, 300 ms); el enlace al código se llena de lima al pasar.
- **Conmutador de tema:** sol y luna en dos celdas de 32 px con filete; el activo en lima llena.
- **Barra de lectura:** raya lima de 3 px bajo la cabecera, ligada al desplazamiento (no se para con movimiento reducido porque no es una animación en el tiempo).
- **Scroll suave:** la rueda y el trackpad se suavizan con Lenis (interpolación 0,1). El táctil y los enlaces de ancla siguen nativos. Las zonas con scroll propio (chat, fuente, lista) se desplazan hasta su final antes de mover la página, y Ctrl más rueda sigue siendo el zoom de la lámina. Con movimiento reducido no se monta.
- **Móvil:** cajón lateral derecho de hasta 22 rem con sombra flotante y velo de tinta al 30 %: filas grandes (1,5 rem, 600) numeradas en mono, que se llenan de lima al pasar; el tema al pie. Escape lo cierra y devuelve el foco; el foco queda dentro.
- **Pestañas de la herramienta (móvil) y selector de vista (lámina, 3D, lista):** la activa en tinta llena con el hueso, nunca lima.

### Rotulador
El `mark` de cada titular: fondo lima de la altura de la línea, padding 0,1 em, tinta fija encima; el trazo crece de izquierda a derecha en 0,9 s tras 0,25 s, y la tinta cambia después.

### Pipeline
Cuatro pasos unidos por un filete horizontal a la altura del nodo: círculo de 44 px con borde de tinta e icono; al pasar por el paso, el filete engorda a 3 px lima y el nodo se llena de lima. Cada paso termina con su artefacto real de la muestra en una figura de banda.

### Lámina, vista 3D y ficha
- **Nodo:** ficha de entidad; halo lima de radio +9 px si está encendido (entra en 220 ms); esquineras de tinta de 4 px en foco o selección.
- **Vecindario:** con un nodo en foco, lo demás baja al 50 % (aristas al 6 %), y solo se rotula el vecindario y lo citado. Lo que queda fuera del recorrido, también al 50 %, sin multiplicarse: los nodos siguen siendo controles y su filete no baja de 3:1 (3,3:1 en claro, 4,8:1 en oscuro).
- **Rótulos:** 12 px sobre hueso que corta las aristas, ink-2 en reposo, tinta y 500 en el vecindario, lima con el número en mono si está citado; colisiones resueltas en ocho posiciones y alias corto si no cabe.
- **Ficha de entidad:** 19 rem, flotante, con la frase de origen tras un filete de tinta y las relaciones listadas como botones. Va en la mitad contraria a su nodo; como vista previa se queda mientras el puntero esté sobre la lámina o sobre ella y Escape la descarta. En la lista se despliega bajo la fila elegida, sin sombra.
- **Evidencia en la fuente:** lima con la tinta fija encima y un filete de tinta de 2 px debajo, para no depender del color.
- **3D:** los mismos símbolos, anillos, halos y bandas; anillos guía discontinuos al 12 %; gira sola salvo con movimiento reducido, al arrastrar o con un nodo en foco.
- **Cajetín:** abajo a la derecha, celdas con label-field; la celda ESTADO se llena de lima mientras la IA trabaja.

### Pie
Lima a sangre con tinta fija en los dos temas: la frase fija en Statement, dos acciones sobre lima, tres columnas (navegar, en otra parte, colofón) con enlaces subrayados al 40 % y una barra final con la marca de punto de tinta.

### Precargador
Una vez por sesión y nunca con movimiento reducido: seis nodos y seis aristas sobre la trama; las aristas se dibujan (0,5 s escalonadas 70 ms) y los nodos se encienden en lima en el orden del salto; la cortina se desvanece sola a los 1,4 s aunque falle el JavaScript. La marca de la portada sube letra a letra después (80 ms por letra).

## Do's and Don'ts

### Do:
- **Do** poner la lima siempre debajo de la tinta fija `on-markup` (13,4:1), en los dos temas.
- **Do** marcar una sola palabra de cada titular con el rotulador y cerrar la frase con punto.
- **Do** abrir cada sección con el índice lima en mono, el nombre en Eyebrow y el titular en Headline.
- **Do** reservar la lima de la lámina a lo recorrido y lo citado, y acompañarla siempre de una señal en tinta: anillo, línea discontinua o continua, número o palabra de estado.
- **Do** marcar el foco y la selección de la lámina con tinta (esquineras, vecindario delante), nunca con lima.
- **Do** distinguir quién actúa con la ficha llena y el resto con la ficha hueca; el icono, del texto.
- **Do** dar a todo color nuevo su valor en el tema claro y en el oscuro, con el contraste medido en ambos.
- **Do** dejar botones, campos, paneles y celdas a 0 px; 3 px solo para el chip de cita.
- **Do** escribir ids, zonas, modelos, revisiones y recuentos en Geist Mono con cifras tabulares.

### Don't:
- **Don't** usar la lima como texto, icono o filete fino sobre el hueso: da 1,20:1.
- **Don't** poner texto lima sobre la tinta del tema: en oscuro es hueso y da 1,15:1.
- **Don't** encender lima en la lámina por hover, selección o decoración.
- **Don't** usar otra sombra que la flotante, ni ponerla en algo que no flote.
- **Don't** dar color propio a un tipo de entidad.
- **Don't** redondear botones, paneles ni tarjetas.
- **Don't** atenuar texto por debajo del 70 % de la tinta.
- **Don't** volver a los rasgos de la referencia retirados: cinta de relojes, carrusel, menú a pantalla completa, contador de precarga y marca gigante cortada.

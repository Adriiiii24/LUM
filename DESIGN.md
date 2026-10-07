---
name: Neural Canvas
description: Una lámina técnica revisada por la IA; la lima solo marca lo que se recorrió y lo que se cita.
colors:
  paper: "#ede8d0"
  paper-2: "#e4dfc8"
  ink: "#1a1a1a"
  ink-2: "#4d4b46"
  ink-3: "#5e5c54"
  line: "rgb(26 26 26 / 0.24)"
  line-strong: "#77756a"
  markup: "#7fff00"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "0.02em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  body-read:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
  label-field:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.08em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
rounded:
  none: "0px"
  xs: "3px"
spacing:
  frame: "0.8rem"
  cell: "16px"
  band: "12px"
  read-gutter: "20px"
  read-gutter-md: "24px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.xs}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.markup}"
    textColor: "{colors.ink}"
  button-primary-disabled:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink-3}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.xs}"
    padding: "0 12px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.paper-2}"
  button-tool:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.xs}"
    size: "28px"
  button-tool-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  toggle-band:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 8px"
    height: "28px"
  toggle-band-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  chip-citation:
    backgroundColor: "{colors.markup}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.xs}"
    padding: "0 4px"
    height: "1.2rem"
  chip-citation-unbacked:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.xs}"
    padding: "0 4px"
    height: "1.2rem"
  panel-header:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 6px 0 12px"
    height: "40px"
  masthead:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "8px 16px"
    height: "56px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "8px 10px"
  title-block-status-active:
    backgroundColor: "{colors.markup}"
    textColor: "{colors.ink}"
    padding: "4px 8px"
---

# Design System: Neural Canvas

## Overview

**Creative North Star: "Plano técnico (Heron real)"**

La interfaz es una lámina de delineante: papel beige, tinta casi negra y una sola marca de revisión en lima. El grafo se dibuja como un plano, con reglas A-H por 1-6 en el borde, retícula de zonas muy tenue, símbolos de entidad por forma y un cajetín abajo a la derecha. La IA actúa como el revisor que marca la lámina: la lima solo aparece donde el recuperador pasó o donde la respuesta cita, igual que la marca en rojo de un revisor de planos.

La densidad es la de una herramienta de trabajo: la primera pantalla es la herramienta entera, enmarcada a 0,8 rem del borde de la ventana y dividida en celdas por filetes de 1 px. Debajo, la lámina de lectura («Cómo funciona», «Lo que se mide», «Límites» y el pie) reutiliza la misma retícula de filetes con más aire y títulos grandes en mayúsculas. Todo es plano, de esquinas vivas y tinta sobre papel; la profundidad solo existe para lo que flota.

Rechazos confirmados en la dirección: el bento redondeado de SaaS y la constelación oscura con neón y cristal.

**Key Characteristics:**
- Papel, tinta y una sola marca lima que nunca es texto.
- El estado se dibuja con tipos de línea (doble, discontinua, continua gruesa), no con color.
- Celdas separadas por filetes de 1 px; esquinas a 0 px en paneles y campos, 3 px en botones y chips.
- Geist en mayúsculas apretadas para títulos; Geist Mono con cifras tabulares para ids, zonas y cifras.
- Una sola sombra dura, sin desenfoque, solo en lo que flota.
- Solo tema claro.

## Colors

Tres tintas de lámina técnica y una marca fluorescente: papel cálido, tinta neutra y lima de revisión.

### Primary
- **Lima de revisión** (markup): la única marca de color. Sobre el papel da 1,05:1, así que nunca escribe; va siempre como relleno bajo o tras la tinta (tinta sobre lima: 14,8:1). Aparece en los halos de nodo, la banda bajo las aristas recorridas o citadas, los rótulos y filas de entidades citadas, los chips de cita, la celda ESTADO del cajetín mientras la IA trabaja, el triángulo de la revisión visible, el fondo de las frases de evidencia en la fuente, el hover del botón principal y la selección de texto.

### Neutral
- **Papel de lámina** (paper): fondo de todo, también de los paneles flotantes y de los campos.
- **Papel de banda** (paper-2): bandas de cabecera de celda, hover de botones secundarios y filas, fondo de los artefactos de «Cómo funciona» y del botón principal deshabilitado.
- **Tinta** (ink): texto principal, símbolos, anillos, aristas, asas de selección, relleno del botón principal y de los conmutadores pulsados, contorno de foco.
- **Tinta segunda** (ink-2, tinta al 76 %; 7,1:1 sobre el papel): texto secundario, frase de valor, cuerpo de las secciones de lectura, rótulos de nodo en reposo.
- **Tinta tercera** (ink-3, tinta al 68 %; 5,4:1 sobre el papel y 5,0:1 sobre paper-2): etiquetas de campo, metadatos en mono, reglas, pies y placeholders.
- **Filete** (line, tinta al 24 %): separaciones entre celdas, filas y bandas. Decorativo, no un borde de control.
- **Filete de control** (line-strong; 3,8:1): bordes de campos, botones secundarios, conmutadores, leyenda, cajetín, el marco de la lámina y el subrayado de los enlaces.

### Named Rules
**The Lime-Under-Ink Rule.** La lima nunca es texto ni la única señal de un estado: es un relleno bajo o tras la tinta (chips con texto en tinta, la celda ESTADO, halos, bandas bajo aristas, marcas de evidencia en la fuente y el hover del botón principal). Todo lo que la lima marca lleva además una señal en tinta: anillo, palabra, número o tipo de línea.

**The Reviewer's Mark Rule.** En reposo, solo lo citado conserva la lima. Mientras se traza un recorrido, todo lo visitado (semilla, recorrido y citado) se marca en lima; al terminar, la lima se retira de lo que no se citó.

**The Measured Tint Rule.** Los grises son tinta con alfa resuelta sobre el papel, con contraste medido: ink-2 7,1:1, ink-3 5,4:1. Un gris nuevo entra solo con su contraste medido sobre paper y paper-2.

## Typography

**Display Font:** Geist (con ui-sans-serif, system-ui, sans-serif), cargada con next/font
**Body Font:** Geist
**Label/Mono Font:** Geist Mono (con ui-monospace, SFMono-Regular, monospace)

**Character:** Una sans de rotulación técnica en mayúsculas apretadas para títulos y una mono de plano para todo lo que se lee como dato: ids, zonas, cifras, predicados y modelos.

### Hierarchy
- **Display** (600, 2,25 rem que sube a 3,75 rem desde md, interlineado 1, -0,02 em, mayúsculas): títulos de las secciones de lectura, sin nada encima.
- **Title** (600, 15 px, 0,02 em, mayúsculas): el nombre NEURAL CANVAS en la cabecera y en el pie, y los títulos de paso de «Cómo funciona».
- **Body** (400, 14 px, interlineado 1,65): texto de la fuente (máx. 65 ch), respuestas y preguntas sugeridas. En las secciones de lectura sube a 15 px con interlineado relajado y 56-60 ch.
- **Label** (600, 11 px, 0,08 em, mayúsculas): títulos de banda de celda y pestañas de móvil. Las etiquetas de campo y de cajetín usan 10-11 px, peso normal, 0,08 em, mayúsculas, en ink-3.
- **Mono** (400, 10-12 px, cifras tabulares): metadatos de banda, celdas de cajetín, reglas A-H y 1-6, predicados de arista, números de cita y la tabla de evals.

### Named Rules
**The Data Is Mono Rule.** Lo que es un identificador, una zona o una cifra va en Geist Mono con cifras tabulares; la prosa nunca.

**The Field Label Rule.** Las etiquetas en mayúsculas pequeñas existen solo como nombre de un campo o de una celda (cajetín, pie, columnas de tabla, campos de formulario), nunca como titular encima de un título.

## Layout

La primera pantalla es la lámina: alto 100dvh (mínimo 38 rem), enmarcada a 0,8 rem del borde desde md y rodeada por un filete de control. Dentro, una cabecera de 56 px (nombre, frase de valor, «Cómo funciona» y Código) y tres celdas:

- Escritorio (desde 80 rem): Fuente 22 rem, Grafo 1fr y Preguntas 24 rem.
- Tableta (48-80 rem): Grafo 1fr y Preguntas 20 rem; la Fuente es un cajón de 22 rem (máx. 85 %) sobre el grafo, con sombra dura, que se cierra con Escape. El contrato solo describía el escritorio.
- Móvil (por debajo de 48 rem): sin marco; dos pestañas («Grafo y preguntas» y «Fuente»). En la primera, el grafo y las preguntas se apilan (1,15fr y 1fr) para que el recorrido se vea mientras se escribe la respuesta.

Cada celda abre con una banda de cabecera de 40 px. En el Grafo, las reglas ocupan 20 px arriba y a la izquierda, la leyenda va abajo a la izquierda y el cajetín abajo a la derecha; el cajetín pasa a una sola fila compacta cuando el contenedor baja de 38 rem (consulta de contenedor).

Ritmo: 16 px de relleno en las celdas, 12 px a la izquierda de las bandas, 20/24 px de margen lateral en las secciones de lectura y 64/80 px sobre cada título de sección. Las retículas de lectura se construyen con huecos de 1 px sobre fondo de filete, de modo que los filetes salen solos.

## Elevation & Depth

La lámina es plana. La jerarquía la dan los filetes, las bandas en paper-2 y la tinta. La única sombra es una sombra dura desplazada, sin desenfoque, al 6 % de tinta, y solo en lo que flota sobre la lámina: el panel de la leyenda desplegada, la ficha de entidad, el aviso de extracción y el cajón de la fuente en tableta.

### Shadow Vocabulary
- **Sombra de lo que flota** (`box-shadow: 0.6rem 0.6rem 0 rgb(26 26 26 / 0.06)`): paneles superpuestos a la lámina. Se retira cuando el mismo elemento pasa a ser una celda (la fuente en escritorio).

### Named Rules
**The Only Floating Shadow Rule.** Una sola sombra, dura y desplazada 0,6 rem al 6 %, y solo en elementos flotantes. Nada que forme parte de la lámina lleva sombra.

## Shapes

Esquinas vivas. Paneles, celdas, campos, cajetín, leyenda y conmutadores de banda van a 0 px; botones, chips de cita y rótulos citados van a 3 px. Los nodos son círculos de foco invisibles bajo símbolos de tinta.

Los símbolos de entidad distinguen el tipo por la forma, nunca por el color: llenos para lo concreto (persona círculo, organización cuadrado, lugar triángulo, evento rombo), huecos para lo construido o abstracto (artefacto cuadrado, concepto círculo) y una cruz para «otro». El tamaño del símbolo codifica las conexiones.

**The State Is A Line Type Rule.** El estado de un nodo lo lleva el anillo: doble de 1 px para la semilla, discontinuo (1,25 px, trazo 2,5/2) para lo recorrido y continuo grueso (2 px) para lo citado. Las aristas siguen la misma gramática: discontinuas (4/3) cuando se recorren y continuas más gruesas (1,6 px) cuando unen dos citadas. La lima acompaña, nunca sustituye.

**The Hairline Rule.** Los paneles se separan con filetes de 1 px de tinta al 24 %; los controles se bordean con el filete de control. Solo el pie usa un filete de 2 px de tinta para cerrar la lámina.

## Components

### Buttons
Tinta firme, esquina de 3 px y un leve hundimiento al pulsar.
- **Shape:** 3 px; alto 36 px.
- **Primary:** relleno de tinta con texto en papel, 14 px de relleno lateral, 14 px peso 500.
- **Hover / Focus:** el relleno pasa a lima con el texto en tinta (150 ms); al pulsar baja 1 px. Foco: contorno de tinta de 2 px a 2 px de distancia, global para toda la interfaz. Deshabilitado: paper-2 con ink-3.
- **Secondary:** transparente con borde de filete de control y texto en tinta; hover en paper-2.
- **Tool:** 28 px cuadrado en las bandas, icono en ink-2, hover en papel con tinta; siempre con nombre accesible.
- **Conmutadores de banda:** 28 px de alto, mayúsculas de 11 px, borde de filete de control y esquinas a 0 px; pulsado en tinta con texto en papel. Las pestañas de móvil y el botón de la leyenda siguen la misma forma cuadrada.

### Chips
- **Cita en la respuesta:** número en mono de 11 px, peso 600, sobre lima, 3 px, alto 1,2 rem; sube 1 px al pasar. Al pulsar centra la cámara en su nodo.
- **Cita sin respaldo:** el mismo chip sin lima, con borde discontinuo de tinta y un «?»: cita una entidad que la recuperación no trajo.
- **Grabada:** marca de lima con texto en tinta en los metadatos de una respuesta grabada.

### Cards / Containers
- **Corner Style:** 0 px.
- **Background:** papel; las bandas de cabecera en paper-2.
- **Shadow Strategy:** solo los flotantes (ficha de entidad, leyenda, aviso de extracción, cajón de fuente), con la sombra dura.
- **Border:** filete de control alrededor de lo flotante y del cajetín; filetes de 1 px entre secciones internas.
- **Internal Padding:** 8-12 px en lo flotante, 16 px en las celdas.

### Inputs / Fields
- **Style:** fondo papel, borde de filete de control, 0 px, texto de 14 px; etiqueta de campo en mayúsculas de 11 px en ink-3 encima.
- **Focus:** contorno de tinta de 2 px pegado al campo (sin desplazamiento).
- **Drag / Error / Disabled:** al arrastrar un archivo, borde discontinuo de 2 px en tinta sobre paper-2; los errores son un recuadro de 1 px en tinta con texto en tinta, sin color; deshabilitado al 60 % de opacidad.

### Navigation
- **Cabecera de la lámina:** 56 px, nombre en Title, frase de valor en ink-2 de 13 px, enlaces de 13 px en tinta subrayados con el filete de control, que pasa a tinta al pasar. Icono de GitHub en SVG de 16 px.
- **Móvil:** la frase pasa a una segunda línea; las celdas se reparten en dos pestañas de banda.

### Cajetín (signature)
El bloque de título del plano, abajo a la derecha del grafo: retícula de celdas de 28 rem con borde de filete de control y filetes internos. Cada celda tiene una etiqueta de campo de 10 px en mayúsculas (Documento, Estado, Entidades, Relaciones, Modelo, Revisión) y su valor en 12 px, en mono si es dato. La celda ESTADO dice LISTO, EXTRAYENDO, RECORRIENDO, RESPONDIENDO, ERROR o SIN GRAFO; se rellena de lima mientras la IA trabaja, con la palabra siempre en tinta. En contenedores estrechos queda en una fila: Grafo, Revisión y Estado.

### Nodo y trazado (signature)
Cada nodo es un símbolo de tinta con su anillo de estado. Lo marcado lleva un halo lima (radio del símbolo + 9 px) que entra escalando en 220 ms; las aristas marcadas llevan una banda lima de 7 px bajo la línea, que se dibuja en 280 ms desde el nodo que se visitó antes. La selección se marca con cuatro asas cuadradas de 4 px en tinta, como en CAD. Las aristas en reposo van al 42 % de tinta y al 14 % cuando se atenúan; el predicado aparece en mono de 10 px sobre papel al enfocar un extremo. Curva de todo el movimiento: cubic-bezier(0.16, 1, 0.3, 1); con movimiento reducido, la banda aparece sin dibujarse.

### Revisión (signature)
Cada pregunta del hilo es una revisión del plano: un triángulo de tinta de 24 px con su número en mono, relleno de lima cuando es la revisión que se ve en la lámina y de papel cuando no. Debajo, los pasos del recorrido en 12 px con su número (S para la semilla) en mono.

## Do's and Don'ts

### Do:
- **Do** poner la lima solo como relleno bajo texto o líneas en tinta (#1a1a1a sobre #7fff00, 14,8:1).
- **Do** acompañar cada marca lima con una señal en tinta: anillo doble, discontinuo o continuo grueso, palabra de estado o número.
- **Do** separar celdas con filetes de 1 px de tinta al 24 % y bordear controles con #77756a.
- **Do** dejar paneles y campos a 0 px y botones y chips a 3 px.
- **Do** escribir ids, zonas y cifras en Geist Mono con cifras tabulares.
- **Do** limitar el movimiento a cambios de estado, con la curva cubic-bezier(0.16, 1, 0.3, 1).

### Don't:
- **Don't** usar la lima como color de texto, de icono o de borde fino sobre el papel: da 1,05:1.
- **Don't** dejar en lima, en reposo, nada que no esté citado.
- **Don't** usar otra sombra que `0.6rem 0.6rem 0 rgb(26 26 26 / 0.06)`, ni ponerla en algo que no flote.
- **Don't** añadir un tema oscuro: el papel beige está fijado.
- **Don't** distinguir tipos de entidad por color; el tipo es la forma del símbolo.
- **Don't** redondear paneles ni montar tarjetas tipo bento.
- **Don't** poner etiquetas en mayúsculas encima de los títulos de sección.

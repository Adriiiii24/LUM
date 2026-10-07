---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Surface brief: app/page.tsx

## Scope

Una sola ruta. El primer viewport es la herramienta (modo Operate); debajo, tres secciones de lectura (modo Read): «Cómo funciona», «Lo que se mide» y «Límites», y el pie.

## Audience and job

Quien llega desde el CV o el portfolio de Adrián. Los recruiters tienen que entender qué hace y verlo funcionar sin pegar nada; los técnicos, comprobar el mecanismo. Tarea: ver la muestra, preguntar (sugerida o libre), ver el recorrido y las citas sobre la lámina y, si quieren, pegar su propio texto.

## Proof and content

Muestra real: extracto de «Apolo 11» (Wikipedia en español, CC BY-SA 4.0), su extracción grabada de Gemini y respuestas grabadas, etiquetadas como grabadas. Las evals solo muestran números de `evals/results/latest.json`.

## Constraints

- Paleta fijada por el usuario: papel #EDE8D0, tinta #1A1A1A, lima #7FFF00.
- La lima sobre el papel da 1,05:1: nunca es texto ni la única señal de un estado.
- Solo tema claro, porque el fondo beige está fijado en el brief.
- Esquinas de 0 a 3 px (decisión del usuario: Heron real).

## Memorable moment

Al preguntar, el recorrido se traza en lima salto a salto sobre la lámina, y cada cita enciende su nodo mientras se escribe.

## Unresolved

- Protección de la cuota pública.
- Destino de despliegue.
- Licencia del código.
- Gold set revisado por Adrián.

## Direction contract

THESIS: El grafo es una lámina técnica y la IA la revisa como un delineante. La lima solo marca lo que el recuperador recorrió y lo que la respuesta cita, igual que Heron marca en rojo las infracciones. Rechaza el bento redondeado de SaaS y la constelación oscura con neón.

OWN-WORLD: Papel #EDE8D0, tinta #1A1A1A, lima #7FFF00 solo como relleno bajo o tras la tinta. Filetes de 1 px de tinta al 24 % separan celdas. Paneles y campos a 0 px; botones y chips a 3 px. Sombra dura 0.6rem sin desenfoque solo en lo que flota. Geist en mayúsculas apretadas para títulos y Geist Mono para ids, zonas y cifras. Símbolos de entidad por tipo, asas de selección de CAD, reglas A-H por 1-6 y cajetín.

STORY: La visita ve una lámina con un grafo real y su cajetín. Pulsa una pregunta sugerida y ve el recorrido trazarse y las citas encender nodos, cada una ligada a su frase en la fuente. Entiende que la respuesta está anclada. Baja y ve cómo funciona, qué se mide y qué no hace.

FIRST VIEWPORT:
- Lámina enmarcada a 0.8rem del borde, de alto 100dvh menos 1.6rem.
- Cabecera de 56 px: NEURAL CANVAS, una frase de valor, «Cómo funciona» y GitHub.
- Tres celdas: Fuente (22rem), Grafo (1fr), Preguntas (24rem), cada una con una banda de cabecera de 40 px.
- En el Grafo: reglas, leyenda abajo a la izquierda y cajetín abajo a la derecha, con la celda ESTADO.
- Acción principal: las preguntas sugeridas. Interacción firma: el trazado del recorrido; movimiento solo de estado, de 150 a 250 ms.

FORM: «Plano técnico (Heron real)», fijado por el usuario. En mi lista estaba en la posición 2; la tirada asignó la 6. Semilla 2306a28b.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

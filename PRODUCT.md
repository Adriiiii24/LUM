# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Dictado por el usuario en el brief del 2026-10-07, con cuatro desviaciones justificadas:

- **Next.js 16** (App Router) en vez de 15: la 16.4 es la estable y la que genera `create-next-app`; FOLIO ya usa la 16. El usuario confirmó el plan con este cambio el 2026-10-07.
- **`@xyflow/react` 12 + `d3-force`** en vez de `react-flow-renderer`, que está marcado como obsoleto en npm desde 2022. React Flow no trae layout de fuerzas, así que lo calcula `d3-force`.
- **Gemini 3.x** en la capa gratuita, con AI SDK 7 (`ai`, `@ai-sdk/google`, `@ai-sdk/react`), en vez de Gemini 1.5 Flash, que ya no está en la API. Por defecto `gemini-3.5-flash` con `gemini-3.5-flash-lite` de reserva: `gemini-3.8-flash` estuvo saturado en todas las pruebas del 2026-10-07. Los ids van en variables de entorno.
- **Grafo en memoria por sesión** (Zustand) en vez de Neo4j AuraDB Free, opción que el brief ya permitía. La instancia gratuita se pausa tras 72 h sin consultas y se borra a los 30 días pausada.

Resto: React 19, TypeScript estricto, Tailwind CSS 4, Motion (antes Framer Motion) y Zod 4. Evals de extracción en Python (decisión del usuario, 2026-10-07), ejecutadas en CI.

Despliegue: sin confirmar.

## Users

Primario: quien abre el enlace desde el CV o el portfolio de Adrián. Dos perfiles:

- **Recruiters y responsables de contratación.** Escanean deprisa. Tienen que entender qué hace y verlo funcionar en el primer pantallazo, sin pegar nada.
- **Entrevistadores técnicos y AI engineers.** Buscan el mecanismo, el código, las evals y los límites dichos con honestidad.

Secundario: cualquiera que quiera convertir un texto (un manual técnico, un relato) en un grafo navegable y hacerle preguntas.

## Product Purpose

Neural Canvas convierte un texto pegado en un grafo de conocimiento. Gemini extrae entidades y relaciones con salida estructurada, la app lo dibuja como una constelación interactiva y un chat en streaming responde preguntas sobre él, enseñando en el propio grafo qué conocimiento recorrió y cuál citó.

Éxito:

- Una visita entiende qué hace en el primer pantallazo y ve el mecanismo funcionar sobre la muestra sin gastar cuota.
- Un revisor técnico puede comprobar que cada nodo encendido es verdad (recorrido o citado) y ver la calidad de la extracción medida, no afirmada.
- Es el cuarto proyecto del portfolio y cubre el hueco de Python y evals.

## Positioning

Recuperación explicable. Lo que se ilumina en el lienzo es literalmente el recorrido del recuperador, salto a salto y en streaming, y las citas que el modelo escribe en la respuesta, que encienden su nodo mientras se escriben. Cada nodo y cada relación remite a la frase del texto de la que salió. La calidad de la extracción está medida con un banco de evaluación en Python sobre textos anotados a mano.

Vecino más cercano: Neo4j LLM Knowledge Graph Builder. Ya extrae grafos con LLMs y su chat GraphRAG devuelve metadatos de las fuentes usadas. Lo que Neural Canvas reclama como propio es la traza en vivo sobre el lienzo, la trazabilidad a la frase de origen y la calidad medida. No se ha comprobado en detalle cómo presenta Graph Builder esos metadatos.

## Operating Context

- Se llega desde un enlace del CV o del portfolio. Sobre todo en escritorio, también en móvil.
- El primer pantallazo trae un grafo de muestra real: un texto con licencia limpia, su extracción grabada de Gemini y respuestas grabadas a dos o tres preguntas sugeridas, etiquetadas como grabadas. No gasta cuota.
- Uso propio: pegar un texto o soltar un .txt o .md, extraer, explorar el grafo (zoom, pan, arrastre) y preguntar en el chat.
- Debajo de la app, una explicación del pipeline, sus límites y los resultados de las evals.
- La capa gratuita de Gemini tiene cuotas por minuto y por día que la documentación no publica (se consultan en AI Studio), y Google usa lo enviado en esa capa para mejorar sus productos.
- El grafo vive en el navegador de cada visita. El servidor no guarda textos ni grafos.
- Interfaz en español. Inferido de los proyectos anteriores; falta confirmar si se quiere también en inglés.

## Capabilities and Constraints

Confirmado:

- Ingesta pegando texto o soltando un .txt o .md. El PDF queda fuera del MVP.
- Extracción con salida estructurada validada por un esquema Zod estricto: nodos (entidades) y aristas (relaciones), cada uno con la cita literal del texto que lo justifica.
- Lienzo con zoom, pan y arrastre. Los nodos reaccionan al hover y a los eventos del chat.
- Chat en streaming. La iluminación sale de dos señales verdaderas: el recorrido del recuperador (semillas y saltos, enviados como partes de datos en el stream) y las citas de nodo dentro del texto de la respuesta. Una sola llamada a Gemini por pregunta.
- Almacén de grafo en memoria por sesión, detrás de una interfaz que admita Neo4j más adelante.
- Banco de evals en Python con textos anotados a mano. Mide precisión, recall y F1 de entidades y relaciones, la tasa de citas literales que existen de verdad en el texto y la validez del esquema. Corre en CI sobre salidas grabadas; regrabarlas exige clave y es manual.
- Coste cero: capa gratuita de Gemini, hosting gratuito y CI de repositorio público.

Decidido en la construcción (2026-10-07):

- Máximo de 12.000 caracteres por texto, sin trocear todavía.
- Muestra: introducción de «Apolo 11», Wikipedia en español (CC BY-SA 4.0), grabada con llamadas reales.
- Límite aproximado por IP y por instancia en las dos rutas.

Abierto:

- Modelo y razonamiento de extracción definitivos, a decidir con las evals.
- Protección compartida de la cuota pública: un servicio externo gratuito o la clave propia del visitante.
- Destino de despliegue y licencia del código.

Terminología: nodo = entidad; arista = relación; recorrido = la traza de la recuperación sobre el grafo; cita = referencia a un nodo dentro de la respuesta.

## Brand Commitments

Fijado por el usuario en el brief del 2026-10-07 y registrado sin ampliar:

- Nombre: Neural Canvas.
- Fondo principal `#EDE8D0`. Acento `#7FFF00` «de forma quirúrgica»: botón principal, badges de estado, brillo de los nodos activos y microinteracciones. Tinta `#0F0F0F` o `#1A1A1A` para texto, bordes y tipografía.
- Referencia: Heron AI (heronaiapp.com), por su sofisticación, su minimalismo corporativo y su fluidez.
- Tarjetas tipo bento con esquinas suavemente redondeadas, sombras muy sutiles y bordes de 1 px semitransparentes. Grano de ruido si mejora el resultado.
- Sans geométrica de alta legibilidad: Geist Sans, Inter o Satoshi.

Pendiente: el brief describe Heron como un bento redondeado con sombra suave. El Heron real usa esquinas de 0 a 3 px, filetes de 1 px, sombras duras sin desenfoque y un único acento que marca lo que ha encontrado la IA. Hay que decidir qué lectura manda; se decide en la ronda de dirección visual.

## Evidence on Hand

- **Muestra grabada:** `data/sample/sample.json`, con 26 entidades, 33 relaciones y tres respuestas de Gemini reales.
- **Conjunto de referencia:** tres textos originales anotados en `evals/gold/`. Son borradores, sin la revisión de Adrián.
- **Primera ejecución de evals:** provisional y sin publicar (ver `docs/ARCHITECTURE.md`).
- **Ausencias:** no hay logo definitivo (el icono es provisional) ni capturas para el README.

No se inventan métricas, usuarios ni benchmarks. La web solo publica resultados de evals con la referencia revisada.

## Product Principles

1. **Lo que se ilumina es verdad.** Un nodo solo se enciende si el recuperador lo recorrió o la respuesta lo cita. Nunca por efecto.
2. **Todo remite a su origen.** Cada nodo, relación y cita lleva a la frase del texto de la que salió.
3. **Calidad medida, no afirmada.** La extracción se juzga con evals, y la web solo muestra números que salen de ellas.
4. **La demo nunca está rota.** La muestra funciona sin cuota ni clave. Si la cuota se agota, la app lo dice y la muestra sigue funcionando.
5. **El texto del visitante es suyo.** El servidor no lo guarda, y la app avisa de que la capa gratuita de Gemini usa lo enviado.

## Accessibility & Inclusion

- WCAG 2.2 AA.
- Restricción medida: `#7FFF00` sobre `#EDE8D0` da 1,05:1. La lima no puede ser texto ni la única señal de un estado sobre el fondo. La tinta sobre lima da 14,8:1 y la tinta sobre el fondo, 15,6:1. Todo estado iluminado necesita además una señal que no dependa del color.
- El grafo tiene que poder recorrerse con teclado y tener una alternativa no visual: la lista de entidades y relaciones, y las citas de la respuesta como enlaces que enfocan su nodo.
- Con movimiento reducido, el recorrido se muestra como cambios de estado, sin animación.

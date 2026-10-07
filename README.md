# Neural Canvas

Convierte un texto en un grafo de conocimiento y, al responder preguntas sobre él, marca en el propio grafo qué recorrió y qué citó.

Lo que se ilumina no es decoración. Es el recorrido real del recuperador, salto a salto, y las citas que el modelo escribe en la respuesta. Cada entidad remite a la frase del texto de la que salió, y la calidad de la extracción se mide con un banco de evals en Python.

## Cómo funciona

```
texto ─► /api/extract ─► Gemini, salida estructurada con un esquema Zod ─► normalización ─► grafo
                                                       (fusión de duplicados, ids, anclaje de citas)

pregunta ─► /api/chat ─► recuperación por saltos, sin modelo ─► data-trace ─► la lámina dibuja el recorrido
                              └─► contexto con citas literales ─► Gemini en streaming ─► [[n5]] ─► cada cita enciende su nodo
```

1. **Extraer.** `generateText` del AI SDK 7 con `Output.object` y un esquema plano (`lib/graph/schema.ts`). Gemini devuelve entidades y relaciones, cada una con una cita literal del texto.
2. **Anclar.** Cada cita se busca en el original, tolerando espacios, saltos de línea y comillas (`lib/graph/normalize.ts`). La que no aparece queda marcada «sin anclaje».
3. **Recorrer.** Semillas por coincidencia de nombres con la pregunta y expansión en anchura de hasta dos saltos, ordenada por cuánto toca cada arista la intención de la pregunta (`lib/graph/retrieve.ts`). Es determinista y no usa ningún modelo.
4. **Citar.** El recorrido viaja como partes `data-trace` antes que el texto. El modelo responde solo con lo recuperado y cita ids de entidad, y cada cita se convierte en una nota que enciende su nodo mientras se escribe (`lib/chat/citations.ts`).

## Decisiones

- **Una llamada a Gemini por pregunta**, sin agente con herramientas. La recuperación es un algoritmo, así que lo que se ve es comprobable.
- **Modelo con reserva.** Por defecto `gemini-3.5-flash`. Si responde 503 o 429, se reintenta con `gemini-3.5-flash-lite`, que tiene cuota gratuita propia. Los ids van en variables de entorno.
- **Sin `maxItems` en el esquema.** Con valores altos, Gemini responde 400 «invalid argument». Los límites (60 entidades y 120 relaciones) van en el prompt y los aplica la normalización.
- **Grafo en el navegador.** El servidor no guarda nada. Neo4j AuraDB Free se descartó porque se pausa a las 72 horas sin consultas.
- **La demo nunca está rota.** La portada usa una muestra grabada de llamadas reales (`data/sample/sample.json`), reproducida por el mismo camino que una respuesta en vivo y etiquetada como grabada.

Más detalle en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). El producto y sus principios están en [`PRODUCT.md`](PRODUCT.md).

## En local

Hace falta Node 24.11 o posterior y una clave de la API de Gemini (la capa gratuita basta).

```sh
npm install
cp .env.example .env.local   # pon tu clave en GOOGLE_GENERATIVE_AI_API_KEY
npm run dev
```

| Variable | Para qué |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Clave de Gemini. Solo la usa el servidor. |
| `NC_EXTRACT_MODEL`, `NC_CHAT_MODEL` | Modelo principal de cada tarea (`gemini-3.5-flash`). |
| `NC_EXTRACT_FALLBACK_MODEL`, `NC_CHAT_FALLBACK_MODEL` | Modelo de reserva (`gemini-3.5-flash-lite`). |
| `NC_EXTRACT_THINKING` | Razonamiento de la extracción: `low` o `medium` (por defecto). |
| `NC_EXTRACT_PER_HOUR`, `NC_CHAT_PER_HOUR` | Límite aproximado por IP y por instancia (8 y 40). |

| Comando | Qué hace |
|---|---|
| `npm test` | Pruebas de normalización, recuperación, layout y citas (`node --test`). |
| `npm run typecheck`, `npm run lint`, `npm run build` | Tipos estrictos, ESLint y compilación de producción. |
| `npm run record:sample` | Regraba la muestra con llamadas reales. Necesita la app en marcha y `BASE_URL`. |
| `npm run sample:relayout` | Recalcula solo el layout de la muestra, sin llamar a la API. |
| `npm run evals:export` | Graba ejecuciones del pipeline sobre los textos de referencia. |

## Evals

En [`evals/`](evals/README.md) hay un proyecto en Python, gestionado con `uv`. Compara la extracción con textos anotados a mano y mide:

- precisión, exhaustividad y F1 de entidades y relaciones;
- exactitud de tipo;
- anclaje de citas y validez del esquema.

Puntúa ejecuciones grabadas, así que corre en CI sin llamar al modelo.

La web solo publica resultados cuando los textos de referencia están revisados por una persona. Los tres actuales son borradores.

## Límites

- La capa gratuita de Gemini tiene cuotas no publicadas, y Google puede usar lo que se le envía para mejorar sus productos. La interfaz lo avisa.
- Hasta 12.000 caracteres por texto. Los textos largos todavía no se trocean.
- Las semillas salen de coincidencias de palabras, no de embeddings.
- No es el GraphRAG de Microsoft: no detecta comunidades ni escribe resúmenes jerárquicos.

## Créditos y licencias

- El texto de la muestra es la introducción de «Apolo 11» de la Wikipedia en español, bajo CC BY-SA 4.0. Ver [`data/sample/ATTRIBUTION.md`](data/sample/ATTRIBUTION.md).
- Los textos de `evals/gold/` son originales, escritos para este banco.
- Licencia del código: por decidir.

Hecho por Adrián Martínez Panés con Next.js 16, React 19, Tailwind 4, React Flow, d3-force, Motion, AI SDK 7, Zod y Gemini.

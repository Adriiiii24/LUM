# Neural Canvas: arquitectura

Versión 1.0, 2026-10-08: lo construido. El plan de la Fase 0 (2026-10-07) está en el historial de este fichero. Producto y principios en [`PRODUCT.md`](../PRODUCT.md).

## 1. Qué está verificado

- **Pruebas en TypeScript:** 12, con `node --test`. Cubren normalización, anclaje de citas, recuperación (semillas, saltos, presupuestos, palabra entera, caso sin coincidencias), contexto, layout determinista y parser de citas en streaming.
- **Pruebas en Python:** 8 del banco de evals, con `pytest`.
- **Compilación y estilo:** `tsc --noEmit` en modo estricto (con `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` y `erasableSyntaxOnly`), ESLint con las reglas del compilador de React y `next build`.
- **Llamadas reales a Gemini:**
  - la muestra de la portada (extracción más tres respuestas);
  - tres ejecuciones de evals;
  - pruebas de esquema y de modelos (sección 13).
- **Interfaz:**
  - el detector de Impeccable no da ningún hallazgo;
  - pasó tres rondas de revisión final con capturas de escritorio y de móvil.

## 2. El sistema

```
INGESTA     texto ─► /api/extract ─► Gemini, salida estructurada (Zod) ─► normalize ─► grafo (en el navegador)
                                                                                       └─► layout d3-force ─► lámina

PREGUNTA    pregunta + grafo + texto ─► /api/chat ─► retrieve: semillas + saltos, sin LLM
                                                    ├─► partes data-trace ─► la lámina traza el recorrido
                                                    └─► contexto con citas ─► Gemini en streaming ─► [[nX]] ─► cada cita enciende su nodo
```

Una llamada a Gemini por extracción y otra por pregunta. El servidor no guarda nada: el grafo vive en el navegador y viaja con cada pregunta.

## 3. Decisiones

| Tema | Decisión | Motivo |
|---|---|---|
| Framework | Next.js 16.4 (App Router, Cache Components) | La estable. `/` se prerenderiza como estática y las rutas de API son dinámicas. |
| Grafo visual | `@xyflow/react` 12 + `d3-force` | Nodos DOM accesibles y con estilo propio. El layout de fuerzas se calcula una vez y es determinista. |
| Modelos | `gemini-3.5-flash`, con `gemini-3.5-flash-lite` de reserva | `gemini-3.8-flash` respondió 503 «high demand» en todas las pruebas estructuradas del 2026-10-07. Ante 503 o 429, la reserva (con cuota propia) entra sola. |
| Razonamiento de la extracción | `medium` por defecto (`NC_EXTRACT_THINKING`) | Medido en la muestra: `low` dio 19 entidades y 20 relaciones en 10 s; `medium`, 29 y 37 en 35 s. Las evals deciden en adelante. |
| Esquema | Plano, sin uniones, opcionales ni `maxItems` | Gemini rechaza `maxItems` altos con 400. Los límites van en el prompt y en `normalize`. |
| Iluminación | Recorrido del recuperador + citas en el texto | El modelo no expone qué usa; solo se ilumina lo que se puede demostrar. |
| Almacén | Zustand por instancia (contexto de React), en el navegador | Sin estado compartido entre peticiones en el servidor. Neo4j AuraDB Free se pausa a las 72 h. |
| Estética | «Plano técnico (Heron real)» | Elección del usuario: esquinas rectas, filetes de 1 px, lima solo como marca de revisión. |

## 4. Repositorio

```
app/
  layout.tsx, page.tsx, globals.css (tokens @theme), icon.svg (provisional)
  api/extract/route.ts            POST { text } -> { graph, text }
  api/chat/route.ts               POST { messages, graph, source } -> stream UI con data-trace
components/
  workbench/                      Workbench (marco y celdas), Masthead, PanelHeader
  canvas/                         GraphCanvas, EntityNode, RelationEdge, LabelLayer, Rulers, TitleBlock,
                                  Legend, EntityCard, EntityList, ExtractingOverlay, EntitySymbol
  source/                         SourcePanel (editor y vista), SourceText (citas marcadas)
  chat/                           ChatPanel, AnswerText (notas de cita), RevisionMark
  explain/                        HowItWorks, Evals, Limits, SiteFooter, SectionHead
  ui/Button.tsx
lib/
  graph/   schema.ts, normalize.ts, retrieve.ts, layout.ts, text.ts (+ graph.test.ts)
  chat/    citations.ts (+ test), transport.ts (muestra grabada o en vivo), types.ts, error-copy.ts
  ai/      models.ts, prompts.ts, errors.ts, stream-with-fallback.ts
  state/   workbench.ts
  sample/  types.ts, load.ts
  server/  rate-limit.ts
  evals/types.ts, site.ts
data/sample/                      source.txt, sample.json (grabado), ATTRIBUTION.md
scripts/                          record-sample.ts, relayout-sample.ts, export-eval-runs.ts
evals/                            banco de evals en Python (uv)
.github/workflows/ci.yml
```

## 5. El esquema

Está en [`lib/graph/schema.ts`](../lib/graph/schema.ts) y tiene dos capas:

- **`ExtractionSchema`:** lo que Gemini tiene que devolver.
  - Entidades con `key`, `name`, `type`, `aliases`, `description` y `evidence`.
  - Relaciones con `source`, `target`, `predicate` y `evidence`.
  - Los tipos son cerrados (persona, organización, lugar, artefacto, concepto, evento, otro), y cada uno tiene su símbolo.
- **`KnowledgeGraphSchema`:** el grafo de dominio después de normalizar.
  - Ids compactos (`n12`, `e7`), que son los que cita el modelo.
  - `evidence` como posición confirmada en el texto, o `null` si no aparece.
  - El grado de cada entidad.
  - `/api/chat` lo valida con límites estrictos al recibirlo.

## 6. Extracción: `/api/extract`

1. **Límites y validación.** Límite aproximado por IP (8 por hora y por instancia). El texto se valida: de 200 a 12.000 caracteres.
2. **Llamada al modelo.** `generateText` con `Output.object`, `thinkingLevel` configurable y `maxRetries: 1`. Ante 503 o 429 se repite la llamada con el modelo de reserva.
3. **`normalizeExtraction`:**
   - funde duplicados (misma clave, nombre o alias normalizado);
   - asigna ids;
   - descarta aristas colgantes, bucles y repetidas;
   - recorta a 60 entidades y 120 relaciones;
   - ancla cada cita;
   - calcula el grado.
4. **Errores tipados:** `texto_invalido` (400), `cuota_agotada` (429 o 503), `salida_invalida` (`NoObjectGeneratedError`) y `error_modelo`. El registro nunca incluye texto del usuario.
5. **Layout en el cliente.** `layoutGraph` funciona con semilla fija: el mismo grafo da siempre la misma lámina. La muestra lo trae precalculado.

## 7. Recuperación y chat: `/api/chat`

- **Validación.** Cuerpo con Zod y mensajes con `validateUIMessages`. El esquema de metadatos tiene que ser opcional, porque los mensajes del usuario no llevan metadatos; sin eso, cualquier pregunta da 400.
- **Recuperación** (`lib/graph/retrieve.ts`):
  1. Primero, los nombres o alias completos que aparecen en la pregunta, como palabra entera; esos nombres consumen sus palabras.
  2. Después, las coincidencias parciales con las palabras libres.
  3. La intención es la pregunta sin los nombres de las semillas.
  4. Se expande en anchura, hasta dos saltos y en los dos sentidos.
  5. Los vecinos se ordenan por cuántas palabras de la intención tocan y, a igualdad, por grado.
  6. Presupuesto: 3 semillas, 24 nodos y 40 aristas.
  7. Si nada coincide, se parte de los nodos más conectados, y el recorrido lo dice.
- **Stream:**
  - primero un `data-trace` por paso;
  - después la respuesta de `streamWithFallback`, que lee hasta el primer fragmento de texto y, si llega un 503 o un 429 antes, cambia al modelo de reserva (una respuesta nunca mezcla modelos);
  - la respuesta se funde con `toUIMessageStream`, y los metadatos (modelo, entidades en contexto, `fallback`) van en el fragmento final.
- **Prompt:**
  - solo el contexto;
  - cada afirmación con su cita `[[nX]]`;
  - si falta información, decir que el grafo no la recoge, sin opinar sobre el texto completo (una versión anterior afirmó en falso que el texto no mencionaba la Guerra Fría).
- **En el cliente:**
  - `useChat` con id fijo (sin él genera uno aleatorio en el prerender y Next lo rechaza);
  - `NeuralTransport` reproduce las respuestas grabadas de la muestra por el mismo camino que las reales;
  - `segmentAnswer` parte el texto según llega, retiene citas a medio escribir y marca las que apuntan fuera del contexto.

## 8. Estado y lámina

- **Almacén** (`lib/state/workbench.ts`):
  - Por instancia, creado con la muestra: la página se prerenderiza ya con el grafo.
  - Cada nodo y arista tiene un estado derivado (`idle`, `dim`, `seed`, `traversed`, `cited`) y se suscribe solo al suyo.
  - **Mientras se recorre y se escribe** (`tracing`), todo lo visitado se marca en lima.
  - **Al terminar**, la lima queda solo en lo citado.
- **Ritmo:** cada salto del recorrido se dibuja en 280 ms y el siguiente empieza a los 420 ms. Con movimiento reducido, todo aparece de golpe.
- **Rótulos** (`LabelLayer.tsx`):
  - Una sola capa sobre todos los símbolos, con fondo de papel que interrumpe las aristas.
  - Un planificador coloca por prioridad: citados, foco, semillas, el nodo principal, recorridos y el resto.
  - Prueba ocho posiciones y, si el nombre completo no cabe, el alias más corto. Nunca sale de la zona visible.
  - Su tamaño en pantalla nunca baja de unos 11 px (`--nc-zoom`).
- **Lámina:**
  - reglas A-H × 1-6 y retícula de zonas que siguen el pan y el zoom;
  - cajetín ancho y bajo, con la celda ESTADO;
  - leyenda plegada;
  - vista de lista accesible;
  - ficha de entidad con su cita;
  - navegación por teclado entre nodos (Tab y flechas).
- **Por ancho de pantalla:**
  - móvil: grafo y preguntas apilados, y la fuente aparte;
  - tableta: la fuente es un cajón;
  - escritorio: tres columnas.

## 9. Muestra

- **Contenido de `data/sample/sample.json`:**
  - el texto («Apolo 11», Wikipedia, CC BY-SA 4.0);
  - el grafo extraído por la API real;
  - el layout;
  - tres respuestas grabadas, con sus tiempos (las pausas de más de 1,5 s se acortan).
- **Regrabarla:** `npm run record:sample`. Con `REUSE_GRAPH=1` reutiliza la última extracción.
- **La extracción no es determinista.** Las grabaciones dieron entre 20 y 29 entidades en pruebas distintas; la muestra actual tiene 26 entidades y 33 relaciones, todas ancladas.

## 10. Evals

En [`evals/`](../evals/README.md):
- `gold/` contiene textos originales anotados a mano y aún sin revisar;
- `runs/` contiene las ejecuciones grabadas por `scripts/export-eval-runs.ts` a través de la API;
- `nc_evals` hace la alineación con `rapidfuzz` y calcula métricas micro.

**Primera ejecución** (2026-10-08, `gemini-3.5-flash` con `medium`, 3 documentos):

| Métrica | Resultado |
|---|---|
| Entidades | F1 0,865 (P 0,821, R 0,914) |
| Tipo | 0,969 |
| Relaciones laxas | F1 0,722 |
| Relaciones estrictas | F1 0,583 |
| Anclaje | 1,0 |
| Esquema | 1,0 |
| Mediana de latencia | 14,9 s |

Son provisionales: la referencia no está revisada y la web no los publica (`goldReviewed: false`).

## 11. Cuota, abuso y privacidad

- **Cuota:** la capa gratuita tiene cuotas no publicadas. Ante un 429, la interfaz lo explica y la muestra sigue funcionando.
- **Límite por IP:** es aproximado, cada instancia lleva su propia cuenta. Un límite compartido (Upstash, firewall de Vercel o clave propia del visitante) sigue siendo una decisión abierta.
- **Aviso al usuario:** junto al botón de extraer, que Google usa lo enviado en la capa gratuita.
- **Servidor:** no persiste ni registra textos.

## 12. Pruebas y CI

- **Job web:** `npm ci`, lint, typecheck, tests y build.
- **Job evals:** `uv sync --locked`, pytest y `nc-evals score --check`, que falla si falta una ejecución.
- **Pendiente:** comprobar en la primera CI que `npm ci` funciona en Linux con el lockfile generado en Windows con npm 11.17.

## 13. Hallazgos de la implementación

| Hallazgo | Consecuencia |
|---|---|
| `maxItems: 60/120` en la salida estructurada → Gemini 400 «Request contains an invalid argument» (con `max(5)` funciona) | Límites en prompt y normalización |
| `gemini-3.8-flash`: 503 «high demand» repetido en llamadas estructuradas; `gemini-3.5-flash` estable | Modelos por defecto y reserva |
| `validateUIMessages` con `metadataSchema` exige metadatos también en los mensajes del usuario | Esquema `.optional()` |
| `useChat` sin `id` y `Date.now()` en el estado inicial rompen el prerender de Cache Components | Id fijo y reloj iniciado en el cliente |
| La primera respuesta afirmó algo falso sobre el texto completo | Prompt: hablar del grafo, no del texto |
| En esta máquina, `timeout … npx tsc` dentro de Git Bash terminaba sin salida y con código 0 aunque hubiera errores | Comprobar siempre con `npm run typecheck`, validado con un error a propósito |

## 14. Pendientes

- **Revisión del gold set:** revisar los tres textos de referencia (`"reviewed": true`) y añadir más, de 10 a 15.
- **GitHub:** crear el repositorio `Adriiiii24/neural-canvas`; `lib/site.ts` ya lo enlaza.
- **Por decidir:** destino de despliegue, licencia del código, protección compartida de la cuota e icono definitivo (el actual es provisional).

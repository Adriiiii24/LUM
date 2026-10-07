# Evals de extracción

Mide si `/api/extract` saca las entidades y relaciones correctas de un texto. Compara la salida con textos anotados a mano y no llama a ningún modelo al puntuar, así que corre en CI.

## Qué se mide

| Métrica | Qué significa |
|---|---|
| Entidades P / R / F1 | Precisión, exhaustividad y F1. Una entidad extraída acierta si su nombre o un alias se parece al de una de referencia (similitud ≥ 88 tras normalizar), con emparejamiento uno a uno. |
| Exactitud de tipo | De las entidades emparejadas, cuántas tienen el tipo correcto. |
| Relaciones laxas | La relación une las dos entidades correctas, en cualquier sentido. |
| Relaciones estrictas | Mismo sentido y predicado parecido (similitud ≥ 70). |
| Anclaje | Proporción de citas que existen de verdad en el texto. |
| Esquema | Proporción de ejecuciones que devolvieron un grafo válido. |

Las sumas son micro: se agregan los aciertos de todos los documentos antes de dividir.

## Flujo

1. **Anotar.** Cada documento de `gold/` es un texto con sus entidades y relaciones anotadas a mano (guía abajo). Mientras no tenga `"reviewed": true`, la web no publica resultados.
2. **Grabar ejecuciones.** Con la app en marcha y la clave en `.env.local`:
   ```sh
   # en la raíz del proyecto; sube el límite por IP para esta sesión
   NC_EXTRACT_PER_HOUR=200 npm run dev
   BASE_URL=http://localhost:3000 npm run evals:export
   ```
   Se escribe un JSON por documento en `runs/<modelo>-<razonamiento>/`. Para comparar configuraciones, repite cambiando `NC_EXTRACT_MODEL` o `NC_EXTRACT_THINKING` en el servidor.
3. **Puntuar.**
   ```sh
   cd evals
   uv run nc-evals score
   ```
   Escribe `results/latest.json`, que la sección «Lo que se mide» de la web lee al compilar.

## Guía de anotación

- **Entidades:** todo lo que el texto nombra y participa en al menos una relación. Personas, organizaciones, lugares, artefactos (naves, máquinas, productos, documentos, obras), conceptos y eventos.
- **Una entidad por referente.** Las otras formas del nombre van en `aliases`.
- **Fechas y cifras** no son entidades, salvo que el texto las trate como protagonistas.
- **Relaciones:** solo las que el texto afirma de forma explícita. `source` y `target` son nombres de entidades del mismo documento; `predicate` es un verbo o frase verbal corta en minúsculas.
- **Nada de conocimiento externo**, aunque sea cierto.
- **Revisión:** cuando revises un documento entero, pon `"reviewed": true`. Un conjunto anotado por un modelo y sin revisar no mide nada.

## Estado

Los tres documentos de `gold/` son borradores (`"reviewed": false`). Los textos son originales, escritos para este banco, así que no tienen problemas de licencia. Hacen falta más documentos y la revisión humana antes de publicar números.

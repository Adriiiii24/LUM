import { z } from 'zod';

/** Tipos cerrados: cada uno tiene su símbolo en la lámina, así el tipo nunca depende del color. */
export const ENTITY_TYPES = ['persona', 'organizacion', 'lugar', 'artefacto', 'concepto', 'evento', 'otro'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export const MIN_SOURCE_CHARS = 200;
export const MAX_SOURCE_CHARS = 12_000;
export const MAX_ENTITIES = 60;
export const MAX_RELATIONS = 120;

/*
 * Lo que Gemini tiene que devolver. Es plano a propósito: sin uniones, sin records y sin
 * opcionales, porque la salida estructurada de Gemini admite un subconjunto de JSON Schema.
 * Tampoco lleva maxItems: con valores altos (60, 120) Gemini responde 400 «invalid argument»
 * (comprobado el 2026-10-07 con gemini-3.5-flash). Los límites van en el prompt y los aplica
 * normalize.ts, igual que todo lo que el esquema no puede garantizar: claves únicas, aristas
 * colgantes y citas que existan de verdad en el texto.
 */
export const ExtractedEntitySchema = z.object({
  key: z.string().describe('Clave en snake_case, única en este grafo. Ejemplo: marie_curie'),
  name: z.string().describe('Nombre canónico, tal como aparece en el texto'),
  type: z.enum(ENTITY_TYPES).describe('Tipo de entidad'),
  aliases: z.array(z.string()).describe('Otras formas en que el texto nombra a la entidad. Vacío si no hay'),
  description: z.string().describe('Una frase con información que esté en el texto, sin conocimiento externo'),
  evidence: z.string().describe('Cita literal y exacta de una frase del texto que menciona la entidad'),
});

export const ExtractedRelationSchema = z.object({
  source: z.string().describe('key de la entidad origen'),
  target: z.string().describe('key de la entidad destino'),
  predicate: z.string().describe('Verbo o frase verbal corta, en minúsculas. Ejemplo: descubrió'),
  evidence: z.string().describe('Cita literal y exacta de la frase del texto que justifica la relación'),
});

export const ExtractionSchema = z.object({
  entities: z.array(ExtractedEntitySchema),
  relations: z.array(ExtractedRelationSchema),
});
export type Extraction = z.infer<typeof ExtractionSchema>;

/*
 * Grafo de dominio, después de normalizar. Los ids compactos (n1, e1) son los que el modelo
 * cita en el chat: cortos para gastar pocos tokens y fáciles de validar.
 */
export const NodeIdSchema = z.templateLiteral(['n', z.number().int().nonnegative()]);
export const EdgeIdSchema = z.templateLiteral(['e', z.number().int().nonnegative()]);
export type NodeId = z.infer<typeof NodeIdSchema>;
export type EdgeId = z.infer<typeof EdgeIdSchema>;

/** Posición de la cita en el texto fuente. null = la cita no aparece en el texto (sin anclaje). */
export const SpanSchema = z.object({ start: z.number().int().nonnegative(), end: z.number().int().nonnegative() });
export type Span = z.infer<typeof SpanSchema>;

export const EntitySchema = z.object({
  id: NodeIdSchema,
  key: z.string(),
  name: z.string().min(1).max(120),
  type: z.enum(ENTITY_TYPES),
  aliases: z.array(z.string().max(120)).max(12),
  description: z.string().max(400),
  evidence: SpanSchema.nullable(),
  degree: z.number().int().nonnegative(),
});

export const RelationSchema = z.object({
  id: EdgeIdSchema,
  source: NodeIdSchema,
  target: NodeIdSchema,
  predicate: z.string().min(1).max(80),
  evidence: SpanSchema.nullable(),
});

/** Lo que el cliente manda a /api/chat junto a los mensajes. Se valida con límites estrictos. */
export const KnowledgeGraphSchema = z.object({
  entities: z.array(EntitySchema).max(MAX_ENTITIES),
  relations: z.array(RelationSchema).max(MAX_RELATIONS),
  meta: z.object({
    model: z.string(),
    createdAt: z.iso.datetime(),
    sourceChars: z.number().int().nonnegative(),
  }),
});
export type Entity = z.infer<typeof EntitySchema>;
export type Relation = z.infer<typeof RelationSchema>;
export type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;

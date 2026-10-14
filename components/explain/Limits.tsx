import type { Icon } from '@phosphor-icons/react';
import { Gauge, Prohibit, Ruler, ShieldCheck, Shuffle, TextAa } from '@phosphor-icons/react/dist/ssr';
import { Mark, SectionHead } from '@/components/site/Grid';

const LIMITS: Array<[Icon, string, string]> = [
  [
    Gauge,
    'Cuota gratuita',
    'Gemini tiene límites por minuto y por día que Google no publica. Si se agotan, la app lo dice y la muestra grabada sigue funcionando.',
  ],
  [
    ShieldCheck,
    'Privacidad',
    'En la capa gratuita, Google puede usar lo que envías para mejorar sus productos. LUM no guarda textos ni grafos en su servidor.',
  ],
  [Ruler, 'Tamaño', 'Hasta 12.000 caracteres por texto y 60 entidades por grafo. Los textos largos todavía no se trocean.'],
  [
    TextAa,
    'Recuperación por palabras',
    'Las semillas salen de coincidencias de palabras, no de embeddings: una pregunta con sinónimos puede no encontrar su entidad.',
  ],
  [
    Shuffle,
    'La extracción varía',
    'El mismo texto puede dar grafos algo distintos en cada extracción. Por eso la muestra está grabada y la calidad se mide con evals.',
  ],
  [
    Prohibit,
    'Lo que no es',
    'No es el GraphRAG de Microsoft: no detecta comunidades ni escribe resúmenes jerárquicos. Es extracción de grafo más recuperación por saltos.',
  ],
];

/** Seis celdas con su icono: lo que la herramienta no hace, dicho sin rodeos. */
export function Limits() {
  return (
    <section id="limites" aria-labelledby="limites-titulo" className="pt-20 md:pt-32">
      <SectionHead id="limites-titulo" index="04" label="Límites">
        Lo que todavía <Mark>no</Mark> hace.
      </SectionHead>
      <dl className="grid gap-px border-t border-line-strong bg-line-strong md:grid-cols-2 xl:grid-cols-3">
        {LIMITS.map(([Glyph, term, detail]) => (
          <div key={term} className="flex flex-col gap-4 bg-paper p-4 py-8 md:p-6 md:py-10">
            <Glyph size={26} weight="bold" aria-hidden="true" />
            <dt className="text-2xl font-semibold tracking-[-0.03em]">{term}</dt>
            <dd className="max-w-[46ch] text-[15px] leading-relaxed text-ink-2">{detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

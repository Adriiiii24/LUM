import { SectionHead } from './SectionHead';

const LIMITS: Array<[string, string]> = [
  [
    'Cuota gratuita',
    'Gemini tiene límites por minuto y por día que Google no publica. Si se agotan, la app lo dice y la muestra grabada sigue funcionando.',
  ],
  [
    'Privacidad',
    'En la capa gratuita, Google puede usar lo que envías para mejorar sus productos. Neural Canvas no guarda textos ni grafos en su servidor.',
  ],
  ['Tamaño', 'Hasta 12.000 caracteres por texto y 60 entidades por grafo. Los textos largos todavía no se trocean.'],
  [
    'Recuperación por palabras',
    'Las semillas salen de coincidencias de palabras, no de embeddings: una pregunta con sinónimos puede no encontrar su entidad.',
  ],
  [
    'La extracción varía',
    'El mismo texto puede dar grafos algo distintos en cada extracción. Por eso la muestra está grabada y la calidad se mide con evals.',
  ],
  [
    'Lo que no es',
    'No es el GraphRAG de Microsoft: no detecta comunidades ni escribe resúmenes jerárquicos. Es extracción de grafo más recuperación por saltos.',
  ],
];

export function Limits() {
  return (
    <section id="limites" aria-labelledby="limites-titulo" className="border-t border-line-strong">
      <SectionHead id="limites-titulo" title="Límites" />
      <dl className="grid gap-px border-t border-line bg-line md:grid-cols-2 xl:grid-cols-3">
        {LIMITS.map(([term, detail]) => (
          <div key={term} className="bg-paper px-5 py-5 md:px-6">
            <dt className="text-[15px] font-semibold text-ink">{term}</dt>
            <dd className="mt-1.5 max-w-[56ch] text-[15px] leading-relaxed text-ink-2">{detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

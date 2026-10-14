import { SITE } from '@/lib/site';

/**
 * La marca: «lum» con un nodo citado por punto (lima con anillo de tinta). Sobre una superficie
 * lima el punto va en tinta. Con `animated`, las letras suben una a una (portada).
 */
export function Wordmark({ dot = 'lime', animated = false, className = '' }: { dot?: 'lime' | 'ink'; animated?: boolean; className?: string }) {
  const letters = SITE.mark.split('');
  return (
    <span className={`inline-flex items-baseline whitespace-nowrap ${className}`}>
      {animated
        ? letters.map((ch, i) => (
            <span key={i} aria-hidden="true" className="rise-letter" style={{ ['--i' as string]: i }}>
              {ch}
            </span>
          ))
        : <span aria-hidden="true">{SITE.mark}</span>}
      <span
        aria-hidden="true"
        className={`${animated ? 'rise-letter' : ''} ml-[0.06em] inline-block size-[0.2em] shrink-0 rounded-full ring-[0.045em] ${
          dot === 'lime' ? 'bg-markup ring-ink' : 'bg-on-markup ring-on-markup'
        }`}
        style={animated ? { ['--i' as string]: letters.length } : undefined}
      />
      <span className="sr-only">{SITE.name}</span>
    </span>
  );
}

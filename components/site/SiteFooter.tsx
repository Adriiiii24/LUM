import { SITE } from '@/lib/site';
import type { SampleFile } from '@/lib/sample/types';
import { LinkButton } from './LinkButton';
import { Wordmark } from './Wordmark';

const line = 'border-on-markup/25';
const heading = 'eyebrow mb-4';
const link = 'underline decoration-on-markup/40 underline-offset-4 hover:decoration-on-markup';

/**
 * Pie en lima a sangre: el principio del producto en grande con sus dos acciones, tres columnas
 * (navegar, en otra parte, colofón) y una barra final con la marca. Sobre la lima, siempre la
 * tinta fija, en los dos temas.
 */
export function SiteFooter({ sample }: { sample: SampleFile }) {
  return (
    <footer className="mt-20 bg-markup text-on-markup md:mt-32 [&_:focus-visible]:outline-on-markup">
      <div className={`grid border-b ${line} md:grid-cols-12`}>
        <p className="p-4 py-14 text-[clamp(2.75rem,7vw,6.5rem)] font-bold leading-[0.92] tracking-[-0.05em] md:col-span-8 md:p-6 md:py-20">
          Lo que se ilumina
          <br />
          es verdad.
        </p>
        <div className="flex flex-col items-start justify-end gap-3 px-4 pb-14 md:col-span-4 md:p-6 md:py-20">
          <LinkButton href="#herramienta" variant="ink">
            Abrir el lienzo
          </LinkButton>
          <LinkButton href={SITE.repoUrl} variant="ink-outline" external>
            Código en GitHub
          </LinkButton>
        </div>
      </div>

      <div className="grid md:grid-cols-12">
        <nav aria-label="Pie" className={`border-b ${line} p-4 py-8 md:col-span-4 md:border-b-0 md:border-r md:p-6`}>
          <p className={heading}>Navegar</p>
          <ul className="space-y-1.5 text-lg font-medium">
            <li><a className={link} href="#lienzo">Lienzo</a></li>
            <li><a className={link} href="#como-funciona">Cómo funciona</a></li>
            <li><a className={link} href="#evals">Lo que se mide</a></li>
            <li><a className={link} href="#limites">Límites</a></li>
          </ul>
        </nav>
        <div className={`border-b ${line} p-4 py-8 md:col-span-4 md:border-b-0 md:border-r md:p-6`}>
          <p className={heading}>En otra parte</p>
          <ul className="space-y-1.5 text-lg font-medium">
            <li><a className={link} href={SITE.repoUrl} target="_blank" rel="noreferrer">GitHub</a></li>
            <li><a className={link} href={SITE.authorUrl} target="_blank" rel="noreferrer">{SITE.author}</a></li>
            <li><a className={link} href={sample.attribution.url} target="_blank" rel="noreferrer">Texto de la muestra</a></li>
          </ul>
        </div>
        <div className="p-4 py-8 md:col-span-4 md:p-6">
          <p className={heading}>Colofón</p>
          <div className="space-y-2 text-sm leading-snug">
            <p>
              Texto de la muestra: {sample.attribution.label}, bajo{' '}
              <a href={sample.attribution.licenseUrl} className={link} target="_blank" rel="noreferrer">
                {sample.attribution.license}
              </a>
              .
            </p>
            <p>Next.js 16, React Flow, d3-force, AI SDK 7, Gemini y Remotion.</p>
          </div>
        </div>
      </div>

      <div className={`flex items-center justify-between gap-4 border-t ${line} px-4 py-4 md:px-6`}>
        <span className="text-3xl font-bold leading-none tracking-[-0.06em]">
          <Wordmark dot="ink" />
        </span>
        <p className="caps">© 2026 {SITE.author}</p>
      </div>
    </footer>
  );
}

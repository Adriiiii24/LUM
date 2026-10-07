import { SITE } from '@/lib/site';
import type { SampleFile } from '@/lib/sample/types';

const label = 'block text-[10px] uppercase tracking-[0.08em] text-ink-3';
const link = 'text-ink underline decoration-line-strong hover:decoration-ink';

/** El cierre de la página es el cajetín de la segunda lámina: proyecto, autor, código y procedencia. */
export function SiteFooter({ sample }: { sample: SampleFile }) {
  return (
    <footer className="border-line-strong md:mx-[0.8rem] md:mb-[0.8rem] md:border md:border-t-0">
      <div className="grid gap-px border-t-2 border-ink bg-line text-[13px] sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1.5fr]">
        <div className="bg-paper px-5 py-3 md:px-6">
          <span className={label}>Proyecto</span>
          <p className="font-semibold uppercase tracking-[0.02em] text-ink">{SITE.name}</p>
          <p className="text-ink-2">{SITE.tagline}</p>
        </div>
        <div className="bg-paper px-5 py-3 md:px-6">
          <span className={label}>Autor</span>
          <a href={SITE.authorUrl} className={link}>
            {SITE.author}
          </a>
        </div>
        <div className="bg-paper px-5 py-3 md:px-6">
          <span className={label}>Código</span>
          <a href={SITE.repoUrl} className={link}>
            Repositorio en GitHub
          </a>
          <p className="text-ink-2">Next.js 16, React Flow, d3-force, AI SDK 7 y Gemini</p>
        </div>
        <div className="bg-paper px-5 py-3 md:px-6">
          <span className={label}>Texto de la muestra</span>
          <a href={sample.attribution.url} className={link}>
            {sample.attribution.label}
          </a>
          <p className="text-ink-2">
            Bajo{' '}
            <a href={sample.attribution.licenseUrl} className={link}>
              {sample.attribution.license}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

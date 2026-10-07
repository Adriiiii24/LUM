import { GithubLogo } from '@phosphor-icons/react/dist/ssr';
import { SITE } from '@/lib/site';

/** Cabecera de la lámina: el nombre, qué hace en una frase y a dónde ir. */
export function Masthead() {
  return (
    <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-x-6 gap-y-1 border-b border-line px-4 py-2 md:flex-nowrap">
      <h1 className="text-[15px] font-semibold uppercase tracking-[0.02em] text-ink">{SITE.name}</h1>
      <p className="order-3 w-full text-[13px] leading-snug text-ink-2 md:order-none md:w-auto md:flex-1 md:truncate">{SITE.tagline}</p>
      <nav aria-label="Enlaces" className="ml-auto flex items-center gap-4 text-[13px]">
        <a href="#como-funciona" className="text-ink underline decoration-line-strong hover:decoration-ink">
          Cómo funciona
        </a>
        <a href={SITE.repoUrl} className="inline-flex items-center gap-1.5 text-ink underline decoration-line-strong hover:decoration-ink">
          <GithubLogo size={16} aria-hidden="true" />
          Código
        </a>
      </nav>
    </header>
  );
}

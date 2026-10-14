'use client';
import { useCallback, useEffect, useRef, useState, type MouseEvent, type RefObject } from 'react';
import { ArrowUpRight, List, Moon, Sun, X } from '@phosphor-icons/react/dist/ssr';
import { useWorkbench } from '@/lib/state/workbench';
import { useStatusWord } from '@/components/canvas/status';
import { setTheme, useTheme } from '@/lib/theme';
import { SITE } from '@/lib/site';
import { LumLogo } from './Logo';

const LINKS = [
  { href: '#lienzo', label: 'Lienzo' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#evals', label: 'Evals' },
  { href: '#limites', label: 'Límites' },
] as const;

/**
 * Lectura del lienzo en la cabecera, con las celdas del cajetín: estado (en lima), grafo, modelo
 * y revisión. Es la misma información que el cajetín, que es el que la anuncia; aquí no se lee.
 */
function Readout({ className = '' }: { className?: string }) {
  const { word } = useStatusWord();
  const entities = useWorkbench((s) => s.graph?.entities.length ?? 0);
  const relations = useWorkbench((s) => s.graph?.relations.length ?? 0);
  const model = useWorkbench((s) => s.graph?.meta.model ?? 'ninguno');
  const revision = useWorkbench((s) => s.highlight?.revision ?? null);
  const cell = 'flex flex-col justify-center border-r border-line-strong px-3';
  const label = 'caps text-ink-3';
  return (
    <div aria-hidden="true" className={`items-stretch ${className}`}>
      <div className={`${cell} min-w-[7.5rem] bg-markup text-on-markup`}>
        <span className="caps">Estado</span>
        <span className="text-xs font-bold tracking-[0.06em]">{word}</span>
      </div>
      <div className={cell}>
        <span className={label}>Grafo</span>
        <span className="font-mono text-xs tabular">
          {entities} · {relations}
        </span>
      </div>
      <div className={cell}>
        <span className={label}>Modelo</span>
        <span className="font-mono text-xs">{model}</span>
      </div>
      <div className={cell}>
        <span className={label}>Revisión</span>
        <span className="font-mono text-xs tabular">{revision ? `R${revision}` : '—'}</span>
      </div>
    </div>
  );
}

/** Conmutador de tema: sol y luna, el activo en lima. */
function ThemeSwitch() {
  const theme = useTheme();
  const option = (value: 'light' | 'dark', label: string, Icon: typeof Sun) => (
    <button
      type="button"
      aria-pressed={theme === value}
      aria-label={label}
      onClick={() => setTheme(value)}
      className={`grid size-8 place-items-center transition-colors ${theme === value ? 'bg-markup text-on-markup' : 'text-ink-2 hover:bg-paper-2 hover:text-ink'}`}
    >
      <Icon size={15} weight={theme === value ? 'fill' : 'regular'} aria-hidden="true" />
    </button>
  );
  return (
    <div role="group" aria-label="Tema" className="flex border border-line-strong">
      {option('light', 'Tema claro', Sun)}
      <span className="w-px bg-line-strong" />
      {option('dark', 'Tema oscuro', Moon)}
    </div>
  );
}

/** Sección que se está leyendo, para marcarla en la navegación. */
function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector(l.href)).filter((el): el is Element => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return active;
}

/** Cajón lateral del móvil: enlaces y tema. Escape lo cierra y el foco no se escapa. */
function Drawer({ open, onClose, toggleRef }: { open: boolean; onClose: () => void; toggleRef: RefObject<HTMLButtonElement | null> }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('nav a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const stops = [...panel.current.querySelectorAll<HTMLElement>('a, button')];
      const i = stops.indexOf(document.activeElement as HTMLElement);
      const to = e.shiftKey ? (i <= 0 ? stops.length - 1 : i - 1) : i === stops.length - 1 ? 0 : i + 1;
      e.preventDefault();
      stops[to]?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, toggleRef]);

  // Con el documento bloqueado el salto del ancla no se movería: se cierra y luego se desplaza.
  const go = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    onClose();
    requestAnimationFrame(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', href);
    });
  };
  const row = 'flex items-center gap-4 px-4 py-4 text-2xl font-semibold tracking-[-0.03em] hover:bg-markup hover:text-on-markup';

  return (
    <div id="menu-movil" hidden={!open} className="fixed inset-0 z-50 lg:hidden">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-ink/30" />
      <div ref={panel} role="dialog" aria-modal="true" aria-label="Menú" className="absolute inset-y-0 right-0 flex w-[min(22rem,100%)] flex-col border-l border-line-strong bg-paper shadow-float">
        <div className="flex h-14 items-center justify-between border-b border-line-strong pl-4 md:h-16">
          <LumLogo className="size-9 md:size-10" />
          <button type="button" onClick={onClose} aria-label="Cerrar el menú" className="grid size-14 place-items-center border-l border-line-strong hover:bg-paper-2 md:size-16">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Secciones" className="flex-1">
          <ul>
            {LINKS.map((l, i) => (
              <li key={l.href} className="border-b border-line-strong">
                <a href={l.href} onClick={(e) => go(e, l.href)} className={row}>
                  <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                  {l.label}
                </a>
              </li>
            ))}
            <li className="border-b border-line-strong">
              <a href={SITE.repoUrl} target="_blank" rel="noreferrer" className={row}>
                <span className="font-mono text-xs text-ink-3">05</span>
                Código
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </nav>
        <div className="flex items-center justify-between border-t border-line-strong p-4">
          <span className="caps text-ink-3">Tema</span>
          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
}

/**
 * Cabecera fija: la marca, la lectura del lienzo (escritorio ancho), la navegación con la sección
 * activa subrayada en lima, el tema y, en móvil, el cajón. Debajo, la raya lima del progreso.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const active = useActiveSection();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-stretch border-b border-line-strong bg-paper md:h-16">
        <a href="#inicio" className="flex items-center border-r border-line-strong px-3 md:px-4">
          <LumLogo className="size-9 md:size-11" />
        </a>
        <Readout className="hidden xl:flex" />
        <nav aria-label="Secciones" className="ml-auto hidden items-stretch lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={active === l.href ? 'location' : undefined}
              className="group relative flex items-center px-4 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:text-ink aria-[current]:font-bold aria-[current]:text-ink"
            >
              {l.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-4 bottom-3 h-[3px] origin-left bg-markup transition-transform duration-300 ease-out-expo ${
                  active === l.href ? 'scale-x-100 shadow-[0_1px_0_var(--color-ink)]' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </a>
          ))}
          <a
            href={SITE.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 border-l border-line-strong px-4 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:bg-markup hover:text-on-markup"
          >
            Código
            <ArrowUpRight size={13} weight="bold" aria-hidden="true" />
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-3 border-l border-line-strong pl-3 lg:ml-0 lg:pr-4">
          <ThemeSwitch />
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label="Abrir el menú"
            onClick={() => setOpen(true)}
            className="grid size-14 place-items-center border-l border-line-strong hover:bg-markup hover:text-on-markup md:size-16 lg:hidden"
          >
            <List size={22} aria-hidden="true" />
          </button>
        </div>
        <span aria-hidden="true" className="scroll-progress absolute inset-x-0 -bottom-px h-[3px] bg-markup" />
      </header>
      <Drawer open={open} onClose={close} toggleRef={toggleRef} />
    </>
  );
}

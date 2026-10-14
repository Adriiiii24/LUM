import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react/dist/ssr';

const VARIANT = {
  /** La acción principal: lima llena con la tinta encima; al pasar, tinta. */
  primary: 'border-markup bg-markup text-on-markup hover:border-ink hover:bg-ink hover:text-paper',
  /** Secundaria: solo el filete; al pasar, la lima. */
  outline: 'border-line-strong text-ink hover:border-markup hover:bg-markup hover:text-on-markup',
  /** Sobre una superficie lima: tinta llena con la lima encima. */
  ink: 'border-on-markup bg-on-markup text-markup hover:bg-transparent hover:text-on-markup',
  /** Sobre una superficie lima: solo el filete de tinta. */
  'ink-outline': 'border-on-markup/60 text-on-markup hover:border-on-markup hover:bg-on-markup hover:text-markup',
} as const;

/** Enlace con forma de botón: versal espaciada y una flecha que avanza al pasar. */
export function LinkButton({
  href,
  children,
  variant = 'outline',
  external = false,
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof VARIANT;
  external?: boolean;
  className?: string;
}) {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`group inline-flex h-11 items-center gap-2.5 border px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-200 ${VARIANT[variant]} ${className}`}
    >
      {children}
      <Arrow size={15} weight="bold" aria-hidden="true" className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
    </a>
  );
}

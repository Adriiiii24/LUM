import type { ComponentProps, ReactNode } from 'react';

type Props = ComponentProps<'button'> & { children: ReactNode };

/*
 * `aria-disabled` se pinta como `disabled`: el botón que tiene el foco no puede pasar a disabled
 * (el navegador soltaría el foco en el body), así que se bloquea su acción y se deja enfocable.
 */
const base =
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 ease-out active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0 aria-disabled:cursor-not-allowed aria-disabled:active:translate-y-0';
const caps = 'text-[0.7rem] font-semibold uppercase tracking-[0.14em]';

/** Acción principal: tinta llena; al pasar, la lima con la tinta fija encima (13,4:1). */
export function PrimaryButton({ className = '', type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={`${base} ${caps} h-9 border border-ink bg-ink px-3.5 text-paper hover:border-markup hover:bg-markup hover:text-on-markup disabled:border-line-strong disabled:bg-paper-2 disabled:text-ink-3 aria-disabled:border-line-strong aria-disabled:bg-paper-2 aria-disabled:text-ink-3 ${className}`}
      {...props}
    />
  );
}

/** Acción secundaria: solo el filete, como los botones de la web. */
export function SecondaryButton({ className = '', type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={`${base} ${caps} h-9 border border-line-strong bg-transparent px-3 text-ink hover:border-ink hover:bg-paper-2 disabled:text-ink-3 ${className}`}
      {...props}
    />
  );
}

/** Botón de herramienta para las bandas de cabecera; siempre con nombre accesible. */
export function ToolButton({ className = '', type = 'button', ...props }: Props & { 'aria-label': string }) {
  return (
    <button
      type={type}
      className={`${base} size-7 text-ink-2 hover:bg-paper-2 hover:text-ink disabled:text-ink-3/60 ${className}`}
      {...props}
    />
  );
}

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

const base =
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xs text-sm font-medium transition-[background-color,color,transform] duration-150 ease-out active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0';

/** Acción principal: tinta; al pasar, la marca lima con la tinta encima (14,8:1). */
export function PrimaryButton({ className = '', type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={`${base} h-9 bg-ink px-3.5 text-paper hover:bg-markup hover:text-ink disabled:bg-paper-2 disabled:text-ink-3 ${className}`}
      {...props}
    />
  );
}

export function SecondaryButton({ className = '', type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={`${base} h-9 border border-line-strong bg-transparent px-3 text-ink hover:bg-paper-2 disabled:text-ink-3 ${className}`}
      {...props}
    />
  );
}

/** Botón de herramienta para las bandas de cabecera; siempre con nombre accesible. */
export function ToolButton({ className = '', type = 'button', ...props }: Props & { 'aria-label': string }) {
  return (
    <button
      type={type}
      className={`${base} size-7 text-ink-2 hover:bg-paper hover:text-ink disabled:text-ink-3/60 ${className}`}
      {...props}
    />
  );
}

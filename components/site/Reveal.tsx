'use client';
import { useEffect, type ReactNode } from 'react';

/** Bloque que entra al aparecer en pantalla; si lleva una palabra marcada, el trazo lima entra después. */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span data-reveal="" className={`inline ${className}`}>
      <span className="reveal-inner">{children}</span>
    </span>
  );
}

/**
 * Un solo observador para toda la página. Lo que ya está a la vista o por encima se da por
 * visto; el resto se esconde (fuera de pantalla, sin que se note) y entra al aparecer.
 */
export function RevealObserver() {
  useEffect(() => {
    const items = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    for (const item of items) {
      if (item.getBoundingClientRect().top < window.innerHeight) item.classList.add('is-in');
      else observer.observe(item);
    }
    document.documentElement.classList.add('reveal-ready');
    return () => observer.disconnect();
  }, []);
  return null;
}

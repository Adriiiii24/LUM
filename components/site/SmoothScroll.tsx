'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Desplazamiento suave con la rueda y el trackpad (Lenis). No se monta con movimiento reducido.
 *
 * - El táctil sigue nativo, y los enlaces de ancla usan el scroll suave del navegador: respeta la
 *   cabecera (scroll-padding), actualiza la URL y deja el foco donde toca.
 * - Ctrl y rueda sigue siendo el zoom de la lámina y de la vista 3D: Lenis no toca esos eventos.
 * - Las zonas con scroll propio (chat, fuente, lista) se desplazan hasta su final y después sigue
 *   la página (allowNestedScroll).
 * - Con el cajón del móvil abierto, el html lleva overflow hidden y Lenis se para solo (autoToggle).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ autoRaf: true, allowNestedScroll: true, autoToggle: true });

    // Un ancla corta la inercia de la rueda para que el salto del navegador no compita con ella.
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a[href^="#"]')) {
        lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      }
    };
    window.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('click', onClick, true);
      lenis.destroy();
    };
  }, []);
  return null;
}

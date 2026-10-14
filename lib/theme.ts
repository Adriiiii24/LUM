'use client';
import { useSyncExternalStore } from 'react';
import { STORAGE } from './site';

export type Theme = 'light' | 'dark';

const read = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

/** El tema vive en el atributo data-theme de <html>; el guion de arranque del layout lo fija antes de pintar. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => 'light');
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151514' : '#f9f6ee');
  try {
    localStorage.setItem(STORAGE.theme, theme);
  } catch {
    // Sin almacenamiento (modo privado, cookies bloqueadas): el tema dura lo que la página.
  }
}

import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Space_Grotesk } from 'next/font/google';
import { SITE, STORAGE } from '@/lib/site';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: `${SITE.name}: grafos de conocimiento con recuperación visible`,
  description: SITE.tagline,
};

export const viewport: Viewport = {
  themeColor: '#f9f6ee',
};

/**
 * Antes de pintar: aplica el tema guardado y decide si el precargador sobra (ya se vio en esta
 * sesión o se pide movimiento reducido). Así no hay destello ni cortina repetida. La barra del
 * navegador sigue al tema en cuanto existe su meta.
 */
const BOOT = `(function(){try{var d=document.documentElement,t=localStorage.getItem(${JSON.stringify(STORAGE.theme)});if(t==="dark"||t==="light")d.setAttribute("data-theme",t);if(t==="dark")document.addEventListener("DOMContentLoaded",function(){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#151514")});if(sessionStorage.getItem(${JSON.stringify(STORAGE.preloaded)})||matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("lum-no-preloader")}catch(e){}})()`;

/**
 * Enlaces de salto: lo primero que alcanza el tabulador. Esperan fuera de la ventana y bajan al
 * recibir el foco, como el botón principal (lima con la tinta fija), por encima de la cabecera
 * fija y del precargador.
 */
const SKIP =
  'fixed left-3 top-3 z-[100] inline-flex h-11 -translate-y-[calc(100%+1rem)] items-center border border-markup bg-markup px-4 text-xs font-semibold uppercase tracking-[0.14em] text-on-markup focus:translate-y-0';

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" data-theme="light" suppressHydrationWarning className={`${spaceGrotesk.variable} ${geistMono.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body className="paper-grain min-h-dvh">
        <a href="#contenido" className={SKIP}>
          Saltar al contenido
        </a>
        <a href="#herramienta" className={SKIP}>
          Saltar al lienzo
        </a>
        {children}
      </body>
    </html>
  );
}

import { loadFont as loadSans } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as loadMono } from '@remotion/google-fonts/GeistMono';
import { Easing, getInputProps } from 'remotion';

/**
 * Los mismos valores que app/globals.css (blanco hueso, tinta y lima), en sus dos temas. Se elige al renderizar con
 * --props='{"theme":"dark"}'. `bone` es el fondo y `ink` la tinta de cada tema; `onLime` es la
 * tinta fija que va sobre la lima, que no cambia.
 */
const dark = (getInputProps() as { theme?: string }).theme === 'dark';
export const C = dark
  ? {
      bone: '#151514',
      ink: '#f4f1e8',
      line: 'rgba(244, 241, 232, 0.18)',
      dots: 'rgba(244, 241, 232, 0.1)',
      lime: '#7fff00',
      onLime: '#1a1a1a',
      hollowLit: '#f9f6ee',
    }
  : {
      bone: '#f9f6ee',
      ink: '#1a1a1a',
      line: 'rgba(26, 26, 26, 0.2)',
      dots: 'rgba(26, 26, 26, 0.13)',
      lime: '#7fff00',
      onLime: '#1a1a1a',
      hollowLit: '#f9f6ee',
    };

export const SANS = loadSans('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const MONO = loadMono('normal', { weights: ['400', '500'], subsets: ['latin'] }).fontFamily;

/** Las dos curvas de la web: salida exponencial para entrar y una simétrica para barrer. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

export const LABEL = {
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
} as const;

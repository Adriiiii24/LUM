/** Guion en fotogramas a 30 fps. Los tiempos de las escenas son absolutos; el grafo cuenta desde T.graph. */
export const FPS = 30;
export const DURATION = 660;

export const T = {
  /** Barrido lima entre la portada y el texto: crece hasta cubrir, se cambia de escena y se retira. */
  wipeIn: 76,
  swap: 90,
  wipeOut: 92,
  graph: 212,
  outro: 586,
} as const;

/** Relativos al inicio del grafo (T.graph). */
export const G = {
  build: 6,
  ask: 132,
  seed: 182,
  hop1: 202,
  hop2: 224,
  answer: 262,
  /** Caracteres de la respuesta que aparecen por fotograma. */
  charsPerFrame: 2.6,
} as const;

/** Datos del sitio en un solo lugar: el repositorio aún no existe en GitHub y su URL puede cambiar. */
export const SITE = {
  /** Nombre del proyecto en la prosa y en el nombre accesible del logotipo. */
  name: 'LUM',
  /** La marca dibujada fuera de la cabecera: en minúscula, con un nodo citado en lima por punto. */
  mark: 'lum',
  tagline: 'Convierte un texto en un grafo y, al responder, marca qué recorrió y qué citó.',
  author: 'Adrián Martínez Panés',
  authorUrl: 'https://github.com/Adriiiii24',
  repoUrl: 'https://github.com/Adriiiii24/LUM',
} as const;

/** Claves de almacenamiento del navegador: el tema y si el precargador ya se vio en esta sesión. */
export const STORAGE = {
  theme: 'lum-theme',
  preloaded: 'lum-preloaded',
} as const;

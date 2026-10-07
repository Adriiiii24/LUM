/** Normalización de texto compartida por la extracción y la recuperación. */

const STOPWORDS = new Set([
  'que', 'cual', 'cuales', 'como', 'donde', 'cuando', 'quien', 'quienes', 'por', 'para', 'con', 'sin',
  'sobre', 'entre', 'los', 'las', 'del', 'una', 'uno', 'unos', 'unas', 'este', 'esta', 'estos', 'estas',
  'ese', 'esa', 'esos', 'esas', 'fue', 'era', 'eran', 'son', 'hay', 'tiene', 'tuvo', 'hizo', 'mas', 'muy',
  'tras', 'desde', 'hasta', 'durante', 'cuanto', 'cuanta', 'cuantos', 'cuantas', 'quiero', 'saber', 'dime',
  'the', 'and', 'what', 'who', 'which', 'where', 'when', 'how', 'did', 'does', 'was', 'were', 'for', 'with', 'from',
]);

/** Minúsculas y sin diacríticos: «Misión» y «mision» comparan igual. */
export function normalizeText(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/** Palabras con contenido: sin signos, sin palabras vacías y de más de dos letras. */
export function tokenize(s: string): string[] {
  return normalizeText(s)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/** Clave estable en snake_case a partir de un nombre. */
export function slug(s: string): string {
  return normalizeText(s).replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '');
}

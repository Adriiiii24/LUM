/*
 * Monograma LUM: la L, la U, la M y el punto, que es el nodo citado. Fuente de verdad:
 * public/brand/lum-logo.svg. Solo va en la cabecera; el resto de la web usa la marca de texto
 * (Wordmark). Las formas se repiten aquí para dibujarlo en línea, sin otra petición.
 */
export function LumLogo({ className = '' }: { className?: string }) {
  return (
    <svg role="img" aria-label="LUM" viewBox="0 0 1254 1254" className={`block shrink-0 ${className}`}>
      <rect width="1254" height="1254" fill="#9DF912" />
      <g fill="#0E0C0D">
        <path d="M248.5 230.3H444.5L447.5 814.5H813.5V989.5L248.5 991.5Z" />
        <path d="M474.5 228.8H627.5V351.5A40 40 0 0 0 667.5 391.5H789.5A40 40 0 0 0 829.5 351.5V228.8H999.5V374.5A112 112 0 0 1 887.5 486.5H586.5A112 112 0 0 1 474.5 374.5Z" />
        <path d="M475.5 501.5H619.5L732.8 612.3L844.5 501.5L1000.5 499.5L1000.7 787.5H843.5V668L732.5 781.5L619.5 668V788.5H475.5Z" />
        <circle cx="917.5" cy="902" r="91" />
      </g>
    </svg>
  );
}

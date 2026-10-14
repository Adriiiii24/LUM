import type { EntityType } from './schema.ts';

/**
 * Icono de cada entidad según lo que el texto dice de ella. Sin modelo y sin red: reglas de
 * palabras sobre el nombre y sobre la cabeza de la descripción (lo que va antes de «que»,
 * «donde», una coma...), que es donde el modelo pone qué es la cosa: «Cohete de lanzamiento...»,
 * «País que...». Cada tipo tiene su icono por defecto, así que nunca falta uno.
 *
 * Sin dependencias en tiempo de ejecución: lo usan la web y el vídeo de Remotion.
 */
export const ICON_KEYS = [
  'user', 'identification-badge', 'crown', 'student', 'chalkboard-teacher', 'flask', 'pen-nib', 'palette', 'music-note',
  'soccer-ball', 'medal-military', 'stethoscope', 'buildings', 'bank', 'briefcase', 'factory', 'shield', 'graduation-cap',
  'users-three', 'trophy', 'newspaper', 'hospital', 'church', 'planet', 'map-pin', 'moon', 'sun', 'waves', 'mountains',
  'island', 'tree', 'city', 'flag', 'globe', 'house', 'rocket', 'rocket-launch', 'cube', 'cube-transparent', 'sword',
  'book-open', 'scroll', 'film-slate', 'code', 'cpu', 'car', 'airplane', 'boat', 'train', 'microscope', 'pill', 'bridge',
  'lightbulb', 'target', 'atom', 'money', 'scales', 'megaphone', 'virus', 'translate', 'handshake', 'fire', 'confetti',
  'calendar-blank', 'hourglass', 'asterisk',
] as const;
export type IconKey = (typeof ICON_KEYS)[number];

export const TYPE_ICON: Record<EntityType, IconKey> = {
  persona: 'user',
  organizacion: 'buildings',
  lugar: 'map-pin',
  artefacto: 'cube',
  concepto: 'lightbulb',
  evento: 'calendar-blank',
  otro: 'asterisk',
};

/** Peso: 3 si la palabra dice exactamente qué es; 2 si es una familia clara; 1 si es genérica. */
type Rule = { icon: IconKey; re: RegExp; weight: 1 | 2 | 3 };
const r = (icon: IconKey, re: RegExp, weight: 1 | 2 | 3 = 2): Rule => ({ icon, re, weight });

const SPACE = /\b(astronauta|cosmonauta|tripulante|piloto (del|de la) (modulo|nave|mision)|comandante de la mision)/;

const RULES: Record<EntityType, Rule[]> = {
  persona: [
    r('rocket', SPACE, 3),
    r('crown', /\b(rey|reina|monarca|emperador|emperatriz|principe|princesa|farao|zar|sultan)\b/, 3),
    r('identification-badge', /\b(president[ea]|primer ministro|ministr[oa]|canciller|senador[a]?|gobernador[a]?|alcalde(sa)?|politic[oa]|dictador|diputad[oa])\b/, 3),
    r('flask', /\b(cientific[oa]|investigador[a]?|fisic[oa]|quimic[oa]|biolog[oa]|matematic[oa]|astronom[oa])\b/),
    r('pen-nib', /\b(escritor[a]?|autor[a]?|poeta|novelista|periodista|filosof[oa])\b/),
    r('palette', /\b(pintor[a]?|artista|escultor[a]?|arquitect[oa]|disenador[a]?)\b/),
    r('music-note', /\b(music[oa]|cantante|compositor[a]?|pianista|guitarrista)\b/),
    r('soccer-ball', /\b(futbolista|deportista|atleta|jugador[a]?|entrenador[a]?)\b/),
    r('medal-military', /\b(militar|general|soldado|almirante|coronel|capitan|guerrero)\b/),
    r('stethoscope', /\b(medic[oa]|doctor[a]?|enfermer[oa]|cirujan[oa])\b/),
    r('chalkboard-teacher', /\b(profesor[a]?|maestr[oa]|catedratic[oa]|docente)\b/),
    r('student', /\b(estudiante|alumn[oa])\b/),
  ],
  organizacion: [
    r('planet', /\b(agencia espacial|espacial)\b/, 3),
    r('bank', /\b(gobierno|ministerio|parlamento|congreso|senado|administracion|tribunal|corte)\b/),
    r('shield', /\b(ejercito|armada|fuerza aerea|fuerzas armadas|policia|guardia)\b/),
    r('graduation-cap', /\b(universidad|instituto|academia|escuela|colegio)\b/),
    r('money', /\b(banco|financier[oa])\b/),
    r('factory', /\b(fabrica|fabricante|industria|constructora)\b/),
    r('briefcase', /\b(empresa|compania|corporacion|multinacional|startup|consultora)\b/),
    r('users-three', /\b(partido|sindicato|movimiento|asociacion|ong|fundacion|comunidad)\b/),
    r('trophy', /\b(equipo|club|seleccion)\b/),
    r('newspaper', /\b(periodico|diario|revista|cadena|television|editorial)\b/),
    r('hospital', /\b(hospital|clinica)\b/),
    r('church', /\b(iglesia|orden religiosa|diocesis)\b/),
  ],
  lugar: [
    r('rocket-launch', /\b(centro espacial|base espacial|cosmodromo|plataforma de lanzamiento)\b/, 3),
    r('moon', /\b(luna|lunar|satelite natural)\b/),
    r('planet', /\b(planeta|marte|venus|jupiter|mercurio|neptuno|urano)\b/),
    r('sun', /\b(sol|estrella)\b/),
    r('waves', /\b(mar|oceano|rio|lago|golfo|bahia|costa|playa|estrecho)\b/),
    r('mountains', /\b(montana|monte|cordillera|volcan|sierra|pico|valle)\b/),
    r('island', /\b(isla|archipielago|atolon)\b/),
    r('tree', /\b(bosque|selva|parque natural|jardin)\b/),
    r('bank', /\b(museo|biblioteca|archivo)\b/),
    r('graduation-cap', /\b(universidad|escuela|colegio|instituto)\b/),
    r('hospital', /\b(hospital|clinica)\b/),
    r('church', /\b(iglesia|catedral|templo|monasterio|mezquita|sinagoga)\b/),
    r('flag', /\b(pais|nacion|republica|reino|imperio|estado soberano)\b/, 3),
    r('city', /\b(ciudad|capital|pueblo|municipio|localidad|villa|aldea)\b/),
    r('house', /\b(casa|palacio|castillo|residencia|mansion)\b/),
    r('bridge', /\b(puente)\b/),
    r('globe', /\b(region|provincia|continente|territorio|comarca|estado)\b/, 1),
  ],
  artefacto: [
    r('rocket', /\b(cohete|lanzador|propulsor)\b/, 3),
    r('rocket-launch', /\b(mision|vuelo tripulado|expedicion)\b/),
    r('cube-transparent', /\b(modulo|seccion|capsula|compartimento|etapa)\b/),
    r('rocket', /\b(sonda|nave|transbordador|estacion espacial|satelite)\b/),
    r('sword', /\b(arma|espada|canon|fusil|misil|bomba)\b/),
    r('book-open', /\b(libro|novela|poema|obra literaria|manuscrito|enciclopedia)\b/),
    r('scroll', /\b(ley|constitucion|tratado|acuerdo|declaracion|decreto|carta)\b/),
    r('film-slate', /\b(pelicula|serie|documental|cortometraje)\b/),
    r('music-note', /\b(cancion|album|disco|sinfonia|opera)\b/),
    r('palette', /\b(cuadro|pintura|escultura|mural|fresco)\b/),
    r('code', /\b(software|aplicacion|algoritmo|codigo|programa informatico|sistema operativo)\b/),
    r('cpu', /\b(ordenador|computadora|procesador|chip|maquina)\b/),
    r('car', /\b(coche|automovil|vehiculo)\b/),
    r('airplane', /\b(avion|aeronave|helicoptero)\b/),
    r('boat', /\b(barco|buque|navio|submarino|velero)\b/),
    r('train', /\b(tren|locomotora)\b/),
    r('microscope', /\b(telescopio|microscopio|instrumento)\b/),
    r('pill', /\b(medicamento|vacuna|farmaco)\b/),
    r('bridge', /\b(puente)\b/),
    r('buildings', /\b(edificio|monumento|torre)\b/),
  ],
  concepto: [
    r('rocket-launch', /\b(programa (de vuelos )?espacial|programa de vuelos espaciales|vuelos espaciales)\b/, 3),
    r('sword', /\b(guerra|conflicto|batalla|combate|revolucion)\b/),
    r('trophy', /\b(carrera|competicion|rivalidad|campeonato|torneo|liga)\b/),
    r('atom', /\b(teoria|ciencia|fisica|quimica|principio|ley fisica)\b/),
    r('money', /\b(economia|mercado|dinero|crisis|inflacion|comercio)\b/),
    r('scales', /\b(derecho|justicia|ley|politica|democracia|ideologia|regimen)\b/),
    r('virus', /\b(enfermedad|virus|pandemia|epidemia)\b/),
    r('cpu', /\b(tecnologia|ingenieria|inteligencia artificial|computacion|informatica)\b/),
    r('palette', /\b(arte|estilo|movimiento artistico|vanguardia)\b/),
    r('music-note', /\b(musica|genero musical)\b/),
    r('translate', /\b(idioma|lengua|dialecto)\b/),
    r('church', /\b(religion|fe|creencia)\b/),
    r('target', /\b(programa|proyecto|plan|iniciativa|objetivo|estrategia)\b/, 1),
  ],
  evento: [
    r('sword', /\b(guerra|batalla|conflicto|revolucion|ataque|invasion|asedio)\b/, 3),
    r('rocket-launch', /\b(lanzamiento|despegue|alunizaje|aterrizaje|vuelo)\b/),
    r('handshake', /\b(tratado|acuerdo|firma|cumbre|conferencia|reunion|negociacion)\b/),
    r('megaphone', /\b(eleccion|elecciones|votacion|referendum|protesta|manifestacion)\b/),
    r('fire', /\b(accidente|incendio|desastre|terremoto|explosion|catastrofe)\b/),
    r('trophy', /\b(final|juegos olimpicos|mundial|campeonato|torneo)\b/),
    r('music-note', /\b(concierto|festival de musica)\b/),
    r('confetti', /\b(fiesta|festival|celebracion|boda|ceremonia)\b/),
    r('lightbulb', /\b(descubrimiento|invento|invencion)\b/),
    r('hourglass', /\b(nacimiento|muerte|fallecimiento)\b/),
  ],
  otro: [],
};

/** Minúsculas, sin tildes ni comillas angulares: «Unión Soviética» → union sovietica. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[«»"“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cabeza de la descripción: lo que dice qué es, antes de la primera subordinada o pausa. */
export function headOf(description: string): string {
  return normalize(description).split(/\b(?:que|donde|cuyo|cuya|del cual|de la cual|en el que|en la que)\b|[,;.:()]/)[0]?.trim() ?? '';
}

/**
 * La regla con más peso gana; acertar en el nombre suma medio punto, porque el nombre manda
 * sobre la descripción («Mar de la Tranquilidad», en la superficie lunar, es un mar).
 */
export function iconFor(entity: { type: EntityType; name: string; description?: string | null }): IconKey {
  const name = normalize(entity.name);
  const head = entity.description ? headOf(entity.description) : '';
  let best: { icon: IconKey; score: number } | null = null;
  for (const rule of RULES[entity.type]) {
    const score = rule.re.test(name) ? rule.weight + 0.5 : rule.re.test(head) ? rule.weight : 0;
    if (score > (best?.score ?? 0)) best = { icon: rule.icon, score };
  }
  return best?.icon ?? TYPE_ICON[entity.type];
}

/** Quién actúa (persona u organización) va en símbolo lleno; el resto, hueco. */
export const isAgent = (type: EntityType) => type === 'persona' || type === 'organizacion';

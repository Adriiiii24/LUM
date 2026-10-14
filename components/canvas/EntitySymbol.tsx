import type { Icon } from '@phosphor-icons/react';
import {
  Airplane, Asterisk, Atom, Bank, Boat, BookOpen, Bridge, Briefcase, Buildings, CalendarBlank, Car, ChalkboardTeacher, Church,
  City, Code, Confetti, Cpu, Crown, Cube, CubeTransparent, Factory, FilmSlate, Fire, Flag, Flask, Globe, GraduationCap,
  Handshake, Hospital, Hourglass, House, IdentificationBadge, Island, Lightbulb, MapPin, MedalMilitary, Megaphone,
  Microscope, Money, Moon, Mountains, MusicNote, Newspaper, Palette, PenNib, Pill, Planet, Rocket, RocketLaunch, Scales,
  Scroll, Shield, SoccerBall, Stethoscope, Student, Sun, Sword, Target, Train, Translate, Tree, Trophy, User, UsersThree,
  Virus, Waves,
} from '@phosphor-icons/react/dist/ssr';
import type { EntityType } from '@/lib/graph/schema';
import { TYPE_ICON, iconFor, isAgent, type IconKey } from '@/lib/graph/icons';

export const TYPE_LABEL: Record<EntityType, string> = {
  persona: 'Persona',
  organizacion: 'Organización',
  lugar: 'Lugar',
  artefacto: 'Artefacto',
  concepto: 'Concepto',
  evento: 'Evento',
  otro: 'Otro',
};

const ICON: Record<IconKey, Icon> = {
  user: User, 'identification-badge': IdentificationBadge, crown: Crown, student: Student, 'chalkboard-teacher': ChalkboardTeacher,
  flask: Flask, 'pen-nib': PenNib, palette: Palette, 'music-note': MusicNote, 'soccer-ball': SoccerBall,
  'medal-military': MedalMilitary, stethoscope: Stethoscope, buildings: Buildings, bank: Bank, briefcase: Briefcase,
  factory: Factory, shield: Shield, 'graduation-cap': GraduationCap, 'users-three': UsersThree, trophy: Trophy,
  newspaper: Newspaper, hospital: Hospital, church: Church, planet: Planet, 'map-pin': MapPin, moon: Moon, sun: Sun,
  waves: Waves, mountains: Mountains, island: Island, tree: Tree, city: City, flag: Flag, globe: Globe, house: House,
  rocket: Rocket, 'rocket-launch': RocketLaunch, cube: Cube, 'cube-transparent': CubeTransparent, sword: Sword,
  'book-open': BookOpen, scroll: Scroll, 'film-slate': FilmSlate, code: Code, cpu: Cpu, car: Car, airplane: Airplane,
  boat: Boat, train: Train, microscope: Microscope, pill: Pill, bridge: Bridge, lightbulb: Lightbulb, target: Target,
  atom: Atom, money: Money, scales: Scales, megaphone: Megaphone, virus: Virus, translate: Translate, handshake: Handshake,
  fire: Fire, confetti: Confetti, 'calendar-blank': CalendarBlank, hourglass: Hourglass, asterisk: Asterisk,
};

type SymbolEntity = { type: EntityType; name: string; description?: string | null };

/**
 * Símbolo de entidad centrado en (0, 0): una ficha redonda con el icono de lo que el texto dice
 * que es (lib/graph/icons.ts). Llena para quien actúa (persona u organización) y hueca para el
 * resto, así el tipo se lee también por la forma. Sobre el halo lima usa la tinta fija y el
 * hueso, para leerse igual en los dos temas.
 */
export function EntitySymbol({ entity, icon, size, opacity = 1, lit = false }: { entity: SymbolEntity; icon?: IconKey | undefined; size: number; opacity?: number; lit?: boolean }) {
  const r = size / 2;
  const agent = isAgent(entity.type);
  const ink = lit ? 'var(--color-on-markup)' : 'var(--color-ink)';
  const paper = lit ? 'var(--color-bone)' : 'var(--color-paper)';
  const Glyph = ICON[icon ?? iconFor(entity)];
  const g = Math.round(size * 0.6);
  return (
    <g opacity={opacity}>
      <circle r={r - 0.75} fill={agent ? ink : paper} stroke={ink} strokeWidth={1.5} />
      <Glyph x={-g / 2} y={-g / 2} size={g} weight="bold" color={agent ? paper : ink} />
    </g>
  );
}

/** El símbolo suelto, para la leyenda, la lista y la ficha. Sin entidad, el icono por defecto del tipo. */
export function SymbolGlyph({
  type,
  entity,
  size = 18,
  className,
}: {
  type: EntityType;
  entity?: SymbolEntity;
  size?: number;
  className?: string;
}) {
  const box = size + 2;
  return (
    <svg width={box} height={box} viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`} className={className} aria-hidden="true">
      <EntitySymbol entity={entity ?? { type, name: '' }} icon={entity ? undefined : TYPE_ICON[type]} size={size} />
    </svg>
  );
}

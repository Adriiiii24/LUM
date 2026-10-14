import type { Icon } from '@phosphor-icons/react';
import {
  Airplane, Asterisk, Atom, Bank, Boat, BookOpen, Bridge, Briefcase, Buildings, CalendarBlank, Car, ChalkboardTeacher, Church,
  City, Code, Confetti, Cpu, Crown, Cube, CubeTransparent, Factory, FilmSlate, Fire, Flag, Flask, Globe, GraduationCap,
  Handshake, Hospital, Hourglass, House, IdentificationBadge, Island, Lightbulb, MapPin, MedalMilitary, Megaphone,
  Microscope, Money, Moon, Mountains, MusicNote, Newspaper, Palette, PenNib, Pill, Planet, Rocket, RocketLaunch, Scales,
  Scroll, Shield, SoccerBall, Stethoscope, Student, Sun, Sword, Target, Train, Translate, Tree, Trophy, User, UsersThree,
  Virus, Waves,
} from '@phosphor-icons/react';
import { iconFor, isAgent, type IconKey } from '../../lib/graph/icons.ts';
import { C } from './theme';

/** El mismo mapa que components/canvas/EntitySymbol.tsx: la web y el vídeo dibujan el mismo icono. */
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

type Entity = Parameters<typeof iconFor>[0];

/**
 * Ficha de entidad centrada en (0, 0), en píxeles del vídeo: llena para quien actúa, hueca para
 * el resto, con el icono de lo que el texto dice que es. Sobre lima, tinta fija y hueso.
 */
export function Badge({ entity, size, opacity, lit }: { entity: Entity; size: number; opacity: number; lit: boolean }) {
  const r = size / 2;
  const agent = isAgent(entity.type);
  const ink = lit ? C.onLime : C.ink;
  const paper = lit ? C.hollowLit : C.bone;
  const Glyph = ICON[iconFor(entity)];
  const g = Math.round(size * 0.6);
  return (
    <g opacity={opacity}>
      <circle r={r - 1} fill={agent ? ink : paper} stroke={ink} strokeWidth={2} />
      <Glyph x={-g / 2} y={-g / 2} size={g} weight="bold" color={agent ? paper : ink} />
    </g>
  );
}

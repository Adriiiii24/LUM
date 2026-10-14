import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ANSWER_TOKENS, CITED, ENTITIES, GRAPH_SCALE, LABELS, LABEL_FONT, MODEL, QUESTION, RELATIONS, STEPS, pos, symbolSize, tokenLength } from '../data';
import { G } from '../timeline';
import { C, EASE_OUT, MONO } from '../theme';
import { Heading, Label, clamp, fade } from '../ui';
import { Badge } from '../icons';

type Visual = 'idle' | 'dim' | 'seed' | 'traversed' | 'cited';

const STEP_AT = [G.seed, G.hop1, G.hop2];
const ANSWER_START = G.answer + 6;

/** Orden de aparición: primero las entidades con más conexiones, como un grafo que se asienta. */
const APPEAR: Record<string, number> = Object.fromEntries(
  [...ENTITIES].sort((a, b) => b.degree - a.degree).map((e, i) => [e.id, G.build + i * 3]),
);
const EDGE_AT: Record<string, number> = Object.fromEntries(
  RELATIONS.map((r, i) => [r.id, Math.max(G.build + 26 + i * 2, (APPEAR[r.source] ?? 0) + 6, (APPEAR[r.target] ?? 0) + 6)]),
);

const NODE_STEP: Record<string, number> = {};
const EDGE_STEP: Record<string, number> = {};
STEPS.forEach((s, i) => {
  for (const id of s.nodes) NODE_STEP[id] ??= i;
  for (const id of s.edges) EDGE_STEP[id] ??= i;
});

/** Fotograma en que la respuesta escribe la primera nota de cada entidad citada. */
const CITED_AT: Record<string, number> = {};
{
  let chars = 0;
  for (const t of ANSWER_TOKENS) {
    if (t.kind === 'text') {
      chars += t.text.length;
      continue;
    }
    chars += t.word.length;
    for (const c of t.cites) {
      CITED_AT[c.id] ??= ANSWER_START + chars / G.charsPerFrame;
      chars += 1;
    }
  }
}
const ANSWER_CHARS = ANSWER_TOKENS.reduce((n, t) => n + tokenLength(t), 0);

/** Estado de un nodo en el fotograma f, con las mismas reglas que la lámina (lib/state/workbench.ts). */
function nodeState(id: string, f: number): { visual: Visual; litAt: number | null } {
  if (f < G.seed) return { visual: 'idle', litAt: null };
  const step = NODE_STEP[id];
  const revealed = STEP_AT.filter((t) => t <= f).length;
  const reached = step !== undefined && step < revealed;
  if (f < G.answer) {
    if (!reached) return { visual: 'dim', litAt: null };
    return { visual: step === 0 ? 'seed' : 'traversed', litAt: STEP_AT[step]! };
  }
  const citedAt = CITED_AT[id];
  if (citedAt !== undefined && f >= citedAt) return { visual: 'cited', litAt: citedAt };
  if (reached) return { visual: step === 0 ? 'seed' : 'traversed', litAt: null };
  return { visual: 'dim', litAt: null };
}

function Graph() {
  const f = useCurrentFrame();
  const tracing = f >= G.seed && f < G.answer;
  const byId = Object.fromEntries(ENTITIES.map((e) => [e.id, e]));

  const edges = RELATIONS.map((r) => {
    const from = byId[r.source];
    const to = byId[r.target];
    if (!from || !to) return null;
    const a = pos(r.source);
    const b = pos(r.target);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
    const g1 = (symbolSize(from.degree) / 2 + 9) * GRAPH_SCALE;
    const g2 = (symbolSize(to.degree) / 2 + 11) * GRAPH_SCALE;
    if (Math.hypot(b.x - a.x, b.y - a.y) < g1 + g2 + 4) return null;
    const x1 = a.x + cos * g1;
    const y1 = a.y + sin * g1;
    const x2 = b.x - cos * g2;
    const y2 = b.y - sin * g2;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const draw = interpolate(f, [EDGE_AT[r.id]!, EDGE_AT[r.id]! + 14], [0, 1], { ...clamp, easing: EASE_OUT });

    const step = EDGE_STEP[r.id];
    const traversedAt = step === undefined ? null : STEP_AT[step]!;
    const traversed = traversedAt !== null && f >= traversedAt;
    const s = nodeState(r.source, f);
    const t = nodeState(r.target, f);
    const cited = traversed && s.visual === 'cited' && t.visual === 'cited';
    const band = cited || (tracing && traversed);
    const bandAt = cited ? Math.max(s.litAt ?? 0, t.litAt ?? 0) : (traversedAt ?? 0);
    const bandDraw = interpolate(f, [bandAt, bandAt + 9], [0, 1], { ...clamp, easing: EASE_OUT });
    const dim = f >= G.seed && !traversed;
    const opacity = cited || traversed ? 1 : dim ? 0.14 : 0.42;
    const head = `${x2 + cos},${y2 + sin} ${x2 - cos * 9 - sin * 4.5},${y2 - sin * 9 + cos * 4.5} ${x2 - cos * 9 + sin * 4.5},${y2 - sin * 9 - cos * 4.5}`;

    return (
      <g key={r.id}>
        {band && (
          <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * bandDraw} y2={y1 + (y2 - y1) * bandDraw} stroke={C.lime} strokeWidth={10} />
        )}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={band ? C.onLime : C.ink}
          strokeOpacity={opacity}
          strokeWidth={cited ? 2.2 : traversed ? 1.7 : 1.3}
          strokeDasharray={traversed && !cited ? '6 4' : `${len} ${len}`}
          strokeDashoffset={traversed && !cited ? 0 : len * (1 - draw)}
        />
        <polygon points={head} fill={band ? C.onLime : C.ink} fillOpacity={opacity * (draw > 0.95 ? 1 : 0)} />
      </g>
    );
  });

  const nodes = ENTITIES.map((e) => {
    const appear = APPEAR[e.id]!;
    const pop = interpolate(f, [appear, appear + 10], [0, 1], { ...clamp, easing: EASE_OUT });
    if (pop === 0) return null;
    const { x, y } = pos(e.id);
    const size = symbolSize(e.degree);
    const r = (size / 2) * GRAPH_SCALE;
    const { visual, litAt } = nodeState(e.id, f);
    const lit = litAt !== null;
    const halo = lit ? interpolate(f, [litAt, litAt + 8], [0.4, 1], { ...clamp, easing: EASE_OUT }) : 0;
    const dim = visual === 'dim';
    const label = fade(f, appear + 4, appear + 14);
    return (
      <g key={e.id} transform={`translate(${x} ${y})`}>
        {lit && <circle r={(r + 13) * halo} fill={C.lime} opacity={halo} />}
        {visual === 'seed' && (
          <g fill="none" stroke={lit ? C.onLime : C.ink} strokeWidth={1.4}>
            <circle r={r + 6.5} />
            <circle r={r + 11} />
          </g>
        )}
        {visual === 'traversed' && <circle r={r + 8} fill="none" stroke={lit ? C.onLime : C.ink} strokeWidth={1.7} strokeDasharray="3.5 3" />}
        {visual === 'cited' && <circle r={r + 8} fill="none" stroke={lit ? C.onLime : C.ink} strokeWidth={2.8} />}
        <g transform={`scale(${pop})`}>
          <Badge entity={e} size={size * GRAPH_SCALE} opacity={dim ? 0.3 : 1} lit={lit} />
        </g>
        <text
          x={LABELS[e.id]?.dx ?? r + 16}
          y={LABELS[e.id]?.dy ?? 6}
          textAnchor={LABELS[e.id]?.anchor ?? 'start'}
          fontSize={LABEL_FONT}
          fontWeight={visual === 'cited' ? 700 : lit ? 600 : 500}
          fill={C.ink}
          opacity={label * (dim ? 0.32 : visual === 'idle' ? 0.82 : 1)}
          style={{ letterSpacing: '-0.01em' }}
        >
          {e.name}
        </text>
      </g>
    );
  });

  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {edges}
      {nodes}
    </svg>
  );
}

/** Cifras del grafo que se acaba de dibujar: cuentan a la vez que aparece. */
function Stats() {
  const f = useCurrentFrame();
  const out = fade(f, G.ask - 6, G.ask + 8);
  const count = (to: number) => Math.round(interpolate(f, [20, 104], [0, to], { ...clamp, easing: EASE_OUT }));
  const rows: Array<[string, string]> = [
    [String(count(ENTITIES.length)).padStart(2, '0'), 'entidades'],
    [String(count(RELATIONS.length)).padStart(2, '0'), 'relaciones'],
  ];
  return (
    <div style={{ position: 'absolute', left: 256, top: 372, opacity: (1 - out) * fade(f, 14, 30) }}>
      {rows.map(([n, l]) => (
        <div key={l} style={{ marginBottom: 34 }}>
          <div style={{ fontSize: 124, lineHeight: 0.85, fontWeight: 700, letterSpacing: '-0.06em', fontVariantNumeric: 'tabular-nums' }}>{n}</div>
          <Label style={{ marginTop: 10 }}>{l}</Label>
        </div>
      ))}
      <div style={{ fontFamily: MONO, fontSize: 24, color: C.ink }}>{MODEL}</div>
      <Label style={{ marginTop: 8 }}>salida estructurada</Label>
    </div>
  );
}

function Question() {
  const f = useCurrentFrame();
  const typed = Math.round(interpolate(f, [G.ask + 8, G.ask + 44], [0, QUESTION.length], clamp));
  const caret = typed < QUESTION.length || Math.floor(f / 8) % 2 === 0;
  return (
    <div style={{ position: 'absolute', left: 256, top: 372, width: 470, opacity: fade(f, G.ask + 2, G.ask + 12) }}>
      <div style={{ borderTop: `1px solid ${C.ink}`, paddingTop: 14 }}>
        <Label>Pregunta</Label>
      </div>
      <div style={{ marginTop: 14, fontSize: 36, lineHeight: 1.12, fontWeight: 600, letterSpacing: '-0.025em' }}>
        {QUESTION.slice(0, typed)}
        <span style={{ display: 'inline-block', width: 14, height: 34, marginLeft: 4, verticalAlign: '-4px', background: caret && f < G.seed + 10 ? C.ink : 'transparent' }} />
      </div>
    </div>
  );
}

const stepLine = (i: number) => {
  const s = STEPS[i]!;
  const names = Object.fromEntries(ENTITIES.map((e) => [e.id, e.name]));
  if (s.kind === 'seed') return ['S', s.nodes.map((id) => names[id] ?? id).join(', ')] as const;
  const by = /«([^»]+)»/.exec(s.reason)?.[1] ?? '';
  return [String(s.step), `+${s.nodes.length} por «${by}»`] as const;
};

function Trace() {
  const f = useCurrentFrame();
  const out = fade(f, G.answer - 10, G.answer);
  return (
    <div style={{ position: 'absolute', left: 256, top: 640, width: 470, opacity: (1 - out) * fade(f, G.seed - 6, G.seed + 4) }}>
      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
        <Label>Recorrido</Label>
        <Label style={{ fontWeight: 400, fontSize: 13 }}>sin modelo · en lima lo visitado</Label>
      </div>
      {STEP_AT.map((t, i) => (
        <div key={i} style={{ display: 'flex', gap: 18, marginTop: 14, fontFamily: MONO, fontSize: 21, lineHeight: 1.3, opacity: fade(f, t, t + 8) }}>
          <span style={{ width: 22, flex: 'none', alignSelf: 'flex-start', background: f >= t ? C.lime : 'transparent', color: f >= t ? C.onLime : C.ink, textAlign: 'center' }}>{stepLine(i)[0]}</span>
          <span>{stepLine(i)[1]}</span>
        </div>
      ))}
    </div>
  );
}

function Answer() {
  const f = useCurrentFrame();
  let budget = Math.max(0, (f - ANSWER_START) * G.charsPerFrame);
  const done = budget >= ANSWER_CHARS;
  return (
    <div style={{ position: 'absolute', left: 256, top: 640, width: 470, opacity: fade(f, G.answer - 2, G.answer + 8) }}>
      <div style={{ borderTop: `1px solid ${C.ink}`, paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
        <Label>Respuesta</Label>
        <Label style={{ fontWeight: 400, fontSize: 13 }}>{CITED.length} citas · en lima solo lo citado</Label>
      </div>
      <p style={{ margin: '14px 0 0', fontSize: 27, lineHeight: 1.36, letterSpacing: '-0.005em' }}>
        {ANSWER_TOKENS.map((t, i) => {
          if (budget <= 0) return null;
          if (t.kind === 'text') {
            const shown = t.text.slice(0, Math.floor(budget));
            budget -= t.text.length;
            return <span key={i}>{shown}</span>;
          }
          const word = t.word.slice(0, Math.floor(budget));
          budget -= t.word.length;
          const cites = t.cites.slice(0, Math.max(0, Math.ceil(budget)));
          budget -= t.cites.length;
          return (
            <span key={i} style={{ whiteSpace: 'nowrap' }}>
              {word}
              {cites.map((c) => (
                <sup
                  key={c.n}
                  style={{ display: 'inline-block', marginLeft: 4, padding: '0 7px', background: C.lime, color: C.onLime, fontFamily: MONO, fontSize: 17, lineHeight: '24px', verticalAlign: '8px' }}
                >
                  {c.n}
                </sup>
              ))}
            </span>
          );
        })}
        {!done && <span style={{ display: 'inline-block', width: 12, height: 26, marginLeft: 3, verticalAlign: '-3px', background: C.ink }} />}
      </p>
    </div>
  );
}

/** Segundo a cuarto paso sobre el mismo grafo: se dibuja, se recorre y se cita. */
export function GraphStory() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Heading index="02" label="Grafo" before="Se vuelve un " mark="grafo" at={2} exit={G.ask - 8} />
      <Heading index="03" label="Recorrido" before="Una pregunta lo " mark="recorre" at={G.ask + 4} exit={G.answer - 10} />
      <Heading index="04" label="Cita" before="La respuesta " mark="cita" after=" su origen." at={G.answer} />
      <Graph />
      {f < G.ask + 10 && <Stats />}
      {f >= G.ask && <Question />}
      {f >= G.seed - 8 && f < G.answer + 2 && <Trace />}
      {f >= G.answer - 2 && <Answer />}
    </AbsoluteFill>
  );
}

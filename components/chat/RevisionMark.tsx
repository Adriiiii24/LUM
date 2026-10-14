/** Triángulo de revisión, como en los planos: el número dentro; en lima cuando es la revisión que se ve en la lámina. */
export function RevisionMark({ number, active }: { number: number; active: boolean }) {
  return (
    <svg width={24} height={21} viewBox="0 0 24 21" aria-hidden="true" className="shrink-0">
      <polygon
        points="12,1 23,20 1,20"
        fill={active ? 'var(--color-markup)' : 'var(--color-paper)'}
        stroke={active ? 'var(--color-on-markup)' : 'var(--color-ink)'}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <text x={12} y={16.5} textAnchor="middle" fontSize={9} fontWeight={600} fill={active ? 'var(--color-on-markup)' : 'var(--color-ink)'} fontFamily="var(--font-mono)">
        {number}
      </text>
    </svg>
  );
}

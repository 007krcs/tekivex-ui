// ─────────────────────────────────────────────────────────────────────────────
// SacredGeometry — purely mathematical mandala for the page background
//
// Draws three superposed pieces of geometry, all derived from constants:
//
//   1. Twelve-fold petal lines (dihedral symmetry of order 12)
//   2. Nine concentric circles spaced by the Fibonacci sequence
//   3. A golden-ratio (φ) logarithmic spiral
//
// No scripts, no glyphs, no scripture. The composition borrows the
// universal language of symmetry — the same way a Spirograph drawing or
// a frequency-domain visualization does — to give the page a sense of
// vastness without any religious connotation.
//
// Stroke width is sub-pixel-thin in viewBox units, lines fade away from
// center, and the whole thing is rotated very slowly via CSS so it never
// feels static. Wrapped in <div className="tk-yantra"> for blend mode.
// ─────────────────────────────────────────────────────────────────────────────

const SIZE = 1000;          // viewBox unit
const CENTER = SIZE / 2;
const PETALS = 12;
const PHI = (1 + Math.sqrt(5)) / 2;

// Fibonacci-spaced concentric ring radii, normalized to fit the viewBox.
const FIB = [1, 2, 3, 5, 8, 13, 21, 34, 55];
const FIB_MAX = FIB[FIB.length - 1];
const RINGS = FIB.map((f) => (f / FIB_MAX) * (CENTER * 0.92));

// Golden-ratio spiral path: r(θ) = a · φ^(θ / (π/2))
function goldenSpiral(turns = 4, samples = 240): string {
  const a = 6;
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const theta = (i / samples) * turns * Math.PI * 2;
    const r = a * Math.pow(PHI, theta / (Math.PI / 2));
    if (r > CENTER * 0.96) break;
    const x = CENTER + r * Math.cos(theta);
    const y = CENTER + r * Math.sin(theta);
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return points.join(' ');
}

export function SacredGeometry() {
  // Twelve evenly-spaced rays (petal axes)
  const rays = Array.from({ length: PETALS }).map((_, i) => {
    const a = (i / PETALS) * Math.PI * 2;
    const x = CENTER + Math.cos(a) * (CENTER * 0.96);
    const y = CENTER + Math.sin(a) * (CENTER * 0.96);
    return { x, y };
  });

  // Twelve "petal" arcs — each petal is two arcs from neighboring nodes
  // on the largest ring, meeting at the center.
  const petalRing = RINGS[RINGS.length - 1];
  const petals = Array.from({ length: PETALS }).map((_, i) => {
    const a0 = (i / PETALS) * Math.PI * 2;
    const a1 = ((i + 1) / PETALS) * Math.PI * 2;
    const x0 = CENTER + Math.cos(a0) * petalRing;
    const y0 = CENTER + Math.sin(a0) * petalRing;
    const x1 = CENTER + Math.cos(a1) * petalRing;
    const y1 = CENTER + Math.sin(a1) * petalRing;
    // Two arcs through the origin form a vesica-piscis-like petal.
    const r = petalRing;
    return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x0.toFixed(2)} ${y0.toFixed(2)} Z`;
  });

  return (
    <div className="tk-yantra" aria-hidden="true">
      <div className="tk-yantra__rotor">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} fill="none" stroke="currentColor">
          <defs>
            {/* Soft radial fade so lines vanish near the edges */}
            <radialGradient id="tk-yantra-fade" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#c4a8ff" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#7b8eff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <mask id="tk-yantra-mask">
              <rect width="100%" height="100%" fill="url(#tk-yantra-fade)" />
            </mask>
          </defs>

          <g mask="url(#tk-yantra-mask)" stroke="#c4a8ff" strokeWidth="0.9" strokeLinecap="round">
            {/* Concentric Fibonacci rings */}
            {RINGS.map((r, i) => (
              <circle key={`r${i}`} cx={CENTER} cy={CENTER} r={r} fill="none" opacity={0.5 + (i / RINGS.length) * 0.5} />
            ))}

            {/* Twelve-fold rays */}
            {rays.map((p, i) => (
              <line key={`l${i}`} x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} opacity={0.45} />
            ))}

            {/* Vesica-style petals (two arcs forming each petal) */}
            <g stroke="#7b8eff" strokeOpacity={0.6} strokeWidth={0.7}>
              {petals.map((d, i) => (
                <path key={`p${i}`} d={d} />
              ))}
            </g>

            {/* Golden-ratio spiral, drawn over everything */}
            <path d={goldenSpiral(4, 360)} stroke="#00f5d4" strokeOpacity={0.55} strokeWidth={1.1} fill="none" />

            {/* Inner hexagram from connecting alternating ray endpoints */}
            <g stroke="#c4a8ff" strokeOpacity={0.4} strokeWidth={0.8}>
              <polygon
                points={[0, 2, 4, 6, 8, 10]
                  .map((i) => {
                    const a = (i / PETALS) * Math.PI * 2;
                    const x = CENTER + Math.cos(a) * RINGS[5];
                    const y = CENTER + Math.sin(a) * RINGS[5];
                    return `${x.toFixed(2)},${y.toFixed(2)}`;
                  })
                  .join(' ')}
                fill="none"
              />
              <polygon
                points={[1, 3, 5, 7, 9, 11]
                  .map((i) => {
                    const a = (i / PETALS) * Math.PI * 2;
                    const x = CENTER + Math.cos(a) * RINGS[5];
                    const y = CENTER + Math.sin(a) * RINGS[5];
                    return `${x.toFixed(2)},${y.toFixed(2)}`;
                  })
                  .join(' ')}
                fill="none"
              />
            </g>

            {/* Central bright dot */}
            <circle cx={CENTER} cy={CENTER} r={6} fill="#c4a8ff" stroke="none" />
          </g>
        </svg>
      </div>
    </div>
  );
}

// The Radar Dial — the product's signature visual element (Part B.1).
// Renders Opportunity (x-axis) and Risk (y-axis) as a single blip within a
// concentric, brass-ticked instrument face, deliberately not collapsed into
// one optimistic number. Reused everywhere Opportunity/Risk appear: category
// dashboards, the Scenario Simulator, the Insight Report, and (eventually)
// the Capital Allocation view.

const VIEWBOX = 220;
const CENTER = VIEWBOX / 2;
const PLOT_HALF_WIDTH = 78;
const RING_COUNT = 4;

function toPlotCoords(opportunity: number, risk: number) {
  const o = Math.max(0, Math.min(100, opportunity));
  const r = Math.max(0, Math.min(100, risk));
  const x = CENTER - PLOT_HALF_WIDTH + (o / 100) * (2 * PLOT_HALF_WIDTH);
  const y = CENTER + PLOT_HALF_WIDTH - (r / 100) * (2 * PLOT_HALF_WIDTH);
  return { x, y };
}

function blipColor(opportunity: number, risk: number): string {
  const net = opportunity - risk; // -100..100
  const t = Math.round(Math.max(0, Math.min(1, (net + 100) / 200)) * 100);
  return `color-mix(in srgb, var(--signal-positive) ${t}%, var(--signal-risk))`;
}

export function RadarDial({
  opportunity,
  risk,
  size = 160,
  animateSweep = false,
  showReadout = true,
  showAxisLabels = false,
}: {
  opportunity: number;
  risk: number;
  size?: number;
  animateSweep?: boolean;
  showReadout?: boolean;
  showAxisLabels?: boolean;
}) {
  const { x, y } = toPlotCoords(opportunity, risk);
  const color = blipColor(opportunity, risk);

  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} className="h-full w-full" role="img" aria-label={`Opportunity ${Math.round(opportunity)}, Risk ${Math.round(risk)}`}>
          {Array.from({ length: RING_COUNT }).map((_, i) => {
            const r = ((i + 1) / RING_COUNT) * PLOT_HALF_WIDTH;
            return (
              <circle
                key={i}
                cx={CENTER}
                cy={CENTER}
                r={r}
                fill="none"
                stroke="var(--accent-brass)"
                strokeOpacity={0.22}
                strokeWidth={1}
              />
            );
          })}

          <line
            x1={CENTER - PLOT_HALF_WIDTH}
            y1={CENTER}
            x2={CENTER + PLOT_HALF_WIDTH}
            y2={CENTER}
            stroke="var(--border)"
            strokeWidth={1}
          />
          <line
            x1={CENTER}
            y1={CENTER - PLOT_HALF_WIDTH}
            x2={CENTER}
            y2={CENTER + PLOT_HALF_WIDTH}
            stroke="var(--border)"
            strokeWidth={1}
          />

          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const outer = PLOT_HALF_WIDTH + 6;
            const inner = PLOT_HALF_WIDTH - 2;
            return (
              <line
                key={deg}
                x1={CENTER + Math.sin(rad) * inner}
                y1={CENTER - Math.cos(rad) * inner}
                x2={CENTER + Math.sin(rad) * outer}
                y2={CENTER - Math.cos(rad) * outer}
                stroke="var(--accent-brass)"
                strokeWidth={1.5}
              />
            );
          })}

          {showAxisLabels && (
            <>
              <text x={CENTER + PLOT_HALF_WIDTH + 10} y={CENTER + 4} fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-mono)">
                OPP
              </text>
              <text x={CENTER - 12} y={CENTER - PLOT_HALF_WIDTH - 10} fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-mono)">
                RISK
              </text>
            </>
          )}

          <line
            className="dial-transition"
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="var(--accent-brass)"
            strokeWidth={1.5}
            strokeOpacity={0.7}
          />
          <circle className="dial-transition" cx={x} cy={y} r={7} fill={color} stroke="var(--bg-panel)" strokeWidth={2} />
        </svg>

        {animateSweep && (
          <div
            className="radar-sweep-overlay pointer-events-none absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, var(--accent-brass) 0deg, transparent 45deg)",
            }}
          />
        )}
      </div>

      {showReadout && (
        <div className="flex items-center gap-4 font-mono text-sm">
          <span style={{ color: "var(--signal-positive)" }}>OPP {Math.round(opportunity)}</span>
          <span style={{ color: "var(--signal-risk)" }}>RISK {Math.round(risk)}</span>
        </div>
      )}
    </div>
  );
}

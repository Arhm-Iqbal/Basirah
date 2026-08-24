const CHANNEL_SPLIT = [
  { label: 'Online', value: 62 },
  { label: 'In person', value: 38 },
];

const MONTHLY = [
  { month: 'Jan', value: 18 },
  { month: 'Feb', value: 24 },
  { month: 'Mar', value: 21 },
  { month: 'Apr', value: 32 },
  { month: 'May', value: 28 },
  { month: 'Jun', value: 41 },
  { month: 'Jul', value: 36 },
  { month: 'Aug', value: 47 },
];

const CATEGORIES = [
  { label: 'Harassment', value: 34 },
  { label: 'Online hate', value: 27 },
  { label: 'Vandalism', value: 16 },
  { label: 'Threats', value: 13 },
  { label: 'Discrimination', value: 10 },
];

const REGIONS = [
  { label: 'Greater Toronto Area', value: 38 },
  { label: 'Montreal', value: 24 },
  { label: 'Vancouver', value: 19 },
  { label: 'Edmonton', value: 12 },
  { label: 'Ottawa', value: 7 },
];

export function Insights() {
  return (
    <section className="bg-basirah-cyan">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="max-w-2xl">
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-basirah-teal sm:text-5xl">
            From individual reports to community insight.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-basirah-teal/70">
            Patterns that are invisible to one person become clear across a community. Aggregated
            reporting helps organizations understand what is happening and where support is needed.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          <Panel title="Online vs in-person">
            <ul className="space-y-6">
              {CHANNEL_SPLIT.map(({ label, value }) => (
                <li key={label}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-basirah-teal">{label}</span>
                    <span className="text-2xl font-semibold text-basirah-teal">{value}%</span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-basirah-cream">
                    <div
                      className="h-full rounded-full bg-basirah-rust"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Reports over time">
            <TrendChart />
            <ul className="mt-4 flex justify-between text-xs font-medium text-basirah-teal/70">
              {MONTHLY.map(({ month }) => (
                <li key={month}>{month}</li>
              ))}
            </ul>
          </Panel>

          <Panel title="Incident categories">
            <BarList items={CATEGORIES} suffix="%" />
          </Panel>

          <Panel title="Regional trends">
            <BarList items={REGIONS} suffix="%" />
          </Panel>
        </div>
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-basirah-teal">{title}</h3>
        <span className="rounded-full bg-basirah-cream px-3 py-1 text-xs font-semibold tracking-wide text-basirah-teal/75 uppercase">
          Illustrative Data
        </span>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function BarList({ items, suffix }: { items: { label: string; value: number }[]; suffix: string }) {
  const max = Math.max(...items.map((item) => item.value));

  return (
    <ul className="space-y-4">
      {items.map(({ label, value }) => (
        <li key={label} className="flex items-center gap-4">
          <span className="w-40 shrink-0 text-sm font-medium text-basirah-teal">{label}</span>
          <span className="h-3 flex-1 rounded-full bg-basirah-cream">
            <span
              className="block h-full rounded-full bg-basirah-teal"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </span>
          <span className="w-12 shrink-0 text-right text-sm font-semibold text-basirah-teal/70">
            {value}
            {suffix}
          </span>
        </li>
      ))}
    </ul>
  );
}

function TrendChart() {
  const max = Math.max(...MONTHLY.map((point) => point.value));
  const step = 100 / (MONTHLY.length - 1);
  const points = MONTHLY.map(
    (point, index) => `${index * step},${40 - (point.value / max) * 34}`,
  ).join(' ');

  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="h-40 w-full"
      role="img"
      aria-label="Illustrative line chart showing reports rising from 18 in January to 47 in August."
    >
      {[0, 10, 20, 30, 40].map((y) => (
        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#ECE8D9" strokeWidth="0.5" />
      ))}
      <polyline
        points={points}
        fill="none"
        stroke="#942106"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

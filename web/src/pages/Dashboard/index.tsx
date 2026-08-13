import { useMemo } from 'react';
import { useModel, useIntl, getLocale } from '@umijs/max';
import ReagentStripe from '@/components/ReagentStripe';
import { DEPT_COLOR, REAGENT, useCountUp } from '@/utils/reagent';
import styles from './index.less';

/* ------------------------------- Mock 数据 ------------------------------- *
 * 视觉先行，后接后端。所有数据集中在这里，日后替换为 useRequest 即可。
 * -------------------------------------------------------------------------*/
const KPIS = [
  {
    key: 'apps',
    value: 128,
    labelId: 'dashboard.kpi.apps.label',
    deltaId: 'dashboard.kpi.apps.delta',
    unitId: 'dashboard.kpi.unit',
    trend: [8, 12, 10, 14, 13, 16, 18],
    stripe: 'blue' as const,
    color: REAGENT.blue,
  },
  {
    key: 'samples',
    value: 76,
    labelId: 'dashboard.kpi.samples.label',
    deltaId: 'dashboard.kpi.samples.delta',
    unitId: 'dashboard.kpi.unit',
    trend: [22, 20, 18, 24, 21, 19, 16],
    stripe: 'green' as const,
    color: REAGENT.green,
  },
  {
    key: 'tests',
    value: 214,
    labelId: 'dashboard.kpi.tests.label',
    deltaId: 'dashboard.kpi.tests.delta',
    unitId: 'dashboard.kpi.unit',
    trend: [14, 18, 22, 26, 30, 34, 38],
    stripe: 'purple' as const,
    color: REAGENT.purple,
  },
  {
    key: 'reports',
    value: 19,
    labelId: 'dashboard.kpi.reports.label',
    deltaId: 'dashboard.kpi.reports.delta',
    unitId: 'dashboard.kpi.unit',
    trend: [6, 8, 10, 9, 11, 14, 19],
    stripe: 'pink' as const,
    color: REAGENT.pink,
  },
];

const FLOW = [
  { key: 'accept', labelId: 'dashboard.flow.accept', value: 42 },
  { key: 'assign', labelId: 'dashboard.flow.assign', value: 38, active: true },
  { key: 'test', labelId: 'dashboard.flow.test', value: 214 },
  { key: 'review', labelId: 'dashboard.flow.review', value: 27 },
  { key: 'issue', labelId: 'dashboard.flow.issue', value: 19 },
];

const RUNNING = [
  { nameId: 'dashboard.running.1', dept: 'lab', pct: 78, dueId: 'dashboard.due.today18', urgent: true },
  { nameId: 'dashboard.running.2', dept: 'lab', pct: 52, dueId: 'dashboard.due.tomorrow' },
  { nameId: 'dashboard.running.3', dept: 'cs', pct: 92, dueId: 'dashboard.due.today' },
  { nameId: 'dashboard.running.4', dept: 'op', pct: 34, dueId: 'dashboard.due.days', dueVars: { n: 2 } },
  { nameId: 'dashboard.running.5', dept: 'report', pct: 66, dueId: 'dashboard.due.days', dueVars: { n: 3 } },
];

// 5 工作日 × 4 部门（cs / op / lab / report）
const CAPACITY_DAYS = [
  'dashboard.week.mon',
  'dashboard.week.tue',
  'dashboard.week.wed',
  'dashboard.week.thu',
  'dashboard.week.fri',
] as const;
const CAPACITY: Array<[number, number, number, number]> = [
  [8, 12, 22, 6],
  [10, 14, 26, 8],
  [12, 10, 30, 10],
  [9, 16, 24, 12],
  [11, 13, 28, 14],
];

/* --------------------------------- 组件 ---------------------------------- */

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 88;
  const h = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const step = w / (data.length - 1);
  const pts = data
    .map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`)
    .join(' ');
  return (
    <svg width={w} height={h} className={styles.spark} aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => {
        if (i !== data.length - 1) return null;
        const x = i * step;
        const y = h - ((v - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r={2.4} fill={color} />;
      })}
    </svg>
  );
}

function KpiCard({ item, delay }: { item: typeof KPIS[number]; delay: number }) {
  const { formatMessage } = useIntl();
  const count = useCountUp(item.value, 500 + delay);
  const delta = formatMessage({ id: item.deltaId });
  return (
    <div className={styles.kpi}>
      <div className={styles.top}>
        <ReagentStripe variant={item.stripe} height={4} />
      </div>
      <div className={styles.eyebrow}>{formatMessage({ id: item.labelId })}</div>
      <div className={styles.value}>
        {count}
        <span className={styles.unit}>{formatMessage({ id: item.unitId })}</span>
      </div>
      <div
        className={`${styles.delta} ${
          delta.startsWith('+')
            ? styles.pos
            : delta.startsWith('−') || delta.startsWith('-')
            ? styles.neg
            : ''
        }`}
      >
        {delta}
      </div>
      <Sparkline data={item.trend} color={item.color} />
    </div>
  );
}

function CapacityChart() {
  const { formatMessage } = useIntl();
  // 尺寸
  const H = 180;
  const W = 720;
  const padL = 32;
  const padR = 8;
  const padT = 12;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const totals = CAPACITY.map(([a, b, c, d]) => a + b + c + d);
  const max = Math.max(...totals) * 1.15;

  const bandW = innerW / CAPACITY.length;
  const barW = Math.min(48, bandW * 0.5);

  const colors = [
    DEPT_COLOR.cs,
    DEPT_COLOR.op,
    DEPT_COLOR.lab,
    DEPT_COLOR.report,
  ];

  const ticks = 4;
  const tickVals = useMemo(
    () => Array.from({ length: ticks + 1 }, (_, i) => Math.round((max / ticks) * i)),
    [max],
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      preserveAspectRatio="none"
      role="img"
      aria-label={formatMessage({ id: 'dashboard.capacity.title' })}
    >
      {/* 网格线 */}
      {tickVals.map((v, i) => {
        const y = padT + innerH - (v / max) * innerH;
        return (
          <g key={v}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y}
              y2={y}
              stroke="rgba(14,26,36,0.06)"
              strokeDasharray="2 4"
            />
            <text
              x={padL - 8}
              y={y + 3}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize={10}
              fill="var(--ink-3)"
            >
              {v}
            </text>
          </g>
        );
      })}
      {/* 柱 */}
      {CAPACITY.map((day, i) => {
        const x = padL + bandW * i + bandW / 2 - barW / 2;
        let stackY = padT + innerH;
        return (
          <g key={i}>
            {day.map((val, j) => {
              const h = (val / max) * innerH;
              stackY -= h;
              const y = stackY;
              const isTop = j === day.length - 1;
              return (
                <rect
                  key={j}
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  fill={colors[j]}
                  rx={isTop ? 3 : 0}
                  ry={isTop ? 3 : 0}
                />
              );
            })}
            <text
              x={padL + bandW * i + bandW / 2}
              y={H - 8}
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontSize={12}
              fontWeight={600}
              fill="var(--ink-2)"
            >
              {formatMessage({ id: CAPACITY_DAYS[i] })}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Dashboard() {
  const { initialState } = useModel('@@initialState');
  const { formatMessage } = useIntl();
  const name = initialState?.currentUser?.name;
  const today = new Date().toLocaleDateString(getLocale(), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1>
          {formatMessage({ id: 'dashboard.hello' })}
          {name ? `，${name}` : ''}
        </h1>
        <div className={styles.meta}>
          <strong>{today}</strong>
          {formatMessage({ id: 'dashboard.meta' })}
        </div>
      </header>

      {KPIS.map((k, i) => (
        <KpiCard key={k.key} item={k} delay={i * 80} />
      ))}

      <section className={styles.flow}>
        <div className={styles.head}>
          <h3>{formatMessage({ id: 'dashboard.flow.title' })}</h3>
          <span className={styles.headHint}>{formatMessage({ id: 'dashboard.flow.hint' })}</span>
        </div>
        <div className={styles.track}>
          {FLOW.map((s, i) => (
            <div
              key={s.key}
              className={`${styles.step} ${s.active ? styles.active : ''}`}
            >
              <div className={styles.dot}>{String(i + 1).padStart(2, '0')}</div>
              <div className={styles.num}>{s.value}</div>
              <div className={styles.label}>{formatMessage({ id: s.labelId })}</div>
            </div>
          ))}
        </div>
      </section>

      <aside className={styles.running}>
        <div className={styles.head}>
          <h3>{formatMessage({ id: 'dashboard.running.title' })}</h3>
          <span className={styles.count}>
            {formatMessage({ id: 'dashboard.running.count' }, { n: RUNNING.length })}
          </span>
        </div>
        <ul>
          {RUNNING.map((r, i) => (
            <li key={i}>
              <span
                className={styles.dot}
                style={{
                  background:
                    DEPT_COLOR[r.dept as keyof typeof DEPT_COLOR] ||
                    REAGENT.blue,
                }}
              />
              <div>
                <div className={styles.name}>{formatMessage({ id: r.nameId })}</div>
                <div className={styles.sub}>
                  <div className={styles.bar}>
                    <span
                      style={{
                        width: `${r.pct}%`,
                        background:
                          DEPT_COLOR[r.dept as keyof typeof DEPT_COLOR] ||
                          REAGENT.blue,
                      }}
                    />
                  </div>
                  <span className={styles.pct}>{r.pct}%</span>
                </div>
              </div>
              <span
                className={`${styles.due} ${r.urgent ? styles.urgent : ''}`}
              >
                {formatMessage({ id: r.dueId }, r.dueVars)}
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <section className={styles.capacity}>
        <div className={styles.head}>
          <h3>{formatMessage({ id: 'dashboard.capacity.title' })}</h3>
          <div className={styles.legend}>
            <span className={styles.cs}>{formatMessage({ id: 'dashboard.capacity.cs' })}</span>
            <span className={styles.op}>{formatMessage({ id: 'dashboard.capacity.op' })}</span>
            <span className={styles.lab}>{formatMessage({ id: 'dashboard.capacity.lab' })}</span>
            <span className={styles.report}>{formatMessage({ id: 'dashboard.capacity.report' })}</span>
          </div>
        </div>
        <CapacityChart />
      </section>
    </div>
  );
}

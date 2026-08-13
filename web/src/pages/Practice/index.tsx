import { Tag } from 'antd';
import { useIntl } from '@umijs/max';
import ReagentStripe from '@/components/ReagentStripe';
import { DEPT_COLOR, REAGENT, statusTagColor, useCountUp } from '@/utils/reagent';
import styles from './index.less';

/* ------------------------------- 数据 ------------------------------- */

const REAGENTS = [
  { key: 'blue', nameId: 'practice.reagent.blue', hex: REAGENT.blue },
  { key: 'green', nameId: 'practice.reagent.green', hex: REAGENT.green },
  { key: 'pink', nameId: 'practice.reagent.pink', hex: REAGENT.pink },
  { key: 'amber', nameId: 'practice.reagent.amber', hex: REAGENT.amber },
  { key: 'purple', nameId: 'practice.reagent.purple', hex: REAGENT.purple },
  { key: 'red', nameId: 'practice.reagent.red', hex: REAGENT.red },
];

const DEPTS = [
  { key: 'cs', nameId: 'practice.deptmap.cs', descId: 'practice.deptmap.cs.desc' },
  { key: 'op', nameId: 'practice.deptmap.op', descId: 'practice.deptmap.op.desc' },
  { key: 'lab', nameId: 'practice.deptmap.lab', descId: 'practice.deptmap.lab.desc' },
  { key: 'report', nameId: 'practice.deptmap.report', descId: 'practice.deptmap.report.desc' },
  { key: 'system', nameId: 'practice.deptmap.system', descId: 'practice.deptmap.system.desc' },
] as const;

const STRIPE_VARIANTS = [
  'rainbow',
  'blue',
  'green',
  'pink',
  'purple',
  'amber',
] as const;

const STATUS_SAMPLES = [
  'ACTIVE',
  'PROCESSING',
  'REVIEW',
  'PASSED',
  'FAILED',
  'PENDING',
];

const TYPE_SCALE = [
  { label: 'Display / H1', size: 32, textId: 'practice.type.h1.text', cls: 'd-h1' },
  { label: 'Display / H2', size: 24, textId: 'practice.type.h2.text', cls: 'd-h2' },
  { label: 'Body', size: 14, textId: 'practice.type.body.text', cls: 'd-body' },
  { label: 'Mono / Data', size: 13, textId: 'practice.type.mono.text', cls: 'd-mono' },
];

const TOKENS = [
  { kId: 'practice.token.radius', vId: 'practice.token.radius.v' },
  { kId: 'practice.token.shadow', vId: 'practice.token.shadow.v' },
  { kId: 'practice.token.paper', vId: 'practice.token.paper.v' },
  { kId: 'practice.token.line', vId: 'practice.token.line.v' },
];

/* ------------------------------- 组件 ------------------------------- */

function SectionHead({
  en,
  titleId,
  hintId,
}: {
  en: string;
  titleId: string;
  hintId: string;
}) {
  const { formatMessage } = useIntl();
  return (
    <div className={styles.sectionHead}>
      <div className={styles.sectionEyebrow}>{en}</div>
      <div className={styles.sectionTitle}>{formatMessage({ id: titleId })}</div>
      <div className={styles.sectionHint}>{formatMessage({ id: hintId })}</div>
    </div>
  );
}

function MiniKpi() {
  const { formatMessage } = useIntl();
  const n = useCountUp(214, 700);
  return (
    <div className={styles.miniKpi}>
      <ReagentStripe variant="green" height={4} />
      <div className={styles.mkEyebrow}>{formatMessage({ id: 'practice.mk.eyebrow' })}</div>
      <div className={styles.mkValue}>
        {n}
        <span className={styles.mkUnit}>{formatMessage({ id: 'practice.mk.unit' })}</span>
      </div>
      <div className={styles.mkDelta}>{formatMessage({ id: 'practice.mk.delta' })}</div>
    </div>
  );
}

/* -------------------------------- 页面 -------------------------------- */

export default function Practice() {
  const { formatMessage } = useIntl();
  return (
    <div className={styles.page}>
      {/* Hero：层析光谱 */}
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.eyebrow}>{formatMessage({ id: 'practice.eyebrow' })}</div>
          <h1>{formatMessage({ id: 'practice.title' })}</h1>
          <p>{formatMessage({ id: 'practice.desc' })}</p>
        </div>
        <div className={styles.spectrum}>
          {REAGENTS.map((r) => (
            <div key={r.key} className={styles.band} style={{ background: r.hex }}>
              <span className={styles.bandName}>{formatMessage({ id: r.nameId })}</span>
              <span className={styles.bandHex}>{r.hex}</span>
            </div>
          ))}
        </div>
      </header>

      {/* 色板 */}
      <section className={styles.card}>
        <SectionHead
          en={formatMessage({ id: 'practice.palette.en' })}
          titleId="practice.palette.title"
          hintId="practice.palette.hint"
        />
        <div className={styles.swatches}>
          {REAGENTS.map((r) => (
            <div key={r.key} className={styles.swatch}>
              <div className={styles.swatchBlock} style={{ background: r.hex }} />
              <div className={styles.swatchSoft} style={{ background: `${r.hex}1a` }} />
              <div className={styles.swatchMeta}>
                <strong>{formatMessage({ id: r.nameId })}</strong>
                <span className={styles.swatchHex}>{r.hex}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 部门分色 */}
      <section className={styles.card}>
        <SectionHead
          en={formatMessage({ id: 'practice.dept.en' })}
          titleId="practice.dept.title"
          hintId="practice.dept.hint"
        />
        <div className={styles.depts}>
          {DEPTS.map((d) => (
            <div key={d.key} className={styles.dept}>
              <span
                className={styles.deptDot}
                style={{ background: DEPT_COLOR[d.key] }}
              />
              <div>
                <div className={styles.deptName}>{formatMessage({ id: d.nameId })}</div>
                <div className={styles.deptDesc}>{formatMessage({ id: d.descId })}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 字体 */}
      <section className={styles.card}>
        <SectionHead
          en={formatMessage({ id: 'practice.type.en' })}
          titleId="practice.type.title"
          hintId="practice.type.hint"
        />
        <div className={styles.typeCol}>
          {TYPE_SCALE.map((t) => (
            <div key={t.label} className={styles.typeRow}>
              <div className={styles.typeLabel}>
                {t.label} · {t.size}px
              </div>
              <div className={styles[t.cls as keyof typeof styles]}>
                {formatMessage({ id: t.textId })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 试剂条 */}
      <section className={styles.card}>
        <SectionHead
          en={formatMessage({ id: 'practice.stripe.en' })}
          titleId="practice.stripe.title"
          hintId="practice.stripe.hint"
        />
        <div className={styles.stripes}>
          {STRIPE_VARIANTS.map((v) => (
            <div key={v} className={styles.stripeRow}>
              <span className={styles.stripeName}>{v}</span>
              <ReagentStripe variant={v} height={6} radius={3} style={{ flex: 1 }} />
            </div>
          ))}
        </div>
      </section>

      {/* 状态与组件 */}
      <section className={styles.card}>
        <SectionHead
          en={formatMessage({ id: 'practice.comp.en' })}
          titleId="practice.comp.title"
          hintId="practice.comp.hint"
        />
        <div className={styles.statusRow}>
          {STATUS_SAMPLES.map((s) => (
            <Tag key={s} color={statusTagColor(s)}>
              {s}
            </Tag>
          ))}
        </div>
        <div className={styles.compGrid}>
          <MiniKpi />
          <div className={styles.compNote}>
            <div className={styles.eyebrow}>{formatMessage({ id: 'practice.signature.eyebrow' })}</div>
            <p>{formatMessage({ id: 'practice.signature.desc' })}</p>
          </div>
        </div>
      </section>

      {/* 令牌 */}
      <section className={styles.card}>
        <SectionHead
          en={formatMessage({ id: 'practice.tokens.en' })}
          titleId="practice.tokens.title"
          hintId="practice.tokens.hint"
        />
        <div className={styles.tokens}>
          {TOKENS.map((t) => (
            <div key={t.kId} className={styles.token}>
              <span className={styles.tokenK}>{formatMessage({ id: t.kId })}</span>
              <span className={styles.tokenV}>{formatMessage({ id: t.vId })}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

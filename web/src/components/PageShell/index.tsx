import type { ReactNode } from 'react';
import { DEPT_COLOR, REAGENT } from '@/utils/reagent';
import styles from './index.less';

type Dept = keyof typeof DEPT_COLOR;

interface Props {
  /** 业务域：决定页头竖条颜色 */
  dept: Dept;
  /** mono 眉标，如 "CS · 客户服务" */
  eyebrow: string;
  /** 页面标题 */
  title: string;
  /** 一句话说明该页做什么（接口语气，平实动词） */
  desc?: string;
  children: ReactNode;
}

/**
 * 页面外壳：给每个业务表格页一个统一的、有语境的页头。
 * 竖条颜色 = 部门色，结构即信息——每页因内容不同而不同，不是模板化重复。
 * 记忆点仍是整站那根试剂条，这里克制地只用部门单色竖条。
 */
export default function PageShell({
  dept,
  eyebrow,
  title,
  desc,
  children,
}: Props) {
  const color = DEPT_COLOR[dept] ?? REAGENT.blue;
  return (
    <div className={styles.shell}>
      <header className={styles.head}>
        <span className={styles.mark} style={{ background: color }} />
        <div className={styles.text}>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <h1 className={styles.title}>{title}</h1>
          {desc && <p className={styles.desc}>{desc}</p>}
        </div>
      </header>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

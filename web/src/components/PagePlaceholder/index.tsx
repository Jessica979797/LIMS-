import { useIntl } from '@umijs/max';
import ReagentStripe from '@/components/ReagentStripe';
import styles from './index.less';

interface Props {
  /** 该模块将做什么--方向性说明（已由调用方按 locale 解析传入） */
  hint?: string;
}

/**
 * 模块开发中占位：试剂主题的空状态。
 * 空屏是邀请与方向，不是情绪--告诉用户这里将会做什么。
 */
export default function PagePlaceholder({ hint }: Props) {
  const { formatMessage } = useIntl();
  return (
    <div className={styles.wrap}>
      <ReagentStripe variant="rainbow" height={5} radius={3} style={{ width: 72 }} />
      <div className={styles.eyebrow}>MODULE</div>
      <div className={styles.title}>{formatMessage({ id: 'placeholder.title' })}</div>
      <p className={styles.hint}>{hint ?? formatMessage({ id: 'placeholder.hint' })}</p>
    </div>
  );
}

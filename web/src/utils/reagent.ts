import { useEffect, useRef, useState } from 'react';

/**
 * 试剂色主题的公共工具：颜色令牌、状态映射、数字滚动。
 */

export const REAGENT = {
  blue: '#2B5FFF',
  green: '#16C79A',
  pink: '#FF4F8B',
  amber: '#FFB020',
  purple: '#7C4DFF',
  red: '#FF5A5A',
  inkSoft: 'rgba(14, 26, 36, 0.08)',
} as const;

/** 部门 → 主色（用于 Dashboard 卡片、图表分色） */
export const DEPT_COLOR = {
  cs: REAGENT.blue, // CS 客户服务
  op: REAGENT.amber, // OP 业务运营
  lab: REAGENT.green, // Lab 实验室
  report: REAGENT.pink, // 报告
  system: REAGENT.purple, // 系统管理
} as const;

/** 状态 → antd Tag color */
export function statusTagColor(status?: string | null): string {
  if (!status) return 'default';
  const s = status.toUpperCase();
  if (['ACTIVE', 'PASSED', 'DONE', 'APPROVED', 'ISSUED'].includes(s))
    return 'green';
  if (['PENDING', 'PROCESSING', 'IN_PROGRESS', 'WAITING'].includes(s))
    return 'gold';
  if (['REVIEW', 'REVIEWING'].includes(s)) return 'blue';
  if (['REJECTED', 'FAILED', 'INACTIVE'].includes(s)) return 'red';
  return 'default';
}

/**
 * 数字滚动：从 0 缓动到 target。
 * 用 rAF 而不是 setInterval，动效丝滑；
 * 尊重 prefers-reduced-motion，直接落点。
 */
export function useCountUp(target: number, durationMs = 500): number {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) {
      setValue(target);
      return;
    }
    startedRef.current = true;
    const start = performance.now();
    const from = 0;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

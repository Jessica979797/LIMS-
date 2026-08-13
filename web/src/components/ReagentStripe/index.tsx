import type { CSSProperties } from 'react';

type Variant = 'rainbow' | 'blue' | 'green' | 'pink' | 'purple' | 'amber';

const gradients: Record<Variant, string> = {
  rainbow:
    'linear-gradient(90deg, var(--reagent-blue) 0%, var(--agar-green) 34%, var(--purple) 62%, var(--indicator-pink) 82%, var(--amber) 100%)',
  blue:
    'linear-gradient(90deg, var(--reagent-blue), rgba(43, 95, 255, 0.3))',
  green:
    'linear-gradient(90deg, var(--agar-green), rgba(22, 199, 154, 0.3))',
  pink:
    'linear-gradient(90deg, var(--indicator-pink), rgba(255, 79, 139, 0.3))',
  purple: 'linear-gradient(90deg, var(--purple), rgba(124, 77, 255, 0.3))',
  amber: 'linear-gradient(90deg, var(--amber), rgba(255, 176, 32, 0.3))',
};

interface Props {
  variant?: Variant;
  height?: number;
  radius?: number;
  style?: CSSProperties;
}

/**
 * 试剂色条 —— 整站的记忆点：
 * 出现在 KPI 卡顶、登录页左侧、菜单激活项、header 底缘。
 * 一根 4px 高的渐变条，把整套后台串起来。
 */
export default function ReagentStripe({
  variant = 'rainbow',
  height = 4,
  radius = 0,
  style,
}: Props) {
  return (
    <div
      style={{
        height,
        borderRadius: radius,
        background: gradients[variant],
        ...style,
      }}
    />
  );
}

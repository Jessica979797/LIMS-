import { Result } from 'antd';

interface Props {
  title: string;
  desc?: string;
}

export default function PagePlaceholder({ title, desc }: Props) {
  return (
    <Result
      status="info"
      title={title}
      subTitle={desc ?? '该模块功能开发中，敬请期待'}
    />
  );
}

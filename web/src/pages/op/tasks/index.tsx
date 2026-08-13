import { useIntl } from '@umijs/max';
import PageShell from '@/components/PageShell';
import PagePlaceholder from '@/components/PagePlaceholder';

export default function Page() {
  const { formatMessage } = useIntl();
  return (
    <PageShell
      dept="op"
      eyebrow={formatMessage({ id: 'dept.op' })}
      title={formatMessage({ id: 'shell.op.tasks.title' })}
      desc={formatMessage({ id: 'shell.op.tasks.desc' })}
    >
      <PagePlaceholder hint={formatMessage({ id: 'placeholder.op.tasks' })} />
    </PageShell>
  );
}

import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { history, useModel, useIntl } from '@umijs/max';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { auth } from '@/utils/auth';
import ReagentStripe from '@/components/ReagentStripe';
import styles from './index.less';

export default function Login() {
  const { setInitialState } = useModel('@@initialState');
  const { formatMessage } = useIntl();

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        message.error(data.message || formatMessage({ id: 'login.fail' }));
        return;
      }
      auth.setToken(data.accessToken);
      await setInitialState((s: any) => ({ ...s, currentUser: data.user }));
      message.success(formatMessage({ id: 'login.success' }));
      history.push('/');
    } catch {
      message.error(formatMessage({ id: 'common.networkError' }));
    }
  };

  return (
    <div className={styles.wrap}>
      {/* 左：层析柱（六色渐入色带 + 大字水印） */}
      <div className={styles.column} aria-hidden>
        <div className={styles.bands}>
          <div className={styles.band} />
          <div className={styles.band} />
          <div className={styles.band} />
          <div className={styles.band} />
          <div className={styles.band} />
          <div className={styles.band} />
        </div>
        <div className={styles.watermark}>
          <span>{formatMessage({ id: 'login.watermark.1' })}</span>
          <span>{formatMessage({ id: 'login.watermark.2' })}</span>
          <span>{formatMessage({ id: 'login.watermark.3' })}</span>
          <span>{formatMessage({ id: 'login.watermark.4' })}</span>
        </div>
        <div className={styles.meta}>
          <strong>{formatMessage({ id: 'login.version' })}</strong>
          {formatMessage({ id: 'login.subtitle' })}
        </div>
      </div>

      {/* 右：表单 */}
      <div className={styles.pane}>
        <div className={styles.brand}>
          <h1>LIMS</h1>
          <div className={styles.subtitle}>
            {formatMessage({ id: 'login.subtitle' })}
          </div>
          <ReagentStripe height={4} radius={2} style={{ width: 96, marginTop: 20 }} />
        </div>

        <h2 className={styles.formTitle}>{formatMessage({ id: 'login.welcome' })}</h2>
        <p className={styles.formHint}>{formatMessage({ id: 'login.hint' })}</p>

        <LoginForm
          submitter={{ searchConfig: { submitText: formatMessage({ id: 'login.submit' }) } }}
          onFinish={handleSubmit}
        >
          <ProFormText
            name="username"
            fieldProps={{ size: 'large', prefix: <UserOutlined /> }}
            placeholder={formatMessage({ id: 'login.username' })}
            rules={[{ required: true, message: formatMessage({ id: 'login.usernameRequired' }) }]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
            placeholder={formatMessage({ id: 'login.password' })}
            rules={[{ required: true, message: formatMessage({ id: 'login.passwordRequired' }) }]}
          />
        </LoginForm>

        <div className={styles.record}>
          <span className={styles.label}>{formatMessage({ id: 'login.demoLabel' })}</span>
          <span className={styles.creds}>admin</span>
          <span style={{ margin: '0 6px', color: 'var(--ink-3)' }}>/</span>
          <span className={styles.creds}>admin123</span>
        </div>
      </div>
    </div>
  );
}

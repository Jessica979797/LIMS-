import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { Card, message } from 'antd';
import { history, useModel } from '@umijs/max';
import { auth } from '@/utils/auth';

export default function Login() {
  const { setInitialState } = useModel('@@initialState');

  const handleSubmit = async (values: { username: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        message.error(data.message || '登录失败');
        return;
      }
      auth.setToken(data.accessToken);
      await setInitialState((s: any) => ({ ...s, currentUser: data.user }));
      message.success('登录成功');
      history.push('/');
    } catch {
      message.error('网络错误，请稍后重试');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>LIMS 检测系统</h2>
        <LoginForm onFinish={handleSubmit}>
          <ProFormText
            name="username"
            placeholder="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          />
          <ProFormText.Password
            name="password"
            placeholder="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          />
        </LoginForm>
        <div style={{ textAlign: 'center', color: '#999' }}>
          默认账号：admin / admin123
        </div>
      </Card>
    </div>
  );
}

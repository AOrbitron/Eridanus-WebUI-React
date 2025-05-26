import { userLogin, getCurrentUser } from '@/services/ant-design-pro/api';
import { Modal } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-components';
import { history, useModel, Helmet } from '@umijs/max';
import { message } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { sha3_256 } from 'js-sha3';

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.isDark;
  //登录状态
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // 保存账户密码到本地存储
  const saveCredentials = (account: string, password: string) => {
    localStorage.setItem('saved_account', account);
    localStorage.setItem('saved_password', password); // 已加密的密码
  };

  // 清除本地存储的账户密码
  const clearCredentials = () => {
    localStorage.removeItem('saved_account');
    localStorage.removeItem('saved_password');
  };

  //提交登录请求
  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 对密码进行sha3-256加密
      const encryptedPassword = sha3_256(values.password || '');
      values.password = encryptedPassword;

      // 发送登录请求到新API
      const loginResult = await userLogin(values);

      if (loginResult.error) {
        message.error('用户名或密码错误');
        // 如果登录失败且使用的是保存的凭据，清除它们
        if (values.account === localStorage.getItem('saved_account')) {
          clearCredentials();
        }
        return;
      } else {
        //本地储存token，虽然没必要三元，但是报错有点碍眼
        localStorage.setItem('auth_token', loginResult.auth_token ? loginResult.auth_token : '');
        //设置cookies，服务端已经设置过了（为了本地模拟还是要加上）
        document.cookie = `auth_token=${loginResult.auth_token}`;

        // 如果选择了自动登录，保存账户和密码
        if (values.autoLogin) {
          saveCredentials(values.account || '', encryptedPassword);
        } else {
          // 如果没有选择自动登录，清除之前可能保存的凭据
          clearCredentials();
        }

        //获取当前用户信息
        const currentUser = await getCurrentUser();
        //更新到全局状态
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser,
          }));
        });
        message.success('登录成功');
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        // 获取当前用户信息并更新到全局状态
        return;
      }
    } catch (error) {
      // 交给requestErrorConfig处理了
      // message.error('登录失败');
    }
  };

  // 尝试使用保存的凭据自动登录
  const attemptAutoLogin = async () => {
    const savedAccount = localStorage.getItem('saved_account');
    const savedPassword = localStorage.getItem('saved_password');

    if (savedAccount && savedPassword) {
      try {

        // 尝试登录
        const loginResult = await userLogin({
          account: savedAccount,
          password: savedPassword, // 已经是加密后的密码
        });

        if (loginResult.message) {
          message.success(loginResult.message);
        }

        if (loginResult.error) {
          // 登录失败，清除保存的凭据
          clearCredentials();
          return;
        }

        // 登录成功
        localStorage.setItem('auth_token', loginResult.auth_token ? loginResult.auth_token : '');
        document.cookie = `auth_token=${loginResult.auth_token}`;

        // 获取用户信息并更新状态
        const currentUser = await getCurrentUser();
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser,
          }));
        });

        message.success('自动登录成功');
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
      } catch (error) {
        // 登录过程出错，清除凭据
        clearCredentials();
      }
    }
  };

  //页面打开，尝试自动登录
  useEffect(() => {
    attemptAutoLogin();
  }, []);

  //渲染页面
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        background: isDark ? '#1f1f1f' : '#f5f5f5',
      }}
    >
      <Helmet>
        <title>
          {'登录'} - {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/icons/icon-192x192.png" />}
          title="Eridanus WebUI"
          subTitle={'请登录'}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <ProFormText
            name="account"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder={'用户名'}
            rules={[
              {
                required: true,
                message: '请输入用户名',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={'密码'}
            rules={[
              {
                required: true,
                message: '请输入密码',
              },
            ]}
          />
          <ProFormCheckbox name="autoLogin" noStyle>
            自动登录
          </ProFormCheckbox>
          <a
            style={{ float: 'right', marginBottom: '20px' }}
            onClick={() => setHelpModalVisible(true)}
          >
            不知道/忘记账户密码？
          </a>
          {/* 帮助信息模态框 */}
          <Modal
            title="账户密码帮助"
            open={helpModalVisible}
            onCancel={() => setHelpModalVisible(false)}
            footer={null}
            centered
          >
            <hr />
            <p>
              如果您是第一次使用，默认账户密码均为：
              <h1 style={{ textAlign: 'center' }}>eridanus</h1>
            </p>
            <hr />
            <p>
              如果您忘记了账户和密码，请在<strong style={{ fontSize: '1.5rem' }}> Eridanus </strong>
              目录下，找到<strong style={{ fontSize: '1.5rem' }}> user_info.yaml </strong>
              文件，将其删除。然后重启服务端，账户密码恢复为默认。
            </p>
            <hr />
            <p>
              如果您有公网访问的需要，为了安全起见，请务必在登录后，找到顶部工具栏右上角的{' '}
              <UserOutlined style={{ fontSize: '2rem' }} /> 按钮，立即修改账户密码！
            </p>
          </Modal>
        </LoginForm>
      </div>
    </div>
  );
};
export default Login;

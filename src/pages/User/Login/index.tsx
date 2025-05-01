import { userLogin, getCurrentUser } from '@/services/ant-design-pro/api';
import { LockOutlined, UserOutlined, } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { history, useModel, Helmet } from '@umijs/max';
import { message } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { sha3_256 } from 'js-sha3';

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.navTheme === 'realDark';
  //登录状态
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});


  //获取用户信息
  // const fetchUserInfo = async () => {
  //   const userInfo = await initialState?.fetchUserInfo?.();
  //   if (userInfo) {
  //     flushSync(() => {
  //       setInitialState((s) => ({
  //         ...s,
  //         currentUser: userInfo,
  //       }));
  //     });
  //   }
  // };
  //提交登录请求
  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 对密码进行sha3-256加密
      values.password = sha3_256(values.password || '');

      // 发送登录请求到新API
      const loginResult = await userLogin(values);

      if (loginResult.error) {
        message.error('用户名或密码错误');
        return;
      } else {
        //本地储存token，虽然没必要三元，但是报错有点碍眼
        localStorage.setItem('auth_token', loginResult.auth_token ? loginResult.auth_token : '');
        //设置cookies，服务端已经设置过了（为了本地模拟还是要加上）
        document.cookie = `auth_token=${loginResult.auth_token}`;
        message.success('登录成功');
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }
    } catch (error) {
      // 交给requestErrorConfig处理了
      // message.error('登录失败');
    }
  };

  //页面打开，先尝试使用本地token验证登录（逻辑放到app.tsx）
  useEffect(() => {
    // directLogin();
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
          initialValues={{
            autoLogin: true,
          }}
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

        </LoginForm>
      </div>
      {/* <Footer /> */}
    </div>
  );
};
export default Login;

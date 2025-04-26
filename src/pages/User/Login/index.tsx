import { Footer } from '@/components';
import { login } from '@/services/ant-design-pro/api';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormText,
} from '@ant-design/pro-components';
import { history, useModel, Helmet } from '@umijs/max';
import { Alert, message } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { createStyles } from 'antd-style';
import { sha3_256 } from 'js-sha3';


const useStyles = createStyles(({ token }) => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      // backgroundColor:,
      // backgroundImage:
      //   "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});


const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const directLogin = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    // 设置cookie
    document.cookie = `auth_token=${token}; path=/`;
    // 验证token有效性
    fetch('/api/profile', {
      method: 'GET',
      headers: {
        'auth': `${token}`,
      },
    })
    .then(response => {
      if (response.ok) {
        try{
          const data = response.json();
        }catch{
          console.log('data error');
        }
        if(data.name !== ''){
          const urlParams = new URL(window.location.href).searchParams;
          history.push(urlParams.get('redirect') || '/');
        }
      }
    })
    .catch(() => {
      // Token无效，清除存储
      localStorage.removeItem('auth');
      document.cookie = '';
    });
  }
}

const Login: React.FC = () => {
  //登录状态
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  //设置账户类型
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  //获取用户信息
  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };
  //提交登录请求
  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 对密码进行sha3-256加密
      const encryptedPassword = sha3_256(values.password || '');

      // 发送登录请求到新API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: values.account,
          password: encryptedPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Success') {
        // 登录成功
        const defaultLoginSuccessMessage = '登录成功！';
        message.success(defaultLoginSuccessMessage);

        // 保存auth_token到localStorage和cookie
        localStorage.setItem('auth_token', data.auth_token);
        document.cookie = `auth_token=${data.auth_token}; path=/`;

        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }

      // 登录失败
      setUserLoginState({ status: 'error', type: 'account' });
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试！';
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };
  const { status, type: loginType } = userLoginState;

  useEffect(() => {
    directLogin();
  }, []);
  return (
    <div className={styles.container}>
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
          {status === 'error' && loginType === 'account' && (
            <LoginMessage content={'用户名或密码错误'} />
          )}

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
      <Footer />
    </div>
  );
};
export default Login;

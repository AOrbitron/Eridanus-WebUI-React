import { Footer, ColorMode, UserProfile, LogOut } from '@/components';
import { useModel } from '@umijs/max';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { getCurrentUser } from '@/services/ant-design-pro/api';
import React, { Children } from 'react';
import { ConfigProvider, theme, message } from 'antd';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings> & { isDark: boolean }; // 更新类型定义以包含 isDark
  currentUser?: API.Profile;
  loading?: boolean;
  directLogin?: () => Promise<API.Profile | undefined>;
}> {
  //本地读取token验证.如果验证失败，清除本地存储的token。返回API.Profile
  const directLogin = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // 设置cookie
      document.cookie = `auth_token=${token}`;
      // 验证token有效性
      getCurrentUser().then(userStatus => {
        if (userStatus.error) {
          // 清除token
          localStorage.removeItem('auth_token');
          document.cookie = '';
          message.error('登录过期，请重新登录');
          return undefined;
        }
        return userStatus;
      })
    }
    return undefined;
  }

  // 初始化主题
  const initTheme = () => {
    const isDark = localStorage.getItem('isDark') === 'true';
    return {
      ...defaultSettings,
      navTheme: isDark ? 'realDark' : 'light',
      isDark: isDark, // 将 isDark 添加到 settings 中
      token: {
        bgLayout: isDark ? '#181818' : '#f5f5f5',
        // bgLayout: 'linear-gradient(to bottom, #181818 0%,#252525 100%)',
        sider: {
          colorMenuBackground: isDark ? ' #1f1f1f' : " #fbfbfb",
        }
      },
    } as Partial<LayoutSettings> & { isDark: boolean }; // 更新类型定义以包含 isDark
  };


  // 如果不在登录页面，先检查用户信息。如果用户信息本地不存在或者过期，跳转到登录页面
  // const { location } = history;
  // if (location.pathname !== loginPath) {
  const currentUser = directLogin();
  return {
    directLogin: async () => directLogin(),
    currentUser: currentUser ? currentUser : undefined,
    settings: initTheme(),
  };
  // }
  // return {
  //   directLogin,
  //   settings: initTheme(),
  // };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  // 根据当前主题设置应用全局主题配置
  const isDark = initialState?.settings?.isDark;

  //这一段configprovider主要是给message组件用的
  ConfigProvider.config({
    theme: {
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorBgBase: isDark ? "#1b1b1b" : "#f5f5f5",
        fontSize: 16,
        sizeStep: 4,
        borderRadius: 8,
        colorTextBase: isDark ? "#f6f6f6" : "#0e0e0e",
      },
    },
  });
  return {
    actionsRender: () => [
      <React.Fragment key="actions">
        <ColorMode key="colormode" />
        <UserProfile key="userprofile" />
        <LogOut key="logout" />
      </React.Fragment>
    ],

    //页面变更时响应
    onPageChange: () => {
      const { location } = history;
      const userStatus = getCurrentUser().then(userStatus => {
        if (location.pathname !== loginPath && userStatus?.error) {
          // 清除token
          localStorage.removeItem('auth_token');
          document.cookie = '';
          location.pathname === '/dashboard'? null : message.info('请先登录');
          history.push(loginPath);
        }
      });
      // 如果没有登录，重定向到 login

    },

    menuHeaderRender: undefined,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {/*这一段configprovider给子组件用，不然子组件颜色渲染没有预期效果 */}
          <ConfigProvider
            theme={{
              algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
              token: {
                colorSuccess: "#95da73",
                colorBgBase: isDark ? "#0e0e0e" : "#fff",
                fontSize: 16,
                sizeStep: 4,
                borderRadius: 8,
                colorTextBase: isDark ? "#f6f6f6" : "#0e0e0e",
              },
              components: {
                Card: {
                  paddingLG: 10,
                  boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
                },
              },
            }}
          >
            {children}
          </ConfigProvider>
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};

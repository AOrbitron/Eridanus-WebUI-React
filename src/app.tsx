import { Footer, ColorMode,UserProfile, LogOut} from '@/components';
import { useModel } from '@umijs/max';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import React from 'react';
import { ConfigProvider, theme, message } from 'antd';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

// const { initialState, setInitialState } = useModel('@@initialState');
// const isDarkMode = initialState?.settings?.navTheme === 'realDark';
// ConfigProvider.config({
//   theme: {
//     algorithm: theme.darkAlgorithm,
//     token: {
//       colorSuccess: "#95da73",
//       colorBgBase: "#f6f6f6",
//       fontSize: 16,
//       sizeStep: 4,
//       borderRadius: 8,
//       colorTextBase: "#f6f6f6"
//     },
//   },
// });
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      // 检查是否有auth_token
      const token = localStorage.getItem('auth_token');
      if (token) {
        // 设置cookie
        document.cookie = `auth_token=${token}; path=/`;
        // return 'abc';

        // 尝试获取用户信息
        const response = await fetch(`/api/profile`, {
          method: 'GET',
          headers: {
            'auth': `${token}`,
          },
        });
        if(!response.ok){
          return undefined;
        }
        try{
          const data = await response.json();
          if(data.name !==''){
            return data;
          }
        } catch (error) {
          message.error('400');
          // return undefined; // Us
          // Token无效，清除存储
          // localStorage.removeItem('auth_token');
          // document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          // history.push(loginPath);
        }
      }

      // 如果没有token或token无效，尝试使用原有方式获取用户信息
    //   const msg = await queryCurrentUser({
    //     skipErrorHandler: true,
    //   });
    //   return msg.data;
    } catch (error) {
      message.error(`${error}`);
      history.push(loginPath);
    }
    return undefined;
  };


  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'realDark' || savedTheme === 'light') {
      return {
        ...defaultSettings,
        navTheme: savedTheme,
      } as Partial<LayoutSettings>;
    }
    return defaultSettings as Partial<LayoutSettings>;
  };


  // 如果不是登录页面，先检查用户信息，如果用户信息本地不存在或者过期，跳转到登录页面
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: initTheme(),
    };
  }
  return {
    fetchUserInfo,
    settings: initTheme(),
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  // 根据当前主题设置应用全局主题配置
  const isDarkMode = initialState?.settings?.navTheme === 'realDark';
  ConfigProvider.config({
    theme: {
      algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorSuccess: "#95da73",
        colorBgBase: isDarkMode ? "#0e0e0e" : "#f6f6f6",
        fontSize: 16,
        sizeStep: 4,
        borderRadius: 8,
        colorTextBase: isDarkMode ? "#f6f6f6" : "#0e0e0e",
      },
    },
  });
  return {
    actionsRender: () => [
      <React.Fragment key="actions">
        <ColorMode key="doc" />
        <UserProfile key="userprofile" />
        <LogOut key="logout" />
      </React.Fragment>
    ],
    // avatarProps: {
    //   src: initialState?.currentUser?.avatar,
    //   title: <AvatarName />,
    //   render: (_, avatarChildren) => {
    //     return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
    //   },
    // },
    // footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    // bgLayoutImgList: [
    //   {
    //     src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
    //     left: 85,
    //     bottom: 100,
    //     height: '303px',
    //   },
    //   {
    //     src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
    //     bottom: -68,
    //     right: -45,
    //     height: '303px',
    //   },
    //   {
    //     src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
    //     bottom: 0,
    //     left: 0,
    //     width: '331px',
    //   },
    // ],
    menuHeaderRender: undefined,
    // menuContentRender: (props,defaultDom) => {<div style={{backgroundColor:"#0e0e0e"}}>{defaultDom}</div>},
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <ConfigProvider
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorSuccess: "#95da73",
            colorBgBase: isDarkMode ? "#0e0e0e" : "#f6f6f6",
            fontSize: 16,
            sizeStep: 4,
            borderRadius: 8,
            colorTextBase: isDarkMode ? "#f6f6f6" : "#0e0e0e",
          },
        }}
      >
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
        </ConfigProvider>
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

import { SunOutlined, UserOutlined, MoonOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button, Tooltip, Popconfirm } from "antd";
import '@umijs/max';
import React, { useState } from 'react';
import { useModel } from '@umijs/max';
import { history } from '@umijs/max';
import { stringify } from 'querystring';
import { userLogout } from '@/services/ant-design-pro/api';
import { flushSync } from 'react-dom';
import UserProfileModal from './UserProfileModal';
import { appMessage } from '@/utils/appMessage';

export type SiderTheme = 'light' | 'dark';

//深色模式切换
export const ColorMode = () => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const isDark = initialState?.settings?.navTheme === 'realDark';

  const toggleTheme = () => {
    if (initialState?.settings) {
      // 计算切换后的主题状态
      const newNavTheme = isDark ? 'light' : 'realDark';
      const newIsDark = newNavTheme === 'realDark';

      setInitialState((preInitialState) => ({
        ...preInitialState!,
        settings: {
          ...preInitialState!.settings,
          // 使用计算出的新主题
          isDark: newIsDark,
          navTheme: newNavTheme,
          // 根据新主题设置 token
          token: {
            bgLayout: newIsDark
              ? '#17191f'
              : 'linear-gradient(160deg, #f9dceb 0%, #e9e7f7 52%, #dce8f4 100%)',
            header: {
              colorBgHeader: newIsDark ? 'rgba(23,25,31,0.78)' : 'rgba(255,255,255,0.62)',
            },
            sider: {
              colorMenuBackground: newIsDark ? 'rgba(23,25,31,0.74)' : 'rgba(255,255,255,0.64)',
            },
            pageContainer: {
              colorBgPageContainer: 'transparent',
            },
          },
        },
      }));

      // 保存切换后的设置到 localStorage
      localStorage.setItem('isDark', newIsDark ? 'true' : 'false');
    }
  };

  return (
    <Tooltip title={isDark ? "切换到浅色模式" : "切换到深色模式"}>
      <Button
        type="text"
        aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
      />
    </Tooltip>
  );
};

//用户信息
export const UserProfile = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Tooltip title="修改登录信息">
        <Button
          type="text"
          aria-label="修改登录信息"
          icon={<UserOutlined />}
          onClick={() => setModalVisible(true)}
        />
      </Tooltip>
      <UserProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

//退出登录
export const LogOut = () => {
  const { setInitialState } = useModel('@@initialState');

  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    // 退出登录
    try {
      const logoutResult = await userLogout();
      if (logoutResult.message) {
        appMessage.success(logoutResult.message);
      }
      if (logoutResult.error) {
        appMessage.error(logoutResult.error);
        return;
      }
    } catch (error) {
      //网络问题交给umi处理
      return;
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('saved_account');
    localStorage.removeItem('saved_password');
    document.cookie = 'auth_token=; Max-Age=0; path=/';
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
    flushSync(() => {
      setInitialState((state: any) => ({ ...state, currentUser: undefined }));
    });
    return;
  };

  return (
    <Tooltip title="退出登录">
      <Popconfirm
        title="确认退出登录吗？"
        placement='bottomLeft'
        onConfirm={loginOut}
        okText="是"
        cancelText="否"
      >
        <Button type="text" aria-label="退出登录" icon={<LogoutOutlined />} />
      </Popconfirm>
    </Tooltip>
  );
};

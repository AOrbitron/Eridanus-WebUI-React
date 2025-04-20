import { SunOutlined, UserOutlined, MoonOutlined, LogoutOutlined } from '@ant-design/icons';
import { Tooltip, Popconfirm } from "antd";
import '@umijs/max';
import React, { useState } from 'react';
import { useModel } from '@umijs/max';
import { history } from '@umijs/max';
import { stringify } from 'querystring';
import { accountLogout } from '@/services/ant-design-pro/api';
import { flushSync } from 'react-dom';
import UserProfileModal from './UserProfileModal';

export type SiderTheme = 'light' | 'dark';

const BottonStyle = {
  display: 'flex',
  height: 50,
  width: 50,
  alignItems: 'center',
  justifyContent: 'center',
}

//深色模式切换
export const ColorMode = () => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const isDark = initialState?.settings?.navTheme === 'realDark';

  const toggleTheme = () => {
    const theme = isDark ? 'light' : 'realDark';

    if (initialState?.settings) {
      setInitialState((preInitialState) => ({
        ...preInitialState!,
        settings: {
          ...preInitialState!.settings,
          navTheme: theme,
          token: {
            bgLayout: !isDark ? '#181818' : '#f9f9f9',
            sider: {
              colorMenuBackground: !isDark ? '#1f1f1f' : "#e3e3e3",
            }
          },
        },
      }));

      // 保存设置到 localStorage
      localStorage.setItem('theme', theme);
    }
  };

  return (
    <Tooltip title={isDark ? "切换到浅色模式" : "切换到深色模式"}>
      <div
        style={BottonStyle}
        onClick={toggleTheme}
      >
        {isDark ? <SunOutlined /> : <MoonOutlined />}
      </div>
    </Tooltip>
  );
};

//用户信息
export const UserProfile = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Tooltip title="修改用户信息">
        <div
          style={BottonStyle}
          onClick={() => setModalVisible(true)}
        >
          <UserOutlined />
        </div>
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
    await accountLogout({ auth: localStorage.getItem('token') || undefined });
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      flushSync(() => {
        setInitialState((s: any) => ({ ...s, currentUser: undefined }));
      });
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
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
        <div
          style={BottonStyle}
        >
          <LogoutOutlined />
        </div>
      </Popconfirm>
    </Tooltip>
  );
};

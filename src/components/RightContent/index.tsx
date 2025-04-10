import { SunOutlined, UserOutlined, MoonOutlined, LogoutOutlined } from '@ant-design/icons';
import { Tooltip } from "antd";
import '@umijs/max';
import React from 'react';
import { useModel } from '@umijs/max';

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
        },
      }));
      
      // 保存设置到 localStorage
      localStorage.setItem('theme', theme);
    }
  };

  return (
    <Tooltip title={isDark ? "切换到浅色模式" : "切换到深色模式"}>
      <div
        style={{
          ...BottonStyle,
          cursor: 'pointer',
        }}
        onClick={toggleTheme}
      >
        {isDark ? <SunOutlined /> : <MoonOutlined />}
      </div>
    </Tooltip>
  );
};

//用户信息
export const UserProfile = () => {
  return (
    <Tooltip title="用户信息">
      <div
        style={BottonStyle}
        onClick={() => {
          window.open('https://pro.ant.design/docs/getting-started');
        }}
      >
        <UserOutlined />

      </div>
    </Tooltip>
  );
};

export const LogOut = () => {
  return (
    <Tooltip title="退出登录">
      <div
        style={BottonStyle}
        onClick={() => {
          window.open('https://pro.ant.design/docs/getting-started');
        }}
      >
        <LogoutOutlined />

      </div>
    </Tooltip>
  );
};
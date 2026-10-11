import React, { useEffect } from 'react';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import { Helmet, history, type RunTimeLayoutConfig } from '@umijs/max';
import { stringify } from 'querystring';
import { ColorMode, LogOut, UserProfile } from '@/components';
import { clearAuthentication } from './initial-state';
import { getCurrentUser } from '@/services/ant-design-pro/api';
import PlaylistController from './PlaylistController';
import { registerMessage } from '@/utils/appMessage';
import './theme.less';

const GlobalMessageHost: React.FC = () => {
  const { message: messageApi } = AntdApp.useApp();

  useEffect(() => {
    registerMessage(messageApi);
    return () => registerMessage(null);
  }, [messageApi]);

  return null;
};

export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const isDark = Boolean(initialState?.settings?.isDark);

  return {
    actionsRender: () => [
      <ColorMode key="color-mode" />,
      <UserProfile key="user-profile" />,
      <LogOut key="logout" />,
    ],
    onPageChange: async () => {
      const { pathname, search } = history.location;
      if (pathname === '/user/login') return;

      const token = localStorage.getItem('auth_token');
      if (!token) {
        history.replace(`/user/login?${stringify({ redirect: pathname + search })}`);
        return;
      }

      try {
        const user = await getCurrentUser();
        if (!user?.error) return;
      } catch {
        // The request layer handles the network error; expired sessions still return to login.
      }

      clearAuthentication();
      setInitialState((state) => ({ ...state, currentUser: undefined }));
      history.replace(`/user/login?${stringify({ redirect: pathname + search })}`);
    },
    menuHeaderRender: undefined,
    childrenRender: (children) => (
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#6274d8',
            colorLink: '#5264c9',
            colorSuccess: '#438b64',
            colorBgBase: isDark ? '#17191f' : '#f7f8fc',
            colorTextBase: isDark ? '#f1f2f6' : '#252936',
            borderRadius: 8,
          },
          components: {
            Card: { paddingLG: 16 },
            Statistic: { titleFontSize: 14, contentFontSize: 18 },
          },
        }}
      >
        <AntdApp>
          <GlobalMessageHost />
          <div className={`app-theme${isDark ? ' app-theme-dark' : ''}`}>
            {children}
            <PlaylistController isDark={isDark} />
          </div>
        </AntdApp>
        <Helmet>
          <meta name="referrer" content="no-referrer" />
          <script
            src="https://registry.npmmirror.com/dplayer/1.27.1/files/dist/DPlayer.min.js"
            type="application/javascript"
          />
          <script
            src="https://registry.npmmirror.com/aplayer/1.10.1/files/dist/APlayer.min.js"
            type="application/javascript"
          />
          <link
            href="https://registry.npmmirror.com/aplayer/1.10.1/files/dist/APlayer.min.css"
            rel="stylesheet"
          />
        </Helmet>
      </ConfigProvider>
    ),
    ...initialState?.settings,
  };
};

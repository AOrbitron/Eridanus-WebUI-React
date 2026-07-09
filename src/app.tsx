import { Footer, ColorMode, UserProfile, LogOut } from '@/components';
import { useModel } from '@umijs/max';
import { LinkOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { getCurrentUser } from '@/services/ant-design-pro/api';
import React, { Children, useState, useEffect, useRef } from 'react';
import { ConfigProvider, theme, message } from 'antd';
import { Helmet } from 'react-helmet';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

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
        // 桃雾(#FFC0E9) → 青瑶(#99A5FF) 渐变；组件用毛玻璃透出该渐变，避免纯白块割裂
        bgLayout: isDark
          ? '#181818'
          : 'linear-gradient(160deg, #ffd8ef 0%, #ece8ff 50%, #ccd3ff 100%)',
        header: {
          colorBgHeader: isDark ? 'rgba(24,24,28,0.55)' : 'rgba(255,255,255,0.30)',
        },
        sider: {
          colorMenuBackground: isDark ? 'rgba(24,24,28,0.42)' : 'rgba(255,255,255,0.30)',
        },
        pageContainer: {
          colorBgPageContainer: 'transparent',
        },
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
        colorPrimary: "#99A5FF",
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
          location.pathname === '/dashboard' ? null : message.info('请先登录');
          history.push(`${loginPath}?redirect=${encodeURIComponent(location.pathname)}`);
          // window.location.reload();
        }
      });
      // 如果没有登录，重定向到 login

    },

    menuHeaderRender: undefined,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      const [playlist, setPlaylist] = useState([]);
      const [isAPlayerCollapsed, setIsAPlayerCollapsed] = useState(true); // 控制APlayer收起状态，默认收起
      const aplayerRef = useRef();

      useEffect(() => {
        const handleAddToPlaylist = (event) => {
          const newSong = event.detail;
          console.log('newSong', newSong);
          console.log('playlist', playlist);
          // 检查音乐是否已经存在于播放列表中
          const isDuplicate = playlist.some(song => song.name == newSong.name && song.artist == newSong.artist);
          if (!isDuplicate) {
            setPlaylist(prev => [...prev, newSong]);
          }
        };

        window.addEventListener('add-to-playlist', handleAddToPlaylist);
        return () => {
          window.removeEventListener('add-to-playlist', handleAddToPlaylist);
        };
      }, [playlist]);

      useEffect(() => {
        if (playlist.length > 0) {
          const initAPlayer = () => {
            if (window.APlayer) {
              if (!aplayerRef.current) {
                // console.log('Initializing APlayer with playlist:', playlist);
                aplayerRef.current = new window.APlayer({
                  container: document.getElementById('aplayer'),
                  loop: 'all',
                  order: 'list',
                  audio: playlist,
                  lrcType: 3,
                });
              } else {
                aplayerRef.current.list.add(playlist[playlist.length - 1]);
              }
            } else {
              // console.log('APlayer not loaded yet, retrying in 1000ms');
              setTimeout(initAPlayer, 1000);
            }
          };
          initAPlayer();
        }
      }, [playlist]);

      // 切换APlayer展开/收起状态
      const toggleAPlayer = () => {
        setIsAPlayerCollapsed(!isAPlayerCollapsed);
      };

      return (
        <>
          {/*这一段configprovider给子组件用，不然子组件颜色渲染没有预期效果 */}
          <ConfigProvider
            theme={{
              algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
              token: {
                colorPrimary: "#99A5FF",
                colorLink: "#7f8dff",
                colorSuccess: "#95da73",
                colorBgBase: isDark ? "#0e0e0e" : "#fbfbfb",
                fontSize: 14,
                sizeStep: 4,
                borderRadius: 8,
                colorTextBase: isDark ? "#f6f6f6" : "#0e0e0e",
              },
              components: {
                Card: {
                  paddingLG: 10,
                  boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
                },
                Statistic: {
                  titleFontSize: 14,    // 标题文字大小
                  contentFontSize: 18,  // 内容文字大小
                },
              },
            }}
          >
            {children}

            {/* APlayer容器，根据状态调整样式 */}
            <div
              id="aplayer"
              style={{
                position: 'fixed',
                right: isAPlayerCollapsed ? '-350px' : '0',
                bottom: '0',
                width: '350px',
                // height: '', // 设置固定高度以确保容器始终可见
                zIndex: 999,
                transition: 'right 0.3s ease-in-out',
                backgroundColor: isDark ? '#2e2e2e' : '#fff', // 根据主题模式调整背景色
                color: isDark ? '#fff' : '#000', // 根据主题模式调整文字颜色
                // display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                border: isDark ? '1px solid #3a3a3a' : '1px solid #e9e9e9'
              }}
            >
              {playlist.length === 0 && (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <div>🎵 暂无播放列表</div>
                  <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.7 }}>请添加音乐到播放列表</div>
                </div>
              )}
            </div>
            {/* 收起/展开按钮 */}
            <div
              onClick={toggleAPlayer}
              style={{
                position: 'fixed',
                right: isAPlayerCollapsed ? '0' : '350px',
                bottom: '5px',
                zIndex: 1000,
                backgroundColor: isDark ? '#2e2e2e' : '#fff',
                color: isDark ? '#fff' : '#000',
                border: '1px solid #d9d9d9',
                borderRadius: '5px',
                width: '20px',
                height: '40px',
                cursor: 'pointer',
                transition: 'right 0.3s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isAPlayerCollapsed ? <LeftOutlined /> : <RightOutlined />}
            </div>
          </ConfigProvider>
          <Helmet>
            {/* 禁用referrer，避免跨域拒绝响应 */}
            <meta name="referrer" content="no-referrer" />
            {/* 引入CDN，减少加载时间 */}
            <script src="https://registry.npmmirror.com/dplayer/1.27.1/files/dist/DPlayer.min.js" type="application/javascript"></script>
            <script src="https://registry.npmmirror.com/aplayer/1.10.1/files/dist/APlayer.min.js" type="application/javascript"></script>
            <link href="https://registry.npmmirror.com/aplayer/1.10.1/files/dist/APlayer.min.css" type="text/css" rel="stylesheet" />
            {/* 自定义APlayer样式以适配深色模式 */}
            <style>{`
              .aplayer-list ol li:hover {
                background: ${isDark ? '#3a3a3a' : '#efefef'} !important;
              }
              .aplayer-list ol li.aplayer-list-light {
                background: ${isDark ? '#2d2d2d' : '#e9e9e9'} !important;
              }

              /* ==== 毛玻璃统一质感：让 桃雾/青瑶 渐变透过各组件，消除纯白色块的割裂感 ==== */
              .ant-card {
                background: ${isDark ? 'rgba(30,30,36,0.50)' : 'rgba(255,255,255,0.42)'} !important;
                -webkit-backdrop-filter: blur(16px) saturate(1.3);
                backdrop-filter: blur(16px) saturate(1.3);
                border: 1px solid ${isDark ? 'rgba(153,165,255,0.16)' : 'rgba(153,165,255,0.22)'};
                box-shadow: 0 6px 26px rgba(153,165,255,0.14) !important;
              }
              /* 顶栏（含 mix 布局顶部导航）+ 侧栏：强模糊 + 低不透明度，透出背景渐变 */
              .ant-layout-header, .ant-pro-top-nav-header, .ant-pro-layout .ant-layout-header {
                background: ${isDark ? 'rgba(24,24,28,0.50)' : 'rgba(255,255,255,0.30)'} !important;
                -webkit-backdrop-filter: blur(18px) saturate(1.3);
                backdrop-filter: blur(18px) saturate(1.3);
              }
              .ant-layout-sider, .ant-pro-sider {
                background: ${isDark ? 'rgba(22,22,28,0.5)' : 'rgba(255,255,255,0.4)'} !important;
                -webkit-backdrop-filter: blur(28px) saturate(1.5);
                backdrop-filter: blur(28px) saturate(1.5);
                border-right: 1px solid ${isDark ? 'rgba(153,165,255,0.14)' : 'rgba(153,165,255,0.22)'};
                box-shadow: 4px 0 24px rgba(153,165,255,0.10);
              }
              .ant-layout-sider-children, .ant-menu, .ant-menu-sub, .ant-menu-root {
                background: transparent !important;
              }
              /* 内容区透明，露出整幅渐变（不再是白底上贴色块） */
              .ant-pro-layout .ant-layout-content, .ant-page-container,
              .ant-pro-page-container, .ant-pro-grid-content {
                background: transparent !important;
              }
              /* 输入类：仅做半透明（不加模糊，控成本），透出所在卡片的玻璃质感 */
              .ant-input, .ant-input-affix-wrapper, .ant-input-number,
              .ant-input-number-affix-wrapper, .ant-select-selector, .ant-picker,
              textarea.ant-input {
                background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.45)'} !important;
              }
              .ant-collapse, .ant-collapse-content, .ant-collapse-item, .ant-collapse-header {
                background: transparent !important;
              }
              .ant-collapse {
                border-color: ${isDark ? 'rgba(153,165,255,0.16)' : 'rgba(153,165,255,0.22)'} !important;
              }
              /* 浮层保持更高不透明度 + 强模糊，保证可读性 */
              .ant-select-dropdown, .ant-dropdown-menu, .ant-modal-content,
              .ant-popover-inner, .ant-picker-panel-container, .ant-message-notice-content {
                background: ${isDark ? 'rgba(30,30,36,0.94)' : 'rgba(255,255,255,0.9)'} !important;
                -webkit-backdrop-filter: blur(18px);
                backdrop-filter: blur(18px);
              }
            `}</style>
          </Helmet>
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

import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import defaultSettings from '../../config/defaultSettings';
import { getCurrentUser } from '@/services/ant-design-pro/api';
import { appMessage } from '@/utils/appMessage';

export type AppSettings = Partial<LayoutSettings> & { isDark: boolean };

export type InitialState = {
  settings: AppSettings;
  currentUser?: API.Profile;
};

export const clearAuthentication = () => {
  localStorage.removeItem('auth_token');
  document.cookie = 'auth_token=; Max-Age=0; path=/';
};

export async function getInitialState(): Promise<InitialState> {
  const isDark = localStorage.getItem('isDark') === 'true';
  const settings: AppSettings = {
    ...defaultSettings,
    navTheme: isDark ? 'realDark' : 'light',
    isDark,
    token: {
      bgLayout: isDark
        ? '#17191f'
        : 'linear-gradient(160deg, #f9dceb 0%, #e9e7f7 52%, #dce8f4 100%)',
      header: {
        colorBgHeader: isDark ? 'rgba(23,25,31,0.78)' : 'rgba(255,255,255,0.62)',
      },
      sider: {
        colorMenuBackground: isDark ? 'rgba(23,25,31,0.74)' : 'rgba(255,255,255,0.64)',
      },
      pageContainer: { colorBgPageContainer: 'transparent' },
    },
  };

  const token = localStorage.getItem('auth_token');
  if (!token) return { settings };

  document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.error) {
      clearAuthentication();
      return { settings };
    }
    return { settings, currentUser };
  } catch {
    clearAuthentication();
    appMessage.warning('登录状态已失效，请重新登录');
    return { settings };
  }
}

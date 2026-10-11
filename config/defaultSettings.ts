import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 青瑶
  colorPrimary: '#6274d8',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Eridanus WebUI',
  pwa: true,
  logo: '/icons/icon-128x128.png',
  iconfontUrl: '',
  token: {
  },
};
export default Settings;

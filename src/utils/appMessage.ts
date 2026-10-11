import { message as staticMessage } from 'antd';

type MessageApi = Pick<typeof staticMessage, 'success' | 'info' | 'warning' | 'error' | 'loading'>;

let messageApi: MessageApi | null = null;

export const registerMessage = (api: MessageApi | null) => {
  messageApi = api;
};

const getMessageApi = () => messageApi || staticMessage;

/**
 * Uses the layout-owned message holder when it is mounted and falls back to
 * Ant Design's static API during application bootstrap.
 */
export const appMessage: MessageApi = {
  success: (...args) => getMessageApi().success(...args),
  info: (...args) => getMessageApi().info(...args),
  warning: (...args) => getMessageApi().warning(...args),
  error: (...args) => getMessageApi().error(...args),
  loading: (...args) => getMessageApi().loading(...args),
};

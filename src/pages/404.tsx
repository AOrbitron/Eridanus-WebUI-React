import { history, useModel } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';
const NoFoundPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.navTheme === 'realDark';

  return (
    <Result
      status="404"
      title="404"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: isDark ? '#1f1f1f' : '#f5f5f5',
      }}
      subTitle={'抱歉，您访问的页面不存在。'}
      extra={
        <Button type="primary" onClick={() => history.push('/')}>
          {'返回首页'}
        </Button>
      }
    />
  );
};

export default NoFoundPage;

import { PageContainer } from '@ant-design/pro-components';
import { Card } from 'antd';
import React from 'react';

const TBD: React.FC = () => {
  return (
    <PageContainer>
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'block', textAlign: 'center', margin: '10px 0' }}>
          <h1>功能开发中，敬请期待</h1>
        </div>
      </Card>
    </PageContainer>
  );
};

export default TBD;

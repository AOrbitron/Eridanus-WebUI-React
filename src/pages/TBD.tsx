import { PageContainer } from '@ant-design/pro-components';
import { Card } from 'antd';
import React from 'react';
import QueueAnim from 'rc-queue-anim';
const TBD: React.FC = () => {
  return (
    <PageContainer>
          <QueueAnim delay={100} type={'bottom'}>
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          overflowX: 'auto',
          height: '50vh',
        }}
        key={1}
      >
        <div style={{ display: 'block', textAlign: 'center', margin: '10px 0' }}>
          <h1>功能开发中，敬请期待</h1>
        </div>
      </Card>
      </QueueAnim>
    </PageContainer>
  );
};

export default TBD;

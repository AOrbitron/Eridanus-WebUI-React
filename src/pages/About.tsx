import { PageContainer } from '@ant-design/pro-components';
import { Card, theme } from 'antd';
import React from 'react';

const About: React.FC = () => {
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
        <div style={{display:'block', margin: '10px 0'}}>
          <h2>onebot v11标准的多功能bot，大部分功能支持llm函数调用，插件化设计，具有一定拓展性。</h2>
        </div>
        <div style={{display:'block', margin: '10px 0'}}>
          <h3>Thanks to all contributors for their efforts</h3>
        </div>
        <div style={{display:'block', textAlign:'center', margin: '10px 0'}}>
          <a href="https://github.com/avilliai/Eridanus/graphs/contributors" target="_blank">
            <img src="https://contrib.rocks/image?repo=avilliai/Eridanus" style={{display:'block', margin:'auto'}} />
          </a>
        </div>
        <div style={{display:'block',textAlign:'center', margin: '10px 0'}}>
          <img src="https://repobeats.axiom.co/api/embed/2e669d8cf896cdd4259d7810df2f07fbfa5fe0df.svg"
            style={{
              width: '100%',
              maxWidth: '1000px',

            }}></img>

        </div>
        <p style={{margin: '10px 0'}}>
          Eridanus WebUI基于 <a href="https://pro.ant.design/" target='_blank'>Ant Design Pro</a> 开发
        </p>
      </Card>
    </PageContainer>
  );
};

export default About;

import { PageContainer } from '@ant-design/pro-components';
import { Card } from 'antd';
import QueueAnim from 'rc-queue-anim';
import React from 'react';

const About: React.FC = () => {
  return (
    <QueueAnim delay={100} type={'bottom'}>
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          overflowX: 'auto',
        }}
        key={0}
      >
        <div style={{ display: 'block', textAlign: 'center', margin: '10px 0' }}>
          <img src="/eridanus.svg" style={{ display: 'block', margin: 'auto', maxWidth: '300px' }} />
        </div>
        <div style={{ display: 'block', textAlign: 'center', margin: '10px 0' }}>
          <h1>Eridanus</h1>
        </div>
        <div style={{ display: 'block', margin: '10px 0' }}>
          <h2>
            Eridanus 是 onebot v11 标准的多功能bot，大部分功能支持llm函数调用，插件化设计，具有一定拓展性。<br />
            Eridanus WebUI 基于 <a href="https://react.dev/" target='_blank'>React</a> 与 <a href="https://pro.ant.design/" target='_blank'>Ant Design Pro</a> 开发。</h2>
        </div>
        <div style={{ display: 'block', textAlign: 'center', margin: '20px 0' }}>
          <hr />
          <h3>感谢以下开发者对Eridanus的贡献</h3>
        </div>
        <div style={{ display: 'block', textAlign: 'center', margin: '20px 0' }}>
          <a href="https://github.com/avilliai/Eridanus/graphs/contributors" target="_blank">
            <img src="https://contrib.rocks/image?repo=avilliai/Eridanus" style={{ display: 'block', margin: 'auto' }} />
          </a>
        </div>
        <div style={{ display: 'block', textAlign: 'center', margin: '10px 0' }}>
          <img src="https://repobeats.axiom.co/api/embed/2e669d8cf896cdd4259d7810df2f07fbfa5fe0df.svg"
            style={{
              width: '100%',
              maxWidth: '1000px',
            }}></img>
        </div>
        <div style={{ display: 'block', margin: '10px 0' }}>
          <h2>
            相关链接
          </h2>
          <a href="https://github.com/avilliai/Eridanus" target="_blank" style={{ marginLeft: '20px' }}>Eridanus 仓库</a><br />
          <a href="https://eridanus-doc.netlify.app/" target="_blank" style={{ marginLeft: '20px' }}>Eridanus 文档</a><br />
        </div>
      </Card>
      </QueueAnim>
  );
};

export default About;

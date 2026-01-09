import { Card, Image } from 'antd';
import QueueAnim from '@/components/QueueAnim';
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
          <img
            src="/eridanus.svg"
            style={{ display: 'block', margin: 'auto', maxWidth: '250px' }}
          />
        </div>
        <div style={{ display: 'block', textAlign: 'center', margin: '10px 0' }}>
          <h1>
            Eridanus
            <br />
            🎊 基于 OneBot 协议的多功能bot兼python开发框架 🎊
            <br />
          </h1>
        </div>
        <div style={{ display: 'block', margin: '10px 0', textAlign: 'center' }}>
          <h2>

            <br />
            Eridanus WebUI 基于{' '}
            <a href="https://react.dev/" target="_blank">
              React
            </a>{' '}
            与{' '}
            <a href="https://ant.design/" target="_blank">
              Ant Design Pro
            </a>{' '}
            开发
          </h2>
        </div>
        <div style={{ display: 'block', textAlign: 'center', margin: '20px 0' }}>
          <hr />
          <h3>感谢以下开发者对Eridanus的贡献</h3>
        </div>
        <div style={{ display: 'block', textAlign: 'center', margin: '20px 0' }}>
          <a href="https://github.com/avilliai/Eridanus/graphs/contributors" target="_blank">
            <img
              src="https://contrib.rocks/image?repo=avilliai/Eridanus"
              style={{ display: 'block', margin: 'auto', width: '100%', maxWidth: '500px' }}
            />
          </a>
        </div>
        <div style={{ display: 'block', textAlign: 'center', margin: '10px 0' }}>
          <img
            src="https://camo.githubusercontent.com/d3ec069ddeb3104c9143d571293b738325beb3c8a5000dcb6ed8b5724150ebf7/68747470733a2f2f6170692e737461722d686973746f72792e636f6d2f7376673f7265706f733d414f72626974726f6e2f45726964616e757326747970653d44617465"
            style={{
              width: '100%',
              maxWidth: '600px',
            }}
          ></img>
        </div>
        <div style={{ display: 'block', margin: '10px 0' }}>
          <h2>相关链接</h2>
          <a
            href="https://github.com/avilliai/Eridanus"
            target="_blank"
            style={{ marginLeft: '20px' }}
          >
            Eridanus 仓库
          </a>
          <br />
          <a
            href="https://eridanus-doc.netlify.app/"
            target="_blank"
            style={{ marginLeft: '20px' }}
          >
            Eridanus 文档
          </a>
          <br />
        </div>
      </Card>
    </QueueAnim>
  );
};

export default About;

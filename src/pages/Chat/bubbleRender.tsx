import React from 'react';
import { Space, Spin, Image } from 'antd';

//一堆？：不够elegant!要狠狠地套娃
const renderMedia = (url: string,type?: string) => {
  const typeMap = {
    image: <Image src={url} style={{ maxWidth: '200px', cursor: 'pointer' }} />,
    video: <video src={url} controls style={{ maxWidth: '200px' }} />,
    record: <audio src={url} controls style={{ width: '200px' }} />,
    node: <div>转发消息，暂不支持</div>,
    music:<div>音乐卡片，暂不支持</div>,
    text: null
    // file: <a href={url} target="_blank" rel="noopener noreferrer">下载文件</a>
  };
  console.info(`url:${url} type:${type}`)
  return typeMap[type as keyof typeof typeMap] || <div>不支持的媒体类型</div>;
};

interface BubbleRenderProps {
  content?: string;
  url?: string;
  type?: string;
  loading?: boolean;
  replyTo?: { id: number; content?: string };
}

const BubbleRender: React.FC<BubbleRenderProps> = ({ content, url, type, loading, replyTo }) => {
  url=`/api/chat/file?path=${url}`
  return (
    <div>
      {/* 回复内容 */}
      {replyTo?.content ? (
        <div style={{ padding: '5px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '8px', fontSize: '12px', color: '#666' }}>
          <div style={{ borderLeft: '2px solid #1890ff', paddingLeft: '8px' }}>
            {replyTo.content.length > 50 ? `${replyTo.content.substring(0, 50)}...` : replyTo.content}
          </div>
        </div>
      ) : null}

      {/* 文本内容 */}
      {content ? (`${content}`) : ('')}

      {/* 媒体内容，loding状态决定要渲染加载动画还是内容 */}
      {loading ? (
        <div style={{ padding: '10px', textAlign: 'center' }}>
          <Space>
            <Spin size="small" />
            <span>加载中...</span>
          </Space>
        </div>
      ) : (url && type!='text') ? (
        <div>
          {renderMedia(url, type)}
        </div>
      ) : ('')
      }
    </div>
  );
};

export default BubbleRender;

import React from 'react';
import { Space, Spin, Image } from 'antd';

interface BubbleRenderProps {
  content?: string;
  base64?: string;
  loading?: boolean;
  replyTo?: { id: string; content?: string };
}

const BubbleRender: React.FC<BubbleRenderProps> = ({ content, base64, loading, replyTo }) => {
//   console.log('BubbleRender被调用，replyTo:', replyTo);
  return (
    <div>
      {replyTo?.content ? (
        <div style={{ padding: '5px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '8px', fontSize: '12px', color: '#666' }}>
          <div style={{ borderLeft: '2px solid #1890ff', paddingLeft: '8px' }}>
            {replyTo.content.length > 50 ? `${replyTo.content.substring(0, 50)}...` : replyTo.content}
          </div>
        </div>
      ) : null}
      {content ? (`${content}`) : ('')}
      {loading ? (
        <div style={{ padding: '10px', textAlign: 'center' }}>
          <Space>
            <Spin size="small" />
            <span>加载中...</span>
          </Space>
        </div>
      ) : base64 ? (
        <div>
          {base64.startsWith('data:image') ? (
            <Image
              src={base64}
              style={{ maxWidth: '200px', cursor: 'pointer' }}
            />
          ) : base64.startsWith('data:video') ? (
            <video
              src={base64}
              controls
              style={{ maxWidth: '200px' }}
            />
          ) : base64.startsWith('data:audio') ? (
            <audio
              src={base64}
              controls
              style={{ width: '200px' }}
            />
          ) : (
            <div>不支持的媒体类型</div>
          )}
        </div>
      ) : ('')
      }
    </div>
  );
};

export default BubbleRender;
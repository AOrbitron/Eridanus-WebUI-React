import React, { useState, useEffect } from 'react';
import { useModel } from '@umijs/max';
import { Space, Spin, Image, Card, Typography, List, Divider } from 'antd';
import axios from 'axios';

// 渲染网易云音乐卡片(好像没有意义)
const renderMusicCard = (url: string) => {
  const { Text, Title } = Typography;
  const [songInfo, setSongInfo] = useState<{
    name: string;
    artists: string;
    picUrl: string;
  }>({ name: '加载中...', artists: '', picUrl: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSongInfo = async () => {
      try {
        // 从URL中提取歌曲ID
        const songId = url.split('id=')[1]?.split('.')[0];
        if (!songId) {
          setError(true);
          return;
        }

        // 获取歌曲详情
        const response = await axios.get(`https://music.163.com/api/song/detail?ids=[${songId}]`);
        const songData = response.data;

        if (songData.code === 200 && songData.songs && songData.songs.length > 0) {
          const song = songData.songs[0];
          // 获取所有艺术家名称并用逗号连接
          const artistNames = song.artists.map((artist: any) => artist.name).join(', ');

          setSongInfo({
            name: song.name,
            artists: artistNames,
            picUrl: song.album.picUrl
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('获取音乐信息失败:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSongInfo();
  }, [url]);

  // 音频播放器和音乐卡片
  return (
    <Card style={{ width: 300, marginTop: 10 }} loading={loading}>
      {!loading && !error ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src={songInfo.picUrl}
            width={64}
            height={64}
            style={{ borderRadius: '4px' }}
            preview={false}
          />
          <div style={{ marginLeft: 12, flex: 1 }}>
            <Title level={5} style={{ margin: 0 }}>{songInfo.name}</Title>
            <Text type="secondary">{songInfo.artists}</Text>
            <audio src={url} controls style={{ width: '100%', marginTop: 8 }} />
          </div>
        </div>
      ) : error ? (
        <div>
          <Text type="danger">无法加载音乐信息</Text>
          <audio src={url} controls style={{ width: '100%', marginTop: 8 }} />
        </div>
      ) : null}
    </Card>
  );
};

// 渲染转发消息
const renderForwardedMessages = (nodeData: any) => {
  const { Text, Title } = Typography;

  // 检查nodeData结构，支持多种可能的数据结构
  if (!nodeData) {
    return <div>转发消息数据无效</div>;
  }

  // 处理消息格式
  let messages = [];
  let nickname = '转发消息';

  // 处理message.params.messages格式的数据
  if (nodeData.message && nodeData.message.params && nodeData.message.params.messages) {
    messages = nodeData.message.params.messages;
    // 使用第一个消息的昵称作为卡片标题
    if (messages.length > 0 && messages[0].data && messages[0].data.nickname) {
      nickname = messages[0].data.nickname;
    }
  }
  // 处理data.content格式的数据
  else if (nodeData.data && nodeData.data.content) {
    messages = [{data: {content: nodeData.data.content}}];
    if (nodeData.data.nickname) {
      nickname = nodeData.data.nickname;
    }
  }
  // 如果是直接的node数组
  else if (Array.isArray(nodeData)) {
    messages = nodeData;
  }

  if (messages.length === 0) {
    return <div>转发消息数据无效</div>;
  }

  return (
    <Card
      title={nickname}
      style={{ marginTop: 10, maxWidth: '100%', backgroundColor: '#f9f9f9' }}
      size="small"
      bordered={true}
    >
      <List
        itemLayout="vertical"
        dataSource={messages}
        renderItem={(item: any) => {
          // 处理node类型数据
          if (item.type === 'node' && item.data) {
            const nodeContent = item.data.content || [];
            return (
              <List.Item>
                {item.data.nickname && (
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.data.nickname}</div>
                )}
                {nodeContent.map((contentItem: any, index: number) => {
                  if (contentItem.type === 'text' && contentItem.data && contentItem.data.text) {
                    return (
                      <div key={index} style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                        {contentItem.data.text}
                      </div>
                    );
                  }
                  return null;
                })}
              </List.Item>
            );
          }
          // 处理直接的文本数据
          else if (item.type === 'text' && item.data && item.data.text) {
            return (
              <List.Item>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{item.data.text}</div>
              </List.Item>
            );
          }
          return null;
        }}
        split={true}
      />
    </Card>
  );
};

const renderMedia = (url: string, type?: string, nodeData?: any) => {
  // 如果是node类型，使用专门的渲染函数
  if (type === 'node' && nodeData) {
    return renderForwardedMessages(nodeData);
  }

  const typeMap = {
    image: <Image src={url} style={{ maxWidth: '150px', cursor: 'pointer' }} />,
    video: <video src={url} controls style={{ maxWidth: '300px' }} />,
    record: <audio src={url} controls style={{ width: '200px' }} />,
    node: nodeData ? renderForwardedMessages(nodeData) : <div>转发消息数据无效</div>,
    // music: renderMusicCard(url),
    music: <div>[音乐卡片，暂不支持]</div>,
    //文本不渲染
    text: null
    // file: <a href={url} target="_blank" rel="noopener noreferrer">下载文件</a>
  };
  // 注意！可能存在性能问题，怎么输入框onchange，这个函数就会执行一遍？
  // console.info(`url:${url} type:${type}`)
  return typeMap[type as keyof typeof typeMap] || <div>不支持的媒体类型</div>;
};

interface BubbleRenderProps {
  content?: string;
  url?: string;
  type?: string;
  loading?: boolean;
  replyTo?: { id: number; content?: string };
  nodeData?: any; // 添加node类型数据
}

const BubbleRender: React.FC<BubbleRenderProps> = ({ content, url, type, loading, replyTo, nodeData }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.isDark;
  // if (type == 'music') {
  //   url = `https://music.163.com/song/media/outer/url?id=${url}.mp3`;

  // } else {
  //   url = `/api/chat/file?path=${url}`;
  // }
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
      ) : (url && type != 'text') ? (
        <div>
          {renderMedia(url, type, nodeData)}
        </div>
      ) : ('')
      }
    </div>
  );
};

export default BubbleRender;

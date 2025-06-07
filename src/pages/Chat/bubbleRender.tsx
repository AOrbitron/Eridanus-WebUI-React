import React, { useState, useEffect } from 'react';
import { useModel } from '@umijs/max';
import { Space, Spin, Image, Card, Typography, List, Divider } from 'antd';
import axios from 'axios';
import markdownit from 'markdown-it';
const md = markdownit({ html: true, breaks: true });

const requestURL = 'http://192.168.195.41:5007';

// 渲染音乐卡片(好像没有意义)
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
            picUrl: song.album.picUrl,
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
  return 'WebUI点歌功能开发中，敬请期待';
  // 音频播放器和音乐卡片
  // return (
  //   <Card style={{ width: 300, marginTop: 10 }} loading={loading}>
  //     {!loading && !error ? (
  //       <div style={{ display: 'flex', alignItems: 'center' }}>
  //         <Image
  //           src={songInfo.picUrl}
  //           width={64}
  //           height={64}
  //           style={{ borderRadius: '4px' }}
  //           preview={false}
  //         />
  //         <div style={{ marginLeft: 12, flex: 1 }}>
  //           <Title level={5} style={{ margin: 0 }}>
  //             {songInfo.name}
  //           </Title>
  //           <Text type="secondary">{songInfo.artists}</Text>
  //           <audio src={url} controls style={{ width: '100%', marginTop: 8 }} />
  //         </div>
  //       </div>
  //     ) : error ? (
  //       <div>
  //         <Text type="danger">无法加载音乐信息</Text>
  //         <audio src={url} controls style={{ width: '100%', marginTop: 8 }} />
  //       </div>
  //     ) : null}
  //   </Card>
  // );
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
    messages = [{ data: { content: nodeData.data.content } }];
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
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {item.data.nickname}
                  </div>
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

//渲染视频
const renderVideo = (url: string) => {
  return <video src={url} controls style={{ maxWidth: '300px' }} />;
};

//渲染图片
const renderImage = (url: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  return (
    <Spin spinning={loading}>
      <Image
        src={url}
        onLoad={() => setLoading(false)}
        style={{ maxWidth: '150px', cursor: 'pointer' }}
      />
    </Spin>
  );
};

//渲染语音
const renderRecord = (url: string) => {
  return <audio src={url} controls style={{ width: '200px' }} />;
};

//渲染回复
const renderReply = (content?: string) => {
  return content ? (
    <div
      style={{
        padding: '5px',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        marginBottom: '8px',
        fontSize: '12px',
      }}
    >
      <div style={{ borderLeft: '2px solid #1890ff', paddingLeft: '8px' }}>
        {content.length > 50 ? `${content.substring(0, 50)}...` : content}
      </div>
    </div>
  ) : null;
};

//渲染文件卡片
const renderFile = (url: string, name: string) => {
  return (
    <a href={url} target="_blank">
      点击下载：{name}
    </a>
  );
};

//渲染文本
const renderText = (content: string) => {
  //先用正则处理一下存在的链接，转换为md格式，便于渲染(todo)

  // let replacetext = content;
  // replacetext.replace(
  //   /((?:https?:\/\/)?(?:(?:[a-z0-9]?(?:[a-z0-9\-]{1,61}[a-z0-9])?\.[^\.|\s])+[a-z\.]*[a-z]+|(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(?::\d{1,5})*[a-z0-9.,_\/~#&=;%+?\-\\(\\)]*)/gi,
  //   '<a href="$&" target="_blank">$&</a>',
  // );
  // console.info(content);
  //bug:返回的文本不能包含--------，否则会导致渲染文本过大（todo）
  return (
    <Typography>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
      <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    </Typography>
  );
};

const BubbleRender: React.FC<API.ChatMessage> = ({ role, replyContent, message_id, message }) => {
  console.log(replyContent);
  const { initialState, setInitialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.isDark;
  const messageAction = message.action;
  const forwardMessages = message.params?.messages;
  const messagesList = message.params?.message;
  // console.info(messageAction);
  switch (messageAction) {
    case 'send_group_msg':
      if (messagesList) {
        const renderedMessages = messagesList.map((msg: any, index: number) => {
          // console.info(msg);
          //优先处理文本类型
          if (msg.type == 'text') {
            return renderText(msg.data.text);
          }
          //处理其余多媒体信息
          const url = `${requestURL}/api/chat/file?path=${msg.data.file}`;
          //URL丢给后端处理，先把要发送的文件剪切到聊天文件夹里面，再发送ws消息（todo）
          switch (msg.type) {
            case 'music':
              return renderMusicCard(url);
            case 'image':
              return renderImage(url);
            case 'video':
              return renderVideo(url);
            case 'reply':
              return renderReply(replyContent);
            default:
              return '[暂不支持的消息类型]';
          }
        });
        return <div>{renderedMessages}</div>;
      }
    case 'upload_group_file':
      // console.info(message.params);
      const url = `${requestURL}/api/chat/file?path=${message.params.file}`;
      return renderFile(url, message.params.name);
    // default:
    //   return renderText(messagesList[0].data.text);
  }

  //Todo
  // if(forwardMessages){
  //   return renderForwardedMessages(forwardMessages);
  // }
  return null;
};

export default BubbleRender;

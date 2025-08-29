import React, { useState, useEffect } from 'react';
// import { useModel } from '@umijs/max';
import { Space, Spin, Image } from 'antd';
// Fix for markdown-it import error
// import markdownit from 'markdown-it';
const markdownit = require('markdown-it');
const md = markdownit({ html: true, breaks: true });
import { getMusicInfo } from '@/services/ant-design-pro/api';
import { Bubble, Attachments } from '@ant-design/x';
import { APlayer } from 'aplayer-react';
import 'aplayer-react/dist/index.css';
import { isArray } from 'lodash';
const requestURL = '';
// 本地调试用
// const requestURL = 'http://192.168.195.41:5007';
// const requestURL = 'http://localhost:5007';
//渲染音乐卡片
const renderMusicCard = (
  type: string,
  id?: string | number,
  audio?: string,
  image?: string,
  title?: string,
) => {
  const [musicInfo, setMusicInfo] = useState<API.MusicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMusicInfo = async () => {
      try {
        //custom类型的消息不进行解析，直接提取
        if (type == 'custom') {
          setMusicInfo({ desc: '', musicUrl: audio, title: title, preview: image });
          window.dispatchEvent(new CustomEvent('add-to-playlist', {
            detail: {
              name: title || '未知标题',
              artist: '',
              url: audio || '',
              cover: image || 'https://picsum.photos/128/128',
            }
          }));
        } else {
          //调用接口
          const data = await getMusicInfo({ type, id });
          if (data.error) {
            throw new Error(data.error);
          }
          setMusicInfo(data);
          // console.info(data);
          // 将音乐信息添加到全局播放列表
          window.dispatchEvent(new CustomEvent('add-to-playlist', {
            detail: {
              name: data.title || '未知标题',
              artist: data.desc || '无描述',
              url: data.musicUrl || '',
              cover: data.preview || 'https://picsum.photos/128/128',
            }
          }));
        }
      } catch (err: any) {
        setError(err || '获取音乐信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchMusicInfo();
  }, [type, id]);

  // 显示success文字而不是音乐卡片
  if (loading) {
    return <Spin style={{
      width: 100,
      height: 150,
      maxWidth: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}
    />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Space direction='vertical' style={{ alignItems: 'center', rowGap: 0, width: 100 }}>
      <Space>
        <Image
          src={musicInfo?.preview || 'https://picsum.photos/128/128'}
          width={100}
          // height={90}
          style={{ borderRadius: '5px' }}
        />
      </Space>
      <Space style={{ fontSize: '16px',fontWeight:'bold' }}>
        {musicInfo?.title || '未知标题'}
      </Space>
      <Space style={{ fontSize: '12px' }}>
        {musicInfo?.desc || '无描述'}
      </Space>
    </Space>
  );
};

// 渲染转发消息
const renderForwardedMessages = (nodeData: any) => {
  // const { Text, Title } = Typography;
  // const [messages, setMessages] = useState<API.ForwardedChatMessage[]>([]);
  // const [isModalOpen, setIsModalOpen] = useState(false);

  // const showModal = () => {
  //   setIsModalOpen(true);
  // };

  // const handleCancel = () => {
  //   setIsModalOpen(false);
  // };
  return (
    <>
      {/* <Button type="primary" onClick={showModal}>
        查看转发消息
      </Button>
      <Modal title="转发消息" open={isModalOpen} onCancel={handleCancel} footer={null}> */}
      <div
        style={{
          padding: '5px',
          backgroundColor: 'transparent',
          borderRadius: '4px',
          marginBottom: '8px',
          fontSize: '16px',
        }}
      >
        <div style={{ borderLeft: '2px solid #1890ff', paddingLeft: '8px' }}>转发消息</div>
      </div>
      <Bubble.List
        items={nodeData.map((msg: any, index: number) => {
          // console.log(msg.data.content);
          return {
            key: index,
            placement: 'start',
            shape: 'corner',
            content: renderMessages(msg.data.content, 'start', null),
          };
        })}
      />
      {/* </Modal> */}
    </>
  );
};

//渲染视频
const renderVideo = (url: string) => {
  const videoRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (videoRef.current && (window as any).DPlayer) {
      // 清理旧实例
      videoRef.current.innerHTML = '';
      // eslint-disable-next-line no-new
      new (window as any).DPlayer({
        container: videoRef.current,
        video: { url },
        screenshot: true,
      });
    }
    // 不需要清理实例，因为 DPlayer 会自动覆盖
  }, [url]);
  return <div ref={videoRef} style={{ maxWidth: '350px' }} />;
};

//渲染图片
const renderImage = (url: string) => {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ width: '200px', maxWidth: '200px', cursor: 'pointer', marginTop: '5px' }}>
      <Spin spinning={loading}>
        <Image
          src={url}
          onLoad={() => setLoading(false)}
        />
      </Spin>
    </div>
  );
};

//渲染语音
const renderRecord = (url: string) => {
  return <audio src={url} controls style={{ width: '300px' }} />;
};

//渲染回复
const renderReply = (content?: string | null) => {
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
      <div style={{ borderLeft: '2px solid #1890ff', paddingLeft: '4px' }}>
        {content.length > 50 ? `${content.substring(0, 50)}...` : content}
      </div>
    </div>
  ) : null;
};

//渲染文件卡片
const renderFile = (url: string, name: string) => {
  const fileInfo = {
    uid: '1',
    name: name,
    url: url,
  };
  return (
    <a style={{ color: 'inherit' }} href={url} target="_blank" download={name}>
      <Attachments.FileCard item={fileInfo} />
    </a>
  );
};

//渲染文本
const renderText = (content: string, role: string) => {
  //先用正则处理一下存在的链接，转换为md格式，便于渲染(todo)

  // let replacetext = content;
  // replacetext.replace(
  //   /((?:https?:\/\/)?(?:(?:[a-z0-9]?(?:[a-z0-9\-]{1,61}[a-z0-9])?\.[^\.|\s])+[a-z\.]*[a-z]+|(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(?::\d{1,5})*[a-z0-9.,_\/~#&=;%+?\-\\(\\)]*)/gi,
  //   '<a href="$&" target="_blank">$&</a>',
  // );
  // console.info(content);
  //bug:返回的文本不能包含--------，否则会导致渲染文本字号过大（done）
  return (
    <div>
      {role == 'start' ? (
        <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
      ) : (
        <div>{content}</div>
      )}
    </div>
  );
};

//渲染消息列表函数，独立出来便于复用到转发消息渲染
const renderMessages = (messagesList: any[], role: string, replyContent: string | null) => {
  return messagesList.map((msg: any, index: number) => {
    // console.log(msg);
    // 优先处理文本类型
    if (msg.type == 'text') {
      return renderText(msg.data.text, role);
    }
    // 处理其余多媒体信息(这么搞不是长久之计，Eridanus那边实现需要文件先保存到本地，不要直接就发http的链接过来。不然链接有时效，过期就没了。)
    // URL丢给后端处理，先把要发送的文件移动到聊天文件夹里面，再发送ws消息（todo）
    const originURL = msg.data?.file;
    const url = originURL?.startsWith('file')
      ? `${requestURL}/api/chat/file?path=${originURL}`
      : originURL;
    switch (msg.type) {
      case 'music':
        return renderMusicCard(
          msg.data.type,
          msg.data?.id,
          msg.data?.audio,
          msg.data?.image,
          msg.data?.title,
        );
      case 'image':
        return renderImage(url);
      case 'video':
        return renderVideo(url);
      case 'record':
        return renderRecord(url);
      case 'reply':
        return renderReply(replyContent);
      case 'at':
        return <i style={{ fontSize: 12 }}>{role == 'start' ? '@你' : '@机器人'}</i>;
      default:
        return null;
    }
  });
};

const BubbleRender: React.FC<API.ChatMessage> = ({ role, replyContent, message_id, message }) => {
  // console.log(message);
  // const { initialState, setInitialState } = useModel('@@initialState');
  // const isDark = initialState?.settings?.isDark;
  // 如果是用户消息（一个数组），直接渲染
  if (isArray(message)) {
    return renderMessages(message, role, replyContent || null);
  } else {
    const messageAction = message.action;
    // console.log(messageAction);
    //转发消息列表，一个node
    const forwardedMessages = message.params?.messages;
    //普通消息列表，单个bubble
    const messagesList = message.params?.message;
    // console.info(messageAction);
    switch (messageAction) {
      //转发消息
      case 'send_group_forward_msg':
        if (forwardedMessages) {
          // console.info('转发消息：', JSON.stringify(forwardedMessages, null, 2));
          // const renderedMessages = renderForwardedMessages(forwardedMessages);
          // return <div>{renderedMessages}</div>;
          return renderForwardedMessages(forwardedMessages);
        }
      //普通消息
      case 'send_group_msg':
        if (messagesList) {
          // const renderedMessages = renderMessages(messagesList, role, replyContent || null);
          // return <div>{renderedMessages}</div>;
          return renderMessages(messagesList, role, replyContent || null);
        }
      //上传群文件事件
      case 'upload_group_file':
        // console.info(message.params);
        const url = `${requestURL}/api/chat/file?path=${message.params.file}`;
        return renderFile(url, message.params.name);
      //消息撤回事件
      // case 'delete_msg':
      //   return '[消息撤回事件]';
      default:
        return <i style={{ fontSize: '12px' }}>{`未处理事件：${messageAction}`}</i>;
    }
  }
};

export default BubbleRender;

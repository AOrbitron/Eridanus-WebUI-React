import React, { useEffect, useRef, useState } from 'react';
import { Card, Input, Button, message, theme, Layout, Spin, Space, Image } from 'antd';
import type { BubbleProps } from '@ant-design/x';
import { CloudUploadOutlined, LinkOutlined, SendOutlined, UploadOutlined } from '@ant-design/icons';
import { Attachments, Bubble, Sender } from '@ant-design/x';
import styles from './styles.less';
import { file2b64 } from '@/services/ant-design-pro/api';
import BubbleRender from './bubbleRender';

const wsURL = `/api/ws`;
const requestURL = ``;
const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'end' | 'start', content?: string; url?: string; type?: string, loading?: boolean; id?: number; replyTo?: { id: number; content?: string } }>>([]);
  // 使用useRef存储最新的messages，解决异步状态更新问题
  const messagesRef = useRef<Array<{ role: 'end' | 'start', content?: string; url?: string; type?: string, loading?: boolean; id?: number; replyTo?: { id: number; content?: string } }>>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatContainRef = React.useRef<HTMLDivElement>(null);


  //输入的值
  const [inputValue, setInputValue] = useState<string>('');

  const handleLogMessages = () => {
    console.log('Current messages:', messages);
    messages.forEach((msg, index) => {
      console.log(`Message ${index}:`, msg);
    });
  };


  useEffect(() => {
    //加载动画
    setLoading(true);
    //连接ws
    connectWebSocket();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    //自动滚动到底部
    scrollToBottom();
    // 更新messagesRef以保持最新状态
    messagesRef.current = messages;
  }, [messages]);

  const connectWebSocket = () => {
    const newWs = new WebSocket(`${wsURL}?auth_token=${localStorage.getItem('auth_token')}`);

    newWs.onopen = () => {
      setLoading(false);
      message.success('WebSocket 已连接！');
    };

    newWs.onmessage = (event) => {
      handleServerMessage(event.data);
    };

    newWs.onclose = () => {
      //如果路由在chat页面才重新连接，避免ws断开就一直重连，不在chat页面也会重连
      if (window.location.pathname == '/chat') {
        setLoading(true);
        setTimeout(connectWebSocket, 5000);
      }
    };

    newWs.onerror = (error: Event) => {
      message.error('WebSocket 连接错误');
    };
    setWs(newWs);
  };

  // 渲染消息气泡函数已移至BubbleRender组件

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        console.log('文件读取完成 (handleFileUpload)');
        const base64Data = e.target?.result as string;
        const mimeType = file.type;
        const fileType = file.type.split('/')[0];

        if (ws && ws.readyState === WebSocket.OPEN) {
          const message = {
            type: fileType,
            data: {
              file: base64Data,
              mime: mimeType
            }
          };
          ws.send(JSON.stringify([message]));
          addUserMessage(`[${file.name}]`, Date.now());
        } else {
          message.error('WebSocket 连接未就绪');
        }
      };

      reader.onerror = (error) => {
        console.error('文件读取错误 (handleFileUpload):', error);
        message.error('文件读取失败');
      };

      console.log('开始读取文件:', file.name);
      reader.readAsDataURL(file);
    }
  };

  //处理发来的消息
  const handleServerMessage = (rawData: string) => {
    try {
      const data = JSON.parse(rawData);
      if (!data.message?.params) {
        console.warn('收到无效消息:', data);
        return;
      }

      const messageList = data.message.params.message;
      if (!Array.isArray(messageList)) {
        console.warn('消息格式错误:', messageList);
        return;
      }

      // 处理整个消息数组，将其作为一个整体添加到气泡中
      //这里的id要拿来分辨消息，要配合后端一起改，不然回复不到正确的消息（done）
      const id = Date.now();
      //回复信息的参数（可能会有回复多媒体消息？这里只处理了文本消息，todo）
      let replyInfo: { id: number; content?: string } | undefined;
      let contentParts: string[] = [];
      // 标记是否有为媒体文件
      let isMedia = false;
      let fileUrl;
      let msgType;
      // 处理所有消息，合并内容到一个气泡里面
      for (const msg of messageList) {
        //消息类型
        msgType = msg.type;
        //消息文本
        let msgText = msg.data?.text;
        //回复的消息的id
        let replyToId = msg.data?.id;
        fileUrl = msg.data?.file;
        // 如果是回复消息
        if (msgType === 'reply') {
          // 找到回复的消息的内容
          const replyToContent = findMessageContent(replyToId);
          //存入回复信息
          replyInfo = { id: replyToId, content: replyToContent };
          continue;
        }
        //如果为文本消息且不为空
        else if (msgType === 'text' && msgText) {
          contentParts.push(msgText);
          //如果是转发列表
        } else {
          isMedia = true;
          // file就是对应的链接
          if (fileUrl) {
            updateServerMedia(id, fileUrl, msgType);
            // 这里先添加一个占位符，后续异步更新
            const updatedContent = contentParts.join('\n').replace('[加载中...]', '[加载失败]');
            updateServerContent(id, updatedContent);
          }
        }
      }

      // 将所有文本内容合并为一个字符串
      const content = contentParts.join('\n');

      // 添加合并后的消息到气泡中
      if (isMedia && fileUrl) {
        // 如果有媒体数据，直接添加带图片的消息
        addServerMediaWithContent(id, content, fileUrl, msgType,replyInfo);
      } else if (isMedia) {
        // 如果有图片但需要异步加载，先添加带加载状态的消息
        addServerMediaLoadingWithContent(id, content,  fileUrl,msgType,replyInfo);
      } else {
        // 只有文本内容的消息
        if (replyInfo) {
          addServerMessageWithReply(id,content, msgType,replyInfo);
        } else {
          addServerMessage(id,content);
        }
      }
    } catch (e) {
      addServerMessage(1,'解析服务器消息失败: ' + e);
      addServerMessage(1,'[消息格式无效]');
    }
  };

  // 查找回复对应的消息内容
  const findMessageContent = (messageId: number): string => {
    // 使用messagesRef.current获取最新的消息数组，而不是使用可能过时的messages状态
    console.log('查找消息，当前消息数组长度:', messagesRef.current.length);
    const message = messagesRef.current.find(msg => msg.id == messageId);
    console.log(`回复的消息id:${messageId},内容:`, JSON.stringify(message, null, 2));
    return message?.content || '原消息不可用';
  };




  const addUserMessage = (content: string, id: number) => {
    console.log(`用户消息id:${id},内容:${content}`);
    setMessages(prev => [...prev, { role: 'end', content, id, type: 'text' }]);
  };

  const addServerMessage = (id:number,content: string) => {
    setMessages(prev => [...prev, { role: 'start', content, id, type: 'text' }]);
  };

  // 添加带回复的服务器消息
  const addServerMessageWithReply = (id:number,content: string, type: string, replyTo: { id: number; content?: string }) => {
    setMessages(prev => [...prev, { role: 'start', content, id, type, replyTo }]);
  };

  // 添加带加载状态的媒体消息
  const addServerMediaLoading = (id: number) => {
    setMessages(prev => [...prev, { role: 'start', loading: true, id }]);
  };

  // 添加带内容和图片的服务器消息
  const addServerMediaWithContent = (id: number, content: string, url: string,type:string, replyTo?: { id: number; content?: string }) => {
    setMessages(prev => [...prev, { role: 'start', content, url, type,id, replyTo }]);
  };

  // 添加带内容和加载状态的媒体消息
  const addServerMediaLoadingWithContent = (id: number, content: string,url:string,type:string, replyTo?: { id: number; content?: string }) => {
    setMessages(prev => [...prev, { role: 'start', content,url,type, loading: true, id, replyTo }]);
  };

  // 更新媒体消息，显示图片
  const updateServerMedia = (id: number, url: string, type: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, url: url, type: type, loading: false } : msg
    ));
    scrollToBottom();
  };

  // 更新消息内容
  const updateServerContent = (id: number, content: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, content, loading: false, id } : msg
    ));
  };

  // 更新媒体消息，显示错误
  const updateServerMediaError = (id: number) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, content: '图片加载失败', loading: false, id } : msg
    ));
  };

  // 保留原函数用于兼容性
  const addServerMedia = (url: string) => {
    setMessages(prev => [...prev, { role: 'start', url }]);
  };


  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  //待增加文件上传消息
  const handleSend = (content: string) => {
    if (!content.trim()) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      //时间戳作为消息唯一id
      const id = Date.now();
      addUserMessage(content, id);
      ws.send(JSON.stringify({ type: 'text', id: id, isat: true, data: { text: content } }));
      setInputValue('');
      setTimeout(() => {
      }, 10);
    } else {
      message.error('WebSocket 未连接');
    }
  };


  return (
    <Spin spinning={loading} tip='websocket连接中...' size='large'>
      <Card className={styles.chatCard} ref={chatContainRef}>
        <div className={styles.chatContainer} ref={chatContainerRef}>
          {messages.map((msg, index) => (
            //antd-x bubble样式
            <Bubble
              key={index}
              placement={msg.role}
              shape='corner'
              // content={msg.content}
              className={styles.message}
              messageRender={() => <BubbleRender content={msg.content} url={msg.url} type={msg.type} loading={msg.loading} replyTo={msg.replyTo} />}
            // style={msg.type === 'user'? styles.userMessageStyle : styles.serverMessageStyle}
            />
          ))}
        </div>

        <Sender

          placeholder="请输入..."
          className={styles.bottomTools}
          value={inputValue}
          //自动调节输入框大小
          autoSize={true}
          onChange={(v) => {
            setInputValue(v);
          }}
          onSubmit={(v) => {
            handleSend(v);
          }}
          prefix={
            <>
              <Attachments
                beforeUpload={() => false}
                onChange={(info) => {
                  if (!info.file.originFileObj) {
                    console.error('文件对象不存在');
                    message.error('文件上传失败：无法获取文件');
                    return;
                  }

                  const file = info.file.originFileObj;
                  console.log('文件上传:', file.name, file.type);

                  const reader = new FileReader();
                  reader.onload = (e) => {
                    console.log('文件读取完成');
                    const base64Data = e.target?.result as string;
                    const mimeType = file.type;
                    const fileType = file.type.split('/')[0];

                    if (ws && ws.readyState === WebSocket.OPEN) {
                      let messageData;
                      if (fileType === 'image') {
                        messageData = { type: fileType, data: { url: base64Data, file: file.name } };
                      } else if (fileType === 'video' || fileType === 'audio') {
                        messageData = { type: fileType, data: { file: base64Data } };
                      } else {
                        messageData = { type: 'file', data: { name: file.name, content: base64Data } };
                      }

                      ws.send(JSON.stringify(messageData));
                      addUserMessage(`[${file.name}]`, Date.now());
                    } else {
                      message.error('WebSocket 连接未就绪');
                    }
                  };

                  reader.onerror = (error) => {
                    console.error('文件读取错误:', error);
                    message.error('文件读取失败');
                  };

                  reader.readAsDataURL(file);
                }}
                getDropContainer={() => chatContainRef.current}
                maxCount={5}
                multiple={true}
                showUploadList={false}
                placeholder={{
                  icon: <CloudUploadOutlined />,
                  title: '松开上传',
                  description: '支持文件：图片、视频、音频等',
                }}
              >
                <Button type="text" icon={<CloudUploadOutlined />} />
              </Attachments>
            </>
          }
        />
        {/* <Button onClick={handleLogMessages} style={{ marginTop: '10px' }}>打印消息到控制台</Button> */}
      </Card>
    </Spin>

  );
};

export default Chat;

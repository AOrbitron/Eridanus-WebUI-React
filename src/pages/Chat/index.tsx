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
  const [messages, setMessages] = useState<Array<{ role: 'end' | 'start', content?: string; base64?: string; loading?: boolean; id?: string; replyTo?: { id: string; content?: string } }>>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatContainRef = React.useRef<HTMLDivElement>(null);


  //输入的值
  const [inputValue, setInputValue] = useState<string>('');


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
  }, [messages]);

  const connectWebSocket = () => {
    const newWs = new WebSocket(`${wsURL}?auth_token=${localStorage.getItem('auth_token')}`);

    newWs.onopen = () => {
      setLoading(false);
      addServerMessage('WebSocket 已连接！');
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
      addServerMessage('WebSocket 连接错误');
    };
    setWs(newWs);
  };

  // 渲染消息气泡函数已移至BubbleRender组件

  const convertFileToBase64 = async (filePath: string): Promise<string | null> => {
    return await file2b64(JSON.stringify({ path: filePath }))
      .then((res) => {
        if (res.base64) {
          return res.base64;
        }
        return null;
      })
      .catch(() => {
        return null;
      });
  };

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
          addUserMessage(`[${file.name}]`);
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

      const messages = data.message.params.messages || data.message.params.message;
      if (!Array.isArray(messages)) {
        console.warn('消息格式错误:', messages);
        return;
      }

      // 处理整个消息数组，将其作为一个整体添加到气泡中
      const id = Date.now().toString();
      let replyInfo: { id: string; content?: string } | undefined;
      let contentParts: string[] = [];
      let hasImage = false;
      let imageData: string | undefined;

      // 首先处理回复类型的消息，获取回复信息
      const replyMsg = messages.find(msg => msg.type === 'reply' && msg.data?.id);
      if (replyMsg) {
        const replyToId = replyMsg.data.id;
        const replyToContent = findMessageContent(replyToId);
        replyInfo = { id: replyToId, content: replyToContent };
      }

      // 处理所有消息类型并合并内容
      for (const msg of messages) {
        if (msg.type === 'text' && msg.data?.text) {
          contentParts.push(msg.data.text);
        } else if (msg.type === 'image') {
          hasImage = true;
          if (msg.data?.url) {
            imageData = msg.data.url;
          } else if (msg.data?.file && typeof msg.data.file === 'string' && msg.data.file.startsWith('data:')) {
            imageData = msg.data.file;
          } else if (msg.data?.file && typeof msg.data.file === 'string') {
            // 如果是文件路径，需要转换为base64
            // 这里先添加一个占位符，后续异步更新
            convertFileToBase64(msg.data.file).then(base64 => {
              if (base64) {
                // 更新消息，显示图片
                updateServerMedia(id, base64);
              } else {
                // 更新消息，显示错误信息
                const updatedContent = contentParts.join('\n').replace('[图片加载中...]', '[图片加载失败]');
                updateServerContent(id, updatedContent);
              }
            });
          }
        } else if (msg.type === 'video' && (msg.data?.file || msg.data?.url)) {
          contentParts.push(`[视频] ${msg.data.name || ''}`);
        } else if (msg.type === 'audio' && (msg.data?.file || msg.data?.url)) {
          contentParts.push(`[音频] ${msg.data.name || ''}`);
        } else if (msg.type === 'file') {
          contentParts.push(`[文件] ${msg.data?.name || ''}`);
        } else if (msg.type !== 'reply') { // 排除已处理的回复类型
          contentParts.push(`未知消息类型: ${msg.type}`);
        }
      }

      // 将所有内容合并为一个字符串
      const content = contentParts.join('\n');

      // 添加合并后的消息到气泡中
      if (hasImage && imageData) {
        // 如果有图片数据，直接添加带图片的消息
        addServerMediaWithContent(id, content, imageData, replyInfo);
      } else if (hasImage) {
        // 如果有图片但需要异步加载，先添加带加载状态的消息
        addServerMediaLoadingWithContent(id, content, replyInfo);
      } else {
        // 只有文本内容的消息
        if (replyInfo) {
          addServerMessageWithReply(content, replyInfo);
        } else {
          addServerMessage(content);
        }
      }
    } catch (e) {
      addServerMessage('解析服务器消息失败: ' + e);
      addServerMessage('[消息格式无效]');
    }
  };

  // 查找消息内容的辅助函数
  const findMessageContent = (messageId: string): string => {
    const message = messages.find(msg => msg.id === messageId);
    return message?.content || '原消息不可用';
  };




  const addUserMessage = (content: string) => {
    const id = Date.now().toString();
    setMessages(prev => [...prev, { role: 'end', content, id }]);
  };

  const addServerMessage = (content: string) => {
    const id = Date.now().toString();
    setMessages(prev => [...prev, { role: 'start', content, id }]);
  };

  // 添加带回复的服务器消息
  const addServerMessageWithReply = (content: string, replyTo: { id: string; content?: string }) => {
    const id = Date.now().toString();
    setMessages(prev => [...prev, { role: 'start', content, id, replyTo }]);
  };

  // 添加带加载状态的媒体消息
  const addServerMediaLoading = (id: string) => {
    setMessages(prev => [...prev, { role: 'start', loading: true, id }]);
  };

  // 添加带内容和图片的服务器消息
  const addServerMediaWithContent = (id: string, content: string, base64: string, replyTo?: { id: string; content?: string }) => {
    setMessages(prev => [...prev, { role: 'start', content, base64, id, replyTo }]);
  };

  // 添加带内容和加载状态的媒体消息
  const addServerMediaLoadingWithContent = (id: string, content: string, replyTo?: { id: string; content?: string }) => {
    setMessages(prev => [...prev, { role: 'start', content, loading: true, id, replyTo }]);
  };

  // 更新媒体消息，显示图片
  const updateServerMedia = (id: string, base64: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, base64, loading: false } : msg
    ));
    scrollToBottom();
  };

  // 更新消息内容
  const updateServerContent = (id: string, content: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, content, loading: false } : msg
    ));
  };

  // 更新媒体消息，显示错误
  const updateServerMediaError = (id: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, content: '图片加载失败', loading: false } : msg
    ));
  };

  // 保留原函数用于兼容性
  const addServerMedia = (base64: string) => {
    setMessages(prev => [...prev, { role: 'start', base64 }]);
  };


  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSend = (content: string) => {
    if (!content.trim()) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      addUserMessage(content);
      ws.send(JSON.stringify([{ type: 'text', data: { text: content } }]));
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
              messageRender={() => <BubbleRender content={msg.content} base64={msg.base64} loading={msg.loading} replyTo={msg.replyTo} />}
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

                      ws.send(JSON.stringify([messageData]));
                      addUserMessage(`[${file.name}]`);
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
      </Card>
    </Spin>

  );
};

export default Chat;

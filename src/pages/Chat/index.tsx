import React, { useEffect, useRef, useState } from 'react';
import { Card, Input, Button, message, theme, Layout, Spin, Space, Image } from 'antd';
import type { BubbleProps } from '@ant-design/x';
import { CloudUploadOutlined, LinkOutlined, SendOutlined, UploadOutlined } from '@ant-design/icons';
import { Attachments, Bubble, Sender } from '@ant-design/x';
import styles from './index.less';
import { file2b64 } from '@/services/ant-design-pro/api';

// const wsURL = `/api/ws`;
// const requestURL = ``;
const wsURL = `ws://v4.frp1.gcbe.eu.org:5008`;
const requestURL = `http://v4.frp1.gcbe.eu.org:5007`;
const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'end' | 'start', content?: string; base64?: string; loading?: boolean; id?: string }>>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatContainRef = React.useRef<HTMLDivElement>(null);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();


  //输入的值
  const [inputValue, setInputValue] = useState<string>('');


  useEffect(() => {
    setLoading(true);
    connectWebSocket();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    const newWs = new WebSocket(wsURL);

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

  //渲染消息气泡
  const renderBubble = (content?: string, base64?: string | undefined, loading?: boolean) => (
    <div>
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

  const convertFileToBase64 = async (filePath: string): Promise<string | null> => {
    return await file2b64(JSON.stringify({ path: filePath }))
      .then((res) => {
        if (res.base64) {
          return res.base64;
        }
        return null;
      })
      .catch((error) => {
        return null;
      });
    // try {
    // const response = await fetch(`${requestURL}/api/file2base64`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ path: filePath })
    // });
    //   const data = await response.json();
    //   if (data.base64) {
    //     return data.base64;
    //   } else {
    //     console.error('Error:', data.error);
    //     return null;
    //   }
    // } catch (error) {
    //   console.error('Request failed:', error);
    //   return null;
    // }
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

      messages.forEach(msg => {
        if (msg.type === 'text' && msg.data?.text) {
          addServerMessage(msg.data.text);
        } else if (msg.type === 'image') {
          const messageId = Date.now().toString();
          // 先添加一个带加载状态的空消息
          addServerMediaLoading(messageId);

          if (msg.data?.file && typeof msg.data.file === 'string' && !msg.data.file.startsWith('data:')) {
            // 如果是文件路径，需要转换为base64
            convertFileToBase64(msg.data.file).then(base64 => {
              if (base64) {
                // 更新消息，显示图片并移除加载状态
                updateServerMedia(messageId, base64);
              } else {
                // 更新消息，显示错误信息
                updateServerMediaError(messageId);
              }
            });
          } else if (msg.data?.url) {
            // 如果已经是base64格式的图片数据
            updateServerMedia(messageId, msg.data.url);
          } else if (msg.data?.file && typeof msg.data.file === 'string' && msg.data.file.startsWith('data:')) {
            // 如果file字段包含base64数据
            updateServerMedia(messageId, msg.data.file);
          } else {
            updateServerMediaError(messageId);
          }
        } else if (msg.type === 'video' && (msg.data?.file || msg.data?.url)) {
          const videoUrl = msg.data.url || msg.data.file;
          if (typeof videoUrl === 'string' && videoUrl.startsWith('data:')) {
            // 如果是base64格式的视频，可以直接显示
            addServerMessage(`[视频] ${msg.data.name || ''}`);
            // 这里可以扩展为显示视频播放器
          } else {
            addServerMessage(`[视频] ${msg.data.name || ''}`);
          }
        } else if (msg.type === 'audio' && (msg.data?.file || msg.data?.url)) {
          const audioUrl = msg.data.url || msg.data.file;
          if (typeof audioUrl === 'string' && audioUrl.startsWith('data:')) {
            // 如果是base64格式的音频，可以直接显示
            addServerMessage(`[音频] ${msg.data.name || ''}`);
            // 这里可以扩展为显示音频播放器
          } else {
            addServerMessage(`[音频] ${msg.data.name || ''}`);
          }
        } else if (msg.type === 'file') {
          addServerMessage(`[文件] ${msg.data?.name || ''}`);
        } else {
          addServerMessage(`未知消息类型: ${msg.type}`);
        }
      });
    } catch (e) {
      addServerMessage('解析服务器消息失败: ' + e);
      addServerMessage('[消息格式无效]');
    }
  };




  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, { role: 'end', content }]);
  };

  const addServerMessage = (content: string) => {
    setMessages(prev => [...prev, { role: 'start', content }]);
  };

  // 添加带加载状态的媒体消息
  const addServerMediaLoading = (id: string) => {
    setMessages(prev => [...prev, { role: 'start', loading: true, id }]);
  };

  // 更新媒体消息，显示图片
  const updateServerMedia = (id: string, base64: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, base64, loading: false } : msg
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
              messageRender={() => renderBubble(msg.content, msg.base64, msg.loading)}
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

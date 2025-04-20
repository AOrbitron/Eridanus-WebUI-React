import React, { useEffect, useRef, useState } from 'react';
import { Card, Input, Button, message, theme, Layout, Spin } from 'antd';
import type { BubbleProps } from '@ant-design/x';
import { CloudUploadOutlined, LinkOutlined, SendOutlined, UploadOutlined } from '@ant-design/icons';
import { Attachments, Bubble, Sender } from '@ant-design/x';
import styles from './index.less';
import { set } from 'lodash';
import { PageContainer } from '@ant-design/pro-components';

const requestURL = `.`;

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'end' | 'start', content?: string; base64?: string }>>([]);
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
    addServerMessage('Hi');
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
    const newWs = new WebSocket(`ws://${window.location.hostname}:5008`);

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
        message.error('WebSocket 连接已断开，正在尝试重新连接...');
        setTimeout(connectWebSocket, 5000);
      }
    };

    newWs.onerror = (error: Event) => {
      addServerMessage('WebSocket 连接错误');
    };

    setWs(newWs);
  };

  //渲染多媒体消息
  const renderBubble: BubbleProps['messageRender'] = (content?: string, base64?: string) => (
    <div>
      {content ? (`${content}`) : ('')}
      {base64 ? (
        <img src={base64} style={{ maxWidth: '200px' }} />
      ) : ('')
      }
    </div>
  );

  const convertFileToBase64 = async (filePath: string): Promise<string | null> => {
    try {
      const response = await fetch(`${requestURL}/api/file2base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath })
      });

      const data = await response.json();
      if (data.base64) {
        return data.base64;
      } else {
        console.error('Error:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (e) => {
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
        } else if (msg.type === 'image' && msg.data?.file) {
          const filePath = msg.data.file;
          convertFileToBase64(filePath).then(base64 => {
            if (base64) {
              addServerMedia(base64);
            }
            else {
              addServerMessage('文件转换失败');
            }
          });
        } else if (msg.type === 'video' && msg.data?.file) {
          addServerMessage('[视频]');
        } else if (msg.type === 'audio' && msg.data?.file) {
          addServerMessage('[音频]');
        } else if (msg.type === 'file' && msg.data?.file) {
          addServerMessage('[文件]');
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
    // <Layout
    // className={styles.container}
    //   style={{
    //     // padding: 24,
    //     // margin: 0,
    //     // height: '100vh',
    //     // minHeight: 280,
    //     // minHeight: 280,
    //     background: colorBgContainer,
    //     borderRadius: borderRadiusLG,
    //   }}
    // >
    <Spin spinning={loading} size='large'>
        <Card style={{ margin: -20 }} className={styles.chatCard} ref={chatContainRef}>
          <div className={styles.chatContainer} ref={chatContainerRef}>
            {messages.map((msg, index) => (

              //antd-x bubble样式
              <Bubble
                placement={msg.role}
                shape='corner'
                // content={msg.content}
                className={styles.message}
                messageRender={() => renderBubble(msg.content, msg.base64)}
              // style={msg.type === 'user'? styles.userMessageStyle : styles.serverMessageStyle}
              />


            ))}
          </div>

          <Sender
            style={{
              backgroundColor: colorBgContainer,
              marginRight: 5,
            }}
            //已经自带回车发送了，这个弃用
            // onKeyDown={handleKeyDown}
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
              <Attachments
                beforeUpload={() => false}
                onChange={({ file }) => {
                  addUserMessage(`[${file.name}]`);
                  message.info(`Mock upload: ${file.name}`);
                }}
                getDropContainer={() => chatContainRef.current}
                placeholder={{
                  icon: <CloudUploadOutlined />,
                  title: '松开上传',
                  description: '目前支持文件：图片',
                }}
              >
                <Button type="text" icon={<CloudUploadOutlined />} />
              </Attachments>
            }

          />
        </Card>
    </Spin>

  );
};

export default Chat;

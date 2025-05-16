import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Spin, Card } from 'antd';
// import type { BubbleProps } from '@ant-design/x';
import { CloudUploadOutlined, LinkOutlined, SendOutlined, UploadOutlined } from '@ant-design/icons';
import { Attachments, Bubble, Sender } from '@ant-design/x';
import { useModel } from '@umijs/max';
import BubbleRender from './bubbleRender';
import { saveMessages, loadMessages, ChatMessage } from '@/utils/indexedDB';

const wsURL = `/api/ws`;
// const requestURL = `http://192.168.195.41:5007`;
const requestURL = ``;
const Chat: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  //深色模式flag，给对话框背景用
  const isDark = initialState?.settings?.isDark;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // 使用useRef存储最新的messages，解决异步状态更新问题
  const messagesRef = useRef<ChatMessage[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [initialLoading, setInitialLoading] = React.useState<boolean>(true);
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
    // 加载历史消息并连接WebSocket
    const initialize = async () => {
      setInitialLoading(true);
      try {
        // 从IndexedDB加载历史消息
        const savedMessages = await loadMessages();
        if (savedMessages && savedMessages.length > 0) {
          setMessages(savedMessages);
          messagesRef.current = savedMessages;
        }
      } catch (error) {
        console.error('加载历史消息失败:', error);
      } finally {
        setInitialLoading(false);
        // 连接WebSocket
        setLoading(true);
        connectWebSocket();
      }
    };

    initialize();

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

    // 保存消息到IndexedDB
    if (messages.length > 0) {
      saveMessages(messages).catch(error => {
        console.error('保存消息到IndexedDB失败:', error);
      });
    }
  }, [messages]);

  const connectWebSocket = () => {
    const newWs = new WebSocket(`${requestURL}${wsURL}?auth_token=${localStorage.getItem('auth_token')}`);

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
      let nodeData; // 存储node类型的数据

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
        // 如果是node类型的转发消息
        else if (msgType === 'node') {
          // 保存完整的转发消息数据结构
          nodeData = msg;
          isMedia = true;
          contentParts.push('[转发消息]');
        }
        //如果为文本消息且不为空
        else if (msgType === 'text' && msgText) {
          contentParts.push(msgText);
        }
        // 其他媒体类型
        else if (msgType && msgType !== 'text') {
          isMedia = true;
          // 添加加载中的占位符
          if (contentParts.length === 0) {
            contentParts.push('[加载中...]');
          }

          // 处理文件URL
          if (fileUrl) {
            // 先添加带加载状态的消息
            addServerMediaLoadingWithContent(id, contentParts.join('\n'), '', msgType, replyInfo, nodeData);

            // 异步加载媒体文件
            setTimeout(() => {
              const processedUrl = `/api/chat/file?path=${fileUrl}`;
              updateServerMedia(id, processedUrl, msgType, nodeData);
              // 更新内容，移除加载中的占位符
              const updatedContent = contentParts.join('\n').replace('[加载中...]', '');
              updateServerContent(id, updatedContent);
            }, 500); // 延迟加载，确保UI先显示加载状态

            return; // 提前返回，避免重复添加消息
          }

          // 处理网易云音乐
          if (msg.data && msg.data.type === '163') {
            const musicUrl = `https://music.163.com/song/media/outer/url?id=${msg.data.id}.mp3`;
            // 先添加带加载状态的消息
            addServerMediaLoadingWithContent(id, contentParts.join('\n'), '', 'music', replyInfo);

            // 异步加载音乐
            setTimeout(() => {
              updateServerMedia(id, musicUrl, 'music');
              const updatedContent = contentParts.join('\n').replace('[加载中...]', '');
              updateServerContent(id, updatedContent);
            }, 500);

            return; // 提前返回，避免重复添加消息
          }
        }
      }

      // 将所有文本内容合并为一个字符串
      const content = contentParts.join('\n');

      // 添加合并后的消息到气泡中
      if (isMedia && nodeData) {
        // 如果是node类型的转发消息
        addServerMediaWithContent(id, content, '', 'node', replyInfo, nodeData);
      } else if (isMedia) {
        // 如果有媒体数据但没有URL（可能是处理失败的情况）
        addServerMediaWithContent(id, content, fileUrl || '', msgType || '', replyInfo);
      } else {
        // 只有文本内容的消息
        if (replyInfo) {
          addServerMessageWithReply(id, content, msgType || 'text', replyInfo);
        } else {
          addServerMessage(id, content);
        }
      }
    } catch (e) {
      addServerMessage(1, '解析服务器消息失败: ' + e);
      addServerMessage(1, '[消息格式无效]');
    }
  };

  // 查找回复对应的消息内容
  const findMessageContent = (messageId: number): string => {
    // 使用messagesRef.current获取最新的消息数组，而不是使用可能过时的messages状态
    // console.log('查找消息，当前消息数组长度:', messagesRef.current.length);
    const message = messagesRef.current.find(msg => msg.id == messageId);
    console.log(`回复的消息id:${messageId},内容:`, JSON.stringify(message, null, 2));
    if (message?.content)
      return message?.content;
    else if (message?.type) {
      // 根据消息类型返回对应的名称
      const typeMap: Record<string, string> = {
        'image': '[图片]',
        'node': '[转发消息]',
        // 'text': '文本',
        'music': '[音乐]',
        'audio': '[语音]',
        'video': '[视频]',
        'file': '[文件]'
      };
      return `[${typeMap[message.type]}]`;
    }
    return '原消息不可用'
  };

  const addUserMessage = (content: string, id: number) => {
    console.log(`用户消息id:${id},内容:${content}`);
    setMessages(prev => [...prev, { role: 'end', content, id, type: 'text' }]);
  };

  const addServerMessage = (id: number, content: string) => {
    setMessages(prev => [...prev, { role: 'start', content, id, type: 'text' }]);
  };

  // 添加带回复的服务器消息
  const addServerMessageWithReply = (id: number, content: string, type: string, replyTo: { id: number; content?: string }) => {
    setMessages(prev => [...prev, { role: 'start', content, id, type, replyTo }]);
  };

  // 添加带加载状态的媒体消息
  const addServerMediaLoading = (id: number) => {
    setMessages(prev => [...prev, { role: 'start', loading: true, id }]);
  };

  // 添加带内容和图片的服务器消息
  const addServerMediaWithContent = (id: number, content: string, url: string, type: string, replyTo?: { id: number; content?: string }, nodeData?: any) => {
    setMessages(prev => [...prev, { role: 'start', content, url, type, id, replyTo, nodeData }]);
  };

  // 添加带内容和加载状态的媒体消息
  const addServerMediaLoadingWithContent = (id: number, content: string, url: string, type: string, replyTo?: { id: number; content?: string }, nodeData?: any) => {
    setMessages(prev => [...prev, { role: 'start', content, url, type, loading: true, id, replyTo, nodeData }]);
  };

  // 更新媒体消息，显示图片
  const updateServerMedia = (id: number, url: string, type: string, nodeData?: any) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, url: url, type: type, loading: false, nodeData } : msg
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


  // 定义样式对象
  const styles = {
    container: {
      top: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    chatCard: {
      width: '100%',
      height: 'calc(100vh-100px)',
      display: 'flex',
      flexDirection: 'column',
    },
    chatContainer: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      padding: '8px',
      borderRadius: '10px',
      height: 'auto',
      marginBottom: '56px',
      overflowY: 'auto',
    },
    message: {
      borderRadius: '1px',
      wordWrap: 'break-word',
      margin: '10px 0',
      position: 'relative',
    },
    userMessage: {
      marginLeft: '20%',
      background: '#1890ff',
      color: 'white',
      borderBottomRightRadius: '4px',
    },
    serverMessage: {
      marginRight: '20%',
      background: '#f0f0f0',
      color: '#333',
      borderBottomLeftRadius: '4px',
    },
    bottomTools: {
      position: 'absolute',
      left: '0',
      bottom: '0px',
      backgroundColor: isDark ? "#2e2e2e" : "#fff",
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    uploadButton: {
      flexShrink: 0,
    },
    sendButton: {
      flexShrink: 0,
    }
  };

  return (
    <Spin spinning={loading} tip='websocket连接中...' size='large'>
      <Card style={{
        height: 'calc(100vh - 82px)',
      }}>
        <div ref={chatContainRef} style={{
          width: '100%',
          height: 'calc(100vh - 82px)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={styles.chatContainer} ref={chatContainerRef}>
            {initialLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin tip="加载历史消息中..." size="large" />
              </div>
            ) : (
              messages.map((msg, index) => (
                //antd-x bubble样式
                <Bubble
                  key={index}
                  placement={msg.role}
                  shape='corner'
                  style={styles.message}
                  messageRender={() => (
                    <BubbleRender
                      content={msg.content}
                      url={msg.url}
                      type={msg.type}
                      loading={msg.loading}
                      replyTo={msg.replyTo}
                      nodeData={msg.nodeData}
                    />
                  )}
                />
              ))
            )}
          </div>

          <Sender
            placeholder="请输入..."
            style={styles.bottomTools}
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
                    description: '当前仅支持图片',
                  }}
                >
                  <Button type="text" icon={<CloudUploadOutlined />} />
                </Attachments>
              </>
            }
          />
          {/* <Button onClick={handleLogMessages} style={{ marginTop: '10px' }}>打印消息到控制台</Button> */}
        </div>
      </Card>
    </Spin >

  );
};

export default Chat;

import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Spin, Card, Modal, Flex, Switch } from 'antd';
// import type { BubbleProps } from '@ant-design/x';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  LinkOutlined,
  SendOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Attachments, Bubble, Sender } from '@ant-design/x';
import { useModel } from '@umijs/max';
import BubbleRender from './bubbleRender';
import { Helmet } from 'react-helmet';
import { delChatHistory, getChatHistory } from '@/services/ant-design-pro/api';
const wsURL = `/api/ws`;

// const requestURL = 'http://192.168.195.41:5007';
// const requestURL = 'http://localhost:5007';
const requestURL = '';
const Chat: React.FC = () => {

  const [sendMsgBtn, setSendMsgBtn] = useState(false);

  const [delAllLoading, setDelAllLoading] = useState(false);

  const [delAllModal, setDelAllModal] = useState(false);

  const listRef = React.useRef<GetRef<typeof Bubble.List>>(null);

  const { initialState, setInitialState } = useModel('@@initialState');
  //深色模式flag，给对话框背景用
  const isDark = initialState?.settings?.isDark;

  // 消息列表
  const [messages, setMessages] = useState<API.ChatMessage[]>([]);

  // 使用useRef存储最新的messages，解决异步状态更新问题
  const messagesRef = useRef<API.ChatMessage[]>([]);

  const [ws, setWs] = useState<WebSocket | null>(null);

  const [loading, setLoading] = React.useState<boolean>(true);

  const [isAt, setIsAt] = React.useState<boolean>(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const chatContainRef = React.useRef<HTMLDivElement>(null);

  /*
重构计划：
1. 将遍历单条消息的列表，合并文字和显示媒体的部分去除，传给bubbleRender渲染；（done）
2. bubbleRender遍历单条消息列表的所有元素，独立渲染message_components，最后组合为一个bubble；（done）
3. 音乐卡片显示封面和跳转地址；（done，跳转感觉没必要）
4. 图片显示存入列表，便于图片浏览器翻页查看；
5. video、file、audio、image类型添加下载按钮；
6. 为发消息添加@/不@的选项；（done）
7. 上传文件；
8. 历史聊天记录功能；
9. file做简单的分类，显示对应的logo；
10. 聊天记录清除；
11. 聊天文件管理；
… …
*/

  //输入的值
  const [inputValue, setInputValue] = useState<string>('');

  // const handleLogMessages = () => {
  //   console.log('Current messages:', messages);
  //   messages.forEach((msg, index) => {
  //     console.log(`Message ${index}:`, msg);
  //   });
  // };

  useEffect(() => {
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
  }, [messages]);

  // 加载历史消息并连接WebSocket
  const initialize = async () => {
    try {
      const data = await getChatHistory({ start: 0, end: 999999 });
      console.info(data);
      // 解析主数据
      for (let i = data.data.length - 1; i >= 0; i--) {
        const subArray = data.data[i];
        // 确保子数组存在且只有一个元素
        if (Array.isArray(subArray) && subArray.length === 1) {
          const parsedJson = JSON.parse(subArray[0]);
          // console.info(`解析后的子数组 ${i + 1}:`, parsedJson);
          setMessages((prev) => [...prev, parsedJson]);
        }
      }
    } catch (e) {
      message.error(`历史消息加载失败: ${e}`);
    } finally {
      // 连接WebSocket
      connectWebSocket();
    }
  };

  const connectWebSocket = () => {
    const newWs = new WebSocket(
      `${requestURL}${wsURL}?auth_token=${localStorage.getItem('auth_token')}`,
    );

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    return null;
  };

  //处理发来的消息
  const handleServerMessage = (rawData: string) => {
    try {
      const data = JSON.parse(rawData);
      //status啥的消息，不需要处理
      if (!data.message) {
        console.warn('收到无效消息:', data);
        return;
      }
      // const messageList = data.message.params.message;
      // if (!Array.isArray(messageList)) {
      //   console.warn('消息格式错误:', messageList);
      //   return;
      // }
      let replyContent: any;
      try {
        replyContent = findMessageContent(data.message.params.message[0].data.id);
      } catch (e) {
        replyContent = null;
      }
      // const replyMesssageId = data.message.params.message[0].data.id;
      // const replyContent = replyMesssageId ? findMessageContent(replyMesssageId) : null;
      // console.log(data.message);
      setMessages((prev) => [
        ...prev,
        {
          role: 'start',
          replyContent: replyContent,
          message_id: data.message_id,
          message: data.message,
        },
      ]);
    } catch (e) {
      console.warn(e);
      // addServerMessage(1, '解析服务器消息失败: ' + e);
      // addServerMessage(1, '[消息格式无效]');
    }
  };

  // 查找回复对应的消息内容
  const findMessageContent = (messageId: number): string => {
    // 使用messagesRef.current获取最新的消息数组，而不是使用可能过时的messages状态
    const message = messagesRef.current.find((msg) => msg.message_id == messageId);
    // console.log(`回复的消息id:${messageId},内容:`, JSON.stringify(message, null, 2));
    const replyContent = message?.message.params.message.at(-1);
    // console.log('回复的消息内容:', replyContent);
    if (replyContent.type == 'text') return replyContent.data.text;
    else if (replyContent.type) {
      // 根据消息类型返回对应的名称
      const typeMap: Record<string, string> = {
        image: '[图片]',
        node: '[转发消息]',
        music: '[音乐]',
        audio: '[语音]',
        video: '[视频]',
        file: '[文件]',
      };
      return `[${typeMap[replyContent.type]}]`;
    }
    return '原消息不可用';
  };

  const addUserMessage = (content: any, id: number) => {
    // console.log(`用户消息id:${id},内容:${content}`);

    setMessages((prev) => [
      ...prev,
      {
        role: 'end',
        message_id: id,
        message: content,
      },
    ]);
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
      setSendMsgBtn(true);
      //时间戳作为消息唯一id
      const id = Date.now();
      //构建消息数组
      const msg: any = [{ msg_id: id }, { type: 'text', data: { text: content } }];
      //如果是@，添加at消息
      if (isAt) {
        msg.splice(1, 0, { type: 'at', data: { qq: '1000000', name: 'Eridanus' } });
      }
      addUserMessage(msg, id);
      msg.unshift();
      ws.send(JSON.stringify(msg));
      //滚动到底部
      listRef.current?.scrollTo({ key: messages.length - 1, block: 'nearest' });
      // ws.send(
      //   JSON.stringify({
      //     action: 'send_group_msg',
      //     msg_id: id,
      //     params: {
      //       group_id: 879886836,
      //       messages: [
      //         { type: 'at', data: { qq: '1000000', name: 'Eridanus' } },
      //         { type: 'text', data: { text: content } },
      //       ],
      //     },
      //   }),
      // );
      setInputValue('');
      setTimeout(() => {
        setSendMsgBtn(false);
      }, 500);
    } else {
      message.error('WebSocket 未连接');
    }
  };

  const handleDeleteHistory = async () => {
    setDelAllLoading(true);
    const result = await delChatHistory(null);
    if (result?.message) {
      message.success(result.message);
      setMessages([]);
    } else {
      message.error(result?.error);
    }
    setDelAllLoading(false);
    setDelAllModal(false);
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
      // padding: '8px',
      borderRadius: '12px',
      height: 'auto',
      marginBottom: '115px',
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
      backgroundColor: isDark ? '#2e2e2e' : '#fff',
      maxHeight: '50vh',
      overflowY: 'auto',
    },
    uploadButton: {
      flexShrink: 0,
    },
    sendButton: {
      flexShrink: 0,
    },
  };

  return (
    <Spin spinning={loading} tip="WebSocket连接中..." size="large">
      <Card
        style={{
          height: 'calc(100vh - 100px)',
        }}
      >
        <div
          ref={chatContainRef}
          style={{
            width: '100%',
            height: 'calc(100vh - 100px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={styles.chatContainer} ref={chatContainerRef}>
            <Bubble.List
              ref={listRef}
              items={messages.map((msg, index) => {
                return {
                  key: index,
                  placement: msg.role,
                  shape: 'corner',
                  // 为啥没用呢？
                  // styles: {
                  //   content:{
                  //     fontSize:'100px',
                  //   }
                  // },
                  content: (
                    <BubbleRender
                      role={msg.role}
                      replyContent={msg.replyContent}
                      message={msg.message}
                      message_id={msg.message_id}
                    />
                  ),
                };
              })}
            />
          </div>

          <Sender
            placeholder="请输入..."
            style={styles.bottomTools}
            value={inputValue}
            //自动调节输入框大小
            autoSize={{ maxRows: 8 }}
            onChange={(v) => {
              setInputValue(v);
            }}
            onSubmit={(v) => {
              setInputValue('');
              handleSend(v);
            }}
            actions={false}
            footer={({ components }) => {
              const { SendButton } = components;
              return (
                <Flex justify="space-between" align="center">
                  <Flex gap="small" align="center">
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
                    <Button
                      type="text"
                      onClick={() => setDelAllModal(true)}
                      icon={<DeleteOutlined />}
                    />
                    <Modal
                      title="提示"
                      open={delAllModal}
                      onOk={() => handleDeleteHistory()}
                      confirmLoading={delAllLoading}
                      onCancel={() => setDelAllModal(false)}
                    >
                      <p>确认清空聊天记录吗？聊天文件也将一并删除！</p>
                    </Modal>
                    @机器人
                    <Switch
                      size="small"
                      checked={isAt}
                      onChange={(v) => {
                        setIsAt(v);
                      }}
                    />
                  </Flex>
                  <Flex align="center">
                    <SendButton type="primary" loading={sendMsgBtn} disabled={false} />
                  </Flex>
                </Flex>
              );
            }}
            // prefix={<></>}
          />
        </div>
      </Card>

      <Helmet>
        {/* 禁用referrer，避免跨域拒绝响应 */}
        <meta name="referrer" content="no-referrer" />
      </Helmet>
    </Spin>
  );
};

export default Chat;

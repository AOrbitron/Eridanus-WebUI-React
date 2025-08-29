import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Spin, Card, Modal, Flex, Switch, UploadProps, Upload } from 'antd';
import {
  CloudUploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Bubble, Sender } from '@ant-design/x';
import { useModel } from '@umijs/max';
import BubbleRender from './bubbleRender';
import { delChatHistory, getChatHistory } from '@/services/ant-design-pro/api';
import { isArray } from 'lodash';
const wsURL = `/api/ws`;

// const requestURL = 'http://192.168.195.41:5007';
// const requestURL = 'http://192.168.195.128:5007';
// const requestURL = 'http://[::1]:5007';
const requestURL = '';
const Chat: React.FC = () => {

  const [sendMsgBtn, setSendMsgBtn] = useState(false);

  const [uploadFileBtn, setUploadFileBtn] = useState(false);

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
8. 历史聊天记录功能；（done）
9. file做简单的分类，显示对应的logo；(done)
10. 聊天记录清除；
11. 聊天文件管理；
… …
*/

  //输入的值
  const [inputValue, setInputValue] = useState<string>('');

  const props: UploadProps = {

  };

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
      // 先批量解析所有消息
      const parsedList: API.ChatMessage[] = [];
      for (let i = data.data.length - 1; i >= 0; i--) {
        const subArray = data.data[i];
        if (Array.isArray(subArray) && subArray.length === 1) {
          const parsedJson = JSON.parse(subArray[0]);
          // 用已解析的 parsedList 查找 replyContent
          const replyContent =
            parsedJson.message?.params?.message?.[0]?.data?.id
              ? findMessageContentFromList(parsedList, parsedJson.message.params.message[0].data.id)
              : null;
          parsedJson.replyContent = replyContent;
          parsedList.push(parsedJson);
        }
      }
      setMessages(parsedList);
      messagesRef.current = parsedList;
    } catch (e) {
      message.error(`历史消息加载失败: ${e}`);
    } finally {
      // 连接WebSocket
      connectWebSocket();
    }
  };

  // 用于批量查找历史消息的工具函数
  const findMessageContentFromList = (list: API.ChatMessage[], messageId: number): string => {
    const message = list.find((msg) => msg.message_id == messageId);
    const replyContent = message?.role == 'start'
      ? message?.message.params.message.at(-1)
      : message?.message.at(-1);
    if (replyContent?.type == 'text') return replyContent.data.text;
    else if (replyContent?.type) {
      const typeMap: Record<string, string> = {
        image: '图片',
        node: '转发消息',
        music: '音乐',
        audio: '语音',
        video: '视频',
        file: '文件',
      };
      return `[${typeMap[replyContent.type]}]`;
    }
    return '原消息不可用';
  };

  const connectWebSocket = () => {
    const newWs = new WebSocket(
      `${requestURL}${wsURL}?auth_token=${localStorage.getItem('auth_token')}`,
    );

    newWs.onopen = () => {
      setLoading(false);
      // message.success('WebSocket 已连接！');
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
      //如果有message_id，说明是回复消息
      const replyContent =
        data.message?.params?.message?.[0]?.data?.id
          ? findMessageContent(data.message.params.message[0].data.id)
          : null;
      const newMsg: API.ChatMessage = {
        role: isArray(data?.message) ? "end" : "start",
        replyContent: replyContent,
        message_id: data.message_id,
        message: data.message,
      };
      setMessages((prev) => {
        if (prev.some(msg => msg.message_id === newMsg.message_id)) {
          return prev;
        }
        return [...prev, newMsg];
      });
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
    const replyContent = message?.role == 'start' ? message?.message.params.message.at(-1) : message?.message.at(-1);
    // console.log('回复的消息内容:', replyContent);
    if (replyContent?.type == 'text') return replyContent.data.text;
    else if (replyContent?.type) {
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
    const newMsg: API.ChatMessage = {
      role: "end",
      message_id: id,
      message: content,
    };
    setMessages((prev) => {
      if (prev.some(msg => msg.message_id === newMsg.message_id)) {
        return prev;
      }
      return [...prev, newMsg];
    });
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  //待增加文件上传消息
  const handleSendMsg = (content: string, type: string) => {
    if (!content.trim()) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      setSendMsgBtn(true);
      //时间戳作为消息唯一id
      const id = Date.now();
      //构建消息数组
      const msg: any = [{ msg_id: id }, { type: type, data: type == 'text' ? { text: content } : { file: content } }];
      //如果是@，添加at消息
      if (isAt) {
        msg.splice(1, 0, { type: 'at', data: { qq: '1000000', name: 'Eridanus' } });
      }
      addUserMessage(msg, id);
      ws.send(JSON.stringify(msg));
      //滚动到底部
      listRef.current?.scrollTo({ key: messages.length - 1, block: 'nearest' });
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
      setMessages([]);
      message.success(result.message);
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

  const safeFileName = (name: string) => {
    // 只保留常见安全字符，其他全部转为下划线
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
  };

  const [uploadMsgBox, contextHolder] = message.useMessage();
  const uploadMessage = (progress: number, isDone: boolean, isSuccess: boolean, name: string) => {
    const safeName = safeFileName(name);
    if (progress < 100) {
      uploadMsgBox.open({
        key: safeName,
        type: 'loading',
        content: `正在上传: ${progress}%`,
        duration: 0
      });
    } else if (isDone) {
      uploadMsgBox.open({
        key: safeName,
        type: isSuccess ? 'success' : 'error',
        content: isSuccess ? `${name} 上传成功` : `${name} 上传失败`,
        duration: 2,
      });
    }
  };
  return (
    <Spin spinning={loading} tip="WebSocket连接中..." size="large">
      <Card
        style={{
          height: 'calc(100vh - 100px)',
        }}
      >
        {contextHolder}
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
                      key={index}
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
              handleSendMsg(v, 'text');
            }}
            actions={false}
            footer={({ components }) => {
              const { SendButton } = components;
              return (
                <Flex justify="space-between" align="center">
                  <Flex gap="small" align="center">
                    <Upload
                      accept='image/*'
                      pastable={true}
                      name='file'
                      action={`${requestURL}/api/chat/uploadFile`}
                      // beforeUpload={() => false}
                      onChange={(info) => {
                        setUploadFileBtn(true);
                        const name = info.file.name;
                        if (info.file.status == 'uploading') {
                          uploadMessage(Math.floor(info.event?.percent ?? 0), false, false, name);
                        }
                        if (info.file.status === 'done') {
                          console.log(info.file.response);
                          const response = info.file.response;
                          if (response?.files[0]?.error) {
                            uploadMessage(100, true, false, name);
                            setUploadFileBtn(false);
                          } else {
                            handleSendMsg(response?.files[0]?.path, 'image')
                            uploadMessage(100, true, true, name);
                            setUploadFileBtn(false);
                          }
                        } else if (info.file.status === 'error') {
                          uploadMessage(100, true, false, name);
                          setUploadFileBtn(false);
                        }
                      }}
                      //antd x的Attachment组件拖拽上传有bug，暂时注释掉
                      // getDropContainer={() => chatContainRef.current}
                      maxCount={1}
                      multiple={false}
                      showUploadList={false}
                    // placeholder={{
                    //   icon: <CloudUploadOutlined />,
                    //   title: '松开上传',
                    //   description: '当前仅支持图片',
                    // }}
                    >
                      <Button disabled={uploadFileBtn} type="text" icon={<CloudUploadOutlined />} />
                    </Upload>
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
                      <p>确认清空聊天记录吗？聊天文件不会被删除。</p>
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
    </Spin>
  );
};

export default Chat;

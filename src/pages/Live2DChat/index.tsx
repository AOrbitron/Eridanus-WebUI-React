import { useModel } from '@umijs/max';
import { Avatar, Badge, Button, Image, Input, Tooltip, Typography, message } from 'antd';
import {
  ClearOutlined,
  PlusOutlined,
  MinusOutlined,
  SendOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import QueueAnim from '@/components/QueueAnim';
import { Live2DEngine } from './live2dEngine';
import type { HistoryItem } from './live2dEngine';

const { Text } = Typography;

const PINK = '#FFC0E9';
const PERI = '#99A5FF';

const Live2DChat: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.isDark;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Live2DEngine | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const bubbleTimer = useRef<any>(0);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('');
  const [connected, setConnected] = useState(false);
  const [bubble, setBubble] = useState('');
  const [narrow, setNarrow] = useState(false);

  // 引擎生命周期
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const engine = new Live2DEngine(canvasRef.current, containerRef.current, {
      onStatus: (s) => setStatus(s),
      onConnected: (c) => setConnected(c),
      onHistory: (updater) => setHistory((prev) => updater(prev)),
      onBubble: (text) => {
        setBubble(text);
        if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
        const dur = Math.max(3000, String(text).length * 180);
        bubbleTimer.current = window.setTimeout(() => setBubble(''), dur);
      },
    });
    engineRef.current = engine;
    engine.start();

    // 响应式：容器宽度决定聊天面板是右侧栏还是底部栏
    const el = containerRef.current;
    const ro = new ResizeObserver(() => setNarrow((el?.clientWidth || 9999) < 768));
    ro.observe(el);
    setNarrow(el.clientWidth < 768);

    return () => {
      ro.disconnect();
      if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // 新消息自动滚到底
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    const ok = engineRef.current?.sendChat(t);
    if (!ok) {
      message.warning('未连接到对话后端 (/api/ws)，稍候重试。');
      return;
    }
    setInput('');
  };

  // ---------- 样式 ----------
  const panelBg = isDark ? 'rgba(24,24,24,0.82)' : 'rgba(255,255,255,0.72)';
  const panelBorder = isDark ? '1px solid #333' : '1px solid rgba(153,165,255,0.35)';
  const containerBg = isDark
    ? 'linear-gradient(160deg, #1c1b22 0%, #181a24 100%)'
    : `linear-gradient(160deg, ${PINK}33 0%, #eef0ff 55%, ${PERI}40 100%)`;

  const panelWidth = narrow ? '100%' : 360;
  const panelHeight = narrow ? '46%' : '100%';

  const renderItem = (item: HistoryItem, idx: number) => {
    const isUser = item.role === 'user';
    const bubbleStyle: React.CSSProperties = {
      maxWidth: '82%',
      padding: '8px 12px',
      borderRadius: 12,
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',
      fontSize: 14,
      lineHeight: 1.5,
      background: isUser ? PERI : isDark ? '#2a2a2e' : '#ffffff',
      color: isUser ? '#fff' : isDark ? '#eee' : '#222',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    };
    let content: React.ReactNode = item.content;
    if (item.kind === 'image') {
      content = <Image src={item.content} style={{ maxWidth: 200, borderRadius: 8 }} />;
    } else if (item.kind === 'file') {
      content = (
        <a href={item.url || item.content} target="_blank" rel="noreferrer">
          📎 {item.name || '文件'}
        </a>
      );
    }
    return (
      <div
        key={idx}
        style={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Avatar
          size={28}
          style={{ background: isUser ? PERI : PINK, flexShrink: 0 }}
          icon={isUser ? undefined : <SmileOutlined />}
        >
          {isUser ? '我' : ''}
        </Avatar>
        <div style={bubbleStyle}>{content}</div>
      </div>
    );
  };

  return (
    <QueueAnim type="bottom" delay={100}>
      <div
        key="stage"
        ref={containerRef}
        style={{
          position: 'relative',
          height: 'calc(100vh - 120px)',
          minHeight: 520,
          borderRadius: 16,
          overflow: 'hidden',
          background: containerBg,
          display: 'flex',
          flexDirection: narrow ? 'column' : 'row',
          boxShadow: '0 4px 24px rgba(153,165,255,0.18)',
        }}
      >
        {/* 模型画布：铺满，位于底层，不拦截指针（交互交给面板/按钮） */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* 状态提示 / 台词气泡 */}
        {status && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 3,
              padding: '6px 12px',
              borderRadius: 10,
              fontSize: 13,
              background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.8)',
              color: isDark ? '#eee' : '#333',
              maxWidth: '70%',
            }}
          >
            {status}
          </div>
        )}
        {bubble && (
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: narrow ? '50%' : '17%',
              transform: 'translateX(-50%)',
              zIndex: 3,
              maxWidth: narrow ? '80%' : 300,
              padding: '10px 14px',
              borderRadius: 14,
              background: isDark ? 'rgba(30,30,36,0.92)' : 'rgba(255,255,255,0.94)',
              color: isDark ? '#f0f0f0' : '#333',
              fontSize: 14,
              lineHeight: 1.5,
              boxShadow: '0 4px 16px rgba(153,165,255,0.35)',
              border: `1px solid ${PERI}55`,
            }}
          >
            {bubble}
          </div>
        )}

        {/* 缩放按钮 */}
        <div
          style={{
            position: 'absolute',
            left: 16,
            bottom: narrow ? 'calc(46% + 16px)' : 16,
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <Tooltip title="放大" placement="right">
            <Button shape="circle" icon={<PlusOutlined />} onClick={() => engineRef.current?.zoom(0.03)} />
          </Tooltip>
          <Tooltip title="缩小" placement="right">
            <Button shape="circle" icon={<MinusOutlined />} onClick={() => engineRef.current?.zoom(-0.03)} />
          </Tooltip>
        </div>

        {/* 聊天面板 */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: panelWidth,
            height: panelHeight,
            marginLeft: narrow ? 0 : 'auto',
            display: 'flex',
            flexDirection: 'column',
            background: panelBg,
            backdropFilter: 'blur(10px)',
            borderLeft: narrow ? 'none' : panelBorder,
            borderTop: narrow ? panelBorder : 'none',
          }}
        >
          {/* 面板头 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: isDark ? '1px solid #333' : '1px solid rgba(153,165,255,0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge status={connected ? 'success' : 'default'} />
              <Text strong>Live2D 对话</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {connected ? '已连接' : '连接中…'}
              </Text>
            </div>
            <Tooltip title="清空当前显示（不删除数据库记录）">
              <Button size="small" type="text" icon={<ClearOutlined />} onClick={() => setHistory([])} />
            </Tooltip>
          </div>

          {/* 消息区 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
            {history.length === 0 && (
              <div style={{ textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 13 }}>
                还没有对话。打个招呼吧～
              </div>
            )}
            {history.map(renderItem)}
            <div ref={logEndRef} />
          </div>

          {/* 输入区 */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: 12,
              borderTop: isDark ? '1px solid #333' : '1px solid rgba(153,165,255,0.25)',
            }}
          >
            <Input.TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="和 Ta 聊点什么…（Enter 发送）"
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ resize: 'none' }}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={send}>
              发送
            </Button>
          </div>
        </div>
      </div>
    </QueueAnim>
  );
};

export default Live2DChat;

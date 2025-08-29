import React, { useState, useEffect, useMemo, useRef } from 'react';
import { message, Button, Card, Select, Space, Input, Typography, DatePicker, Spin } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getLogFiles, getLogContent } from '@/services/ant-design-pro/api';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useModel } from '@umijs/max';

const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;

interface LogEntry {
  timestamp: string;
  app: string;
  level: string;
  message: string;
}

const Diagnosis: React.FC = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [appliedSearchText, setAppliedSearchText] = useState<string>('');
  const [startTimeFilter, setStartTimeFilter] = useState<moment.Moment | null>(moment().subtract(30, 'minutes'));
  const [endTimeFilter, setEndTimeFilter] = useState<moment.Moment | null>(moment());
  const [appFilter, setAppFilter] = useState<string[]>([]);
  const [levelFilter, setLevelFilter] = useState<string[]>(['ERROR']);
  // 新增状态用于存储筛选条件和加载状态
  const [appliedStartTimeFilter, setAppliedStartTimeFilter] = useState<moment.Moment | null>(moment().subtract(30, 'minutes'));
  const [appliedEndTimeFilter, setAppliedEndTimeFilter] = useState<moment.Moment | null>(moment());
  const [appliedAppFilter, setAppliedAppFilter] = useState<string[]>([]);
  const [appliedLevelFilter, setAppliedLevelFilter] = useState<string[]>(['ERROR']);
  const [loading, setLoading] = useState<boolean>(false);
  // xterm相关引用
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  // 获取主题状态
  const { initialState } = useModel('@@initialState');
  const isDarkMode = initialState?.settings?.isDark || false;

  // 获取文件列表
  useEffect(() => {
    getLogFiles()
      .then(response => {
        if (response && Array.isArray(response.files)) {
          setFiles(response.files);
          // 自动选择最后一个文件
          if (response.files.length > 0) {
            const lastFile = response.files[response.files.length - 1];
            setSelectedFile(lastFile);
          }
        } else {
          setFiles([]);
          message.error(response?.error || '服务器返回的数据格式不正确');
        }
      })
      .catch(error => {
        setFiles([]);
        message.error('获取文件列表失败: ' + error.message);
      });
  }, []);

  // 当选中的文件改变时，自动加载日志内容
  useEffect(() => {
    if (selectedFile) {
      fetchLogs();
    }
  }, [selectedFile]);

  // 初始化xterm终端
  useEffect(() => {
    if (terminalRef.current) {
      // 创建终端实例
      terminalInstance.current = new Terminal({
        rows: 10000,
        cols: 120,
        cursorBlink: true,
        scrollback: 1000000,
        theme: {
          background: isDarkMode ? '#1e1e1e' : '#fbfbfb',
          foreground: isDarkMode ? '#d4d4d4' : '#000',
          selectionBackground: isDarkMode ? '#333' : '#ccc',
          cursor: isDarkMode ? '#eee' : '#111',
          red: isDarkMode ? '#ff6f6f' : '#ee1111',
          green: isDarkMode ? '#4cab4c' : '#1e9400',
          yellow: isDarkMode ? '#c3c323' : '#e59900',
        }
      });

      // 创建并加载FitAddon
      fitAddon.current = new FitAddon();
      terminalInstance.current.loadAddon(fitAddon.current);

      // 在DOM元素上打开终端
      terminalInstance.current.open(terminalRef.current);

      // 适配终端大小
      fitAddon.current.fit();

      // 添加窗口大小改变监听器
      const handleResize = () => {
        if (fitAddon.current) {
          fitAddon.current.fit();
        }
      };

      window.addEventListener('resize', handleResize);

      // 清理函数
      return () => {
        window.removeEventListener('resize', handleResize);
        terminalInstance.current?.dispose();
      };
    }
  }, [terminalRef]);

  // 更新终端主题
  useEffect(() => {
    if (terminalInstance.current) {
      terminalInstance.current.options.theme = {
        background: isDarkMode ? '#1e1e1e' : '#fbfbfb',
        foreground: isDarkMode ? '#d4d4d4' : '#000',
        selectionBackground: isDarkMode ? '#333' : '#ccc',
        cursor: isDarkMode ? '#eee' : '#111',
        red: isDarkMode ? '#ff6f6f' : '#ee1111',
        green: isDarkMode ? '#4cab4c' : '#1e9400',
        yellow: isDarkMode ? '#c3c323' : '#e59900',
      };
    }
  }, [isDarkMode]);

  // 渲染日志到终端
  const renderLogsToTerminal = (logs: LogEntry[], clearTerminal: boolean = true) => {
    if (terminalInstance.current) {
      // 根据参数决定是否清空终端
      if (clearTerminal) {
        terminalInstance.current.clear();
      }

      // 为每个日志条目创建格式化的字符串
      logs.forEach((log, index) => {
        // 根据日志等级设置颜色
        let levelColor = '';
        switch (log.level) {
          case 'ERROR':
            levelColor = '\x1b[31m'; // 红色
            break;
          case 'WARNING':
            levelColor = '\x1b[33m'; // 黄色
            break;
          case 'INFO':
            levelColor = '\x1b[32m'; // 绿色
            break;
          default:
            levelColor = isDarkMode ? '\x1b[37m' : '\x1b[30m'; // 深色模式用白色，浅色模式用黑色
        }

        // 格式化日志行，整行使用对应颜色
        const logLine = `${levelColor}${log.timestamp} ${log.app} ${log.level} ${log.message}\x1b[0m`;

        // 写入终端
        terminalInstance.current?.write(logLine + '\r\n\r\n');
      });
    }
  };

  // 解析日志内容
  const parseLogs = (logContent: string): LogEntry[] => {
    // 检查日志内容是否有效
    if (!logContent || typeof logContent !== 'string') {
      return [];
    }

    const lines = logContent.split('\n').filter(line => line.trim() !== '');
    const parsedLogs: LogEntry[] = [];
    let currentLog: LogEntry | null = null;

    for (const line of lines) {
      // 检查是否为标准日志格式（包含时间戳、应用、等级）
      const parts = line.split(' - ');

      // 标准日志格式应至少包含4个部分：时间戳、应用、等级、消息
      if (parts.length >= 4) {
        // 如果有累积的非标准日志行，将其添加到上一条日志的消息中
        if (currentLog) {
          parsedLogs.push(currentLog);
        }

        // 创建新的日志条目
        currentLog = {
          timestamp: parts[0] || '',
          app: parts[1] || '',
          level: parts[2] || '',
          message: parts.slice(3).join(' - ') || ''
        };
      } else {
        // 非标准日志行，将其添加到当前日志的消息中
        if (currentLog) {
          currentLog.message += '\n' + line;
        }
        // 如果还没有任何标准日志行，创建一个空的日志条目来容纳非标准行
        else if (line.trim() !== '') {
          currentLog = {
            timestamp: '',
            app: '',
            level: '',
            message: line
          };
        }
      }
    }

    // 添加最后一条日志
    if (currentLog) {
      parsedLogs.push(currentLog);
    }

    return parsedLogs;
  };

  // 获取日志内容
  const fetchLogs = () => {
    if (!selectedFile) return;

    setLoading(true);
    getLogContent({ file: selectedFile })
      .then(response => {
        if (response && typeof response === 'string') {
          const parsedLogs = parseLogs(response);
          setLogs(parsedLogs);
          // 不再直接设置filteredLogs，让useEffect钩子来处理筛选
        } else {
          message.error(response?.error || '服务器返回的数据格式不正确');
        }
      })
      .catch(error => {
        message.error('获取日志内容失败: ' + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 基础筛选器（时间、应用、等级）
  const basicFilteredLogs = useMemo(() => {
    let result = logs;

    // 时间筛选
    if (appliedStartTimeFilter && appliedEndTimeFilter) {
      result = result.filter(log => {
        const logTime = moment(log.timestamp, 'YYYY-MM-DD HH:mm:ss');
        return logTime.isSameOrAfter(appliedStartTimeFilter) && logTime.isSameOrBefore(appliedEndTimeFilter);
      });
    }

    // 应用筛选 (当有选择时才应用筛选)
    if (appliedAppFilter && appliedAppFilter.length > 0) {
      result = result.filter(log => appliedAppFilter.includes(log.app));
    }

    // 等级筛选 (当有选择时才应用筛选)
    if (appliedLevelFilter && appliedLevelFilter.length > 0) {
      result = result.filter(log => appliedLevelFilter.includes(log.level));
    }

    return result;
  }, [logs, appliedStartTimeFilter, appliedEndTimeFilter, appliedAppFilter, appliedLevelFilter]);

  // 搜索筛选器
  const searchFilteredLogs = useMemo(() => {
    if (!appliedSearchText) {
      return basicFilteredLogs;
    }

    // 只根据搜索文本过滤日志内容
    return basicFilteredLogs.filter(log =>
      log.message.includes(appliedSearchText)
    );
  }, [basicFilteredLogs, appliedSearchText]);

  // 更新最终筛选结果
  useEffect(() => {
    setFilteredLogs(searchFilteredLogs);
    // 渲染日志到终端
    renderLogsToTerminal(searchFilteredLogs, true);
  }, [searchFilteredLogs]);

  // 应用筛选函数
  const applyFilters = () => {
    setLoading(true);
    // 模拟筛选处理时间
    setTimeout(() => {
      setAppliedStartTimeFilter(startTimeFilter);
      setAppliedEndTimeFilter(endTimeFilter);
      setAppliedAppFilter(appFilter);
      setAppliedLevelFilter(levelFilter);
      setAppliedSearchText(searchText);
      setLoading(false);
    }, 500);
  };

  // 监听筛选条件变化，自动应用筛选
  useEffect(() => {
    if (logs.length > 0) {
      applyFilters();
    }
  }, [startTimeFilter, endTimeFilter, appFilter, levelFilter]);

  // 获取唯一的应用和等级
  const uniqueApps = Array.from(new Set(logs.map(log => log.app)));
  const uniqueLevels = Array.from(new Set(logs.map(log => log.level)));

  // 导出日志函数
  const exportLogs = () => {
    // 生成文件名
    const fileName = generateFileName();

    // 将日志转换为文本格式
    const logText = filteredLogs.map(log =>
      `${log.timestamp} ${log.app} ${log.level} ${log.message}`
    ).join('\n\n');

    // 创建Blob对象
    const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.log`;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 生成文件名函数
  const generateFileName = (): string => {
    // 基础文件名
    let fileName = '';
    // 添加时间筛选条件
    if (appliedStartTimeFilter) {
      fileName += `_${appliedStartTimeFilter.format('YYYYMMDD_HHmmss')}`;
    }
    if (appliedEndTimeFilter) {
      fileName += `_${appliedEndTimeFilter.format('YYYYMMDD_HHmmss')}`;
    }

    // 添加应用筛选条件
    if (appliedAppFilter && appliedAppFilter.length > 0) {
      fileName += `_${appliedAppFilter.join('_')}`;
    }

    // 添加等级筛选条件
    if (appliedLevelFilter && appliedLevelFilter.length > 0) {
      fileName += `_${appliedLevelFilter.join('_')}`;
    }

    // 添加搜索文本
    if (appliedSearchText) {
      // 将特殊字符替换为下划线
      const cleanSearchText = appliedSearchText.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      fileName += `_search_${cleanSearchText}`;
    }

    // 替换文件名中的特殊字符为下划线
    fileName = fileName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');

    return fileName;
  };

  return (
    <div>
        <Card key="0">
          <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }}>
            <Space wrap>
              <Select
                placeholder="选择日志文件"
                style={{ width: 200 }}
                onChange={value => setSelectedFile(value)}
                value={selectedFile}
              >
                {(files || []).map(file => (
                  <Option key={file} value={file}>{file}</Option>
                ))}
              </Select>
              <Button onClick={fetchLogs} type="primary">刷新日志</Button>
            </Space>
            <Space wrap>
              <DatePicker
                showTime={{ format: 'HH:mm:ss' }}
                placeholder="开始时间"
                style={{ width: 200 }}
                value={startTimeFilter}
                onChange={date => setStartTimeFilter(date)}
                format="YYYY-MM-DD HH:mm:ss"
              />
              <DatePicker
                showTime={{ format: 'HH:mm:ss' }}
                placeholder="结束时间"
                style={{ width: 200 }}
                value={endTimeFilter}
                onChange={date => setEndTimeFilter(date)}
                format="YYYY-MM-DD HH:mm:ss"
              />

              <Select
                mode="multiple"
                placeholder="模块筛选"
                style={{ width: 200 }}
                value={appFilter}
                onChange={value => setAppFilter(value)}
              >
                {/* <Option value="all">全部</Option> */}
                {(uniqueApps || []).map(app => (
                  <Option key={app} value={app}>{app}</Option>
                ))}
              </Select>
              <Select
                mode="multiple"
                placeholder="日志等级筛选"
                style={{ width: 200 }}
                value={levelFilter}
                onChange={value => setLevelFilter(value)}
              >
                {/* <Option value="all">全部</Option> */}
                {(uniqueLevels || []).map(level => (
                  <Option key={level} value={level}>{level}</Option>
                ))}
              </Select>
              <Input
                placeholder="搜索日志内容..."
                style={{ width: 200 }}
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onPressEnter={() => setAppliedSearchText(searchText)}
              />
              <Button style={{ width: 60 }} onClick={() => setAppliedSearchText(searchText)} type="primary">
                搜索
              </Button>
              <Button style={{ width: 130 }} onClick={exportLogs} icon={<DownloadOutlined />}>
                导出当前日志
              </Button>
              {/* <Button onClick={applyFilters} type="primary" loading={loading}>
              应用筛选
            </Button> */}
            </Space>

            <Spin spinning={loading} delay={200}>
              <Card title={`日志内容 (${filteredLogs.length} 条记录)`}>
                <div className="terminal-container" style={{ width: '100%', height: '600px', overflow: 'auto', position: 'relative' }}>
                  <div ref={terminalRef} style={{ width: '100%', height: '600px', backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff', padding: '-5px', overflow: 'hidden' }} />
                </div>
              </Card>
            </Spin>
          </Space>
        </Card>
    </div>
  );
};

export default Diagnosis;

import React, { useState, useEffect } from 'react';
import { message, Button, Switch, Input, InputNumber, List, Affix, Card, Spin, Select, Popconfirm, Modal, Space, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined, DownOutlined, PlusSquareOutlined, SearchOutlined } from '@ant-design/icons';
import { getYamlFiles, loadYamlFile, saveYamlFile, searchYamlKeys } from '@/services/ant-design-pro/api';
import { useParams, history } from 'umi';

interface YamlData {
  data?: any;
  comments?: Record<string, string>;
  order?: Record<string, string[]>;
  error?: string;
}

const { TextArea } = Input;

const YamlEditor: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { fileName } = useParams();
  const [fileList, setFileList] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [yamlData, setYamlData] = useState<YamlData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false); //文件保存中状态

  // 搜索相关状态
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  // 批量添加模态框相关状态
  const [batchAddModalVisible, setBatchAddModalVisible] = useState<boolean>(false);
  const [batchAddData, setBatchAddData] = useState<string>('');
  const [batchAddPath, setBatchAddPath] = useState<string>('');
  const [batchAddCurrentValue, setBatchAddCurrentValue] = useState<any[]>([]);
  // 批量删除相关状态
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean[]>>({});


  const fetchYamlFiles = async () => {
    try {
      const result = await getYamlFiles();
      if (result.files) {
        setFileList(result.files);
        if (result.files.length > 0) {
          setCurrentFile(result.files[0]);
          handleLoadYamlFile(result.files[0]);
        }
      } else {
        messageApi.error('配置文件列表加载失败');
      }
    } catch (error) {
      messageApi.error('获取文件列表时出错: ' + error);
    }
  };

  const handleLoadYamlFile = async (fileName: string) => {
    try {
      setLoading(true);
      const data = await loadYamlFile(fileName);
      if (data) {
        setYamlData(data);
        if (data.error) {
          messageApi.error(`错误：${data.error}`);
        }
      } else {
        messageApi.error('配置文件加载失败');
      }
    } catch (error) {
      messageApi.error('配置文件加载出错: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // 辅助函数：递归遍历数据，将数组中的数字字符串转换为数字类型
  const convertStringNumbers = (data: any): any => {
    if (Array.isArray(data)) {
      return data.map(item => {
        // 如果是字符串且能转换为数字，则转换为数字
        if (typeof item === 'string' && !isNaN(Number(item)) && item.trim() !== '') {
          return Number(item);
        }
        // 如果是对象或数组，递归处理
        if (typeof item === 'object' && item !== null) {
          return convertStringNumbers(item);
        }
        // 其他情况保持原值
        return item;
      });
    } else if (typeof data === 'object' && data !== null) {
      // 对象类型，递归处理每个属性
      const newData: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          newData[key] = convertStringNumbers(data[key]);
        }
      }
      return newData;
    }
    // 其他类型保持原值
    return data;
  };

  const handleSaveYamlFile = async () => {
    try {
      setSaving(true);
      // 在保存前转换数组中的数字字符串
      const processedData = { ...yamlData };
      if (processedData.data) {
        processedData.data = convertStringNumbers(processedData.data);
      }

      const result = await saveYamlFile(currentFile, processedData);
      if (result.message) {
        messageApi.success('配置文件保存成功');
      } else {
        messageApi.error(result.error || '保存失败');
      }
    } catch (error) {
      messageApi.error('保存配置文件时出错: ' + error);
    } finally {
      setSaving(false);
    }
  };

  const updateData = (path: string, value: any) => {
    const pathParts = path.split('.');
    const newData = { ...yamlData };
    let current = newData.data || newData;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (part.includes('[')) {
        const [key, indexStr] = part.split('[');
        const index = parseInt(indexStr.replace(']', ''), 10);
        current = current[key][index];
      } else {
        current = current[part];
      }
    }

    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart.includes('[')) {
      const [key, indexStr] = lastPart.split('[');
      const index = parseInt(indexStr.replace(']', ''), 10);
      current[key][index] = value;
    } else {
      current[lastPart] = value;
    }

    setYamlData(newData);
  };

  // 显示批量添加模态框
  const showBatchAddModal = (path: string, currentValue: any[]) => {
    setBatchAddPath(path);
    setBatchAddCurrentValue(currentValue);
    setBatchAddData('');
    setBatchAddModalVisible(true);
  };

  // 处理批量添加
  const handleBatchAdd = () => {
    if (!batchAddData.trim()) {
      messageApi.warning('请输入要添加的内容！');
      return;
    }

    // 按行分割输入的数据
    const lines = batchAddData.split('\n').filter(line => line.trim() !== '');

    // 创建新项数组
    const newItems = lines.map(line => {
      // 如果当前数组项是对象类型，返回空对象
      if (batchAddCurrentValue.length > 0 && typeof batchAddCurrentValue[0] === 'object') {
        return {};
      }
      // 否则返回字符串值
      return line.trim();
    });

    // 更新数据
    updateData(batchAddPath, [...batchAddCurrentValue, ...newItems]);

    // 关闭模态框并重置状态
    setBatchAddModalVisible(false);
    setBatchAddData('');
    messageApi.success(`成功添加 ${newItems.length} 项`);
  };

  const renderYamlValue = (value: any, path: string) => {
    if (typeof value === 'boolean') {
      return (
        <Switch
          checked={value}
          checkedChildren="开"
          unCheckedChildren="关"
          onChange={(checked) => updateData(path, checked)}
        // size="small"
        />
      );
    } else if (typeof value === 'string') {
      return (
        <TextArea
          value={value}
          onChange={(e) => updateData(path, e.target.value)}
          autoSize={{ minRows: 1, maxRows: 5 }}
        // size="small"
        />
      );
    } else if (typeof value === 'number') {
      return (
        <InputNumber
          type={'number'}
          value={value}
          style={{ width: '100%' }}
          onChange={(value) => {
            //清空输入框的时候同时，value也会马上被清空，导致报错，所以这里需要先判断value是否为null或者undefined，如果是则不更新内容
            value === null || value === undefined ? null : updateData(path, value);
          }}
        // formatter={(value) => )} // 格式化：移除所有非数字字符
        // size="small"
        />
      );
    }
    else if (Array.isArray(value)) {
      return (
        <div className="array-container">
          {value.map((item, index) => (
            <div key={index} className="array-item">
              {/* 复选框 */}
              <Checkbox
                checked={selectedItems[path]?.[index] || false}
                onChange={(e) => {
                  const newSelectedItems = { ...selectedItems };
                  if (!newSelectedItems[path]) {
                    newSelectedItems[path] = Array(value.length).fill(false);
                  }
                  newSelectedItems[path][index] = e.target.checked;
                  setSelectedItems(newSelectedItems);
                }}
              />
              {item === null ? (
                <TextArea
                  value={item}
                  onChange={(e) => {
                    const newValue = [...value];
                    newValue[index] = e.target.value;
                    updateData(path, newValue);
                  }}
                  autoSize={{ minRows: 1, maxRows: 5 }}
                />
              ) : typeof item === 'object' ? (
                <div className="nested-object" style={{ flex: 1 }}>
                  {Object.entries(item).map(([objKey, objValue]) => (
                    <div key={objKey} className="object-item">
                      <strong>{objKey}:</strong>
                      <div style={{ marginLeft: '10px' }}>
                        {renderYamlValue(objValue, `${path}[${index}].${objKey}`)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <TextArea
                  value={item}
                  onChange={(e) => {
                    const newValue = [...value];
                    newValue[index] = e.target.value;
                    updateData(path, newValue);
                  }}
                  autoSize={{ minRows: 1, maxRows: 5 }}
                />
              )}
            </div>
          ))}
          <Space wrap>
            {/* 全选/取消全选按钮 */}
            <Button
              type="dashed"
              onClick={() => {
                const newSelectedItems = { ...selectedItems };
                const allSelected = selectedItems[path]?.every(item => item) || false;
                newSelectedItems[path] = Array(value.length).fill(!allSelected);
                setSelectedItems(newSelectedItems);
              }}
            >
              {selectedItems[path]?.every(item => item) ? '取消全选' : '全选'}
            </Button>
            {/* 批量删除按钮 */}
            <Popconfirm
              title="确认删除吗？"
              placement='topRight'
              onConfirm={() => {
                const selectedIndices = selectedItems[path]?.
                  map((selected, index) => selected ? index : -1).
                  filter(index => index !== -1) || [];
                // 检查是否至少保留一项
                if (value.length - selectedIndices.length < 1) {
                  messageApi.warning('至少需要保留一项');
                  return;
                }
                if (selectedIndices.length === 0) {
                  messageApi.warning('请先选择要删除的项');
                  return;
                }
                const newValue = value.filter((_, index) => !selectedIndices.includes(index));
                updateData(path, newValue);
                // 重置选中状态
                const newSelectedItems = { ...selectedItems };
                newSelectedItems[path] = Array(newValue.length).fill(false);
                setSelectedItems(newSelectedItems);

                messageApi.success(`成功删除 ${selectedIndices.length} 项`);
              }}
              okText="是"
              cancelText="否"
            >
              <Button type="dashed" danger><DeleteOutlined />删除选中</Button>
            </Popconfirm>

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => {
                const newItem = typeof value[0] === 'object' ? {} : '';
                updateData(path, [...value, newItem]);
              }}
            >
              添加一项
            </Button>
            <Button
              type="dashed"
              icon={<PlusSquareOutlined />}
              onClick={() => {
                // 批量添加功能
                showBatchAddModal(path, value);
              }}
            >
              批量添加
            </Button>
          </Space>
        </div>
      );
    }
    return null;
  };

  const renderYamlEditor = (data: any, comments: Record<string, string> = {}, order: Record<string, string[]> = {}, path = '') => {
    // 获取当前路径的键顺序，如果不存在则使用对象的键
    const keys = order[path] || Object.keys(data);
    return (
      <List
        dataSource={keys}
        bordered={false}
        split={false}
        renderItem={(key) => {
          const value = data[key];
          const currentPath = path ? `${path}.${key}` : key;
          const comment = comments[currentPath];

          return (
            <List.Item className="yaml-item" id={`yaml-item-${currentPath}`}>
              <Card style={{ padding: 0 }} className="yaml-content">
                <div className="key-container">
                  <strong style={{ fontSize: '1.2rem' }}>{key}:</strong>
                  {comment && (
                    <span
                      style={{
                        textIndent: '1em',
                        opacity: 0.8,
                        overflow: 'visible',
                        textOverflow: 'unset',
                        whiteSpace: 'normal',
                        display: 'block',
                        maxWidth: '100%'
                      }}
                      className="comment"
                      dangerouslySetInnerHTML={{
                        // 正则表达式匹配注释中的URL，并将其转换为可点击的链接
                        __html: comment.replace(
                          /((?:https?:\/\/)?(?:(?:[a-z0-9]?(?:[a-z0-9\-]{1,61}[a-z0-9])?\.[^\.|\s])+[a-z\.]*[a-z]+|(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(?::\d{1,5})*[a-z0-9.,_\/~#&=;%+?\-\\(\\)]*)/gi,
                          '<a href="$&" target="_blank">$&</a>'
                        )
                      }}
                    />
                  )}
                </div>
                {typeof value === 'object' && !Array.isArray(value) ? (
                  <div className="nested-object">
                    {renderYamlEditor(value, comments, order, currentPath)}
                  </div>
                ) : (
                  renderYamlValue(value, currentPath)
                )}
              </Card>
            </List.Item>
          );
        }}
      />
    );
  };

  useEffect(() => {
    fetchYamlFiles().then(() => {
      // 如果URL中没有fileName参数，但有默认文件，则更新URL
      if (!fileName && fileList.length > 0) {
        history.replace(`/configEditor/${currentFile}`);
      }
    });
  }, []);

  useEffect(() => {
    // 如果URL中有fileName参数，且文件列表已加载，自动选择对应的文件
    if (fileName && fileList.length > 0 && fileList.includes(fileName)) {
      setCurrentFile(fileName);
      handleLoadYamlFile(fileName);
    }
  }, [fileName, fileList]);

  // 搜索功能
  const handleSearch = async () => {
    if (!searchText.trim()) {
      messageApi.warning('请先输入要搜索的内容');
      return;
    }

    try {
      setSearchLoading(true);
      const response = await searchYamlKeys(searchText.trim());

      if (response.results) {
        setSearchResults(response.results);
        setSearchModalVisible(true);
      } else if (response.error) {
        messageApi.error(response.error);
      } else {
        setSearchResults([]);
        setSearchModalVisible(true);
        messageApi.info('未找到匹配项');
      }
    } catch (error) {
      messageApi.error('搜索时出错: ' + error);
    } finally {
      setSearchLoading(false);
    }
  };

  // 渲染搜索结果
  const renderSearchResults = () => {
    return (
      <List
        dataSource={searchResults}
        renderItem={(item) => (
          <List.Item
            key={item.path}
          >
            <List.Item.Meta
              title={<div>路径：{item.path}</div>}
              description={<div>文件：{item.file}</div>}
            />
            <Button
              type="primary"
              onClick={() => {
                // 跳转到对应文件和位置
                if (currentFile !== item.file) {
                  // 如果当前文件不匹配，需要先加载对应文件
                  setCurrentFile(item.file);
                  handleLoadYamlFile(item.file).then(() => {
                    // 滚动到对应位置
                    setTimeout(() => {
                      const element = document.getElementById(`yaml-item-${item.path}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 300);
                    // messageApi.success('已跳转到对应位置');
                  });
                  // 更新URL参数
                  history.push(`/configEditor/${item.file}?path=${item.path}`);
                } else {
                  // 如果当前文件匹配，直接滚动到对应位置
                  const element = document.getElementById(`yaml-item-${item.path}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // messageApi.success('已跳转到对应位置');
                  } else {
                    messageApi.error('未找到对应位置');
                  }
                }
                setSearchModalVisible(false);
              }}
            >
              跳转
            </Button>
          </List.Item>
        )}
      />
    );
  };

  return (
    <Spin spinning={loading} size='large'>
      {/* <QueueAnim type={'bottom'} delay={100}> */}
      {contextHolder}
      <Card style={{ padding: 0 }} key="a">
        <div className="yaml-editor">
          {/* 固钉组件,用于将下拉菜单和按钮固定到顶部 */}
          <Affix offsetTop={60}>
            <div className="file-controls">
              <Space wrap direction="horizontal"
                style={{
                  borderRadius: 8,
                  backdropFilter: 'blur(8px)',
                  padding: 10,
                  boxShadow: '0 0 10px rgba(112, 112, 112, 0.63)',
                  width: '100%'
                }}>
                <Select
                  style={{ width: '320px' }}
                  value={currentFile || undefined}
                  placeholder="选择文件"
                  onChange={(value) => {
                    setCurrentFile(value);
                    handleLoadYamlFile(value);
                    // 更新URL参数
                    history.push(`/configEditor/${value}`);
                  }}
                  suffixIcon={<DownOutlined />}
                  options={fileList.map((file) => ({
                    value: file,
                    label: file
                  }))}
                />
                <Button type="primary" onClick={handleSaveYamlFile} loading={saving}>
                  保存配置
                </Button>

                <Button type="primary" onClick={() => setSearchModalVisible(true)}>
                  <SearchOutlined />搜索配置项
                </Button>
              </Space>
            </div>
          </Affix>
          <div className="editor-content">
            {/* YAML编辑器 */}
            {yamlData.data && renderYamlEditor(yamlData.data, yamlData.comments, yamlData.order)}
          </div>
          {/* 批量添加模态框 */}
          <Modal
            title="批量添加"
            open={batchAddModalVisible}
            onOk={handleBatchAdd}
            onCancel={() => setBatchAddModalVisible(false)}
            width={600}
            okText="添加"
            cancelText="取消"
          >
            <TextArea
              value={batchAddData}
              onChange={(e) => setBatchAddData(e.target.value)}
              placeholder="请输入要添加的数据，回车换行，每行一项"
              autoSize={{ minRows: 5, maxRows: 20 }}
              style={{ width: '100%' }}
            />
          </Modal>
          {/* 搜索结果模态框 */}
          <Modal
            title="搜索配置项"
            open={searchModalVisible}
            onCancel={() => setSearchModalVisible(false)}
            width={800}
            footer={null}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="搜索配置项..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={handleSearch}
                  style={{ width: '100%' }}
                />
                <Button type="primary" onClick={handleSearch} loading={searchLoading}>
                  搜索
                </Button>
              </Space>
              <div>提示：搜索范围包括其它配置文件，若对当前配置文件有修改，请先保存后再跳转。</div>
              <div style={{ marginTop: '20px' }}>
                {searchResults.length > 0 ? (
                  renderSearchResults()
                ) : (
                  <p>未找到匹配项</p>
                )}
              </div>
            </Space>
          </Modal>
          <style>{`
        .yaml-editor {
          // padding: 20px;
        }
        .file-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          display: flex;
          gap: 5px;
          padding: 5px;
        }
        .yaml-item {
          // border: 1px solid #e8e8e8;
          // padding: 5px;
          // margin-bottom: 10px;
          border-radius: 5px;
        }
        .yaml-content {
          width: 100%;
        }
        .key-container {
          margin-bottom: 8px;
        }
        .comment {
          margin-left: 8px;
        }
        .nested-object {
          margin-left: 20px;
        }
        .array-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .array-item {
          display: flex;
          gap: 8px;
          align-items: center;
        }
      `}</style>
        </div>
      </Card>
      {/* </QueueAnim> */}
    </Spin >

  );
};

export default YamlEditor;

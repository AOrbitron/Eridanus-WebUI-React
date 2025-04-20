import React, { useState, useEffect } from 'react';
import { message, Button, Switch, Input, InputNumber, List, Affix, Card, Spin, Typography, Select, FloatButton } from 'antd';
import { PlusOutlined, DeleteOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';


interface YamlData {
  data?: any;
  comments?: Record<string, string>;
  order?: Record<string, string[]>;
  error?: string;
}

const { Title } = Typography;

const YamlEditor: React.FC = () => {
  const [fileList, setFileList] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [yamlData, setYamlData] = useState<YamlData>({});
  const [loading, setLoading] = React.useState<boolean>(false);

  // const requestURL = `http://${window.location.hostname}:5007`;

  const requestURL = `.`;

  const fetchYamlFiles = async () => {
    try {
      const response = await fetch(`${requestURL}/api/files`);
      if (!response.ok) {
        throw new Error('网络响应失败');
      }
      const result = await response.json();
      if (result.files) {
        setFileList(result.files);
        if (result.files.length > 0) {
          setCurrentFile(result.files[0]);
          loadYamlFile(result.files[0]);
        }
      } else {
        message.error('配置文件列表加载失败');
      }
    } catch (error) {
      message.error('获取文件列表时出错: ' + error);
    }
  };

  const loadYamlFile = async (fileName: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${requestURL}/api/load/${fileName}`);
      const data = await response.json();
      if (data) {
        setYamlData(data);
        if (data.error) {
          message.error(`错误：${data.error}`);
        }
      } else {
        message.error('配置文件加载失败');
      }
    } catch (error) {
      message.error('配置文件加载出错: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const saveYamlFile = async () => {
    try {
      const response = await fetch(`${requestURL}/api/save/${currentFile}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(yamlData),
      });
      const result = await response.json();
      if (result.message) {
        message.success('配置文件保存成功');
      } else {
        message.error(result.error || '保存失败');
      }
    } catch (error) {
      message.error('保存配置文件时出错: ' + error);
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
        <Input
          type={'text'}
          value={value}
          onChange={(e) => updateData(path, e.target.value)}
        // size="small"
        />
      );
    } else if (typeof value === 'number') {
      return (
        <InputNumber
          value={value}
          style={{ width: '100%' }}
          onChange={(value) => updateData(path, value)}
        // size="small"
        />
      );
    }
    else if (Array.isArray(value)) {
      return (
        <div className="array-container">
          {value.map((item, index) => (
            <div key={index} className="array-item">
              <Input
                value={item}
                onChange={(e) => {
                  const newValue = [...value];
                  newValue[index] = e.target.value;
                  updateData(path, newValue);
                }}
              // size="small"
              />



              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  const newValue = value.filter((_, i) => i !== index);
                  updateData(path, newValue);
                }}
              // size="small"
              />
            </div>
          ))}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => {
              updateData(path, [...value, '']);
            }}
          // size="small"
          >
            添加项
          </Button>
        </div>
      );
    }
    return null;
  };

  const renderYamlEditor = (data: any, comments: Record<string, string> = {}, path = '') => {
    const keys = Object.keys(data);
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
            <List.Item className="yaml-item">
              <Card style={{ margin: '-8px' }} className="yaml-content">
                <div className="key-container">
                  <strong style={{ fontSize: '1.2rem' }}>{key}:</strong>
                  {comment && (
                    <span style={{ left: "5px" }} className="comment" dangerouslySetInnerHTML={{
                      __html: comment.replace(
                        /((?:https?:\/\/)?(?:(?:[a-z0-9]?(?:[a-z0-9\-]{1,61}[a-z0-9])?\.[^\.|\s])+[a-z\.]*[a-z]+|(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(?::\d{1,5})*[a-z0-9.,_\/~#&=;%+?\-\\(\\)]*)/gi,
                        '<a href="$&" target="_blank">$&</a>'
                      )
                    }} />
                  )}
                </div>
                {typeof value === 'object' && !Array.isArray(value) ? (
                  <div className="nested-object">
                    {renderYamlEditor(value, comments, currentPath)}
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
    fetchYamlFiles();
  }, []);

  return (
    <Spin spinning={loading} size='large'>
      <PageContainer>
        <Card>
          <div className="yaml-editor">
            <div className="editor-header">
              <div className="file-controls">
                <Select
                  value={currentFile}
                  onChange={(value) => {
                    setCurrentFile(value);
                    loadYamlFile(value);
                  }}
                  style={{ width: 200 }}
                >
                  {fileList.map((file) => (
                    <Select.Option key={file} value={file}>
                      {file}
                    </Select.Option>
                  ))}
                </Select>
                <Affix offsetTop={60}>
                  <Button type="primary" onClick={saveYamlFile}>
                    保存配置
                  </Button>
                </Affix>
              </div>
            </div>
            <div className="editor-content">
              {yamlData.data && renderYamlEditor(yamlData.data, yamlData.comments)}
            </div>
            <FloatButton
              icon={<VerticalAlignTopOutlined />}
              tooltip="返回顶部"
              type="primary"
            />
            <style jsx>{`
        .yaml-editor {
          // padding: 20px;
        }
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .file-controls {
          display: flex;
          gap: 5px;
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
      </PageContainer>
    </Spin>
  );
};

export default YamlEditor;

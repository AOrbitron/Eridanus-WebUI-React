import { loadMenu, updateMenu } from '@/services/ant-design-pro/api';
import { Card, Input, Typography, Space, Divider, Button, Affix, Collapse, message } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined, SaveOutlined } from '@ant-design/icons';
import type { CollapseProps } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import QueueAnim from '@/components/QueueAnim';

const { TextArea } = Input;
const { Title, Text } = Typography;

const MenuEditor: React.FC = () => {
  const [menu, setMenu] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTextArea, setActiveTextArea] = useState<string | null>(null);
  const textAreaRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    setLoading(true);
    loadMenu()
      .then((res) => {
        setMenu(res || {});
      })
      .catch((error) => {
        console.error('Failed to load menu:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 格式化页面名称显示
  const formatPageName = (pageName: string) => {
    if (pageName.startsWith('page')) {
      const pageNumber = pageName.replace('page', '');
      return `第${pageNumber}页`;
    }
    return pageName;
  };

  // 格式化栏目名称显示
  const formatItemName = (itemName: string) => {
    if (itemName.startsWith('序号')) {
      const itemNumber = itemName.replace('序号', '');
      return `第${itemNumber}栏`;
    }
    return itemName;
  };

  // 获取文本内容的辅助函数
  const getTextContent = (item: any) => {
    if (!item || !item.内容文本) return '';
    let content = '';
    if (Array.isArray(item.内容文本)) {
      content = item.内容文本[0] || '';
    } else {
      content = item.内容文本 || '';
    }
    // 确保content是字符串类型，如果不是则转换为字符串
    if (typeof content !== 'string') {
      content = String(content);
    }
    // 处理后端转义的换行符，将\\n转换为\n
    return content.replace(/\\n/g, '\n');
  };

  // 处理文本内容的变化
  const handleTextChange = (page: string, item: string, value: string) => {
    const newMenu = { ...menu };
    // 保存时将换行符转换为双反斜杠格式，以保持与后端一致
    const processedValue = value.replace(/\n/g, '\\n');
    newMenu[page][item].内容文本 = [processedValue];
    setMenu(newMenu);
  };

  // 处理TextArea焦点事件
  const handleTextAreaFocus = (page: string, item: string) => {
    const key = `${page}-${item}`;
    setActiveTextArea(key);
  };

  // 删除栏目
  const deleteItem = (page: string, item: string) => {
    const newMenu = { ...menu };
    delete newMenu[page][item];
    setMenu(newMenu);
  };

  // 添加文本框（添加一个包含空字符串的数组）
  const addTextBox = (page: string) => {
    const newMenu = { ...menu };
    const existingItems = Object.keys(newMenu[page]);
    const maxNumber = Math.max(...existingItems.map(item => {
      const match = item.match(/序号(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }));
    const newItemKey = `序号${maxNumber + 1}`;
    newMenu[page][newItemKey] = {
      "类型": "文字",
      "内容文本": [""]
    };
    setMenu(newMenu);
  };

  // 添加空行（添加一个空字符串，不可编辑）
  const addEmptyLine = (page: string) => {
    const newMenu = { ...menu };
    const existingItems = Object.keys(newMenu[page]);
    const maxNumber = Math.max(...existingItems.map(item => {
      const match = item.match(/序号(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }));
    const newItemKey = `序号${maxNumber + 1}`;
    newMenu[page][newItemKey] = {
      "类型": "文字",
      "内容文本": ""
    };
    setMenu(newMenu);
  };

  // 检查是否为空行（不可编辑）
  const isEmptyLine = (item: any) => {
    return item && typeof item.内容文本 === 'string' && item.内容文本.trim() === '';
  };

  // 保存菜单数据
  const handleSaveMenu = async () => {
    setSaving(true);
    try {
      const response = await updateMenu(menu);
      if (response.message) {
        message.success(response.message);
      } else if (response.error) {
        message.error(response.error);
      }
    }
    catch (error) {
      message.error('菜单保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 插入标签到TextArea
  const insertTag = (tagType: 'title' | 'des') => {
    if (!activeTextArea) return;

    const [page, item] = activeTextArea.split('-');
    const textArea = textAreaRefs.current[activeTextArea];
    if (!textArea) return;

    const currentValue = getTextContent(menu[page][item]);
    const cursorPos = textArea.resizableTextArea.textArea.selectionStart;

    const tagStart = `[${tagType}]`;
    const tagEnd = `[/${tagType}]`;
    const newValue =
      currentValue.slice(0, cursorPos) +
      tagStart + tagEnd +
      currentValue.slice(cursorPos);

    handleTextChange(page, item, newValue);

    // 设置光标位置到标签内部
    setTimeout(() => {
      const newCursorPos = cursorPos + tagStart.length;
      textArea.resizableTextArea.textArea.setSelectionRange(newCursorPos, newCursorPos);
      textArea.focus();
    }, 0);
  };

  // 渲染带标记的文本预览
  const renderMarkedText = (text: string) => {
    if (!text) return null;

    // 首先处理双反斜杠换行符，将\\n转换为\n
    let formattedText = text.replace(/\\n/g, '\n');

    // 替换[title]标记
    const titleRegex = /\[title\](.*?)\[\/title\]/g;
    formattedText = formattedText.replace(titleRegex, (match, title) => {
      return `<span style="font-weight: bold; font-size: 24px;">${title}</span>`;
    });

    const nameRegex = /\[name\](.*?)\[\/name\]/g;
    formattedText = formattedText.replace(nameRegex, (match, name) => {
      return `<div style="font-weight: bold; font-size: 24px;">${name}</div>`;
    });

    // 替换[des]标记
    const desRegex = /\[des\](.*?)\[\/des\]/g;
    formattedText = formattedText.replace(desRegex, (match, des) => {
      return `<span style="color: #888; font-size: 12px;">${des}</span>`;
    });

    // 处理换行符，将\n转换为<br>标签
    formattedText = formattedText.replace(/\n/g, '<br>');

    return (
      <div
        style={{ whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
    );
  };

  return (
    <QueueAnim type={'bottom'} delay={100}>
      <Card loading={loading}>
        <Affix offsetTop={60}>
          <Space wrap direction="horizontal"
            style={{
              borderRadius: 8,
              backdropFilter: 'blur(8px)',
              padding: 10,
              boxShadow: '0 0 10px rgba(112, 112, 112, 0.63)',
              width: '100%',
              marginBottom: 20,
            }}>
            插入标签：
            <Button
              type="primary"
              disabled={!activeTextArea}
              onClick={() => insertTag('title')}
            >
              标题
            </Button>
            <Button
              type="primary"
              disabled={!activeTextArea}
              onClick={() => insertTag('des')}
            >
              描述
            </Button>
            操作：
            <Button
              type="primary"
              loading={saving}
              onClick={handleSaveMenu}
              style={{ float: 'right' }}
            >
              保存菜单
            </Button>
          </Space>
        </Affix>
        <div>
          {(() => {
            const pageItems: CollapseProps['items'] = Object.keys(menu).map((page) => ({
              key: page,
              label: formatPageName(page),
              children: (
                <div>
                  {/* 栏目编辑区域 */}
                  <div style={{ marginBottom: 16 }}>
                    {Object.keys(menu[page]).map((item) => (
                      <Card key={item} style={{ marginBottom: 16 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>{formatItemName(item)}</Text>
                          </div>
                          {isEmptyLine(menu[page][item]) ? (
                            <div style={{ textAlign: 'center' }}>
                              ---占位空行---
                            </div>
                          ) : (
                            <div>
                              {menu[page][item]["图片链接"] && (
                                <div style={{ marginBottom: '8px' }}>
                                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                    {menu[page][item]["类型"]}<br />图片链接：
                                  </label>
                                  <Input
                                    value={menu[page][item]["图片链接"] || ''}
                                    onChange={(e) => {
                                      const newMenu = { ...menu };
                                      newMenu[page][item]["图片链接"] = e.target.value;
                                      setMenu(newMenu);
                                    }}
                                    placeholder="请输入图片链接URL"
                                  />
                                </div>
                              )}
                              文本内容：
                              <TextArea
                                ref={(ref) => {
                                  if (ref) {
                                    textAreaRefs.current[`${page}-${item}`] = ref;
                                  }
                                }}
                                autoSize={{ maxRows: 20 }}
                                value={getTextContent(menu[page][item])}
                                onChange={(e) => handleTextChange(page, item, e.target.value)}
                                onFocus={() => handleTextAreaFocus(page, item)}
                                placeholder="输入内容，使用[title]标题[/title]和[des]描述[/des]标记"
                              />
                            </div>
                          )}
                        </Space>
                      </Card>
                    ))}

                    {/* 添加按钮区域 */}
                    {/* <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: 16 }}>
                     <Button 
                       type="dashed" 
                       icon={<PlusOutlined />}
                       onClick={() => addTextBox(page)}
                     >
                       添加文本框
                     </Button>
                     <Button 
                       type="dashed" 
                       icon={<MinusOutlined />}
                       onClick={() => addEmptyLine(page)}
                     >
                       添加空行
                     </Button>
                   </div> */}
                  </div>

                  {/* 页面级别的预览 */}
                  <div style={{ marginTop: 16 }}>
                    <Title level={4}>页面预览</Title>
                    <Card>
                      {Object.keys(menu[page]).map((item) => {
                        const content = getTextContent(menu[page][item]);
                        if (content.trim() === '') {
                          return <div key={item} style={{ marginBottom: 16 }} />;
                        }
                        return (
                          <Card key={item} style={{ marginBottom: 16, boxShadow: '0 0 10px rgba(112, 112, 112, 0.63)' }}>
                            <span style={{ fontSize: '20px' }}></span>
                            <div style={{ marginTop: 8 }}>
                              {renderMarkedText(content)}
                            </div>
                          </Card>
                        );
                      })}
                    </Card>
                  </div>
                </div>
              ),
            }));

            return (
              <Collapse
                items={pageItems}
                defaultActiveKey={Object.keys(menu).length > 0 ? [Object.keys(menu)[0]] : []}
                style={{ marginBottom: 16 }}
              />
            );
          })()}
        </div>
      </Card>
    </QueueAnim>
  );
};

export default MenuEditor;
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, Card, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
// import type { TableListPagination } from './data';
import { addUser, delUser, modUser, getUserList } from '@/services/ant-design-pro/api';
import { useModel } from '@umijs/max';

// const { initialState, setInitialState } = useModel('@@initialState');
// const isDark = initialState?.settings?.isDark;
//添加用户
const handleAdd = async (fields: API.UserItem) => {
  try {
    const result = await addUser({ ...fields });
    if (result.message) {
      message.success(result.message);
    } else {
      message.error(result.error);
    }
    return true;
  } catch (error) {
    message.error('网络错误');
    return false;
  }
};

//更新用户信息
const handleMod = async (fields: API.UserItem) => {
  try {
    const result = await modUser({ ...fields });
    if (result.message) {
      message.success(result.message);
    } else {
      message.error(result.error);
    }
    return true;
  } catch (error) {
    message.error('网络错误');
    return false;
  }
};

//删除用户（有必要吗）
const handleDel = async (selectedRows: API.UserItem[]) => {
  //如果没选中项，直接返回
  if (!selectedRows) return true;

  try {
    const result = await delUser(selectedRows.map((row) => row.user_id));
    if (result.message) {
      message.success(result.message);
    } else {
      message.error(result.error);
    }
    return true;
  } catch (error) {
    message.error('网络错误');
    return false;
  }
};

const TableList: React.FC = () => {
  /** 新建窗口的弹窗 */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /** 分布更新窗口的弹窗 */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>(null);
  const [currentRow, setCurrentRow] = useState<API.UserItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.UserItem[]>([]);

  // 表格变化由ProTable的request属性自动处理

  const columns: ProColumns<API.UserItem>[] = [
    {
      title: '用户id',
      dataIndex: 'user_id',
      sorter: true,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      valueType: 'textarea',
      search: false,
    },
    {
      title: '卡片',
      dataIndex: 'card',
      valueType: 'textarea',
      search: false,
      hideInTable: true,
    },
    {
      title: '性别',
      dataIndex: 'sex',
      valueType: 'textarea',
      search: false,
      hideInTable: true,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      valueType: 'textarea',
      search: false,
      hideInTable: true,
    },
    {
      title: '城市',
      dataIndex: 'city',
      valueType: 'textarea',
      search: false,
      hideInTable: true,
    },
    {
      title: '权限等级',
      dataIndex: 'permission',
      sorter: true,
      search: false,
    },
    {
      title: '注册日期',
      dataIndex: 'registration_date',
      valueType: 'textarea',
      search: false,
      hideInTable: true,
    },
    {
      title: 'token统计',
      dataIndex: 'ai_token_record',
      sorter: true,
      search: false,
    },
    {
      title: '画像更新时间',
      dataIndex: 'portrait_update_time',
      valueType: 'textarea',
      search: false,
      hideInTable: true,
    },
    {
      title: '用户画像',
      dataIndex: 'user_portrait',
      valueType: 'textarea',
      search: false,
      hideInTable: true,
    },

    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, entity) => {
        return (
          <>
            <a
              onClick={() => {
                setCurrentRow(entity);
                setShowDetail(true);
              }}
            >
              详细信息
            </a>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <a
              onClick={() => {
                message.warning('功能开发中，敬请期待');
                // setCurrentRow(entity);
                // setShowDetail(true);
              }}
            >
              编辑
            </a>
          </>
        );
      },
      // render: (_, record) => [
      //   <a
      //     key="config"
      //     onClick={() => {
      //       handleUpdateModalVisible(true);
      //       setCurrentRow(record);
      //     }}
      //   >
      //     查看
      //   </a>,
      // ],
    },
  ];

  return (
    <Card>
      {/* <ProTable< API.UserItem, TableListPagination> */}
      <ProTable<API.UserItem>
        headerTitle="用户管理"
        actionRef={actionRef}
        rowKey="user_id"
        search={{
          labelWidth: 100,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              message.warning('功能开发中，敬请期待');
              // actionRef.current?.reloadAndRest?.();
              // handleModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params, sort, filter) => {
          const { current, pageSize, ...restParams } = params;
          // 构建排序参数
          let sortBy = '';
          let sortOrder = '';
          if (sort) {
            // 只取第一个排序字段（ProTable默认只支持单字段排序）
            const sortKeys = Object.keys(sort);
            if (sortKeys.length > 0) {
              sortBy = sortKeys[0];
              sortOrder = sort[sortBy] === 'ascend' ? 'asc' : 'desc';
            }
          }

          const result = await getUserList({
            current,
            pageSize,
            ...restParams,
            ...filter,
            sortBy,
            sortOrder,
          });

          return result;
        }}
        columns={columns}
        pagination={{ position: ['topLeft', 'bottomRight'] }}
        // sticky={true}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项 &nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={async () => {
              message.warning('功能开发中，敬请期待');
              // await handleDel(selectedRowsState);
              // setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
          <Button
            type="primary"
            onClick={() => {
              message.warning('功能开发中，敬请期待');
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量修改
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title="新建用户"
        // width="400px"
        open={createModalVisible}
        onOpenChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.UserItem);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: '用户ID为必填项',
            },
          ]}
          width="md"
          name="user_id"
          label="用户ID"
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: '昵称为必填项',
            },
          ]}
          width="md"
          name="nickname"
          label="昵称"
        />
        <ProFormText width="md" name="city" label="城市" />
        <ProFormText width="md" name="permission" label="权限等级" />
      </ModalForm>

      {/* <UpdateForm
        onSubmit={async (value) => {
          // 合并表单值和当前行数据
          const updatedUser = { ...currentRow, ...value };
          const success = await handleMod(updatedUser);

          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrentRow(undefined);
        }}
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
      /> */}

      {/* 详细信息 */}
      {currentRow?.user_id && (
        <Modal
          width={800}
          open={showDetail}
          title={`${currentRow?.user_id}  的详细信息`}
          onCancel={() => {
            setShowDetail(false);
            // 确保动画显示完全
            setTimeout(() => {
              setCurrentRow(undefined);
            }, 300);
          }}
          footer={null}
          // centered
        >
          <ProDescriptions<API.UserItem>
            column={2}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.user_id,
            }}
            columns={columns as ProDescriptionsItemProps<API.UserItem>[]}
          />
        </Modal>
      )}
    </Card>
  );
};

export default TableList;

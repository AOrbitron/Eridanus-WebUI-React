import React from 'react';
import { Modal, Form, Input, Button } from 'antd';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        newAccount: values.newAccount,
        newPassword: values.newPassword,
      };
      console.log('提交的数据:', submitData);
      // TODO: 调用后端 API
      onClose();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title="修改用户信息"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="新用户名（留空保持不变）"
          name="newAccount"
          rules={[{ required: false }]}
        >
          <Input placeholder="请输入新用户名" />
        </Form.Item>

        <Form.Item
          label="新密码（留空保持不变）"
          name="newPassword"
          rules={[{ required: false }]}
        >
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>

        <Form.Item
          label="确认新密码"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: false },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || !getFieldValue('newPassword') || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="请确认新密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            确认修改
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserProfileModal; 
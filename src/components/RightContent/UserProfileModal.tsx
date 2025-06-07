import React, { useState } from 'react';
import { Modal, Form, Input, Button, Popconfirm, message, PopconfirmProps } from 'antd';
import { history } from '@umijs/max';
import { sha3_256 } from 'js-sha3';
import { updateProfile } from '@/services/ant-design-pro/api';
interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [matchPswd, setMatchPswd] = useState<boolean>(true);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    // 对密码进行sha3-256加密
    const encryptedPassword = values.newPassword ? sha3_256(values.newPassword) : '';
    const submitData: API.UpdateProfileParams = {
      account: values.newAccount ? values.newAccount : '',
      password: encryptedPassword,
    };
    // 发送用户信息修改请求
    const submitResult = await updateProfile(submitData);
    if (submitResult.message) {
      onClose();
      document.cookie = 'auth_token=';
      localStorage.removeItem('auth_token');
      localStorage.removeItem('saved_account');
      localStorage.removeItem('saved_password');
      history.push('/user/login');
      message.success(submitResult.message);
      // setTimeout(()=>{location.reload()},1000);
    }
    if (submitResult.error) {
      message.error(submitResult.error);
      return;
    }
    // onClose();
    // message.error('修改失败');
    // console.error('表单验证失败:', error);
  };

  return (
    <Modal
      title="修改登录信息"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
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
          rules={[
            { required: false },
            ({ getFieldValue }) => ({
              validator(_, value) {
                message.info(value);
                //如果新密码为空，确认密码也为空；或者新密码为空，确认密码不为空；或者新密码和确认密码相同
                if ((!getFieldValue('confirmPassword') && !value) || (getFieldValue('confirmPassword') && !value) || getFieldValue('confirmPassword') === value) {
                  setMatchPswd(true);
                  return Promise.resolve();
                }
                setMatchPswd(false);
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
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
                message.info(value);
                //如果新密码为空，确认密码也为空；或者新密码为空，确认密码不为空；或者新密码和确认密码相同
                if ((!getFieldValue('newPassword') && !value) || (!getFieldValue('newPassword') && value) || getFieldValue('newPassword') === value) {
                  setMatchPswd(true);
                  return Promise.resolve();
                }
                setMatchPswd(false);
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="请确认新密码" />
        </Form.Item>
        <Popconfirm
          title="确认修改吗？"
          placement='bottom'
          onConfirm={handleSubmit}
          okText="是"
          cancelText="否"
        >
          <Button type="primary" block disabled={!matchPswd}>
            确认修改
          </Button>
        </Popconfirm>
      </Form>
    </Modal>
  );
};

export default UserProfileModal;

import React from 'react';
<<<<<<< HEAD
import { Modal, Form, Input, Button, Popconfirm, message, PopconfirmProps } from 'antd';
=======
import { Modal, Form, Input, Button } from 'antd';
>>>>>>> 2eb1461b120906aedb5b7f172ea9336e7814de69

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();

<<<<<<< HEAD
  const confirm: PopconfirmProps['onConfirm'] = (e) => {
    message.success('Click on Yes');
  };


=======
>>>>>>> 2eb1461b120906aedb5b7f172ea9336e7814de69
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        newAccount: values.newAccount,
        newPassword: values.newPassword,
      };
      console.log('提交的数据:', submitData);
<<<<<<< HEAD
      message.success('修改成功');
      // TODO: 调用后端 API
      onClose();
    } catch (error) {
      message.error('修改失败');
=======
      // TODO: 调用后端 API
      onClose();
    } catch (error) {
>>>>>>> 2eb1461b120906aedb5b7f172ea9336e7814de69
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
<<<<<<< HEAD
          <Popconfirm
            title="确认修改吗？"
            placement='bottom'
            // description="Are you sure to delete this task?"
            onConfirm={handleSubmit}
            // onCancel={cancel}
            okText="是"
            cancelText="否"
          >
            <Button type="primary" block>
              确认修改
            </Button>
          </Popconfirm>
=======
          <Button type="primary" htmlType="submit" block>
            确认修改
          </Button>
>>>>>>> 2eb1461b120906aedb5b7f172ea9336e7814de69
        </Form.Item>
      </Form>
    </Modal>
  );
};

<<<<<<< HEAD
export default UserProfileModal;
=======
export default UserProfileModal; 
>>>>>>> 2eb1461b120906aedb5b7f172ea9336e7814de69

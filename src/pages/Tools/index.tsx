import { Button, Card, message, Upload, Modal, Flex } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import QueueAnim from 'rc-queue-anim';
import { UploadOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload';
import { restartServer, exportConfig, importConfig, uploadFiles } from '@/services/ant-design-pro/api';

const Tools: FC<any> = () => {
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);

  // 重启服务端
  const handleRestart = async () => {
    try {
      const response = await restartServer();
      if (response.message) {
        message.success(response.message);
      } else if (response.error) {
        message.error(response.error);
      }
    } catch (error) {
      message.error('服务端重启失败: ' + error);
    }
  };

  // 导出配置文件
  const handleExport = async () => {
    try {
      setExportLoading(true);
      const response = await exportConfig();
      if (response.file) {
        message.success(response.message);
        setDownloadUrl(response.file);
        setIsModalVisible(true);
      } else if (response.error) {
        message.error(response.error);
      }
    } catch (error) {
      message.error('导出配置文件失败: ' + error);
    } finally {
      setExportLoading(false);
    }
  };

  // 导入配置文件
  const handleImport = async (file: RcFile) => {
    setImportLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response1 = await uploadFiles(formData);
      const fileName = response1.files[0].name || '';
      if (response1.error) {
        message.error(response1.error);
      }
      const response2 = await importConfig(fileName);
      if (response2.error) {
        message.error(response2.error);
      } else {
        message.success(response2.message);
      }
    } catch (error) {
      message.error('配置文件导入失败: ' + error);
    } finally {
      setImportLoading(false);
    }

    return false;
  };

  return (
    <>
      <QueueAnim type={'bottom'} delay={100} >
        <Card key="a" style={{ margin: 16, padding: 5 }} title="服务端">
          <Button type="primary" onClick={handleRestart}>
            <ReloadOutlined />重启服务端
          </Button>
        </Card>
        <Card key="b" style={{ margin: 16, padding: 5 }} title="配置文件">
          <Flex justify="space-between" align="center">
            <Flex gap="small" align="center">
              <Button type="primary" onClick={handleExport} loading={exportLoading}>
                <DownloadOutlined />导出配置文件
              </Button>
            </Flex>
            <Flex gap="small" align="center">
              <Upload
                beforeUpload={handleImport}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} loading={importLoading}>导入配置文件</Button>
              </Upload>
            </Flex>
          </Flex>
        </Card>
      </QueueAnim>

      <Modal
        okType='primary'
        title="导出配置文件"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>下载链接:&nbsp;&nbsp;<a href={`./api/chat/file?name=${downloadUrl}`} target="_blank" rel="noopener noreferrer">{downloadUrl}</a></p>
      </Modal>
    </>
  );
};

export default Tools;

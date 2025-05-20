import {
  InboxOutlined,
  HddOutlined,
  DesktopOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { Card, Col, Progress, Row, Statistic, Tooltip } from 'antd';
import React from 'react';
import QueueAnim from 'rc-queue-anim';

const BasicInfoCard: React.FC<API.BasicInfo> = ({ loading, systemInfo, botInfo }) => {
  const calcGB = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
  };
  // 计算内存和磁盘使用百分比
  const memoryPercent = systemInfo
    ? Math.round((systemInfo.usedMemory / systemInfo.totalMemory) * 100)
    : 0;
  const diskPercent = systemInfo
    ? Math.round((systemInfo.usedDisk / systemInfo.totalDisk) * 100)
    : 0;

  return (
    <>
      <Card loading={loading} title="系统信息" style={{ marginBottom: 12 }}>
        <Row gutter={24}>
          <Col xl={8} lg={8} md={8} sm={24} xs={24} key="0">
            <Statistic
              title="CPU使用率"
              value={systemInfo?.cpuUsage || 0}
              prefix={<DesktopOutlined />}
              suffix="%"
            />
            <Progress percent={systemInfo?.cpuUsage || 0} showInfo={false} strokeWidth={6} />
          </Col>
          <Col xl={8} lg={8} md={8} sm={24} xs={24} key="1">
            <Statistic
              title="内存"
              value={systemInfo ? `${calcGB(systemInfo.usedMemory)}/${calcGB(systemInfo.totalMemory)}` : '-'}
              prefix={<InboxOutlined />}
              suffix="GB"
            />
            <Progress percent={memoryPercent} showInfo={true} strokeWidth={6} />
          </Col>
          <Col xl={8} lg={8} md={8} sm={24} xs={24} key="2">
            <Statistic
              title="磁盘"
              value={systemInfo ? `${calcGB(systemInfo.usedDisk)}/${calcGB(systemInfo.totalDisk)}` : '-'}
              prefix={<HddOutlined />}
              suffix="GB"
            />
            <Progress percent={diskPercent} showInfo={true} strokeWidth={6} />
          </Col>
        </Row>
      </Card>
      <Card loading={loading} title="机器人信息" style={{ marginBottom: 12 }} key="b">
        <Row gutter={24}>
          <Col xl={8} lg={8} md={8} sm={8} xs={8}>
            <Statistic
              title="用户总数"
              value={botInfo?.totalUsers || '-'}
              prefix={<UserSwitchOutlined />}
            />
          </Col>
          <Col xl={8} lg={8} md={8} sm={8} xs={8}>
            <Statistic
              title="好友总数"
              value={botInfo?.totalFriends || 0}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#4da300' }}
            />
          </Col>
          <Col xl={8} lg={8} md={8} sm={8} xs={8}>
            <Statistic
              title="群总数"
              value={botInfo?.totalGroups || 0}
              prefix={<UsergroupAddOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default BasicInfoCard;

import { GridContent } from '@ant-design/pro-components';
import { Col, message, Row } from 'antd';
import type { FC } from 'react';
import { useRef, useEffect, useState } from 'react';
import BasicInfoCard from './components/BasicInfoCard';
import RankingCard from './components/RankingCard';
import { getBasicInfo } from '@/services/ant-design-pro/api';
import QueueAnim from 'rc-queue-anim';

const Dashboard: FC<any> = () => {
  // 使用useRef存储数据
  const dataRef = useRef<any>(null);
  // 使用useState管理loading状态
  const [loading, setLoading] = useState<boolean>(true);
  // 使用useState存储systemInfo数据以触发更新
  const [systemInfoState, setSystemInfoState] = useState<any>(null);

  // 在组件挂载时获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getBasicInfo();
        if (result.error) {
          message.error(result.error);
          return;
        }
        dataRef.current = result;
        setSystemInfoState(result.systemInfo);
      } catch (error) {
        message.error('网络错误');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const intervalId = setInterval(async () => {
      try {
        const result = await getBasicInfo({ systemInfo: 1 });
        if (result.error) {
          message.error(result.error);
          return;
        }
        dataRef.current = { ...dataRef.current, systemInfo: result.systemInfo };
        setSystemInfoState(result.systemInfo);
      } catch (error) {
        message.error('网络错误');
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <GridContent>
    <QueueAnim type={'bottom'} delay={100}>
      <Row gutter={24} key="a">
        <Col xl={24} lg={24} md={24} sm={24} xs={24}>
          <BasicInfoCard
            loading={loading}
            systemInfo={systemInfoState}
            botInfo={dataRef.current?.botInfo}
          />
        </Col>
      </Row>
      <Row gutter={24} key="b">
        <Col xl={24} lg={24} md={24} sm={24} xs={24}>
          <RankingCard loading={loading} ranks={dataRef.current?.ranks} />
        </Col>
      </Row>
      </QueueAnim>
    </GridContent>
  );
};

export default Dashboard;

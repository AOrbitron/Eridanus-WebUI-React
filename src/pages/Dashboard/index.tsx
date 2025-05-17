import { GridContent } from '@ant-design/pro-components';
import { Col, message, Row } from 'antd';
import type { FC } from 'react';
import { useRef, useEffect, useState } from 'react';
import BasicInfoCard from './components/BasicInfoCard';
import RankingCard from './components/RankingCard';
import { getBasicInfo } from '@/services/ant-design-pro/api';



const Dashboard: FC<any> = () => {
  // 使用useRef存储数据
  const dataRef = useRef<any>(null);
  // 使用useState管理loading状态
  const [loading, setLoading] = useState<boolean>(true);

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
      } catch (error) {
        message.error('网络错误');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <GridContent>
        <Row gutter={24}>
          <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <BasicInfoCard
              loading={loading}
              systemInfo={dataRef.current?.systemInfo}
              botInfo={dataRef.current?.botInfo}
            />
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <RankingCard loading={loading} ranks={dataRef.current?.ranks} />
          </Col>
        </Row>
    </GridContent>
  );
};

export default Dashboard;

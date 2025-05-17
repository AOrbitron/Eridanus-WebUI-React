import { TrophyOutlined, CalendarOutlined } from '@ant-design/icons';
import { Card, Col, Row, Tabs, List, Avatar } from 'antd';
import React from 'react';

type RankingProps = {
  loading: boolean;
  ranks?: {
    tokenRank: Array<{
      user_id: number;
      ai_token_record: number;
    }>;
    signInRank: Array<{
      userId: number;
      days: number;
    }>;
  };
};

const RankingCard: React.FC<RankingProps> = ({ loading, ranks }) => {

  // 生成排名列表项的样式
  const getRankingItemStyle = (index: number) => {
    if (index === 0) return { backgroundColor: '#ffbd3e', color: '#fff' };
    if (index === 1) return { backgroundColor: '#ff973e', color: '#fff' };
    if (index === 2) return { backgroundColor: '#ca6400', color: '#fff' };
    return {};
  };

  return (
    <Card loading={loading} title="Top10活跃用户排行榜">
      <Row gutter={24}>
        <Col xl={12} lg={12} md={12} sm={12} xs={24}>
          <List
            header="Token消耗"
            dataSource={ranks?.tokenRank || []}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={getRankingItemStyle(index)}>{index + 1}</Avatar>}
                  title={`用户 ${item.user_id}`}
                  description={`消耗Token: ${item.ai_token_record}`}
                />
              </List.Item>
            )}
          />
        </Col>

        <Col xl={12} lg={12} md={12} sm={12} xs={24}>
          <List
            header="签到天数"
            dataSource={ranks?.signInRank || []}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={getRankingItemStyle(index)}>{index + 1}</Avatar>}
                  title={`用户 ${item.userId}`}
                  description={`累计签到: ${item.days} 天`}
                />
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default RankingCard;

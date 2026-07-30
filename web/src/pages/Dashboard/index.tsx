import { Card, Col, Row, Statistic } from 'antd';

export default function Dashboard() {
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic title="进行中委托" value={0} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="待检样品" value={0} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="检测任务" value={0} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="待签发报告" value={0} />
        </Card>
      </Col>
    </Row>
  );
}

import { Layout, Typography, Card, Space, Row, Col, Button, Avatar, Badge } from 'antd';
import { MessageOutlined, DashboardOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';
import Chatbot from './Chatbot';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout style={{ 
      minHeight: '100vh', 
      maxHeight: '100vh',
      background: '#f0f2f5',
      overflow: 'hidden'
    }}>
      <Header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Avatar 
            size="large" 
            style={{ backgroundColor: '#fff', color: '#667eea' }}
            icon={<DashboardOutlined />}
          />
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            Analytics Hub
          </Title>
        </div>
        
        <Space size="middle">
          <Badge count={3}>
            <Button 
              type="text" 
              icon={<BellOutlined />} 
              style={{ color: 'white' }}
            />
          </Badge>
          <Button 
            type="text" 
            icon={<SettingOutlined />} 
            style={{ color: 'white' }}
          />
          <Avatar 
            style={{ backgroundColor: '#fff', color: '#667eea' }}
          >
            U
          </Avatar>
        </Space>
      </Header>
      
      <Content style={{ 
        padding: '24px', 
        height: 'calc(100vh - 64px)',
        maxHeight: 'calc(100vh - 64px)',
        overflow: 'hidden'
      }}>
        <Row gutter={[24, 24]} style={{ height: '100%' }}>
          {/* Dashboard Section - 2/3 width */}
          <Col xs={24} lg={16} style={{ height: '100%' }}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DashboardOutlined style={{ color: '#667eea' }} />
                  <span>Power BI Analytics</span>
                </div>
              }
              style={{ 
                height: '100%',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                border: 'none'
              }}
              styles={{ body: { padding: '16px', height: 'calc(100% - 57px)' } }}
            >
              <div style={{ 
                width: '100%', 
                height: '100%',
                overflow: 'hidden',
                borderRadius: '8px',
                background: '#f8f9fa'
              }}>
                <iframe
                  title="audit"
                  width="100%"
                  height="100%"
                  src="https://app.powerbi.com/reportEmbed?reportId=ca2dc115-9471-4f92-b69b-f225a3acc7d1&autoAuth=true&ctid=7af38bd4-da09-4cad-b870-0617a2df54d4"
                  frameBorder="0"
                  allowFullScreen={true}
                  style={{
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </Card>
          </Col>
          
          {/* Chatbot Section - 1/3 width */}
          <Col xs={24} lg={8} style={{ height: '100%' }}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageOutlined style={{ color: '#667eea' }} />
                    <span>AI Assistant</span>
                  </div>
                  <Badge status="processing" text="Online" />
                </div>
              }
              style={{ 
                height: '100%',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                border: 'none',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
              }}
              styles={{ 
                body: { 
                  padding: '0', 
                  height: 'calc(100% - 57px)',
                  display: 'flex',
                  flexDirection: 'column'
                } 
              }}
            >
              <Chatbot />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;

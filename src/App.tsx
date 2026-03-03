import { Layout, Typography, Card, Space, Row, Col, Button, Avatar, Badge, Input, Spin, message } from 'antd';
import { MessageOutlined, DashboardOutlined, SettingOutlined, BellOutlined, SendOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if chatbot server is online
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:3004/health');
      if (response.ok) {
        setIsOnline(true);
      }
    } catch (error) {
      setIsOnline(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !isOnline) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3004/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue })
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: data.response,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        message.error('Failed to send message');
      }
    } catch (error) {
      message.error('Error connecting to chatbot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
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
                  <Badge status={isOnline ? "processing" : "error"} text={isOnline ? "Online" : "Offline"} />
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
                  padding: '16px', 
                  height: 'calc(100% - 57px)',
                  display: 'flex',
                  flexDirection: 'column'
                } 
              }}
            >
              <div style={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Messages Area */}
                <div style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  marginBottom: '16px',
                  padding: '8px',
                  background: '#fafafa',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}>
                  {messages.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#8c8c8c', 
                      padding: '20px' 
                    }}>
                      <MessageOutlined style={{ fontSize: '32px', color: '#d9d9d9', marginBottom: '8px' }} />
                      <div>Ask me about your Power BI data!</div>
                      <div style={{ fontSize: '12px', marginTop: '8px' }}>
                        Try: "total sales", "top products", or "dax: EVALUATE {'{1, 2, 3}'}"
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} style={{ 
                        marginBottom: '12px',
                        display: 'flex',
                        justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                      }}>
                        <div style={{
                          maxWidth: '80%',
                          padding: '8px 12px',
                          borderRadius: '12px',
                          background: msg.type === 'user' 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                            : '#ffffff',
                          color: msg.type === 'user' ? 'white' : '#333',
                          border: msg.type === 'bot' ? '1px solid #f0f0f0' : 'none',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
                            {msg.timestamp}
                          </div>
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <Spin size="small" /> Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={isOnline ? "Ask about your data..." : "Chatbot offline"}
                    disabled={!isOnline || isLoading}
                    style={{ flex: 1 }}
                  />
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />}
                    onClick={sendMessage}
                    disabled={!isOnline || isLoading || !inputValue.trim()}
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;

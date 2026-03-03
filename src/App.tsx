import { Layout, Typography, Card, Space, Row, Col, Button, Avatar, Badge, Input, Spin, message, Select } from 'antd';
import { MessageOutlined, DashboardOutlined, SettingOutlined, BellOutlined, SendOutlined, BarChartOutlined, TableOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  data?: any[];
  chartType?: 'table' | 'bar' | 'pie' | 'line';
}

const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const detectChartType = (data: any[]): 'bar' | 'pie' | 'line' | 'table' => {
    if (!data || data.length === 0) return 'table';
    
    const keys = Object.keys(data[0]);
    const numericKeys = keys.filter(key => 
      data.some(row => typeof row[key] === 'number')
    );
    
    // If we have categories and numeric values, suggest bar or pie
    if (keys.length >= 2 && numericKeys.length >= 1) {
      const categoricalKeys = keys.filter(key => 
        data.some(row => typeof row[key] === 'string')
      );
      
      if (categoricalKeys.length >= 1 && data.length <= 10) {
        return 'pie'; // Good for small categorical data
      }
      return 'bar'; // Good for comparisons
    }
    
    return 'table'; // Default to table
  };

  const formatDataForChart = (data: any[], chartType: string) => {
    if (!data) return [];
    
    if (chartType === 'pie') {
      const keys = Object.keys(data[0]);
      const nameKey = keys.find(key => typeof data[0][key] === 'string') || 'name';
      const valueKey = keys.find(key => typeof data[0][key] === 'number') || 'value';
      
      return data.map(item => ({
        name: item[nameKey],
        value: item[valueKey]
      }));
    }
    
    return data;
  };

  const renderChart = (data: any[], chartType: string) => {
    if (!data || data.length === 0) return null;
    
    const formattedData = formatDataForChart(data, chartType);
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(formattedData[0]).find(k => typeof formattedData[0][k] === 'string')} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={Object.keys(formattedData[0]).find(k => typeof formattedData[0][k] === 'number')} fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(formattedData[0]).find(k => typeof formattedData[0][k] === 'string')} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={Object.keys(formattedData[0]).find(k => typeof formattedData[0][k] === 'number')} stroke="#667eea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

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
        
        // Extract structured data if available
        let extractedData: any[] | undefined = undefined;
        let chartType: 'table' | 'bar' | 'pie' | 'line' = 'table';
        
        if (data.has_data && data.data) {
          extractedData = data.data;
          chartType = detectChartType(data.data);
        }
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: data.response,
          timestamp: new Date().toLocaleTimeString(),
          data: extractedData,
          chartType: chartType
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
            <iframe title="testaudit" width="1140" height="541.25" src="https://app.powerbi.com/reportEmbed?reportId=6ac9f0dc-1c02-4339-b1aa-0ed86b91b49c&autoAuth=true&ctid=7af38bd4-da09-4cad-b870-0617a2df54d4" frameborder="0" allowFullScreen="true"/>
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
                          {/* Render chart if data is available */}
                          {msg.data && msg.chartType && (
                            <div style={{ marginTop: '12px' }}>
                              {renderChart(msg.data, msg.chartType)}
                            </div>
                          )}
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

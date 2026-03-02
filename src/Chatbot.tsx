import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Avatar, Typography, Space, Spin, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Text } = Typography;

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you with your dashboard analytics today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = 'http://localhost:3001';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check API connection on component mount
    checkAPIConnection();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkAPIConnection = async () => {
    try {
      await axios.get(`${API_BASE_URL}/health`);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
      message.warning('Chatbot service is currently unavailable');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: inputMessage.trim()
      });

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.response?.status === 503) {
        errorMessage = 'I\'m currently experiencing connection issues. Please try again in a moment.';
        setIsConnected(false);
      }

      const errorBotMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorBotMessage]);
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
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#fff'
    }}>
      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        background: '#fafafa'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: '8px'
            }}
          >
            {msg.sender === 'bot' && (
              <Avatar
                size="small"
                style={{ backgroundColor: '#667eea' }}
                icon={<RobotOutlined />}
              />
            )}
            
            <div
              style={{
                maxWidth: '70%',
                padding: '8px 12px',
                borderRadius: '12px',
                background: msg.sender === 'user' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : '#f5f5f5',
                color: msg.sender === 'user' ? 'white' : '#333',
                wordBreak: 'break-word'
              }}
            >
              <Text style={{ color: msg.sender === 'user' ? 'white' : 'inherit' }}>
                {msg.text}
              </Text>
            </div>

            {msg.sender === 'user' && (
              <Avatar
                size="small"
                style={{ backgroundColor: '#1890ff' }}
                icon={<UserOutlined />}
              />
            )}
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar
              size="small"
              style={{ backgroundColor: '#667eea' }}
              icon={<RobotOutlined />}
            />
            <div style={{
              padding: '8px 12px',
              borderRadius: '12px',
              background: '#f5f5f5'
            }}>
              <Spin size="small" />
              <Text style={{ marginLeft: 8, color: '#666' }}>Thinking...</Text>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #f0f0f0',
        background: '#fff'
      }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            disabled={isLoading || !isConnected}
            style={{ resize: 'none' }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim() || !isConnected}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            Send
          </Button>
        </Space.Compact>
        
        {!isConnected && (
          <div style={{ marginTop: 8 }}>
            <Text type="danger" style={{ fontSize: '12px' }}>
              ⚠️ Chatbot service disconnected. Please check your connection.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;

import { useState, useEffect } from 'react';
import { Button, Card, Space, Typography } from 'antd';

const { Title, Text } = Typography;

const TestAuth = () => {
  const [authData, setAuthData] = useState({});

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const refreshToken = localStorage.getItem('refreshToken');
    
    setAuthData({
      token: token ? 'Present' : 'Missing',
      role: role || 'Missing',
      username: username || 'Missing',
      refreshToken: refreshToken ? 'Present' : 'Missing'
    });
    
    console.log('Current localStorage:', {
      token,
      role,
      username,
      refreshToken
    });
  };

  const clearAuth = () => {
    localStorage.clear();
    setAuthData({});
    console.log('Cleared localStorage');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Card title="Auth Debug Panel" style={{ margin: '20px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={4}>Current Auth Status:</Title>
        <Text>Token: {authData.token}</Text>
        <Text>Role: {authData.role}</Text>
        <Text>Username: {authData.username}</Text>
        <Text>RefreshToken: {authData.refreshToken}</Text>
        
        <Space>
          <Button type="primary" onClick={checkAuth}>
            Refresh Check
          </Button>
          <Button danger onClick={clearAuth}>
            Clear Auth
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

export default TestAuth;


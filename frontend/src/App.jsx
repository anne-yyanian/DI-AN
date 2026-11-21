import { useState } from 'react';
import AuthPage from './AuthPage';
import DashboardPage from './DashboardPage';
import { getToken } from './api';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return isAuthenticated ? (
    <DashboardPage onLogout={handleLogout} />
  ) : (
    <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />
  );
}
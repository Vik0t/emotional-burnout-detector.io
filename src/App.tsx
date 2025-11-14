import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { BurnoutTest, TestResults } from './components/BurnoutTest';
import { ChatBot } from './components/ChatBot';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeeList } from './components/EmployeeList';

type AppState = 'login' | 'test' | 'chat' | 'dashboard' | 'admin' | 'employeeList';

export default function App() {
  const [currentState, setCurrentState] = useState('login' as AppState);
  const [employeeId, setEmployeeId] = useState('');
  const [testResults, setTestResults] = useState(null as TestResults | null);

  const handleLogin = (id: string, isAdmin: boolean) => {
    setEmployeeId(id);
    if (isAdmin) {
      setCurrentState('admin');
    } else {
      setCurrentState('test');
    }
  };

  const handleLogout = () => {
    setEmployeeId('');
    setTestResults(null);
    setCurrentState('login');
  };

  const handleTestComplete = (results: TestResults) => {
    setTestResults(results);
    setCurrentState('dashboard');
  };

  const handleGoToDashboard = () => {
    setCurrentState('dashboard');
  };

  const handleBackToChat = () => {
    setCurrentState('chat');
  };

  const handleRetakeTest = () => {
    setTestResults(null);
    setCurrentState('test');
  };

  const handleViewEmployeeList = () => {
    setCurrentState('employeeList');
  };

  return (
    <>
      {currentState === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}
      
      {currentState === 'test' && (
        <BurnoutTest 
          onComplete={handleTestComplete} 
          employeeId={employeeId}
          onLogout={handleLogout}
        />
      )}
      
      {currentState === 'chat' && testResults && (
        <ChatBot
          testResults={testResults}
          employeeId={employeeId}
          onGoToDashboard={handleGoToDashboard}
        />
      )}
      
      {currentState === 'dashboard' && testResults && (
        <Dashboard
          testResults={testResults}
          employeeId={employeeId}
          onBackToChat={handleBackToChat}
          onRetakeTest={handleRetakeTest}
          onLogout={handleLogout}
        />
      )}
      
      {currentState === 'admin' && (
        <AdminDashboard
          onLogout={handleLogout}
          onShowEmployeeList={handleViewEmployeeList}
        />
      )}
      
      {currentState === 'employeeList' && (
        <EmployeeList
          onBack={() => setCurrentState('admin')}
        />
      )}
    </>
  );
}
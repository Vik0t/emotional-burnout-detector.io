import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { BurnoutTest, TestResults } from './components/BurnoutTest';
import { ChatBot } from './components/ChatBot';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeDetail } from './components/EmployeeDetail';
import { UserAccount } from './components/UserAccount';

type AppState = 'login' | 'account' | 'test' | 'chat' | 'dashboard' | 'admin' | 'employeeList' | 'employeeDetail';

export default function App() {
  const [currentState, setCurrentState] = useState('login' as AppState);
  const [employeeId, setEmployeeId] = useState('');
  const [testResults, setTestResults] = useState(null as TestResults | null);
  const [selectedTestResult, setSelectedTestResult] = useState(null as TestResults | null);
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; department: string } | null>(null);

  const handleLogin = (id: string, isAdmin: boolean) => {
    setEmployeeId(id);
    if (isAdmin) {
      setCurrentState('admin');
    } else {
      setCurrentState('account');
    }
  };

  const handleLogout = () => {
    setEmployeeId('');
    setTestResults(null);
    setSelectedTestResult(null);
    setCurrentState('login');
  };

  const handleTestComplete = (results: TestResults) => {
    setTestResults(results);
    setSelectedTestResult(results);
    setCurrentState('dashboard');
  };

  const handleGoToDashboard = () => {
    setCurrentState('dashboard');
  };

  const handleBackToChat = () => {
    setCurrentState('chat');
  };

  const handleBackToAccount = () => {
    setCurrentState('account');
  };

  const handleRetakeTest = () => {
    setCurrentState('test');
  };

  const handleViewEmployeeList = () => {
    setCurrentState('employeeList');
  };

  const handleStartTest = () => {
    setCurrentState('test');
  };

  const handleOpenChat = () => {
    setCurrentState('chat');
  };

  const handleViewTestResult = (result: any) => {
    setSelectedTestResult(result);
    setCurrentState('dashboard');
  };

  const handleViewEmployeeDetail = (empId: string, department: string) => {
    setSelectedEmployee({ id: empId, department });
    setCurrentState('employeeDetail');
  };

  const handleBackToEmployeeList = () => {
    setSelectedEmployee(null);
    setCurrentState('employeeList');
  };

  return (
    <>
      {currentState === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}

      {currentState === 'account' && (
        <UserAccount
          employeeId={employeeId}
          onLogout={handleLogout}
          onStartTest={handleStartTest}
          onOpenChat={handleOpenChat}
          onViewTestResult={handleViewTestResult}
        />
      )}
      
      {currentState === 'test' && (
        <BurnoutTest 
          onComplete={handleTestComplete} 
          employeeId={employeeId}
          onLogout={handleLogout}
          onBackToAccount={handleBackToAccount}
        />
      )}
      
      {currentState === 'chat' && (testResults || selectedTestResult) && (
        <ChatBot
          testResults={(selectedTestResult || testResults)!}
          employeeId={employeeId}
          onGoToDashboard={handleGoToDashboard}
          onBackToAccount={handleBackToAccount}
        />
      )}
      
      {currentState === 'dashboard' && (testResults || selectedTestResult) && (
        <Dashboard
          testResults={(selectedTestResult || testResults)!}
          employeeId={employeeId}
          onBackToChat={handleBackToChat}
          onRetakeTest={handleRetakeTest}
          onLogout={handleLogout}
          onBackToAccount={handleBackToAccount}
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
          onViewEmployee={handleViewEmployeeDetail}
        />
      )}

      {currentState === 'employeeDetail' && selectedEmployee && (
        <EmployeeDetail
          employeeId={selectedEmployee.id}
          department={selectedEmployee.department}
          onBack={handleBackToEmployeeList}
        />
      )}
    </>
  );
}

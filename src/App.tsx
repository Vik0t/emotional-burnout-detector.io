import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { BurnoutTest, TestResults } from './components/BurnoutTest';
import { ChatBot } from './components/ChatBot';
import { Dashboard } from './components/Dashboard';

type AppState = 'login' | 'test' | 'chat' | 'dashboard';

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('login');
  const [employeeId, setEmployeeId] = useState('');
  const [testResults, setTestResults] = useState<TestResults | null>(null);

  const handleLogin = (id: string) => {
    setEmployeeId(id);
    setCurrentState('test');
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

  return (
    <>
      {currentState === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}
      
      {currentState === 'test' && (
        <BurnoutTest 
          onComplete={handleTestComplete} 
          employeeId={employeeId}
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
        />
      )}
    </>
  );
}

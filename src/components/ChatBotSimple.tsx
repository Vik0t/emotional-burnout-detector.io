import React from 'react';
import { Button } from 'primereact/button';
import { TestResults } from './BurnoutTest';

interface ChatBotSimpleProps {
  testResults: TestResults;
  employeeId: string;
  onGoToDashboard: () => void;
  onBackToAccount?: () => void;
}

export function ChatBotSimple({ testResults, employeeId, onGoToDashboard, onBackToAccount }: ChatBotSimpleProps) {
  console.log('ChatBotSimple props:', { testResults, employeeId, onGoToDashboard, onBackToAccount });
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">ChatBot Simple Test</h1>
        <p className="mb-4">Employee ID: {employeeId}</p>
        <p className="mb-4">Test Results: {JSON.stringify(testResults, null, 2)}</p>
        <Button onClick={onGoToDashboard} label="Вернуться в дашборд" />
        {onBackToAccount && (
          <Button onClick={onBackToAccount} label="В личный кабинет" className="ml-2" />
        )}
      </div>
    </div>
  );
}
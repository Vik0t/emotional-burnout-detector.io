import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { ProgressBar } from 'primereact/progressbar';
import { Card } from 'primereact/card';
import { apiService } from '../services/api';
import cdekLogo from '../assets/cdek-logo.svg';

interface BurnoutTestProps {
  onComplete: (results: TestResults) => void;
  employeeId: string;
  onLogout: () => void;
  onBackToAccount?: () => void;
}

export interface TestResults {
  emotionalExhaustion: number;
  depersonalization: number;
  personalAccomplishment: number;
  totalScore: number;
  answers: number[];
}

const questions = [
  // Эмоциональное истощение
  { text: 'Я чувствую себя эмоционально опустошённым из-за работы', category: 'exhaustion' },
  { text: 'К концу рабочего дня я чувствую себя полностью измотанным', category: 'exhaustion' },
  { text: 'Я чувствую усталость, когда утром встаю и должен идти на работу', category: 'exhaustion' },
  { text: 'Работа с людьми весь день требует от меня больших усилий', category: 'exhaustion' },
  { text: 'Моя работа меня изматывает', category: 'exhaustion' },
  
  // Деперсонализация
  { text: 'Я чувствую, что стал более чёрствым по отношению к людям', category: 'depersonalization' },
  { text: 'Я беспокоюсь, что работа делает меня более жёстким эмоционально', category: 'depersonalization' },
  { text: 'Я не особенно забочусь о том, что происходит с некоторыми коллегами', category: 'depersonalization' },
  { text: 'Мне кажется, что коллеги обвиняют меня в некоторых своих проблемах', category: 'depersonalization' },
  
  // Редукция личных достижений
  { text: 'Я могу легко понять, что чувствуют мои коллеги', category: 'accomplishment', reverse: true },
  { text: 'Я эффективно справляюсь с проблемами своих коллег', category: 'accomplishment', reverse: true },
  { text: 'Я чувствую, что своей работой положительно влияю на жизнь других', category: 'accomplishment', reverse: true },
  { text: 'Я полон энергии', category: 'accomplishment', reverse: true },
  { text: 'Я легко создаю спокойную атмосферу с моими коллегами', category: 'accomplishment', reverse: true },
];

const options = [
  { value: '0', label: 'Никогда' },
  { value: '1', label: 'Очень редко' },
  { value: '2', label: 'Редко' },
  { value: '3', label: 'Иногда' },
  { value: '4', label: 'Часто' },
  { value: '5', label: 'Очень часто' },
  { value: '6', label: 'Всегда' },
];

export function BurnoutTest({ onComplete, employeeId, onLogout, onBackToAccount }: BurnoutTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(questions.length).fill(-1) as number[]);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && answers[currentQuestion] !== -1) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, answers]);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await calculateResults();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = async () => {
    let emotionalExhaustion = 0;
    let depersonalization = 0;
    let personalAccomplishment = 0;

    questions.forEach((q, index) => {
      const score = q.reverse ? 6 - answers[index] : answers[index];
      
      if (q.category === 'exhaustion') {
        emotionalExhaustion += score;
      } else if (q.category === 'depersonalization') {
        depersonalization += score;
      } else if (q.category === 'accomplishment') {
        personalAccomplishment += score;
      }
    });

    const totalScore = emotionalExhaustion + depersonalization + personalAccomplishment;
    
    const results = {
      emotionalExhaustion,
      depersonalization,
      personalAccomplishment,
      totalScore,
      answers,
    };

    try {
      // Save test results to backend
      await apiService.saveTestResults(employeeId, results);
      onComplete(results);
    } catch (error) {
      console.error('Failed to save test results:', error);
      // Still complete the test even if saving fails
      onComplete(results);
    }
  };

  const isAnswered = answers[currentQuestion] !== -1;

  return (
    <div style={{ height: '100vh', maxHeight: '100vh' }} className="w-screen bg-gray-50 flex flex-col p-2 sm:p-3 overflow-hidden box-border">
      <div className="max-w-4xl w-full mx-auto flex flex-col min-h-0" style={{ height: '100%' }}>
        {/* Logo and Logout */}
        <div className="flex justify-between items-center mb-2 flex-shrink-0" style={{ minHeight: 'fit-content' }}>
          <div className="flex items-center gap-2">
            <img src={cdekLogo} alt="CDEK" className="h-4 sm:h-5" />
            <span className="text-gray-600 text-xs sm:text-sm">Диагностика выгорания</span>
          </div>
          <div className="flex gap-2">
            {onBackToAccount && (
              <Button 
                onClick={onBackToAccount} 
                label="НАЗАД"
                outlined
                size="small"
                className="text-xs py-1 px-2"
              />
            )}
            <Button 
              onClick={onLogout} 
              label="ВЫХОД"
              outlined
              size="small"
              className="text-xs py-1 px-2"
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="mb-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0 overflow-hidden p-3 sm:p-4" style={{ flex: '1 1 0', minHeight: 0 }}>
          {/* Header inside card */}
          <div className="text-center pb-2 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-gray-900 mb-1 text-sm sm:text-base font-semibold">Тест на выгорание</h1>
            <p className="text-gray-600 text-xs">
              Вопрос {currentQuestion + 1} из {questions.length}
            </p>
            {/* Progress */}
            <div className="mt-1.5">
              <ProgressBar 
                value={progress} 
                showValue={false}
                style={{ height: '6px' }}
                color="#00B33C"
              />
            </div>
          </div>

          {/* Question */}
          <div className="py-3 sm:py-4 flex-shrink-0">
            <p className="text-gray-900 text-xs sm:text-sm leading-snug text-center">
              {questions[currentQuestion].text}
            </p>
          </div>

          {/* Options - takes remaining space with scrolling */}
          <div className="flex flex-col gap-2 overflow-y-auto" style={{ flex: '1 1 0', minHeight: 0 }}>
            {options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer flex-shrink-0 ${
                  answers[currentQuestion]?.toString() === option.value
                    ? 'border-[#00B33C] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                style={{ minHeight: '48px' }}
                onClick={() => handleAnswer(option.value)}
              >
                <RadioButton
                  inputId={option.value}
                  value={option.value}
                  onChange={(e) => handleAnswer(e.value)}
                  checked={answers[currentQuestion]?.toString() === option.value}
                />
                <label
                  htmlFor={option.value}
                  className="flex-1 cursor-pointer text-gray-700 text-xs sm:text-sm"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3 sm:gap-4 flex-shrink-0" style={{ minHeight: 'fit-content' }}>
          <Button
            onClick={handleBack}
            label="НАЗАД"
            outlined
            disabled={currentQuestion === 0}
            style={{ height: '40px', minWidth: '150px', flex: '0 0 auto' }}
            className="px-8 text-xs sm:text-sm"
          />
          <Button
            onClick={handleNext}
            label={currentQuestion === questions.length - 1 ? 'ЗАВЕРШИТЬ' : 'ДАЛЕЕ'}
            disabled={!isAnswered}
            style={{ height: '40px', flex: '1 1 auto' }}
            className="px-10 text-xs sm:text-sm"
            severity="success"
          />
        </div>
      </div>
    </div>
  );
}
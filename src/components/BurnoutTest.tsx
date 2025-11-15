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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-2xl w-full">
        {/* Logo and Logout */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={cdekLogo} alt="CDEK" className="h-5 sm:h-6" />
            <span className="text-gray-600 text-sm sm:text-base">Диагностика выгорания</span>
          </div>
          <div className="flex gap-2">
            {onBackToAccount && (
              <Button 
                onClick={onBackToAccount} 
                label="НАЗАД"
                outlined
                size="small"
                className="text-xs sm:text-sm"
              />
            )}
            <Button 
              onClick={onLogout} 
              label="ВЫХОД"
              outlined
              size="small"
              className="text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-4 sm:mb-6">
          {/* Header inside card */}
          <div className="text-center mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
            <h1 className="text-gray-900 mb-2 sm:mb-3 text-xl sm:text-2xl font-semibold">Тест на выгорание</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Вопрос {currentQuestion + 1} из {questions.length}
            </p>
            {/* Progress */}
            <div className="mt-3 sm:mt-4">
              <ProgressBar 
                value={progress} 
                showValue={false}
                className="h-2"
                color="#00B33C"
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-6 sm:mb-8">
            <p className="text-gray-900 text-base sm:text-lg leading-relaxed">
              {questions[currentQuestion].text}
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2 sm:gap-3">
            {options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  answers[currentQuestion]?.toString() === option.value
                    ? 'border-[#00B33C] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
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
                  className="flex-1 cursor-pointer text-gray-700 text-sm sm:text-base"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-3 sm:gap-4">
          <Button
            onClick={handleBack}
            label="НАЗАД"
            outlined
            disabled={currentQuestion === 0}
            className="h-10 sm:h-12 px-4 sm:px-6 flex-1 sm:flex-none text-sm sm:text-base"
          />
          <Button
            onClick={handleNext}
            label={currentQuestion === questions.length - 1 ? 'ЗАВЕРШИТЬ' : 'ДАЛЕЕ'}
            disabled={!isAnswered}
            className="h-10 sm:h-12 px-4 sm:px-6 flex-1 sm:flex-auto text-sm sm:text-base"
            severity="success"
          />
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface BurnoutTestProps {
  onComplete: (results: TestResults) => void;
  employeeId: string;
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

export function BurnoutTest({ onComplete, employeeId }: BurnoutTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
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

    onComplete({
      emotionalExhaustion,
      depersonalization,
      personalAccomplishment,
      totalScore,
      answers,
    });
  };

  const isAnswered = answers[currentQuestion] !== -1;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2">
            <div className="bg-[#00B33C] text-white px-3 py-1 rounded">
              CDEK
            </div>
            <span className="text-gray-600">ID: {employeeId}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-6">
          {/* Header inside card */}
          <div className="text-center mb-6 pb-6 border-b border-gray-200">
            <h1 className="text-gray-900 mb-3">Тест на выгорание</h1>
            <p className="text-gray-600">
              Вопрос {currentQuestion + 1} из {questions.length}
            </p>
            {/* Progress */}
            <div className="mt-4">
              <Progress value={progress} className="h-2 bg-gray-200">
                <div 
                  className="h-full bg-[#00B33C] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </Progress>
            </div>
          </div>

          <h2 className="text-gray-900 mb-6">
            {questions[currentQuestion].text}
          </h2>

          <RadioGroup
            value={answers[currentQuestion].toString()}
            onValueChange={handleAnswer}
            className="space-y-2.5"
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  answers[currentQuestion].toString() === option.value
                    ? 'border-[#00B33C] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label
                  htmlFor={option.value}
                  className="flex-1 cursor-pointer text-gray-700"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={handleBack}
            disabled={currentQuestion === 0}
            variant="outline"
            className="flex-1 h-12"
          >
            НАЗАД
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isAnswered}
            className="flex-1 h-12 bg-[#00B33C] hover:bg-[#009933] text-white"
          >
            {currentQuestion === questions.length - 1 ? 'ЗАВЕРШИТЬ' : 'ДАЛЕЕ'}
          </Button>
        </div>
      </div>
    </div>
  );
}

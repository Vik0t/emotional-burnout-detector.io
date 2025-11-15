import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { 
  ArrowLeft,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  User
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import cdekLogo from '../assets/cdek-logo.svg';

interface TestResult {
  date: string;
  score: number;
  level: string;
  emotionalExhaustion: number;
  depersonalization: number;
  personalAccomplishment: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface EmployeeDetailProps {
  employeeId: string;
  department: string;
  onBack: () => void;
}

export function EmployeeDetail({ employeeId, department, onBack }: EmployeeDetailProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Загрузка данных пользователя
  useEffect(() => {
    // Загружаем историю тестов
    const savedHistory = localStorage.getItem(`testHistory_${employeeId}`);
    if (savedHistory) {
      setTestResults(JSON.parse(savedHistory));
    } else {
      // Генерируем моковые данные если их нет
      generateMockData();
    }

    // Генерируем моковые рекомендации для каждого сотрудника
    generateMockRecommendations();
  }, [employeeId]);

  const generateMockRecommendations = () => {
    const allRecommendations = [
      {
        id: '1',
        title: 'Техники дыхательной релаксации',
        description: 'Практикуйте глубокое дыхание 5-10 минут утром и вечером',
        completed: Math.random() > 0.5
      },
      {
        id: '2',
        title: 'Регулярные физические упражнения',
        description: 'Уделяйте минимум 30 минут физической активности 3 раза в неделю',
        completed: Math.random() > 0.5
      },
      {
        id: '3',
        title: 'Установление границ между работой и личной жизнью',
        description: 'Определите четкое время окончания рабочего дня и придерживайтесь его',
        completed: Math.random() > 0.5
      },
      {
        id: '4',
        title: 'Практика осознанности',
        description: 'Медитируйте 10-15 минут каждый день для снижения стресса',
        completed: Math.random() > 0.5
      },
      {
        id: '5',
        title: 'Качественный сон',
        description: 'Обеспечьте себе 7-8 часов сна каждую ночь',
        completed: Math.random() > 0.5
      },
      {
        id: '6',
        title: 'Социальная поддержка',
        description: 'Регулярно общайтесь с друзьями и семьей для эмоциональной поддержки',
        completed: Math.random() > 0.5
      },
      {
        id: '7',
        title: 'Хобби и отдых',
        description: 'Уделяйте время любимым занятиям и хобби вне работы',
        completed: Math.random() > 0.5
      },
      {
        id: '8',
        title: 'Профессиональная консультация',
        description: 'Рассмотрите возможность консультации с психологом или коучем',
        completed: Math.random() > 0.5
      }
    ];

    const count = 3 + Math.floor(Math.random() * 6);
    const selectedRecommendations = allRecommendations
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    setRecommendations(selectedRecommendations);
  };

  const generateMockData = () => {
    const mockData: TestResult[] = [];
    const startDate = new Date('2024-09-01');
    
    for (let i = 0; i < 12; i++) {
      const testDate = new Date(startDate);
      testDate.setDate(testDate.getDate() + (i * 8));
      
      let emotionalExhaustion, depersonalization, personalAccomplishment;
      
      if (i < 5) {
        emotionalExhaustion = 8 + i * 2 + Math.floor(Math.random() * 3);
        depersonalization = 4 + i * 1.5 + Math.floor(Math.random() * 2);
        personalAccomplishment = 18 - i * 1.5 + Math.floor(Math.random() * 2);
      } else if (i < 9) {
        emotionalExhaustion = 18 + Math.floor(Math.random() * 4);
        depersonalization = 11 + Math.floor(Math.random() * 3);
        personalAccomplishment = 10 + Math.floor(Math.random() * 3);
      } else {
        emotionalExhaustion = 15 - (i - 8) * 2 + Math.floor(Math.random() * 2);
        depersonalization = 9 - (i - 8) * 1.5 + Math.floor(Math.random() * 2);
        personalAccomplishment = 12 + (i - 8) * 2 + Math.floor(Math.random() * 2);
      }
      
      const score = emotionalExhaustion + depersonalization + personalAccomplishment;
      
      let level: string;
      if (emotionalExhaustion > 15 || depersonalization > 10) {
        level = 'Высокий';
      } else if (emotionalExhaustion > 10 || depersonalization > 6) {
        level = 'Средний';
      } else {
        level = 'Низкий';
      }
      
      mockData.push({
        date: testDate.toISOString(),
        score,
        level,
        emotionalExhaustion,
        depersonalization,
        personalAccomplishment
      });
    }
    
    setTestResults(mockData);
  };

  const latestResult = testResults.length > 0 ? testResults[testResults.length - 1] : null;
  const completedCount = recommendations.filter(r => r.completed).length;
  const completionPercentage = recommendations.length > 0 
    ? Math.round((completedCount / recommendations.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              onClick={onBack} 
              label="НАЗАД"
              outlined
              size="small"
              icon={<ArrowLeft size={16} />}
            />
            <img src={cdekLogo} alt="CDEK" className="h-5 sm:h-6" />
            <div>
              <h1 className="text-gray-900 text-base sm:text-xl">Сотрудник: {employeeId}</h1>
              <p className="text-xs sm:text-sm text-gray-500">{department}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Employee Info */}
        <Card 
          className="mb-6" 
          style={{ 
            background: 'linear-gradient(to bottom right, #faf5ff, #eff6ff)',
            borderColor: '#e9d5ff'
          }}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#e9d5ff' }}
              >
                <User size={32} style={{ color: '#7c3aed' }} />
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900 mb-3">Профиль сотрудника</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">ID сотрудника</p>
                    <p className="text-gray-900">{employeeId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Департамент</p>
                    <p className="text-gray-900">{department}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Status */}
        {latestResult && (
          <>
            <Card className="mb-6">
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-gray-900 text-lg sm:text-xl mb-1">Текущий статус</h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Последний тест: {new Date(latestResult.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div 
                    className="px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium"
                    style={{
                      backgroundColor: latestResult.level === 'Высокий' ? '#fee2e2' :
                                      latestResult.level === 'Средний' ? '#fef3c7' : '#d1fae5',
                      color: latestResult.level === 'Высокий' ? '#991b1b' :
                            latestResult.level === 'Средний' ? '#92400e' : '#065f46'
                    }}
                  >
                    {latestResult.level}
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div 
                    className="rounded-lg p-2 sm:p-4 text-center border"
                    style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
                  >
                    <p className="text-xs mb-1 sm:mb-2" style={{ color: '#b91c1c', fontSize: '0.65rem', lineHeight: '1.2' }}>
                      <span className="hidden sm:inline">Эмоц. истощение</span>
                      <span className="sm:hidden">Эмоц.<br/>истощ.</span>
                    </p>
                    <p className="text-lg sm:text-3xl font-bold" style={{ color: '#7f1d1d' }}>
                      {latestResult.emotionalExhaustion}
                    </p>
                  </div>
                  <div 
                    className="rounded-lg p-2 sm:p-4 text-center border"
                    style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}
                  >
                    <p className="text-xs mb-1 sm:mb-2" style={{ color: '#c2410c', fontSize: '0.65rem', lineHeight: '1.2' }}>
                      <span className="hidden sm:inline">Деперсонализация</span>
                      <span className="sm:hidden">Деперс.</span>
                    </p>
                    <p className="text-lg sm:text-3xl font-bold" style={{ color: '#7c2d12' }}>
                      {latestResult.depersonalization}
                    </p>
                  </div>
                  <div 
                    className="rounded-lg p-2 sm:p-4 text-center border"
                    style={{ backgroundColor: '#faf5ff', borderColor: '#e9d5ff' }}
                  >
                    <p className="text-xs mb-1 sm:mb-2" style={{ color: '#7c3aed', fontSize: '0.65rem', lineHeight: '1.2' }}>
                      <span className="hidden sm:inline">Редукция достижений</span>
                      <span className="sm:hidden">Редукция<br/>дост.</span>
                    </p>
                    <p className="text-lg sm:text-3xl font-bold" style={{ color: '#6b21a8' }}>
                      {latestResult.personalAccomplishment}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Dynamic Dashboard */}
            {testResults.length > 1 && (
              <Card className="mb-6">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 size={20} style={{ color: '#00B33C' }} />
                    <h3 className="text-gray-900 text-lg sm:text-xl">Динамика состояния</h3>
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                    <div 
                      className="rounded-lg p-2 sm:p-4 border"
                      style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', borderColor: '#93c5fd' }}
                    >
                      <p className="text-xs mb-1 sm:mb-2 text-center" style={{ color: '#1e40af' }}>Средний балл</p>
                      <p className="text-lg sm:text-2xl font-bold text-center" style={{ color: '#1e3a8a' }}>
                        {(testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length).toFixed(1)}
                      </p>
                    </div>

                    <div 
                      className="rounded-lg p-2 sm:p-4 border"
                      style={{ background: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)', borderColor: '#c084fc' }}
                    >
                      <p className="text-xs mb-1 sm:mb-2 text-center" style={{ color: '#7c3aed' }}>Диапазон</p>
                      <p className="text-lg sm:text-2xl font-bold text-center" style={{ color: '#6b21a8' }}>
                        {Math.min(...testResults.map(r => r.score))} - {Math.max(...testResults.map(r => r.score))}
                      </p>
                    </div>

                    <div 
                      className="rounded-lg p-2 sm:p-4 border"
                      style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', borderColor: '#6ee7b7' }}
                    >
                      <p className="text-xs mb-1 sm:mb-2 text-center" style={{ color: '#047857' }}>Тренд</p>
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {testResults[testResults.length - 1].score < testResults[0].score ? (
                          <>
                            <TrendingDown size={18} className="sm:w-6 sm:h-6" style={{ color: '#047857' }} />
                            <span className="text-sm sm:text-lg font-bold" style={{ color: '#065f46' }}>Улучшение</span>
                          </>
                        ) : testResults[testResults.length - 1].score > testResults[0].score ? (
                          <>
                            <TrendingUp size={18} className="sm:w-6 sm:h-6" style={{ color: '#b91c1c' }} />
                            <span className="text-sm sm:text-lg font-bold" style={{ color: '#7f1d1d' }}>Ухудшение</span>
                          </>
                        ) : (
                          <span className="text-sm sm:text-lg font-bold text-gray-900">Стабильно</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score Dynamics Chart */}
                  <div className="mb-6">
                    <h4 className="text-gray-900 mb-4">Динамика общего балла</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart 
                        data={testResults.map((result, index) => ({
                          name: `Тест ${index + 1}`,
                          date: new Date(result.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                          score: result.score
                        }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00B33C" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00B33C" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '8px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#00B33C" 
                          strokeWidth={2}
                          fill="url(#colorScore)" 
                          name="Балл"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed Metrics Chart */}
                  <div>
                    <h4 className="text-gray-900 mb-4">Детальные показатели</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart 
                        data={testResults.map((result, index) => ({
                          name: `Тест ${index + 1}`,
                          date: new Date(result.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                          emotionalExhaustion: result.emotionalExhaustion,
                          depersonalization: result.depersonalization,
                          personalAccomplishment: result.personalAccomplishment
                        }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '8px'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="emotionalExhaustion" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          name="Эмоц. истощение"
                          dot={{ fill: '#ef4444', r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="depersonalization" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          name="Деперсонализация"
                          dot={{ fill: '#f59e0b', r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="personalAccomplishment" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          name="Редукция достижений"
                          dot={{ fill: '#8b5cf6', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            )}

            {/* Test History */}
            {testResults.length > 1 && (
              <Card className="mb-6">
                <Accordion>
                  <AccordionTab 
                    header={
                      <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-gray-600" />
                        <span className="text-gray-900">История тестов</span>
                        <span className="text-sm text-gray-500">({testResults.length})</span>
                      </div>
                    }
                  >
                    <div className="space-y-3">
                      {testResults.slice().reverse().map((result, index) => {
                        const actualIndex = testResults.length - 1 - index;
                        const prevResult = actualIndex > 0 ? testResults[actualIndex - 1] : null;
                        const scoreDiff = prevResult ? result.score - prevResult.score : 0;
                        
                        return (
                          <div 
                            key={result.date}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-start sm:items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                                  <p className="text-gray-900 font-medium text-sm sm:text-base">
                                    {new Date(result.date).toLocaleDateString('ru-RU', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </p>
                                  {index === 0 && (
                                    <span 
                                      className="text-xs px-2 py-1 rounded inline-block self-start"
                                      style={{ backgroundColor: '#e5f3ff', color: '#00B33C' }}
                                    >
                                      Последний
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-600">Балл: {result.score}</span>
                                  {prevResult && scoreDiff !== 0 && (
                                    <span className={`flex items-center gap-1 ${
                                      scoreDiff > 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                      {scoreDiff > 0 ? (
                                        <TrendingUp size={14} />
                                      ) : (
                                        <TrendingDown size={14} />
                                      )}
                                      {Math.abs(scoreDiff)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div 
                                className="px-3 py-1 rounded text-sm font-medium flex-shrink-0"
                                style={{
                                  backgroundColor: result.level === 'Высокий' ? '#fee2e2' :
                                                  result.level === 'Средний' ? '#fef3c7' : '#d1fae5',
                                  color: result.level === 'Высокий' ? '#991b1b' :
                                        result.level === 'Средний' ? '#92400e' : '#065f46'
                                }}
                              >
                                {result.level}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionTab>
                </Accordion>
              </Card>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <div className="p-4 sm:p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={20} style={{ color: '#8b5cf6' }} />
                        <h3 className="text-gray-900 text-lg sm:text-xl">Рекомендации и их выполнение</h3>
                      </div>
                      <div className="text-sm text-gray-600">
                        {completedCount} из {recommendations.length}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <ProgressBar 
                        value={completionPercentage} 
                        className="h-2"
                        color="#8b5cf6"
                        showValue={false}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Выполнено {completionPercentage}% рекомендаций
                    </p>
                  </div>

                  <div className="space-y-3">
                    {recommendations.map((rec) => (
                      <div 
                        key={rec.id}
                        className={`border rounded-lg p-4 ${
                          rec.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {rec.completed ? (
                              <CheckCircle2 size={20} className="text-green-600" />
                            ) : (
                              <Circle size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p 
                              className="mb-1 font-medium"
                              style={{
                                color: rec.completed ? '#166534' : '#111827',
                                textDecoration: rec.completed ? 'line-through' : 'none'
                              }}
                            >
                              {rec.title}
                            </p>
                            <p 
                              className="text-sm"
                              style={{
                                color: rec.completed ? '#15803d' : '#4b5563',
                                textDecoration: rec.completed ? 'line-through' : 'none'
                              }}
                            >
                              {rec.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {recommendations.length === 0 && (
              <Card>
                <div className="p-8 text-center bg-gray-50">
                  <AlertCircle size={32} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Рекомендации пока не назначены</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Сотрудник еще не получал персонализированные рекомендации
                  </p>
                </div>
              </Card>
            )}
          </>
        )}

        {!latestResult && (
          <Card>
            <div className="p-8 text-center bg-gray-50">
              <p className="text-gray-600 text-lg">Данные по тестам отсутствуют</p>
              <p className="text-sm text-gray-500 mt-1">
                Сотрудник еще не проходил тестирование
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

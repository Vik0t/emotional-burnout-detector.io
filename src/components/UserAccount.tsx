import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Checkbox } from 'primereact/checkbox';
import { Accordion, AccordionTab } from 'primereact/accordion';
import cdekLogo from '../assets/cdek-logo.svg';
import { apiService } from '../services/api';
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Circle,
  FileText,
  MessageSquare,
  BarChart3,
  Clock,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export interface TestResult {
  date: string;
  totalScore: number;
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

interface UserAccountProps {
  employeeId: string;
  onLogout: () => void;
  onStartTest: () => void;
  onOpenChat: () => void;
  onViewTestResult: (result: TestResult) => void;
  onViewBadges: () => void;
}

export function UserAccount({ employeeId, onLogout, onStartTest, onOpenChat, onViewTestResult, onViewBadges }: UserAccountProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [timeUntilNextTest, setTimeUntilNextTest] = useState('');
  const [canTakeTest, setCanTakeTest] = useState(true);

  const latestResult = testResults.length > 0 ? testResults[testResults.length - 1] : null;

  // Проверка, можно ли пройти тест (прошла ли неделя)
  useEffect(() => {
    if (latestResult) {
      const checkTestAvailability = () => {
        const lastTestDate = new Date(latestResult.date);
        const now = new Date();
        const weekInMs = 7 * 24 * 60 * 60 * 1000;
        const timeSinceLastTest = now.getTime() - lastTestDate.getTime();
        const timeRemaining = weekInMs - timeSinceLastTest;

        if (timeRemaining > 0) {
          setCanTakeTest(false);
          
          const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
          const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
          
          if (days > 0) {
            setTimeUntilNextTest(`${days} дн. ${hours} ч.`);
          } else if (hours > 0) {
            setTimeUntilNextTest(`${hours} ч. ${minutes} мин.`);
          } else {
            setTimeUntilNextTest(`${minutes} мин.`);
          }
        } else {
          setCanTakeTest(true);
          setTimeUntilNextTest('');
        }
      };

      checkTestAvailability();
      const interval = setInterval(checkTestAvailability, 60000);
      
      return () => clearInterval(interval);
    }
  }, [latestResult]);

  // Загрузка данных при монтировании
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const history = await apiService.getTestHistory(employeeId);
        setTestResults(history || []);

        const savedRecommendations = localStorage.getItem(`recommendations_${employeeId}`);
        if (savedRecommendations) {
          setRecommendations(JSON.parse(savedRecommendations));
        } else if (history && history.length > 0) {
          const latest = history[history.length - 1];
          const defaultRecommendations = getRecommendationsByScore(latest);
          setRecommendations(defaultRecommendations);
          localStorage.setItem(`recommendations_${employeeId}`, JSON.stringify(defaultRecommendations));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [employeeId]);

  const toggleRecommendation = (id: string) => {
    const updated = recommendations.map(rec => 
      rec.id === id ? { ...rec, completed: !rec.completed } : rec
    );
    setRecommendations(updated);
    localStorage.setItem(`recommendations_${employeeId}`, JSON.stringify(updated));
  };

  const completedCount = recommendations.filter(r => r.completed).length;
  const completionPercentage = recommendations.length > 0 
    ? Math.round((completedCount / recommendations.length) * 100) 
    : 0;

  const getRiskLevel = (result: TestResult) => {
    if (result.emotionalExhaustion > 15 || result.depersonalization > 10) {
      return { level: 'Высокий', color: '#DB4C3F', bgColor: '#FEE2E2' };
    } else if (result.emotionalExhaustion > 10 || result.depersonalization > 6) {
      return { level: 'Средний', color: '#FFA100', bgColor: '#FEF3C7' };
    } else {
      return { level: 'Низкий', color: '#00B33C', bgColor: '#D1FAE5' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={cdekLogo} alt="CDEK" className="h-6" />
              <div>
                <h1 className="text-gray-900 text-xl">Личный кабинет</h1>
                <p className="text-sm text-gray-500">Мониторинг состояния</p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              label="ВЫХОД"
              outlined
              size="small"
              className="text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-gray-900 text-xl sm:text-2xl mb-2">Добро пожаловать!</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Отслеживайте своё состояние и следуйте рекомендациям для поддержания здоровья
          </p>
        </div>

        {/* No Test Yet */}
        {!latestResult && (
          <Card className="mb-6">
            <div className="text-center p-6 sm:p-8">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#E5F3FF' }}
              >
                <FileText size={32} style={{ color: '#00B33C' }} />
              </div>
              <h3 className="text-gray-900 text-lg sm:text-xl mb-2">Пройдите первый тест</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
                Диагностика займет всего 5 минут и поможет определить ваш уровень профессионального выгорания
              </p>
              <Button 
                onClick={onStartTest}
                label="НАЧАТЬ ТЕСТ"
                className="p-button-success"
                style={{ 
                  backgroundColor: '#00B33C',
                  borderColor: '#00B33C'
                }}
              >
                <FileText size={18} className="mr-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Latest Result */}
        {latestResult && (
          <>
            {/* Current Status Card */}
            <Card className="mb-6">
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-gray-900 text-lg sm:text-xl mb-1">Текущий статус</h3>
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
                      backgroundColor: getRiskLevel(latestResult).bgColor,
                      color: getRiskLevel(latestResult).color
                    }}
                  >
                    {getRiskLevel(latestResult).level}
                  </div>
                </div>

                {/* Test Cooldown Warning */}
                {!canTakeTest && (
                  <div className="mb-6 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Clock size={18} style={{ color: '#2563EB' }} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm mb-1" style={{ color: '#1E40AF' }}>
                          <strong>Следующий тест через:</strong> {timeUntilNextTest}
                        </p>
                        <p className="text-xs" style={{ color: '#1D4ED8' }}>
                          Рекомендуется проходить тест не чаще раза в неделю
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <Button 
                    onClick={() => onViewTestResult(latestResult)}
                    className="p-button-success w-full"
                    style={{ 
                      backgroundColor: '#00B33C',
                      borderColor: '#00B33C',
                      padding: '0.5rem 0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '3rem'
                    }}
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2" style={{ fontSize: '0.7rem' }}>
                      <FileText size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline text-sm">ПОСМОТРЕТЬ ДАШБОРД</span>
                      <span className="sm:hidden">ДАШБОРД</span>
                    </div>
                  </Button>
                  <Button 
                    onClick={onStartTest}
                    outlined
                    disabled={!canTakeTest}
                    className="w-full"
                    style={{ 
                      padding: '0.5rem 0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '3rem'
                    }}
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2" style={{ fontSize: '0.7rem' }}>
                      <span className="hidden sm:inline text-sm">ПРОЙТИ ТЕСТ ЗАНОВО</span>
                      <span className="sm:hidden text-center">ПРОЙТИ<br/>ЗАНОВО</span>
                    </div>
                  </Button>
                  <Button 
                    onClick={onOpenChat}
                    className="w-full"
                    style={{ 
                      backgroundColor: '#8B5CF6',
                      borderColor: '#8B5CF6',
                      padding: '0.5rem 0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '3rem'
                    }}
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2" style={{ fontSize: '0.7rem' }}>
                      <MessageSquare size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline text-sm">ЧАТ С AI</span>
                      <span className="sm:hidden">ЧАТ С AI</span>
                    </div>
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Badges Button */}
            <Card className="mb-6">
              <div className="p-4 sm:p-6">
                <Button
                  onClick={onViewBadges}
                  className="w-full"
                  style={{
                    backgroundColor: '#8B5CF6',
                    borderColor: '#8B5CF6',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Award size={20} />
                    <span>ПОСМОТРЕТЬ ВАШИ ЗНАЧКИ</span>
                  </div>
                </Button>
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
                        {(testResults.reduce((sum, r) => sum + r.totalScore, 0) / testResults.length).toFixed(1)}
                      </p>
                    </div>

                    <div 
                      className="rounded-lg p-2 sm:p-4 border"
                      style={{ background: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)', borderColor: '#c084fc' }}
                    >
                      <p className="text-xs mb-1 sm:mb-2 text-center" style={{ color: '#7c3aed' }}>Диапазон</p>
                      <p className="text-lg sm:text-2xl font-bold text-center" style={{ color: '#6b21a8' }}>
                        {Math.min(...testResults.map(r => r.totalScore))} - {Math.max(...testResults.map(r => r.totalScore))}
                      </p>
                    </div>

                    <div 
                      className="rounded-lg p-2 sm:p-4 border"
                      style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', borderColor: '#6ee7b7' }}
                    >
                      <p className="text-xs mb-1 sm:mb-2 text-center" style={{ color: '#047857' }}>Тренд</p>
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {testResults[testResults.length - 1].totalScore < testResults[0].totalScore ? (
                          <>
                            <TrendingDown size={18} className="sm:w-6 sm:h-6" style={{ color: '#047857' }} />
                            <span className="text-sm sm:text-lg font-bold" style={{ color: '#065f46' }}>Улучшение</span>
                          </>
                        ) : testResults[testResults.length - 1].totalScore > testResults[0].totalScore ? (
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
                          score: result.totalScore
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
                        const scoreDiff = prevResult ? result.totalScore - prevResult.totalScore : 0;
                        const risk = getRiskLevel(result);
                        
                        return (
                          <div 
                            key={result.date}
                            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-start sm:items-center justify-between mb-3 gap-2">
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
                                      style={{ 
                                        backgroundColor: '#E5F3FF',
                                        color: '#00B33C'
                                      }}
                                    >
                                      Последний
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-600">Балл: {result.totalScore}</span>
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
                                  backgroundColor: risk.bgColor,
                                  color: risk.color
                                }}
                              >
                                {risk.level}
                              </div>
                            </div>
                            <Button
                              onClick={() => onViewTestResult(result)}
                              label="ПОСМОТРЕТЬ ДАШБОРД"
                              outlined
                              size="small"
                              className="w-full"
                            />
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
              <Card className="mb-6">
                <div className="p-4 sm:p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={20} style={{ color: '#8B5CF6' }} />
                        <h3 className="text-gray-900 text-lg sm:text-xl">Рекомендации</h3>
                      </div>
                      <div className="text-sm text-gray-600">
                        {completedCount} из {recommendations.length}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <ProgressBar 
                        value={completionPercentage} 
                        className="h-2"
                        color="#8B5CF6"
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
                        className={`border rounded-lg p-4 transition-all ${
                          rec.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            inputId={rec.id}
                            checked={rec.completed}
                            onChange={() => toggleRecommendation(rec.id)}
                            className="mt-1"
                          />
                          <label htmlFor={rec.id} className="flex-1 cursor-pointer">
                            <div className="flex items-start gap-2 mb-1">
                              {rec.completed ? (
                                <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                              ) : (
                                <Circle size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                              )}
                              <p 
                                className="font-medium"
                                style={{
                                  color: rec.completed ? '#166534' : '#111827',
                                  textDecoration: rec.completed ? 'line-through' : 'none'
                                }}
                              >
                                {rec.title}
                              </p>
                            </div>
                            <p 
                              className="text-sm ml-6"
                              style={{
                                color: rec.completed ? '#15803d' : '#4b5563',
                                textDecoration: rec.completed ? 'line-through' : 'none'
                              }}
                            >
                              {rec.description}
                            </p>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function getRecommendationsByScore(result: TestResult): Recommendation[] {
  const { emotionalExhaustion, depersonalization } = result;
  const isHighRisk = emotionalExhaustion > 15 || depersonalization > 10;
  const isMediumRisk = emotionalExhaustion > 10 || depersonalization > 6;

  if (isHighRisk) {
    return [
      { id: 'rec-1', title: 'Обратитесь к специалисту по психическому здоровью', description: 'Профессиональная поддержка поможет справиться с симптомами выгорания', completed: false },
      { id: 'rec-2', title: 'Обсудите нагрузку с руководителем', description: 'Рассмотрите возможность перераспределения задач или временного снижения нагрузки', completed: false },
      { id: 'rec-3', title: 'Установите четкие границы между работой и личной жизнью', description: 'Не берите работу домой, отключайте уведомления после рабочего дня', completed: false },
      { id: 'rec-4', title: 'Возьмите отпуск или несколько выходных дней', description: 'Полноценный отдых необходим для восстановления', completed: false },
      { id: 'rec-5', title: 'Практикуйте техники релаксации ежедневно', description: 'Медитация, дыхательные упражнения или йога по 15-20 минут в день', completed: false }
    ];
  } else if (isMediumRisk) {
    return [
      { id: 'rec-1', title: 'Пересмотрите свой рабочий график', description: 'Убедитесь, что у вас есть регулярные перерывы и время на отдых', completed: false },
      { id: 'rec-2', title: 'Делегируйте задачи, где это возможно', description: 'Не пытайтесь делать всё самостоятельно', completed: false },
      { id: 'rec-3', title: 'Занимайтесь физической активностью 3-4 раза в неделю', description: 'Спорт помогает снизить стресс и улучшить настроение', completed: false },
      { id: 'rec-4', title: 'Наладьте режим сна', description: 'Старайтесь спать не менее 7-8 часов каждую ночь', completed: false },
      { id: 'rec-5', title: 'Общайтесь с коллегами и близкими', description: 'Социальная поддержка важна для эмоционального здоровья', completed: false },
      { id: 'rec-6', title: 'Найдите хобби вне работы', description: 'Занятие, которое приносит вам удовольствие и помогает переключиться', completed: false }
    ];
  } else {
    return [
      { id: 'rec-1', title: 'Продолжайте поддерживать work-life balance', description: 'Баланс между работой и личной жизнью - залог долгосрочного благополучия', completed: false },
      { id: 'rec-2', title: 'Регулярно делайте перерывы в течение дня', description: 'Короткие 5-10 минутные перерывы каждые 1-2 часа', completed: false },
      { id: 'rec-3', title: 'Ставьте реалистичные цели', description: 'Избегайте перфекционизма и чрезмерных ожиданий от себя', completed: false },
      { id: 'rec-4', title: 'Отмечайте свои достижения', description: 'Записывайте успехи, даже небольшие, чтобы поддерживать мотивацию', completed: false },
      { id: 'rec-5', title: 'Поддерживайте здоровые привычки', description: 'Правильное питание, физическая активность, достаточный сон', completed: false }
    ];
  }
}

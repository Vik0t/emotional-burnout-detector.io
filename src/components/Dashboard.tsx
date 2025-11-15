import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import cdekLogo from '../assets/cdek-logo.svg';
import { TestResults } from './BurnoutTest';
import { apiService } from '../services/api';
import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Brain,
  Heart,
  Award,
  Calendar,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardProps {
  testResults: TestResults;
  employeeId: string;
  onBackToChat: () => void;
  onRetakeTest: () => void;
  onLogout: () => void;
  onBackToAccount?: () => void;
}

export function Dashboard({ testResults, employeeId, onBackToChat, onRetakeTest, onLogout, onBackToAccount }: DashboardProps) {
  const [latestTestResults, setLatestTestResults] = useState(testResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestTestResults = async () => {
      try {
        setLoading(true);
        const results = await apiService.getLatestTestResults(employeeId);
        if (results) {
          setLatestTestResults(results);
        }
      } catch (err) {
        console.error('Failed to fetch latest test results:', err);
        setError('Failed to load latest test results');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTestResults();
  }, [employeeId]);

  const { emotionalExhaustion, depersonalization, personalAccomplishment } = latestTestResults || testResults;

  // Определяем уровень риска
  const getRiskLevel = () => {
    if (emotionalExhaustion > 15 || depersonalization > 10) {
      return { level: 'Высокий', color: '#DB4C3F', bgColor: '#FEE2E2', icon: AlertCircle };
    } else if (emotionalExhaustion > 10 || depersonalization > 6) {
      return { level: 'Средний', color: '#FFA100', bgColor: '#FEF3C7', icon: AlertCircle };
    } else {
      return { level: 'Низкий', color: '#00B33C', bgColor: '#D1FAE5', icon: CheckCircle };
    }
  };

  const risk = getRiskLevel();
  const RiskIcon = risk.icon;

  // Данные для графиков
  const barData = [
    {
      name: 'Эмоц. истощение',
      score: emotionalExhaustion,
      max: 30,
      percentage: (emotionalExhaustion / 30) * 100,
    },
    {
      name: 'Деперсонализация',
      score: depersonalization,
      max: 24,
      percentage: (depersonalization / 24) * 100,
    },
    {
      name: 'Личные достижения',
      score: personalAccomplishment,
      max: 30,
      percentage: (personalAccomplishment / 30) * 100,
    },
  ];

  const pieData = [
    { name: 'Эмоциональное истощение', value: emotionalExhaustion },
    { name: 'Деперсонализация', value: depersonalization },
    { name: 'Личные достижения', value: personalAccomplishment },
  ];

  const COLORS = ['#DB4C3F', '#FFA100', '#00B33C'];

  // Рекомендации
  const getRecommendations = () => {
    const recommendations = [];

    if (emotionalExhaustion > 15) {
      recommendations.push({
        title: 'Высокое эмоциональное истощение',
        icon: Brain,
        color: '#DB4C3F',
        actions: [
          'Обратитесь к HR для обсуждения рабочей нагрузки',
          'Практикуйте техники релаксации ежедневно',
          'Рассмотрите консультацию с психологом',
        ],
      });
    } else if (emotionalExhaustion > 10) {
      recommendations.push({
        title: 'Признаки эмоциональной усталости',
        icon: Brain,
        color: '#FFA100',
        actions: [
          'Делайте регулярные перерывы (каждые 90 минут)',
          'Установите границы рабочего времени',
          'Практикуйте техники дыхания',
        ],
      });
    }

    if (depersonalization > 10) {
      recommendations.push({
        title: 'Высокий уровень деперсонализации',
        icon: Heart,
        color: '#DB4C3F',
        actions: [
          'Восстановите социальные связи с коллегами',
          'Практикуйте эмпатию и активное слушание',
          'Участвуйте в командных мероприятиях',
        ],
      });
    }

    if (personalAccomplishment < 15) {
      recommendations.push({
        title: 'Низкая самооценка достижений',
        icon: Award,
        color: '#FFA100',
        actions: [
          'Ведите журнал успехов и достижений',
          'Запрашивайте обратную связь от руководителя',
          'Отмечайте даже небольшие победы',
        ],
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Отличные показатели!',
        icon: CheckCircle,
        color: '#00B33C',
        actions: [
          'Продолжайте поддерживать work-life баланс',
          'Делитесь опытом с коллегами',
          'Регулярно проходите тест для мониторинга',
        ],
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={cdekLogo} alt="CDEK" className="h-5 sm:h-6" />
              <div>
                <h1 className="text-gray-900 text-base sm:text-xl">Личный кабинет</h1>
                <p className="text-xs sm:text-sm text-gray-500">Результаты диагностики</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              {onBackToAccount && (
                <Button 
                  onClick={onBackToAccount} 
                  label="Назад в кабинет"
                  outlined
                  size="small"
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                />
              )}
              <Button 
                onClick={onRetakeTest} 
                label="Пройти тест заново"
                outlined
                size="small"
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              />
              <Button 
                onClick={onLogout} 
                label="ВЫХОД"
                outlined
                size="small"
                className="text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Risk Level Card */}
        <Card className="p-4 sm:p-6 md:p-8 mb-4 sm:mb-6" style={{ backgroundColor: risk.bgColor, borderColor: risk.color }}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-8">
            {/* Icon at top on mobile */}
            <div 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center flex-shrink-0 sm:order-2"
              style={{ backgroundColor: `${risk.color}15` }}
            >
              <AlertCircle size={48} className="sm:w-16 sm:h-16" style={{ color: risk.color }} />
            </div>
            <div className="flex-1 w-full text-center sm:text-left sm:order-1">
              <h3 className="text-gray-900 mb-2 sm:mb-3 text-lg sm:text-xl">Уровень выгорания</h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className="text-5xl sm:text-6xl text-gray-900">
                  {Math.round((testResults.totalScore / 84) * 100)}%
                </span>
                <span className="text-lg sm:text-xl text-gray-600">{risk.level} риск</span>
              </div>
              <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                Обратите внимание на признаки стресса. Рекомендуем поговорить с AI-помощником.
              </p>
              <Button
                onClick={onBackToChat}
                severity="success"
                className="w-full sm:w-auto text-xs sm:text-base"
                style={{ 
                  height: '48px',
                  paddingLeft: '24px', 
                  paddingRight: '24px'
                }}
              >
                ПОЛУЧИТЬ ПЕРСОНАЛЬНЫЕ РЕКОМЕНДАЦИИ
              </Button>
            </div>
          </div>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <Card className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 mb-1">Эмоциональное истощение</p>
                <h3 className="text-gray-900">{emotionalExhaustion} / 30</h3>
              </div>
              <Brain style={{ color: '#DB4C3F' }} size={24} />
            </div>
            <ProgressBar 
              value={(emotionalExhaustion / 30) * 100} 
              showValue={false}
              className="h-2"
              color="#DB4C3F"
            />
            <p className="text-sm text-gray-500 mt-2">
              {emotionalExhaustion > 15 ? 'Высокий' : emotionalExhaustion > 10 ? 'Средний' : 'Низкий'} уровень
            </p>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 mb-1">Деперсонализация</p>
                <h3 className="text-gray-900">{depersonalization} / 24</h3>
              </div>
              <Heart style={{ color: '#FFA100' }} size={24} />
            </div>
            <ProgressBar 
              value={(depersonalization / 24) * 100} 
              showValue={false}
              className="h-2"
              color="#FFA100"
            />
            <p className="text-sm text-gray-500 mt-2">
              {depersonalization > 10 ? 'Высокий' : depersonalization > 6 ? 'Средний' : 'Низкий'} уровень
            </p>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 mb-1">Личные достижения</p>
                <h3 className="text-gray-900">{personalAccomplishment} / 30</h3>
              </div>
              <Award className="text-[#00B33C]" size={24} />
            </div>
            <ProgressBar 
              value={(personalAccomplishment / 30) * 100} 
              showValue={false}
              className="h-2"
              color="#00B33C"
            />
            <p className="text-sm text-gray-500 mt-2">
              {personalAccomplishment < 15 ? 'Низкий' : personalAccomplishment < 22 ? 'Средний' : 'Высокий'} уровень
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Детальный анализ по категориям</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  interval={0}
                  style={{ fontSize: '12px' }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#00B33C" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Распределение показателей</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={(entry) => entry.value}
                  outerRadius={70}
                  fill="#00B33C"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="mb-12">
          <h2 className="text-gray-900 mb-4">Персональные рекомендации</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${rec.color}20` }}
                    >
                      <Icon size={24} style={{ color: rec.color }} />
                    </div>
                    <h3 className="text-gray-900 mt-2">{rec.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {rec.actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <ArrowRight size={16} className="mt-1 flex-shrink-0" style={{ color: rec.color }} />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8"></div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 border-purple-200" style={{ background: 'linear-gradient(to bottom right, #faf5ff, #ffffff)' }}>
            <Calendar className="text-purple-600 mb-2" size={28} />
            <h3 className="text-gray-900 mb-1.5">Следующий тест</h3>
            <p className="text-gray-700 mb-2">
              Рекомендуем проходить тест каждые 2 недели для отслеживания динамики
            </p>
            <p className="text-sm text-purple-700">
              Следующий тест: {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}
            </p>
          </Card>

          <Card className="p-5 border-blue-200" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #ffffff)' }}>
            <TrendingDown className="text-blue-600 mb-2" size={28} />
            <h3 className="text-gray-900 mb-1.5">Эффект для бизнеса</h3>
            <p className="text-gray-700 mb-1.5">Снижение выгорания на 30% ведёт к:</p>
            <ul className="text-sm text-gray-600 space-y-0.5">
              <li>• +25% продуктивности</li>
              <li>• -40% текучки кадров</li>
              <li>• +35% удовлетворённости</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
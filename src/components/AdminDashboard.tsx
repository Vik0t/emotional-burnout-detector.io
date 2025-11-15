import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { apiService } from '../services/api';
import cdekLogo from '../assets/cdek-logo.svg';
import { ComputedStylesDebug } from './ui/ComputedStylesDebug';
import {
  Users,
  TrendingUp,
  AlertTriangle, 
  Shield,
  BarChart3,
  Activity,
  Download,
  Filter,
  Building2,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Target,
  Zap,
  List
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface AdminDashboardProps {
  onLogout: () => void;
  onShowEmployeeList: () => void;
}

// Define COLORS constant
const COLORS = ['#00B33C', '#FFA100', '#DB4C3F'];

export function AdminDashboard({ onLogout, onShowEmployeeList }: AdminDashboardProps) {
  const devNoBackend = (import.meta as any).env?.VITE_NO_BACKEND === 'true';
  // State for dashboard data
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [testedEmployees, setTestedEmployees] = useState(0);
  const [testCoverage, setTestCoverage] = useState(0);
  const [riskDistribution, setRiskDistribution] = useState([
    { level: 'Низкий', count: 0, percentage: 0, color: '#00B33C' },
    { level: 'Средний', count: 0, percentage: 0, color: '#FFA100' },
    { level: 'Высокий', count: 0, percentage: 0, color: '#DB4C3F' },
  ]);
  const [pieData, setPieData] = useState([
    { name: 'Низкий риск', value: 0 },
    { name: 'Средний риск', value: 0 },
    { name: 'Высокий риск', value: 0 },
  ]);
  const [departmentData, setDepartmentData] = useState([
    { name: 'Логистика', avgScore: 0, riskLevel: 'Низкий', employees: 0, atRisk: 0 },
    { name: 'Курьеры', avgScore: 0, riskLevel: 'Низкий', employees: 0, atRisk: 0 },
    { name: 'Клиент. сервис', avgScore: 0, riskLevel: 'Низкий', employees: 0, atRisk: 0 },
    { name: 'IT', avgScore: 0, riskLevel: 'Низкий', employees: 0, atRisk: 0 },
    { name: 'Управление', avgScore: 0, riskLevel: 'Низкий', employees: 0, atRisk: 0 },
  ]);
  const [trendData, setTrendData] = useState([
    { month: 'Май', avgScore: 0, atRisk: 0 },
    { month: 'Июнь', avgScore: 0, atRisk: 0 },
    { month: 'Июль', avgScore: 0, atRisk: 0 },
    { month: 'Авг', avgScore: 0, atRisk: 0 },
    { month: 'Сен', avgScore: 0, atRisk: 0 },
    { month: 'Окт', avgScore: 0, atRisk: 0 },
  ]);
  const [radarData, setRadarData] = useState([
    { metric: 'Эмоц. истощение', value: 0, fullMark: 100 },
    { metric: 'Деперсонализация', value: 0, fullMark: 100 },
    { metric: 'Личные достиж.', value: 0, fullMark: 100 },
    { metric: 'Рабочая нагрузка', value: 0, fullMark: 100 },
    { metric: 'Work-life баланс', value: 0, fullMark: 100 },
  ]);
  const [businessMetrics, setBusinessMetrics] = useState([
    {
      title: 'Прогнозируемая текучесть',
      value: '0%',
      trend: 0,
      description: '',
      icon: Users,
      color: '#00B33C'
    },
    {
      title: 'Потенциальная экономия',
      value: '₽0М',
      trend: 0,
      description: '',
      icon: Target,
      color: '#00B33C'
    },
    {
      title: 'Индекс продуктивности',
      value: '0/100',
      trend: 0,
      description: '',
      icon: Zap,
      color: '#FFA100'
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch HR statistics
        const stats = await apiService.getHRStatistics();
        setTotalEmployees(stats.total_employees);
        setTestedEmployees(stats.recent_tests);
        setTestCoverage(Math.round((stats.recent_tests / stats.total_employees) * 100));
        
        // Update risk distribution
        const newRiskDistribution = [
          { level: 'Низкий', count: stats.low_risk_count, percentage: Math.round((stats.low_risk_count / stats.total_employees) * 100), color: '#00B33C' },
          { level: 'Средний', count: stats.medium_risk_count, percentage: Math.round((stats.medium_risk_count / stats.total_employees) * 100), color: '#FFA100' },
          { level: 'Высокий', count: stats.high_risk_count, percentage: Math.round((stats.high_risk_count / stats.total_employees) * 100), color: '#DB4C3F' },
        ];
        setRiskDistribution(newRiskDistribution);
        
        // Update pie data
        setPieData([
          { name: 'Низкий риск', value: stats.low_risk_count },
          { name: 'Средний риск', value: stats.medium_risk_count },
          { name: 'Высокий риск', value: stats.high_risk_count },
        ]);
        
        // Fetch employee stats for department data
        const employeeStats = await apiService.getEmployeeStats();
        
        // Group by department (mocked for now)
        const newDepartmentData = [
          { name: 'Логистика', avgScore: 45, riskLevel: 'Средний', employees: 89, atRisk: 28 },
          { name: 'Курьеры', avgScore: 62, riskLevel: 'Высокий', employees: 156, atRisk: 52 },
          { name: 'Клиент. сервис', avgScore: 51, riskLevel: 'Средний', employees: 67, atRisk: 21 },
          { name: 'IT', avgScore: 38, riskLevel: 'Низкий', employees: 45, atRisk: 8 },
          { name: 'Управление', avgScore: 42, riskLevel: 'Средний', employees: 34, atRisk: 12 },
        ];
        setDepartmentData(newDepartmentData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={cdekLogo} alt="CDEK" className="h-5 sm:h-6" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-gray-900 text-base sm:text-xl">Панель администратора</h1>
                  <Badge 
                    value="HR" 
                    severity="info"
                    className="text-xs sm:text-sm"
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Агрегированная аналитика выгорания</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                onClick={onShowEmployeeList}
                label="СПИСОК СОТРУДНИКОВ"
                severity="success"
                icon="pi pi-list"
                size="small"
                className="flex-1 sm:flex-none"
              />
              <Button 
                onClick={onLogout}
                label="ВЫХОД"
                outlined
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {devNoBackend && (
          <ComputedStylesDebug selectors={[ '.p-button', '.p-card', '.p-inputtext', '.p-badge', '.p-avatar' ]} />
        )}
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-blue-200" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #ffffff)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-gray-600 mb-1">Всего сотрудников</p>
                <h2 className="text-gray-900">{totalEmployees}</h2>
              </div>
              <Users style={{ color: '#1F8CEB' }} size={28} />
            </div>
            <p className="text-sm text-gray-600">
              Протестировано: {testedEmployees} ({testCoverage}%)
            </p>
          </Card>

          <Card className="p-4 border-red-200" style={{ background: 'linear-gradient(to bottom right, #fee2e2, #ffffff)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-gray-600 mb-1">Группа риска</p>
                <h2 className="text-gray-900">{riskDistribution[2].count}</h2>
              </div>
              <AlertTriangle style={{ color: '#DB4C3F' }} size={28} />
            </div>
            <p className="text-sm text-gray-600">
              {riskDistribution[2].percentage}% от протестированных
            </p>
          </Card>

          <Card className="p-4 border-green-200" style={{ background: 'linear-gradient(to bottom right, #dcfce7, #ffffff)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-gray-600 mb-1">Низкий риск</p>
                <h2 className="text-gray-900">{riskDistribution[0].count}</h2>
              </div>
              <CheckCircle2 style={{ color: '#45B24E' }} size={28} />
            </div>
            <p className="text-sm text-gray-600">
              {riskDistribution[0].percentage}% от протестированных
            </p>
          </Card>

          <Card className="p-4 border-purple-200" style={{ background: 'linear-gradient(to bottom right, #faf5ff, #ffffff)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-gray-600 mb-1">Средний балл</p>
                <h2 className="text-gray-900">47/100</h2>
              </div>
              <Activity style={{ color: '#9757D7' }} size={28} />
            </div>
            <p className="text-sm" style={{ color: '#45B24E' }}>↓ -3% за месяц</p>
          </Card>
        </div>

        {/* Business Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {businessMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-gray-600 mb-1">{metric.title}</p>
                    <h2 className="text-gray-900">{metric.value}</h2>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${metric.color}20` }}
                  >
                    <Icon size={20} style={{ color: metric.color }} />
                  </div>
                </div>
                <p className="text-sm" style={{ color: metric.trend > 0 ? '#45B24E' : '#DB4C3F' }}>
                  {metric.trend > 0 ? '↑' : '↓'} {metric.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Department Analysis */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Анализ по департаментам</h3>
              <Building2 size={20} className="text-gray-500" />
            </div>
            <div className="space-y-3 mb-4">
              {departmentData.map((dept, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{dept.name}</span>
                      <Badge 
                        value={dept.riskLevel}
                        severity={
                          dept.riskLevel === 'Высокий' ? 'danger' :
                          dept.riskLevel === 'Средний' ? 'warning' :
                          'success'
                        }
                      />
                    </div>
                    <span className="text-sm text-gray-600">{dept.employees} чел.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${dept.avgScore}%`,
                          backgroundColor: 
                            dept.riskLevel === 'Высокий' ? '#DB4C3F' :
                            dept.riskLevel === 'Средний' ? '#FFA100' :
                            '#00B33C'
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[80px]">
                      {dept.atRisk} в группе риска
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Risk Distribution Pie */}
          <Card className="p-4">
            <h3 className="text-gray-900 mb-4">Распределение по уровням риска</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#00B33C"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {riskDistribution.map((risk, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">{risk.level}</div>
                  <div className="text-gray-900 mt-1">{risk.count}</div>
                  <div className="text-xs text-gray-500">{risk.percentage}%</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trend Chart */}
          <Card className="p-4">
            <h3 className="text-gray-900 mb-4">Динамика выгорания</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#00B33C" 
                  strokeWidth={2}
                  name="Средний балл"
                />
                <Line 
                  type="monotone" 
                  dataKey="atRisk" 
                  stroke="#DB4C3F" 
                  strokeWidth={2}
                  name="% в группе риска"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Radar Chart */}
          <Card className="p-4">
            <h3 className="text-gray-900 mb-4">Профиль компании</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" style={{ fontSize: '12px' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar 
                  name="Показатели" 
                  dataKey="value" 
                  stroke="#00B33C" 
                  fill="#00B33C" 
                  fillOpacity={0.3} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="p-4 mb-6 border-purple-200" style={{ background: 'linear-gradient(to bottom right, #faf5ff, #ffffff)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#9757D7' }}>
              <AlertCircle className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 mb-2">Приоритетные действия</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Высокий приоритет</p>
                  <p className="text-gray-900 mb-2">Департамент курьеров</p>
                  <p className="text-sm text-gray-700">52 сотрудника в группе риска. Рекомендуется пересмотр графика и нагрузки.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Средний приоритет</p>
                  <p className="text-gray-900 mb-2">Клиентский сервис</p>
                  <p className="text-sm text-gray-700">21 сотрудник. Усилить поддержку, организовать тренинги по стресс-менеджменту.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Лучшие практики</p>
                  <p className="text-gray-900 mb-2">IT департамент</p>
                  <p className="text-sm text-gray-700">Низкий уровень выгорания. Изучить успешные практики для масштабирования.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy Notice */}
        <Card className="p-4 border-blue-200" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #ffffff)' }}>
          <div className="flex items-start gap-3">
            <Shield style={{ color: '#1F8CEB' }} className="flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-700">
                <strong>Конфиденциальность:</strong> Все данные агрегированы и анонимизированы. 
                Индивидуальные результаты сотрудников недоступны администраторам и защищены в соответствии с политикой конфиденциальности СДЭК.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { apiService } from '../services/api';
import {
  ArrowLeft,
  Search,
  Download,
  Shield,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface EmployeeListProps {
  onBack: () => void;
}

export function EmployeeList({ onBack }: EmployeeListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        const stats = await apiService.getEmployeeStats();
        
        // Transform API data to match existing structure
        const transformedData = stats.map((employee: any) => ({
          id: employee.employee_id,
          department: 'Курьеры', // This would come from a department mapping in a real app
          riskLevel: getRiskLevel(employee.last_score),
          score: employee.last_score || 0,
          lastTest: employee.last_test_date ? formatDate(employee.last_test_date) : 'Нет данных',
          status: employee.is_admin ? 'Админ' : 'Активен'
        }));
        
        setEmployeeList(transformedData);
      } catch (err) {
        console.error('Failed to fetch employee data:', err);
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const getRiskLevel = (score: number) => {
    if (score > 60) return 'Высокий';
    if (score > 40) return 'Средний';
    return 'Низкий';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Нет данных';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Фильтрация списка сотрудников
  const filteredEmployees = employeeList.filter(emp => {
    const matchesSearch = emp.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'all' || emp.riskLevel === filterRisk;
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    return matchesSearch && matchesRisk && matchesDepartment;
  });

  // Сортировка списка сотрудников
  const sortedEmployees = filteredEmployees.sort((a, b) => {
    if (sortBy === 'id') {
      return sortDirection === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    } else if (sortBy === 'department') {
      return sortDirection === 'asc' ? a.department.localeCompare(b.department) : b.department.localeCompare(a.department);
    } else if (sortBy === 'riskLevel') {
      return sortDirection === 'asc' ? a.riskLevel.localeCompare(b.riskLevel) : b.riskLevel.localeCompare(a.riskLevel);
    } else if (sortBy === 'score') {
      return sortDirection === 'asc' ? a.score - b.score : b.score - a.score;
    } else if (sortBy === 'lastTest') {
      return sortDirection === 'asc' ? a.lastTest.localeCompare(b.lastTest) : b.lastTest.localeCompare(a.lastTest);
    } else if (sortBy === 'status') {
      return sortDirection === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                onClick={onBack} 
                variant="outline" 
                className="gap-1 sm:gap-2 h-9 sm:h-10"
                size="sm"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">НАЗАД</span>
              </Button>
              <div className="bg-[#00B33C] text-white px-2 sm:px-3 py-1 rounded text-sm sm:text-base">
                CDEK
              </div>
              <div>
                <h1 className="text-gray-900 text-base sm:text-xl">Список сотрудников</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Просмотр данных по сотрудникам</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2 h-9 sm:h-10 self-end sm:self-auto" size="sm">
              <Download size={16} />
              <span className="hidden sm:inline">ЭКСПОРТ</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="p-4 md:p-6 mb-6">
          <div className="space-y-4">
            {/* Search and Sort Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Sort */}
              <div className="w-full md:w-64">
                <label className="text-sm text-gray-600 mb-2 block">Сортировка</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">ID сотрудника</SelectItem>
                    <SelectItem value="department">Департамент</SelectItem>
                    <SelectItem value="riskLevel">Уровень риска</SelectItem>
                    <SelectItem value="score">Балл выгорания</SelectItem>
                    <SelectItem value="lastTest">Последний тест</SelectItem>
                    <SelectItem value="status">Статус</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Direction */}
              <div className="w-full md:w-auto">
                <label className="text-sm text-gray-600 mb-2 block">Направление</label>
                <Button
                  variant="outline"
                  className="h-12 px-4 w-full md:w-auto"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDirection === 'asc' ? (
                    <>
                      <ArrowUp size={20} className="mr-2" />
                      По возрастанию
                    </>
                  ) : (
                    <>
                      <ArrowDown size={20} className="mr-2" />
                      По убыванию
                    </>
                  )}
                </Button>
              </div>

              {/* Search */}
              <div className="flex-1 w-full">
                <label className="text-sm text-gray-600 mb-2 block">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Поиск по ID или департаменту"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Risk Filter */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Уровень риска</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterRisk === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterRisk('all')}
                  className={`flex-1 min-w-[60px] px-2 sm:px-4 text-xs sm:text-sm ${filterRisk === 'all' ? 'bg-[#00B33C] hover:bg-[#009933]' : ''}`}
                  size="sm"
                >
                  ВСЕ
                </Button>
                <Button
                  variant={filterRisk === 'Высокий' ? 'default' : 'outline'}
                  onClick={() => setFilterRisk('Высокий')}
                  className={`flex-1 min-w-[60px] px-2 sm:px-4 text-xs sm:text-sm ${filterRisk === 'Высокий' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  size="sm"
                >
                  ВЫСОКИЙ
                </Button>
                <Button
                  variant={filterRisk === 'Средний' ? 'default' : 'outline'}
                  onClick={() => setFilterRisk('Средний')}
                  className={`flex-1 min-w-[60px] px-2 sm:px-4 text-xs sm:text-sm ${filterRisk === 'Средний' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                  size="sm"
                >
                  СРЕДНИЙ
                </Button>
                <Button
                  variant={filterRisk === 'Низкий' ? 'default' : 'outline'}
                  onClick={() => setFilterRisk('Низкий')}
                  className={`flex-1 min-w-[60px] px-2 sm:px-4 text-xs sm:text-sm ${filterRisk === 'Низкий' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  size="sm"
                >
                  НИЗКИЙ
                </Button>
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Департамент</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterDepartment === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterDepartment('all')}
                  className={`px-2 sm:px-4 text-xs sm:text-sm ${filterDepartment === 'all' ? 'bg-[#00B33C] hover:bg-[#009933]' : ''}`}
                  size="sm"
                >
                  ВСЕ
                </Button>
                <Button
                  variant={filterDepartment === 'Курьеры' ? 'default' : 'outline'}
                  onClick={() => setFilterDepartment('Курьеры')}
                  size="sm"
                  className="px-2 sm:px-4 text-xs sm:text-sm"
                >
                  КУРЬЕРЫ
                </Button>
                <Button
                  variant={filterDepartment === 'IT' ? 'default' : 'outline'}
                  onClick={() => setFilterDepartment('IT')}
                  size="sm"
                  className="px-2 sm:px-4 text-xs sm:text-sm"
                >
                  IT
                </Button>
                <Button
                  variant={filterDepartment === 'Логистика' ? 'default' : 'outline'}
                  onClick={() => setFilterDepartment('Логистика')}
                  size="sm"
                  className="px-2 sm:px-4 text-xs sm:text-sm"
                >
                  ЛОГИСТИКА
                </Button>
                <Button
                  variant={filterDepartment === 'Клиент. сервис' ? 'default' : 'outline'}
                  onClick={() => setFilterDepartment('Клиент. сервис')}
                  size="sm"
                  className="px-2 sm:px-4 text-xs sm:text-sm"
                >
                  КЛИЕНТ. СЕРВИС
                </Button>
                <Button
                  variant={filterDepartment === 'Управление' ? 'default' : 'outline'}
                  onClick={() => setFilterDepartment('Управление')}
                  size="sm"
                  className="px-2 sm:px-4 text-xs sm:text-sm"
                >
                  УПРАВЛЕНИЕ
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Всего сотрудников</p>
            <h3 className="text-gray-900">{employeeList.length}</h3>
          </Card>
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-sm text-gray-600 mb-1">Высокий риск</p>
            <h3 className="text-gray-900">
              {employeeList.filter(e => e.riskLevel === 'Высокий').length}
            </h3>
          </Card>
          <Card className="p-4 bg-orange-50 border-orange-200">
            <p className="text-sm text-gray-600 mb-1">Средний риск</p>
            <h3 className="text-gray-900">
              {employeeList.filter(e => e.riskLevel === 'Средний').length}
            </h3>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-sm text-gray-600 mb-1">Низкий риск</p>
            <h3 className="text-gray-900">
              {employeeList.filter(e => e.riskLevel === 'Низкий').length}
            </h3>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">ID сотрудника</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Департамент</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Уровень риска</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Балл выгорания</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Последний тест</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {sortedEmployees.map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{employee.department}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={
                          employee.riskLevel === 'Высокий' ? 'bg-red-100 text-red-700' :
                          employee.riskLevel === 'Средний' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }
                      >
                        {employee.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span>{employee.score}/100</span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${employee.score}%`,
                              backgroundColor: 
                                employee.riskLevel === 'Высокий' ? '#EF4444' :
                                employee.riskLevel === 'Средний' ? '#F59E0B' :
                                '#00B33C'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{employee.lastTest}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {employee.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredEmployees.length === 0 && (
            <div className="p-12 text-center bg-white">
              <p className="text-gray-500">Сотрудники не найдены</p>
              <p className="text-sm text-gray-400 mt-2">Попробуйте изменить параметры поиска</p>
            </div>
          )}
          
          {loading && (
            <div className="p-12 text-center bg-white">
              <p className="text-gray-500">Загрузка данных...</p>
            </div>
          )}
          
          {error && (
            <div className="p-12 text-center bg-white">
              <p className="text-red-500">{error}</p>
              <p className="text-sm text-gray-400 mt-2">Не удалось загрузить данные сотрудников</p>
            </div>
          )}
          
          {filteredEmployees.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <p className="text-sm text-gray-600">
                Показано: {filteredEmployees.length} из {employeeList.length} сотрудников
              </p>
            </div>
          )}
        </Card>

        {/* Privacy Notice */}
        <Card className="p-4 bg-blue-50 border-blue-200 mt-6">
          <div className="flex items-start gap-3">
            <Shield className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-700">
                <strong>Конфиденциальность:</strong> Данные отображаются только в агрегированном виде. 
                Персональная информация и детали тестирования недоступны без соответствующих прав доступа.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
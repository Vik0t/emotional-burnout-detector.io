import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { apiService } from '../services/api';
import cdekLogo from '../assets/cdek-logo.svg';
import { ComputedStylesDebug } from './ui/ComputedStylesDebug';
import { Shield } from 'lucide-react';

interface EmployeeListProps {
  onBack: () => void;
  onViewEmployee: (employeeId: string, department: string) => void;
}

interface Employee {
  id: string;
  department: string;
  riskLevel: string;
  score: number;
  lastTest: string;
  status: string;
}

export function EmployeeList({ onBack, onViewEmployee }: EmployeeListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const devNoBackend = (import.meta as any).env?.VITE_NO_BACKEND === 'true';

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
    const matchesRisk = filterRisk === 'all' || emp.riskLevel === filterRisk;
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    return matchesRisk && matchesDepartment;
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
                icon="pi pi-arrow-left"
                label="НАЗАД"
                outlined
                size="small"
                className="gap-1 sm:gap-2"
              />
              <img src={cdekLogo} alt="CDEK" className="h-5 sm:h-6" />
              <div>
                <h1 className="text-gray-900 text-base sm:text-xl">Список сотрудников</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Просмотр данных по сотрудникам</p>
              </div>
            </div>
            <Button 
              icon="pi pi-download" 
              label="ЭКСПОРТ"
              outlined
              size="small"
              className="self-end sm:self-auto"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {devNoBackend && (
          <div className="mb-6 p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            Dev mode: backend is disabled — showing mock employees.
          </div>
        )}
        {devNoBackend && (
          <ComputedStylesDebug selectors={[
            '.p-button',
            '.p-inputtext',
            '.p-card',
            '.p-badge',
            '.p-datatable'
          ]} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-blue-200" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #ffffff)' }}>
            <p className="text-sm text-gray-600 mb-1">Всего сотрудников</p>
            <h3 className="text-gray-900">{employeeList.length}</h3>
          </Card>
          <Card className="p-4 border-red-200" style={{ background: 'linear-gradient(to bottom right, #fee2e2, #ffffff)' }}>
            <p className="text-sm text-gray-600 mb-1">Высокий риск</p>
            <h3 className="text-gray-900">
              {employeeList.filter(e => e.riskLevel === 'Высокий').length}
            </h3>
          </Card>
          <Card className="p-4 border-orange-200" style={{ background: 'linear-gradient(to bottom right, #ffedd5, #ffffff)' }}>
            <p className="text-sm text-gray-600 mb-1">Средний риск</p>
            <h3 className="text-gray-900">
              {employeeList.filter(e => e.riskLevel === 'Средний').length}
            </h3>
          </Card>
          <Card className="p-4 border-green-200" style={{ background: 'linear-gradient(to bottom right, #dcfce7, #ffffff)' }}>
            <p className="text-sm text-gray-600 mb-1">Низкий риск</p>
            <h3 className="text-gray-900">
              {employeeList.filter(e => e.riskLevel === 'Низкий').length}
            </h3>
          </Card>
        </div>

        {/* Table with integrated filters */}
        <DataTable 
          value={filteredEmployees}
          paginator 
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          stripedRows
          showGridlines
          emptyMessage="Сотрудники не найдены"
          loading={loading}
          globalFilter={searchQuery}
          sortMode="multiple"
          removableSort
          onRowClick={(e) => onViewEmployee(e.data.id, e.data.department)}
          className="bg-white rounded-lg shadow border border-gray-200 cursor-pointer"
          header={
              <div className="flex flex-col md:flex-row gap-4 p-4">
                <IconField iconPosition="left" className="w-full md:flex-1">
                  <InputIcon className="pi pi-search" />
                  <InputText
                    placeholder="Поиск по ID или департаменту"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </IconField>
                <Dropdown
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.value)}
                  options={[
                    { label: 'Все уровни риска', value: 'all' },
                    { label: 'Высокий', value: 'Высокий' },
                    { label: 'Средний', value: 'Средний' },
                    { label: 'Низкий', value: 'Низкий' }
                  ]}
                  placeholder="Фильтр по риску"
                  className="w-full md:w-52"
                />
                <Dropdown
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.value)}
                  options={[
                    { label: 'Все департаменты', value: 'all' },
                    { label: 'Курьеры', value: 'Курьеры' },
                    { label: 'IT', value: 'IT' },
                    { label: 'Логистика', value: 'Логистика' },
                    { label: 'Клиент. сервис', value: 'Клиент. сервис' },
                    { label: 'Управление', value: 'Управление' }
                  ]}
                  placeholder="Фильтр по отделу"
                  className="w-full md:w-52"
                />
              </div>
            }
          >
            <Column field="id" header="ID сотрудника" sortable />
            <Column field="department" header="Департамент" sortable />
            <Column 
              field="riskLevel" 
              header="Уровень риска" 
              sortable
              body={(rowData) => (
                <Badge
                  value={rowData.riskLevel}
                  severity={
                    rowData.riskLevel === 'Высокий' ? 'danger' :
                    rowData.riskLevel === 'Средний' ? 'warning' :
                    'success'
                  }
                />
              )}
            />
            <Column 
              field="score" 
              header="Балл выгорания" 
              sortable
              body={(rowData) => `${rowData.score}/100`}
            />
            <Column field="lastTest" header="Последний тест" sortable />
            <Column 
              field="status" 
              header="Статус"
              body={(rowData) => (
                <Badge value={rowData.status} severity="info" />
              )}
            />
          </DataTable>

        {/* Privacy Notice */}
        <Card className="p-4 border-blue-200 mt-6" style={{ background: 'linear-gradient(to bottom right, #dbeafe, #ffffff)' }}>
          <div className="flex items-start gap-3">
            <Shield style={{ color: '#1F8CEB' }} className="flex-shrink-0" size={20} />
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
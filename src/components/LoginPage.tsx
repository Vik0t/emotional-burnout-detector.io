import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { User } from 'lucide-react';

interface LoginPageProps {
  onLogin: (employeeId: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [employeeId, setEmployeeId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeId.trim()) {
      onLogin(employeeId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2">
            <div className="bg-[#00B33C] text-white px-3 py-1 rounded">
              CDEK
            </div>
            <span className="text-gray-600">Забота о сотрудниках</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header inside card */}
          <div className="text-center mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-gray-900 mb-3">Диагностика выгорания</h1>
            <p className="text-gray-600">
              Инструмент для анализа и профилактики профессионального выгорания
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="employeeId" className="block text-gray-700 mb-2">
                ID сотрудника
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={20} />
                </div>
                <Input
                  id="employeeId"
                  type="text"
                  placeholder="Введите ваш ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-300"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Ваш ID указан в личном кабинете сотрудника
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#00B33C] hover:bg-[#009933] text-white"
            >
              Войти
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Все данные конфиденциальны и используются исключительно для улучшения условий труда
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-purple-50 rounded-lg p-4 border border-purple-100">
          <h3 className="text-purple-900 mb-2">Что вас ждёт:</h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li className="flex items-start gap-2">
              <span className="text-[#00B33C] mt-1">✓</span>
              <span>Краткий тест на диагностику выгорания (5 минут)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00B33C] mt-1">✓</span>
              <span>Персональные рекомендации от AI-ассистента</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00B33C] mt-1">✓</span>
              <span>Дашборд с вашими метриками и прогрессом</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
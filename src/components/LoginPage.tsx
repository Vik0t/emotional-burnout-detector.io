import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { User, Lock } from 'lucide-react';
import { apiService } from '../services/api';

interface LoginPageProps {
  onLogin: (employeeId: string, isAdmin: boolean) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!login.trim()) {
      setError('Введите логин');
      return;
    }
    
    setLoading(true);
    
    try {
      const user = await apiService.login(login, password);
      onLogin(user.employeeId, user.isAdmin);
    } catch (err) {
      setError('Неверный логин или пароль');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
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
              <label htmlFor="login" className="block text-gray-700 mb-2">
                Логин
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={20} />
                </div>
                <Input
                  id="login"
                  type="text"
                  placeholder="Введите логин"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-300"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-300"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-[#00B33C] hover:bg-[#009933] text-white"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
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
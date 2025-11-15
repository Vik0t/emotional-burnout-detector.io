import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { apiService } from '../services/api';
import cdekLogo from '../assets/cdek-logo.svg';
import { ComputedStylesDebug } from './ui/ComputedStylesDebug';

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
    } catch (err: any) {
      setError(err.message || 'Неверный логин или пароль');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const devNoBackend = (import.meta as any).env?.VITE_NO_BACKEND === 'true';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3">
            <img src={cdekLogo} alt="CDEK" className="h-6" />
            <span className="text-gray-600">Забота о сотрудниках</span>
          </div>
        </div>

        {/* Login Form */}
        {devNoBackend && (
          <Message 
            severity="warn" 
            text="Dev mode: backend is disabled; you can login using IDs '1' (user) or '2' (admin) without password."
            className="mb-4"
          />
        )}
        <Card className="p-4">
          {/* Header inside card */}
          <div className="text-center mb-6 pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">Диагностика выгорания</h1>
            <p className="text-gray-600">
              Инструмент для анализа и профилактики профессионального выгорания
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="login" className="font-medium">
                Логин
              </label>
              <IconField iconPosition="left" className="w-full">
                <InputIcon className="pi pi-user" />
                <InputText
                  id="login"
                  type="text"
                  placeholder="Введите логин"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </IconField>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-medium">
                Пароль
              </label>
              <IconField iconPosition="left" className="w-full">
                <InputIcon className="pi pi-lock" />
                <InputText
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </IconField>
            </div>

            {error && (
              <Message severity="error" text={error} />
            )}

            <Button
              type="submit"
              label={loading ? 'Вход...' : 'Войти'}
              className="w-full"
              disabled={loading}
              loading={loading}
            />
          </form>

          {devNoBackend && (
            <ComputedStylesDebug selectors={[
              '.p-button',
              '.p-button .p-button-label',
              '.p-inputtext',
              '.p-card',
              '.p-avatar',
              '.p-badge'
            ]} />
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Все данные конфиденциальны и используются исключительно для улучшения условий труда
            </p>
          </div>
        </Card>

        {/* Info Section */}
        <Card className="mt-6 bg-purple-50 border-purple-100">
          <h3 className="mb-3 font-semibold" style={{ color: '#7254F3' }}>Что вас ждёт:</h3>
          <ul className="flex flex-col gap-2 text-sm" style={{ color: '#9757D7' }}>
            <li className="flex items-start gap-2">
              <i className="pi pi-check-circle text-[#00B33C] mt-1"></i>
              <span>Краткий тест на диагностику выгорания (5 минут)</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="pi pi-check-circle text-[#00B33C] mt-1"></i>
              <span>Персональные рекомендации от AI-ассистента</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="pi pi-check-circle text-[#00B33C] mt-1"></i>
              <span>Дашборд с вашими метриками и прогрессом</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
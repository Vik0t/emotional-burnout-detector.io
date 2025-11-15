import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { apiService, BadgeInfo } from '../services/api';
import { Award, Star, Flame, Target, TrendingUp, CheckCircle } from 'lucide-react';
import cdekLogo from '../assets/cdek-logo.svg';

interface BadgesProps {
  employeeId: string;
  onBack: () => void;
  onLogout: () => void;
}

// Define badge information
const badgeInfo: Record<string, BadgeInfo> = {
  'test_taker': {
    id: 'test_taker',
    name: 'Тестировщик',
    description: 'Пройдите первый тест на выгорание',
    icon: Award,
    color: '#8B5CF6'
  },
  'improvement_champion': {
    id: 'improvement_champion',
    name: 'Чемпион улучшений',
    description: 'Покажите улучшение в результатах теста',
    icon: TrendingUp,
    color: '#00B33C'
  },
  '7_day_streak': {
    id: '7_day_streak',
    name: 'Серия недели',
    description: 'Пройдите тест 7 дней подряд',
    icon: Flame,
    color: '#FFA100'
  },
  'low_burnout_champion': {
    id: 'low_burnout_champion',
    name: 'Чемпион низкого выгорания',
    description: 'Достигните низкого уровня выгорания',
    icon: Star,
    color: '#00B33C'
  }
};

interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  earned: boolean;
}

export function Badges({ employeeId, onBack, onLogout }: BadgesProps) {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const gamificationData = await apiService.getGamificationData(employeeId);
        setPoints(gamificationData.points);
        setStreak(gamificationData.streak);
        
        // Create list of all badges with earned status
        const badges = Object.values(badgeInfo).map(badge => ({
          ...badge,
          earned: gamificationData.badges.includes(badge.id)
        }));
        
        setUserBadges(badges);
      } catch (error) {
        console.error('Failed to fetch badges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
      </div>
    );
  }

  const earnedBadges = userBadges.filter(badge => badge.earned);
  const lockedBadges = userBadges.filter(badge => !badge.earned);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={cdekLogo} alt="CDEK" className="h-6" />
              <div>
                <h1 className="text-gray-900 text-xl">Ваши достижения</h1>
                <p className="text-sm text-gray-500">Собирайте значки и улучшайте свои результаты</p>
              </div>
            </div>
            <Button
              onClick={onBack}
              label="В ЛИЧНЫЙ КАБИНЕТ"
              outlined
              size="small"
              className="text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="text-yellow-500" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Ваши баллы</p>
                <p className="text-2xl font-bold text-gray-900">{points}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="text-orange-500" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Серия</p>
                <p className="text-2xl font-bold text-gray-900">{streak} дней</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-gray-900 text-xl mb-4">Полученные значки</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={badge.id}
                    className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${badge.color}20` }}
                      >
                        <Icon size={24} style={{ color: badge.color }} />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium">{badge.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle size={14} className="text-green-500" />
                          <span className="text-xs text-green-600">Получен</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <Card>
            <h2 className="text-gray-900 text-xl mb-4">Доступные значки</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={badge.id}
                    className="border rounded-lg p-4 bg-gray-50 opacity-75"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Icon size={24} className="text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium">{badge.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Target size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500">Не получен</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* How to Earn Badges */}
        <Card className="mt-6">
          <h2 className="text-gray-900 text-xl mb-4">Как получать значки</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Award className="text-blue-500 mt-0.5" size={20} />
              <div>
                <h3 className="text-gray-900 font-medium">Тестировщик</h3>
                <p className="text-sm text-gray-600">Просто пройдите первый тест на выгорание</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="text-green-500 mt-0.5" size={20} />
              <div>
                <h3 className="text-gray-900 font-medium">Чемпион улучшений</h3>
                <p className="text-sm text-gray-600">Покажите улучшение в результатах теста</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <Flame className="text-orange-500 mt-0.5" size={20} />
              <div>
                <h3 className="text-gray-900 font-medium">Серия недели</h3>
                <p className="text-sm text-gray-600">Пройдите тест 7 дней подряд</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <Star className="text-purple-500 mt-0.5" size={20} />
              <div>
                <h3 className="text-gray-900 font-medium">Чемпион низкого выгорания</h3>
                <p className="text-sm text-gray-600">Достигните низкого уровня выгорания</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <Button 
            onClick={onBack}
            label="Назад в личный кабинет"
            outlined
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
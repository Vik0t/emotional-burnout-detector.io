const API_BASE_URL = 'http://localhost:3002/api';

export interface TestResults {
  emotionalExhaustion: number;
  depersonalization: number;
  personalAccomplishment: number;
  totalScore: number;
  answers: number[];
}

export interface User {
  employeeId: string;
  isAdmin: boolean;
}

export interface ChatMessage {
  message: string;
  response: string;
  created_at: string;
}

export interface EmployeeStats {
  employee_id: string;
  is_admin: number;
  created_at: string;
  last_login: string;
  test_count: number;
  last_test_date: string;
  last_score: number;
  department?: string;
}

export interface GamificationData {
  points: number;
  streak: number;
  last_streak_date: string;
  badges: string[];
}

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

export interface LeaderboardEntry {
  employee_id: string;
  first_name: string;
  last_name: string;
  department: string;
  points: number;
  streak: number;
}

export interface RiskDistribution {
  high: number;
  medium: number;
  low: number;
}

export interface DepartmentStats {
  name: string;
  avg_score: number;
  at_risk: number;
  employees: number;
}

class ApiService {
  // User authentication
  async login(employeeId: string, password: string): Promise<User> {
    // If explicitly configured to use no backend (dev-only), return a mock user
    const noBackend = (import.meta as any).env?.VITE_NO_BACKEND === 'true';
    if (noBackend) {
      const isAdmin = employeeId === '2';
      return { employeeId, isAdmin };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to login');
      }

      const data = await response.json();
      return {
        employeeId: data.employeeId,
        isAdmin: data.isAdmin,
      };
    } catch (err) {
      // Network error — fallback for local dev: allow 1/2 without back-end
      if (employeeId === '1' || employeeId === '2') {
        return { employeeId, isAdmin: employeeId === '2' };
      }
      throw err;
    }
  }

  // Test results
  async saveTestResults(employeeId: string, results: TestResults): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/test-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId,
        emotionalExhaustion: results.emotionalExhaustion,
        depersonalization: results.depersonalization,
        personalAccomplishment: results.personalAccomplishment,
        totalScore: results.totalScore,
        answers: results.answers,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save test results');
    }
  }

  async getLatestTestResults(employeeId: string): Promise<TestResults> {
    const response = await fetch(`${API_BASE_URL}/test-results/${employeeId}/latest`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No test results found');
      }
      throw new Error('Failed to fetch test results');
    }

    const data = await response.json();
    return {
      emotionalExhaustion: data.emotional_exhaustion,
      depersonalization: data.depersonalization,
      personalAccomplishment: data.personal_accomplishment,
      totalScore: data.total_score,
      answers: data.answers,
    };
  }

  async getTestHistory(employeeId: string): Promise<Array<TestResults & { date: string }>> {
    const noBackend = (import.meta as any).env?.VITE_NO_BACKEND === 'true';
    
    // Mock data for development
    const mockHistory = [
      {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        emotionalExhaustion: 18,
        depersonalization: 12,
        personalAccomplishment: 22,
        totalScore: 52,
        answers: []
      },
      {
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        emotionalExhaustion: 15,
        depersonalization: 10,
        personalAccomplishment: 24,
        totalScore: 49,
        answers: []
      },
      {
        date: new Date().toISOString(), // today
        emotionalExhaustion: 12,
        depersonalization: 8,
        personalAccomplishment: 26,
        totalScore: 46,
        answers: []
      }
    ];

    if (noBackend) {
      return mockHistory;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/test-results/${employeeId}/history`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        // Fallback to mock on error
        return mockHistory;
      }

      const data = await response.json();
      return data.map((item: any) => ({
        date: item.created_at || item.date,
        emotionalExhaustion: item.emotional_exhaustion,
        depersonalization: item.depersonalization,
        personalAccomplishment: item.personal_accomplishment,
        totalScore: item.total_score,
        answers: item.answers || []
      }));
    } catch (err) {
      // Network error, return mock for local dev
      return mockHistory;
    }
  }

  // Chat messages
  async saveChatMessage(employeeId: string, message: string, response: string): Promise<void> {
    const responseObj = await fetch(`${API_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId, message, response }),
    });

    if (!responseObj.ok) {
      throw new Error('Failed to save chat message');
    }
  }

  async getChatHistory(employeeId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${API_BASE_URL}/chat-messages/${employeeId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }

    return await response.json();
  }

  async getChatbotResponse(employeeId: string, message: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/chatbot/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId, message }),
    });

    if (!response.ok) {
      throw new Error('Failed to get chatbot response');
    }

    const data = await response.json();
    return data.response;
  }

  // HR Dashboard
  async getEmployeeStats(): Promise<EmployeeStats[]> {
    const noBackend = (import.meta as any).env?.VITE_NO_BACKEND === 'true';
    // Mock data for dev when backend is disabled or fetch fails
    const mockEmployees: EmployeeStats[] = [
      {
        employee_id: '1',
        is_admin: 0,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        test_count: 2,
        last_test_date: new Date().toISOString(),
        last_score: 45,
      },
      {
        employee_id: '2',
        is_admin: 1,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        test_count: 10,
        last_test_date: new Date().toISOString(),
        last_score: 38,
      },
      {
        employee_id: '3',
        is_admin: 0,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        test_count: 1,
        last_test_date: new Date().toISOString(),
        last_score: 60,
      },
      {
        employee_id: '4',
        is_admin: 0,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        test_count: 0,
        last_test_date: '',
        last_score: 0,
      },
      {
        employee_id: '5',
        is_admin: 0,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        test_count: 5,
        last_test_date: new Date().toISOString(),
        last_score: 52,
      },
    ];

    if (noBackend) {
      return mockEmployees;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/hr/employees`);
      if (!response.ok) {
        // fallback to mock in dev
        return mockEmployees;
      }
      return await response.json();
    } catch (err) {
      // network error, return mock for local dev
      return mockEmployees;
    }
  }

  async getHRStatistics(): Promise<{total_employees: number, recent_tests: number, high_risk_count: number, medium_risk_count: number, low_risk_count: number}> {
    const noBackend = (import.meta as any).env?.VITE_NO_BACKEND === 'true';
    const mockStats = { total_employees: 5, recent_tests: 3, high_risk_count: 1, medium_risk_count: 2, low_risk_count: 2 };
    if (noBackend) return mockStats;
    try {
      const response = await fetch(`${API_BASE_URL}/hr/statistics`);
      if (!response.ok) {
        return mockStats;
      }
      return await response.json();
    } catch (err) {
      return mockStats;
    }
  }

  async getDepartmentStats(): Promise<DepartmentStats[]> {
    const noBackend = (import.meta as any).env?.VITE_NO_BACKEND === 'true';
    const mockDepartments: DepartmentStats[] = [
      { name: 'Курьеры', avg_score: 62, at_risk: 52, employees: 156 },
      { name: 'Логистика', avg_score: 45, at_risk: 28, employees: 89 },
      { name: 'IT', avg_score: 38, at_risk: 8, employees: 45 },
    ];
    if (noBackend) return mockDepartments;
    try {
      const response = await fetch(`${API_BASE_URL}/hr/departments`);
      if (!response.ok) {
        return mockDepartments;
      }
      return await response.json();
    } catch (err) {
      return mockDepartments;
    }
  }

  async getTrendData(): Promise<Array<{month: string, avgScore: number, atRisk: number}>> {
    const noBackend = (import.meta as any).env?.VITE_NO_BACKEND === 'true';
    const mockTrendData = [
      { month: 'Май', avgScore: 52, atRisk: 8 },
      { month: 'Июнь', avgScore: 48, atRisk: 12 },
      { month: 'Июль', avgScore: 45, atRisk: 15 },
      { month: 'Авг', avgScore: 47, atRisk: 14 },
      { month: 'Сен', avgScore: 49, atRisk: 10 },
      { month: 'Окт', avgScore: 46, atRisk: 12 },
    ];
    if (noBackend) return mockTrendData;
    try {
      const response = await fetch(`${API_BASE_URL}/hr/trend`);
      if (!response.ok) {
        return mockTrendData;
      }
      return await response.json();
    } catch (err) {
      return mockTrendData;
    }
  }

  async getCompanyProfileData(): Promise<Array<{metric: string, value: number, fullMark: number}>> {
    const noBackend = (import.meta as any).env?.VITE_NO_BACKEND === 'true';
    const mockRadarData = [
      { metric: 'Эмоц. истощение', value: 65, fullMark: 100 },
      { metric: 'Деперсонализация', value: 45, fullMark: 100 },
      { metric: 'Личные достиж.', value: 75, fullMark: 100 },
      { metric: 'Рабочая нагрузка', value: 55, fullMark: 100 },
      { metric: 'Work-life баланс', value: 60, fullMark: 100 },
    ];
    if (noBackend) return mockRadarData;
    try {
      const response = await fetch(`${API_BASE_URL}/hr/company-profile`);
      if (!response.ok) {
        return mockRadarData;
      }
      return await response.json();
    } catch (err) {
      return mockRadarData;
    }
  }

  async getGamificationData(employeeId: string): Promise<GamificationData> {
    const noBackend = (import.meta as any).env?.VITE_NO_BACKEND === 'true';
    const mockGamificationData: GamificationData = {
      points: 50,
      streak: 3,
      last_streak_date: new Date().toISOString().split('T')[0],
      badges: ['test_taker', 'improvement_champion']
    };
    
    if (noBackend) return mockGamificationData;
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${employeeId}/gamification`);
      if (!response.ok) {
        throw new Error('Failed to fetch gamification data');
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching gamification data:', err);
      return mockGamificationData;
    }
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const noBackend = (import.meta as any).env?.VITE_NO_BACKEND === 'true';
    const mockLeaderboard: LeaderboardEntry[] = [
      { employee_id: '1', first_name: 'Иван', last_name: 'Иванов', department: 'IT', points: 150, streak: 7 },
      { employee_id: '2', first_name: 'Петр', last_name: 'Петров', department: 'Логистика', points: 120, streak: 5 },
      { employee_id: '3', first_name: 'Мария', last_name: 'Сидорова', department: 'Курьеры', points: 100, streak: 3 },
      { employee_id: '4', first_name: 'Анна', last_name: 'Кузнецова', department: 'Клиент. сервис', points: 90, streak: 2 },
      { employee_id: '5', first_name: 'Алексей', last_name: 'Смирнов', department: 'IT', points: 85, streak: 4 }
    ];
    
    if (noBackend) return mockLeaderboard;
    
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      return mockLeaderboard;
    }
  }
}

export const apiService = new ApiService();
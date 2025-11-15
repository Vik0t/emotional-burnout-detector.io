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
  async login(employeeId: string, password: string = ''): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId, password }),
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }

    const data = await response.json();
    return {
      employeeId: data.employeeId,
      isAdmin: data.isAdmin,
    };
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
    const response = await fetch(`${API_BASE_URL}/test-results/${employeeId}`);

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
    const response = await fetch(`${API_BASE_URL}/hr/employees`);

    if (!response.ok) {
      throw new Error('Failed to fetch employee stats');
    }

    return await response.json();
  }

  async getHRStatistics(): Promise<{total_employees: number, recent_tests: number, high_risk_count: number, medium_risk_count: number, low_risk_count: number}> {
    const response = await fetch(`${API_BASE_URL}/hr/statistics`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch HR statistics');
    }
    
    return await response.json();
  }

  async getDepartmentStats(): Promise<DepartmentStats[]> {
    const response = await fetch(`${API_BASE_URL}/hr/departments`);

    if (!response.ok) {
      throw new Error('Failed to fetch department stats');
    }

    return await response.json();
  }

  async getDepartmentStats(): Promise<DepartmentStats[]> {
    const response = await fetch(`${API_BASE_URL}/hr/departments`);

    if (!response.ok) {
      throw new Error('Failed to fetch department stats');
    }

    return await response.json();
  }
}

export const apiService = new ApiService();
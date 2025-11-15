// api.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config();

const db = require('./db/connection');
const { initializeDatabase } = require('./db/init');
const { runMigrations } = require('./db/migrations');

// Репозитории
const {
  findOrCreateUser,
  getUserByEmployeeId,
  updateUserTestInfo,
  verifyUserPassword
} = require('./repositories/usersRepository');

const {
  saveTestResults,
  getLatestTestResults,
  getTestHistory
} = require('./repositories/testResultsRepository');

const {
  saveChatMessage,
  getChatHistory
} = require('./repositories/chatRepository');

const {
  getEmployeesWithStats,
  getRiskDistribution,
  getDepartmentsStats,
  getHrStats
} = require('./repositories/hrRepository');

// Сервис чат-бота
const { generateChatbotResponse } = require('./services/chatbotService.cjs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3002;

// ======== Middleware ========
app.use(cors());
app.use(bodyParser.json());

// ======== Swagger ========
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Burnout API',
      version: '1.0.0',
      description: 'API для сервиса оценки эмоционального выгорания'
    },
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            employee_id: { type: 'string', example: '123' },
            telegram_chat_id: { type: 'string', nullable: true, example: '123456789' },
            is_admin: { type: 'boolean', example: false },
            created_at: { type: 'string', format: 'date-time', example: '2025-01-01T12:00:00Z' },
            last_login: { type: 'string', format: 'date-time', nullable: true },
            department: { type: 'string', nullable: true, example: 'IT' },
            first_name: { type: 'string', nullable: true, example: 'Иван' },
            last_name: { type: 'string', nullable: true, example: 'Иванов' },
            email: { type: 'string', nullable: true, example: 'ivan@example.com' },
            last_test_date: { type: 'string', format: 'date-time', nullable: true },
            next_test_date: { type: 'string', format: 'date-time', nullable: true },
            notifications_enabled: { type: 'boolean', example: true }
          }
        },
        TestResult: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 10 },
            employee_id: { type: 'string', example: '123' },
            emotional_exhaustion: { type: 'integer', example: 20 },
            depersonalization: { type: 'integer', example: 10 },
            personal_accomplishment: { type: 'integer', example: 30 },
            total_score: { type: 'integer', example: 60 },
            answers: {
              type: 'array',
              items: { type: 'integer' },
              example: [3, 4, 2, 1, 5]
            },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        TestResultCreate: {
          type: 'object',
          required: [
            'employeeId',
            'emotionalExhaustion',
            'depersonalization',
            'personalAccomplishment',
            'totalScore',
            'answers'
          ],
          properties: {
            employeeId: { type: 'string', example: '123' },
            emotionalExhaustion: { type: 'integer', example: 20 },
            depersonalization: { type: 'integer', example: 10 },
            personalAccomplishment: { type: 'integer', example: 30 },
            totalScore: { type: 'integer', example: 60 },
            answers: {
              type: 'array',
              items: { type: 'integer' },
              example: [3, 4, 2, 1, 5]
            }
          }
        },
        ChatMessage: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 5 },
            employee_id: { type: 'string', example: '123' },
            message: { type: 'string', example: 'Мне тяжело работать в последнее время' },
            response: { type: 'string', example: 'Понимаю, давай разберёмся по шагам…' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        ChatRequest: {
          type: 'object',
          required: ['employeeId', 'message'],
          properties: {
            employeeId: { type: 'string', example: '123' },
            message: { type: 'string', example: 'Мне тяжело работать в последнее время' }
          }
        },
        ChatResponse: {
          type: 'object',
          properties: {
            response: { type: 'string', example: 'Понимаю, давай разберёмся по шагам…' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['employeeId'],
          properties: {
            employeeId: { type: 'string', example: '123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            employeeId: { type: 'string', example: '123' },
            isAdmin: { type: 'boolean', example: false }
          }
        }
      }
    }
  },
  apis: ['./api.js'] // этот файл
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ======== Эндпоинты ========

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Проверка работоспособности сервера
 *     tags:
 *       - Service
 *     responses:
 *       200:
 *         description: Сервер жив
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Логин пользователя (создаёт запись при первом входе)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Успешный логин
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Не передан employeeId
 *       500:
 *         description: Ошибка базы данных
 */
app.post('/api/login', (req, res) => {
  const { employeeId, password } = req.body;

  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  // First check if user exists and verify password
  verifyUserPassword(db, employeeId, password, (err, isValid) => {
    if (err) {
      console.error('Error verifying password:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!isValid) {
      // If password is invalid, check if user exists
      getUserByEmployeeId(db, employeeId, (getUserErr, user) => {
        if (getUserErr) {
          console.error('Error getting user:', getUserErr);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          // User doesn't exist, create new user with password
          findOrCreateUser(db, employeeId, password, (createErr, newUser, isNew) => {
            if (createErr) {
              console.error('Error creating user:', createErr);
              return res.status(500).json({ error: 'Database error' });
            }

            updateUserTestInfo(
              db,
              employeeId,
              { last_login: new Date().toISOString() },
              (updateErr) => {
                if (updateErr) {
                  console.error('Error updating last_login:', updateErr);
                }

                return res.json({
                  success: true,
                  employeeId,
                  isAdmin: newUser?.is_admin === 1 || employeeId === '2'
                });
              }
            );
          });
        } else if (!user.password_hash) {
          // User exists but doesn't have a password yet, set the provided password
          bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
              console.error('Error hashing password:', hashErr);
              return res.status(500).json({ error: 'Database error' });
            }

            db.run(
              'UPDATE users SET password_hash = ? WHERE employee_id = ?',
              [hashedPassword, employeeId],
              (updateErr) => {
                if (updateErr) {
                  console.error('Error updating password:', updateErr);
                  return res.status(500).json({ error: 'Database error' });
                }

                updateUserTestInfo(
                  db,
                  employeeId,
                  { last_login: new Date().toISOString() },
                  (updateErr) => {
                    if (updateErr) {
                      console.error('Error updating last_login:', updateErr);
                    }

                    return res.json({
                      success: true,
                      employeeId,
                      isAdmin: user?.is_admin === 1 || employeeId === '2'
                    });
                  }
                );
              }
            );
          });
        } else {
          // User exists but password is wrong
          return res.status(401).json({ error: 'Invalid password' });
        }
      });
    } else {
      // Password is valid, update last login
      getUserByEmployeeId(db, employeeId, (getUserErr, user) => {
        if (getUserErr) {
          console.error('Error getting user:', getUserErr);
          return res.status(500).json({ error: 'Database error' });
        }

        updateUserTestInfo(
          db,
          employeeId,
          { last_login: new Date().toISOString() },
          (updateErr) => {
            if (updateErr) {
              console.error('Error updating last_login:', updateErr);
            }

            return res.json({
              success: true,
              employeeId,
              isAdmin: user?.is_admin === 1 || employeeId === '2'
            });
          }
        );
      });
    }
  });
});

/**
 * @swagger
 * /api/users/{employeeId}:
 *   get:
 *     summary: Получить информацию о пользователе
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Табельный номер сотрудника
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка базы данных
 */
app.get('/api/users/:employeeId', (req, res) => {
  const { employeeId } = req.params;

  getUserByEmployeeId(db, employeeId, (err, user) => {
    if (err) {
      console.error('Error getUserByEmployeeId:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Можно скрыть чувствительные поля при необходимости
    res.json(user);
  });
});

/**
 * @swagger
 * /api/test-results:
 *   post:
 *     summary: Сохранить результаты теста выгорания
 *     tags:
 *       - Tests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestResultCreate'
 *     responses:
 *       200:
 *         description: Результаты сохранены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: integer
 *                   example: 10
 *       400:
 *         description: Не передан employeeId или данные теста
 *       500:
 *         description: Ошибка при сохранении
 */
app.post('/api/test-results', (req, res) => {
  const {
    employeeId,
    emotionalExhaustion,
    depersonalization,
    personalAccomplishment,
    totalScore,
    answers
  } = req.body;

  if (
    !employeeId ||
    emotionalExhaustion === undefined ||
    depersonalization === undefined ||
    personalAccomplishment === undefined ||
    totalScore === undefined ||
    !Array.isArray(answers)
  ) {
    return res.status(400).json({ error: 'Invalid test data' });
  }

  saveTestResults(
    db,
    {
      employeeId,
      emotionalExhaustion,
      depersonalization,
      personalAccomplishment,
      totalScore,
      answers
    },
    (err, id) => {
      if (err) {
        console.error('Error saveTestResults:', err);
        return res.status(500).json({ error: 'Failed to save test results' });
      }

      // Обновляем у пользователя дату последнего теста
      updateUserTestInfo(
        db,
        employeeId,
        { last_test_date: new Date().toISOString() },
        (updateErr) => {
          if (updateErr) {
            console.error('Error updating last_test_date:', updateErr);
          }

          res.json({ success: true, id });
        }
      );
    }
  );
});

/**
 * @swagger
 * /api/test-results/{employeeId}/latest:
 *   get:
 *     summary: Получить последний результат теста сотрудника
 *     tags:
 *       - Tests
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Последний результат теста
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestResult'
 *       404:
 *         description: Для сотрудника нет результатов
 *       500:
 *         description: Ошибка базы данных
 */
app.get('/api/test-results/:employeeId/latest', (req, res) => {
  const { employeeId } = req.params;

  getLatestTestResults(db, employeeId, (err, result) => {
    if (err) {
      console.error('Error getLatestTestResults:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!result) {
      return res.status(404).json({ error: 'No test results found for employee' });
    }

    try {
      result.answers = JSON.parse(result.answers);
    } catch {
      result.answers = [];
    }

    res.json(result);
  });
});

/**
 * @swagger
 * /api/test-results/{employeeId}/history:
 *   get:
 *     summary: Получить историю результатов тестов сотрудника
 *     tags:
 *       - Tests
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: История результатов тестов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TestResult'
 *       500:
 *         description: Ошибка базы данных
 */
app.get('/api/test-results/:employeeId/history', (req, res) => {
  const { employeeId } = req.params;

  getTestHistory(db, employeeId, (err, rows) => {
    if (err) {
      console.error('Error getTestHistory:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const mapped = rows.map((r) => {
      let answers = [];
      try {
        answers = JSON.parse(r.answers);
      } catch {
        answers = [];
      }
      return { ...r, answers };
    });

    res.json(mapped);
  });
});

/**
 * @swagger
 * /api/chatbot/response:
 *   post:
 *     summary: Получить ответ чат-бота с учётом последнего теста
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: Ответ чат-бота
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       404:
 *         description: Нет результатов теста для сотрудника
 *       500:
 *         description: Ошибка базы данных
 */
app.post('/api/chatbot/response', async (req, res) => {
  const { employeeId, message } = req.body;

  if (!employeeId || !message) {
    return res.status(400).json({ error: 'employeeId and message are required' });
  }

  getLatestTestResults(db, employeeId, async (err, testResult) => {
    if (err) {
      console.error('Error getLatestTestResults for chatbot:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!testResult) {
      return res.status(404).json({ error: 'No test results found for employee' });
    }

    try {
      testResult.answers = JSON.parse(testResult.answers);
    } catch {
      testResult.answers = [];
    }

    try {
      const responseText = await generateChatbotResponse(testResult, message);

      saveChatMessage(db, employeeId, message, responseText, (saveErr) => {
        if (saveErr) {
          console.error('Error saveChatMessage:', saveErr);
          return res.status(500).json({ error: 'Failed to save chat message' });
        }

        res.json({ response: responseText });
      });
    } catch (error) {
      console.error('Error generating chatbot response:', error);
      return res.status(500).json({ error: 'Failed to generate response' });
    }
  });
});

/**
 * @swagger
 * /api/chat-messages/{employeeId}:
 *   get:
 *     summary: Получить историю сообщений сотрудника в чате
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список сообщений
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessage'
 *       500:
 *         description: Ошибка базы данных
 */
app.get('/api/chat-messages/:employeeId', (req, res) => {
  const { employeeId } = req.params;

  getChatHistory(db, employeeId, (err, rows) => {
    if (err) {
      console.error('Error getChatHistory:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(rows);
  });
});

/**
 * @swagger
 * /api/hr/employees:
 *   get:
 *     summary: Список сотрудников с базовой статистикой по тестам
 *     tags:
 *       - HR
 *     responses:
 *       200:
 *         description: Список сотрудников
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   employee_id:
 *                     type: string
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   is_admin:
 *                     type: boolean
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   last_login:
 *                     type: string
 *                     format: date-time
 *                   test_count:
 *                     type: integer
 *                   last_test_date:
 *                     type: string
 *                     format: date-time
 *                   last_score:
 *                     type: integer
 *       500:
 *         description: Ошибка базы данных
 */
app.get('/api/hr/employees', (req, res) => {
  getEmployeesWithStats(db, (err, rows) => {
    if (err) {
      console.error('Error getEmployeesWithStats:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/hr/risk-distribution:
 *   get:
 *     summary: Распределение сотрудников по уровням риска выгорания
 *     tags:
 *       - HR
 *     responses:
 *       200:
 *         description: Распределение по категориям риска
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   risk_level:
 *                     type: string
 *                     example: "high"
 *                   count:
 *                     type: integer
 *                     example: 12
 *       500:
 *         description: Ошибка базы данных
 */
app.get('/api/hr/risk-distribution', (req, res) => {
  getRiskDistribution(db, (err, rows) => {
    if (err) {
      console.error('Error getRiskDistribution:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/hr/departments:
 *   get:
 *     summary: Статистика по отделам
 *     tags:
 *       - HR
 *     responses:
 *       200:
 *         description: Сводка по отделам
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   department:
 *                     type: string
 *                     example: "IT"
 *                   employees_count:
 *                     type: integer
 *                     example: 25
 *                   average_score:
 *                     type: number
 *                     format: float
 *                     example: 48.5
 *       500:
 *         description: Ошибка базы данных
 */
app.get('/api/hr/departments', (req, res) => {
  getDepartmentsStats(db, (err, rows) => {
    if (err) {
      console.error('Error getDepartmentsStats:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/hr/statistics:
 *   get:
 *     summary: Общая HR-статистика по выгоранию
 *     tags:
 *       - HR
 *     responses:
 *       200:
 *         description: Аггрегированная статистика
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employees_total:
 *                   type: integer
 *                 tests_total:
 *                   type: integer
 *                 high_risk_percent:
 *                   type: number
 *                   format: float
 *                 medium_risk_percent:
 *                   type: number
 *                   format: float
 *                 low_risk_percent:
 *                   type: number
 *                   format: float
 *       500:
 *         description: Ошибка базы данных
 */
app.get('/api/hr/statistics', (req, res) => {
  getHrStats(db, (err, stats) => {
    if (err) {
      console.error('Error getHrStats:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(stats);
  });
});

/**
 * @swagger
 * /api/hr/trend:
 *   get:
 *     summary: Получить данные для графика динамики выгорания по месяцам
 *     tags:
 *       - HR
 *     responses:
 *       200:
 *         description: Данные для графика трендов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   month:
 *                     type: string
 *                     example: "Янв 2025"
 *                   avgScore:
 *                     type: number
 *                     format: float
 *                     example: 45.5
 *                   atRisk:
 *                     type: integer
 *                     example: 12
 *       500:
 *         description: Ошибка базы данных
 */
app.get('/api/hr/trend', (req, res) => {
  db.all(`
    SELECT
      strftime('%Y-%m', created_at) as month,
      AVG(total_score) as avg_score,
      COUNT(CASE WHEN total_score > 50 THEN 1 END) as at_risk_count,
      COUNT(*) as total_tests
    FROM test_results
    GROUP BY strftime('%Y-%m', created_at)
    ORDER BY month
  `, [], (err, rows) => {
    if (err) {
      console.error('Error getting trend data:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const trendData = rows.map(row => ({
      month: formatMonth(row.month),
      avgScore: Math.round(row.avg_score * 10) / 10,
      atRisk: row.at_risk_count
    }));
    
    res.json(trendData);
  });
});

/**
 * @swagger
 * /api/hr/company-profile:
 *   get:
 *     summary: Получить данные для радар-чарта профиля компании
 *     tags:
 *       - HR
 *     responses:
 *       200:
 *         description: Данные для радар-чарта
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   metric:
 *                     type: string
 *                     example: "Эмоц. истощение"
 *                   value:
 *                     type: number
 *                     format: float
 *                     example: 75
 *                   fullMark:
 *                     type: integer
 *                     example: 100
 *       500:
 *         description: Ошибка базы данных
 */
app.get('/api/hr/company-profile', (req, res) => {
  db.get(`
    SELECT
      AVG(emotional_exhaustion) as avg_emotional_exhaustion,
      AVG(depersonalization) as avg_depersonalization,
      AVG(personal_accomplishment) as avg_personal_accomplishment
    FROM (
      SELECT employee_id,
             MAX(created_at) as latest_test
      FROM test_results
      GROUP BY employee_id
    ) latest_tests
    JOIN test_results tr ON latest_tests.employee_id = tr.employee_id
                         AND latest_tests.latest_test = tr.created_at
  `, [], (err, row) => {
    if (err) {
      console.error('Error getting company profile data:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.json([]);
    }
    
    const radarData = [
      { metric: 'Эмоц. истощение', value: Math.round(row.avg_emotional_exhaustion * 5), fullMark: 100 },
      { metric: 'Деперсонализация', value: Math.round(row.avg_depersonalization * 5), fullMark: 100 },
      { metric: 'Личные достиж.', value: Math.round((36 - row.avg_personal_accomplishment) * 2.78), fullMark: 100 },
      { metric: 'Рабочая нагрузка', value: Math.round((row.avg_emotional_exhaustion + row.avg_depersonalization) * 2.5), fullMark: 100 },
      { metric: 'Work-life баланс', value: Math.round((36 - row.avg_personal_accomplishment + (30 - row.avg_emotional_exhaustion)) * 1.67), fullMark: 100 }
    ];
    
    res.json(radarData);
  });
});

/**
 * @swagger
 * /api/hr/export:
 *   get:
 *     summary: Экспорт данных сотрудников в CSV
 *     tags:
 *       - HR
 *     produces:
 *       - text/csv
 *     responses:
 *       200:
 *         description: CSV файл с данными сотрудников
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               example: "ID,Департамент,Уровень риска,Балл выгорания,Последний тест,Статус\n1,IT,Низкий,45,2025-01-15,Активен"
 *       500:
 *         description: Ошибка базы данных
 */
app.get('/api/hr/export', (req, res) => {
  getEmployeesWithStats(db, (err, rows) => {
    if (err) {
      console.error('Error getting employee data for export:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Create CSV content
    const headers = ['ID сотрудника', 'Департамент', 'Уровень риска', 'Балл выгорания', 'Последний тест', 'Статус'];
    const csvRows = [headers.join(',')];
    
    rows.forEach(row => {
      const riskLevel = row.last_score > 60 ? 'Высокий' : row.last_score > 40 ? 'Средний' : 'Низкий';
      const lastTest = row.last_test_date ? new Date(row.last_test_date).toLocaleDateString('ru-RU') : 'Нет данных';
      const status = row.is_admin ? 'Админ' : 'Активен';
      
      csvRows.push([
        `"${row.employee_id}"`,
        `"${row.department || 'Не указано'}"`,
        `"${riskLevel}"`,
        `"${row.last_score || 0}/100"`,
        `"${lastTest}"`,
        `"${status}"`
      ].join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="employee_list_${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.send(csvContent);
  });
});

// Helper function to format month
function formatMonth(dateString) {
  const months = {
    '01': 'Янв', '02': 'Фев', '03': 'Мар', '04': 'Апр',
    '05': 'Май', '06': 'Июн', '07': 'Июл', '08': 'Авг',
    '09': 'Сен', '10': 'Окт', '11': 'Ноя', '12': 'Дек'
  };
  
  const [year, month] = dateString.split('-');
  return `${months[month]} ${year}`;
}

// ======== Запуск + init/migrate ========
const DB_ACTION = process.env.DB_ACTION || 'init'; // 'init' | 'migrate' | 'none'

async function bootstrap() {
  try {
    if (DB_ACTION === 'init') {
      console.log('Running DB initialization...');
      await initializeDatabase(db);
    } else if (DB_ACTION === 'migrate') {
      console.log('Running DB migrations...');
      await runMigrations(db);
    } else {
      console.log('DB_ACTION=none — пропускаем init/migrate');
    }

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
      console.log(`Swagger UI available at /api-docs`);
    });
  } catch (err) {
    console.error('Fatal error on startup:', err);
    process.exit(1);
  }
}

bootstrap();

// Корректное завершение
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    process.exit(0);
  });
});

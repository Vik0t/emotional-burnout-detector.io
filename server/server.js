const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Create or connect to SQLite database
const dbPath = path.join(__dirname, 'burnout.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize database tables
function initializeDatabase() {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    telegram_chat_id TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    last_test_date DATETIME,
    next_test_date DATETIME,
    notifications_enabled BOOLEAN DEFAULT TRUE
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready.');
    }
  });

  // Create test_results table
  db.run(`CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL,
    emotional_exhaustion INTEGER NOT NULL,
    depersonalization INTEGER NOT NULL,
    personal_accomplishment INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    answers TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users (employee_id)
  )`, (err) => {
    if (err) {
      console.error('Error creating test_results table:', err.message);
    } else {
      console.log('Test results table ready.');
    }
  });

  // Create chat_messages table
  db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users (employee_id)
  )`, (err) => {
    if (err) {
      console.error('Error creating chat_messages table:', err.message);
    } else {
      console.log('Chat messages table ready.');
    }
  });

  // Create some default admin user for testing
  db.run(`INSERT OR IGNORE INTO users (employee_id, first_name, is_admin) VALUES ('2', 'Admin', TRUE)`, (err) => {
    if (err) {
      console.error('Error creating default admin user:', err.message);
    } else {
      console.log('Default admin user created.');
    }
  });
}

// Initialize database
initializeDatabase();

// API Routes

// User authentication
app.post('/api/login', (req, res) => {
  const { employeeId, password } = req.body;
  
  // Simple authentication - in production, use proper password hashing
  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }
  
  // Check if user exists, if not create them
  db.get('SELECT * FROM users WHERE employee_id = ?', [employeeId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      // Create new user
      db.run('INSERT INTO users (employee_id) VALUES (?)', [employeeId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create user' });
        }
        
        // Update last login
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE employee_id = ?', [employeeId], (err) => {
          if (err) {
            console.error('Error updating last login:', err.message);
          }
        });
        
        return res.json({ 
          success: true, 
          employeeId,
          isAdmin: employeeId === '2' // Simple admin check
        });
      });
    } else {
      // Update last login
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE employee_id = ?', [employeeId], (err) => {
        if (err) {
          console.error('Error updating last login:', err.message);
        }
      });
      
      return res.json({ 
        success: true, 
        employeeId,
        isAdmin: user.is_admin === 1
      });
    }
  });
});

// Create or update user with additional information
app.post('/api/users', (req, res) => {
  const { employee_id, first_name, last_name, email } = req.body;
  
  if (!employee_id) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }
  
  // Check if user exists
  db.get('SELECT * FROM users WHERE employee_id = ?', [employee_id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      // Create new user with additional information
      db.run(
        'INSERT INTO users (employee_id, first_name, last_name, email) VALUES (?, ?, ?, ?)',
        [employee_id, first_name, last_name, email],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }
          
          // Update last login
          db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE employee_id = ?', [employee_id], (err) => {
            if (err) {
              console.error('Error updating last login:', err.message);
            }
          });
          
          return res.json({
            success: true,
            employee_id,
            first_name,
            last_name,
            email,
            is_admin: employee_id === '2' // Simple admin check
          });
        }
      );
    } else {
      // Update existing user with additional information
      db.run(
        'UPDATE users SET first_name = ?, last_name = ?, email = ?, last_login = CURRENT_TIMESTAMP WHERE employee_id = ?',
        [first_name, last_name, email, employee_id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to update user' });
          }
          
          return res.json({
            success: true,
            employee_id,
            first_name: first_name || user.first_name,
            last_name: last_name || user.last_name,
            email: email || user.email,
            is_admin: user.is_admin === 1
          });
        }
      );
    }
  });
});

// Get user information by employee_id
app.get('/api/users/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  
  db.get('SELECT * FROM users WHERE employee_id = ?', [employeeId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove sensitive information
    const { telegram_chat_id, ...userWithoutSensitiveInfo } = user;
    
    res.json(userWithoutSensitiveInfo);
  });
});

// Save test results
app.post('/api/test-results', (req, res) => {
  const { employeeId, emotionalExhaustion, depersonalization, personalAccomplishment, totalScore, answers } = req.body;
  
  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }
  
  const answersJson = JSON.stringify(answers);
  
  db.run(
    'INSERT INTO test_results (employee_id, emotional_exhaustion, depersonalization, personal_accomplishment, total_score, answers) VALUES (?, ?, ?, ?, ?, ?)',
    [employeeId, emotionalExhaustion, depersonalization, personalAccomplishment, totalScore, answersJson],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save test results' });
      }
      
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Update user test dates and notification settings
app.put('/api/users/:employeeId/test-info', (req, res) => {
  const { employeeId } = req.params;
  const { last_test_date, next_test_date, notifications_enabled } = req.body;
  
  // Build the update query dynamically based on provided fields
  const updates = [];
  const values = [];
  
  if (last_test_date !== undefined) {
    updates.push('last_test_date = ?');
    values.push(last_test_date);
  }
  
  if (next_test_date !== undefined) {
    updates.push('next_test_date = ?');
    values.push(next_test_date);
  }
  
  if (notifications_enabled !== undefined) {
    updates.push('notifications_enabled = ?');
    values.push(notifications_enabled);
  }
  
  // Add employeeId to the values array for the WHERE clause
  values.push(employeeId);
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  const query = `UPDATE users SET ${updates.join(', ')} WHERE employee_id = ?`;
  
  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update user test information' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true });
  });
});

// Get latest test result for employee
app.get('/api/test-results/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  
  db.get(
    `SELECT * FROM test_results 
     WHERE employee_id = ? 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [employeeId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'No test results found' });
      }
      
      // Parse answers JSON
      try {
        row.answers = JSON.parse(row.answers);
      } catch (e) {
        row.answers = [];
      }
      
      res.json(row);
    }
  );
});

// Get all test results for employee (for history)
app.get('/api/test-results/:employeeId/history', (req, res) => {
  const { employeeId } = req.params;
  
  db.all(
    `SELECT id, emotional_exhaustion, depersonalization, personal_accomplishment, total_score, created_at
     FROM test_results 
     WHERE employee_id = ? 
     ORDER BY created_at DESC`,
    [employeeId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(rows);
    }
  );
});

// Save chat message
app.post('/api/chat-messages', (req, res) => {
  const { employeeId, message, response } = req.body;
  
  if (!employeeId || !message) {
    return res.status(400).json({ error: 'Employee ID and message are required' });
  }
  
  db.run(
    'INSERT INTO chat_messages (employee_id, message, response) VALUES (?, ?, ?)',
    [employeeId, message, response],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save chat message' });
      }
      
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Get chat history for employee
app.get('/api/chat-messages/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  
  db.all(
    `SELECT message, response, created_at
     FROM chat_messages
     WHERE employee_id = ?
     ORDER BY created_at ASC`,
    [employeeId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(rows);
    }
  );
});

// Generate chatbot response based on test results
app.post('/api/chatbot/response', (req, res) => {
  const { employeeId, message } = req.body;
  
  if (!employeeId || !message) {
    return res.status(400).json({ error: 'Employee ID and message are required' });
  }
  
  // Get latest test results for the employee
  db.get(
    `SELECT * FROM test_results
     WHERE employee_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [employeeId],
    (err, testResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!testResult) {
        return res.status(404).json({ error: 'No test results found for employee' });
      }
      
      // Parse answers JSON
      try {
        testResult.answers = JSON.parse(testResult.answers);
      } catch (e) {
        testResult.answers = [];
      }
      
      // Generate response based on test results and message
      const response = generateChatbotResponse(testResult, message);
      
      // Save the chat message
      db.run(
        'INSERT INTO chat_messages (employee_id, message, response) VALUES (?, ?, ?)',
        [employeeId, message, response],
        function(err) {
          if (err) {
            console.error('Failed to save chat message:', err.message);
          }
        }
      );
      
      res.json({ response });
    }
  );
});

// Simple chatbot response generator
function generateChatbotResponse(testResult, message) {
  const { emotional_exhaustion, depersonalization, personal_accomplishment } = testResult;
  
  // Convert message to lowercase for easier matching
  const msg = message.toLowerCase();
  
  // Check for specific keywords in the message
  if (msg.includes('стресс') || msg.includes('напряжен')) {
    return `Понимаю, что вы беспокоитесь о стрессе. С вашими показателями:
    
📊 Ваши показатели:
• Эмоциональное истощение: ${emotional_exhaustion}/30
• Деперсонализация: ${depersonalization}/24
• Личные достижения: ${personal_accomplishment}/30

Вот несколько проверенных техник:
🧘‍♀️ **Техника "4-7-8" дыхания:**
• Вдох на 4 счёта
• Задержка дыхания на 7 счётов
• Выдох на 8 счётов
Повторите 4 раза

⏰ **Микроперерывы:**
Каждые 90 минут делайте 5-минутный перерыв. Встаньте, потянитесь, пройдитесь.`;
  }
  
  if (msg.includes('баланс') || msg.includes('личн') || msg.includes('время')) {
    return `Отличный вопрос о балансе! С вашими показателями:
    
📊 Ваши показатели:
• Эмоциональное истощение: ${emotional_exhaustion}/30
• Деперсонализация: ${depersonalization}/24
• Личные достижения: ${personal_accomplishment}/30

⚖️ **Установите границы:**
• Определите чёткое время окончания рабочего дня
• Отключайте рабочие уведомления после работы
• Научитесь говорить "нет" дополнительным задачам

🎯 **Приоритизация:**
Используйте матрицу Эйзенхауэра:
1. Срочно и важно - делать сейчас
2. Важно, не срочно - планировать
3. Срочно, не важно - делегировать
4. Не срочно, не важно - отказаться`;
  }
  
  if (msg.includes('релакс') || msg.includes('отдых') || msg.includes('расслаб')) {
    return `Техники релаксации помогут восстановить силы:
    
📊 Ваши показатели:
• Эмоциональное истощение: ${emotional_exhaustion}/30
• Деперсонализация: ${depersonalization}/24
• Личные достижения: ${personal_accomplishment}/30

🌅 **Прогрессивная мышечная релаксация:**
Напрягайте и расслабляйте каждую группу мышц от ног до головы по 5 секунд.

🎵 **Медитация и музыка:**
• 10 минут медитации в день снижают стресс на 30%
• Слушайте спокойную музыку во время обеда

🚶‍♂️ **Активный отдых:**
• Прогулка на свежем воздухе 15-20 минут
• Лёгкая растяжка или йога`;
  }
  
  // Default response
  return `Спасибо за ваш вопрос! С вашими показателями:
  
📊 Ваши показатели:
• Эмоциональное истощение: ${emotional_exhaustion}/30
• Деперсонализация: ${depersonalization}/24
• Личные достижения: ${personal_accomplishment}/30

Я могу помочь вам с:
✅ Управлением стрессом и техниками релаксации
✅ Балансом работы и личной жизни
✅ Тайм-менеджментом и продуктивностью

О чём бы вы хотели узнать подробнее?`;
}

// HR Dashboard endpoints

// Get employee statistics
app.get('/api/hr/employees', (req, res) => {
  db.all(
    `SELECT 
      u.employee_id,
      u.is_admin,
      u.created_at,
      u.last_login,
      COUNT(tr.id) as test_count,
      MAX(tr.created_at) as last_test_date,
      MAX(tr.total_score) as last_score
    FROM users u
    LEFT JOIN test_results tr ON u.employee_id = tr.employee_id
    GROUP BY u.employee_id
    ORDER BY u.created_at DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(rows);
    }
  );
});

// Get risk distribution statistics
app.get('/api/hr/risk-distribution', (req, res) => {
  db.all(
    `SELECT
      CASE
        WHEN tr.total_score > 50 THEN 'high'
        WHEN tr.total_score > 30 THEN 'medium'
        ELSE 'low'
      END as risk_level,
      COUNT(*) as count
    FROM (
      SELECT employee_id, MAX(created_at) as latest_test
      FROM test_results
      GROUP BY employee_id
    ) latest_tests
    JOIN test_results tr ON latest_tests.employee_id = tr.employee_id AND latest_tests.latest_test = tr.created_at
    GROUP BY
      CASE
        WHEN tr.total_score > 50 THEN 'high'
        WHEN tr.total_score > 30 THEN 'medium'
        ELSE 'low'
      END`,
    (err, rows) => {
      if (err) {
        console.error('Risk distribution error:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Convert to the format expected by frontend
      const distribution = {
        high: 0,
        medium: 0,
        low: 0
      };
      
      rows.forEach(row => {
        distribution[row.risk_level] = row.count;
      });
      
      res.json(distribution);
    }
  );
});

// Get department statistics (mocked since we don't have department data yet)
app.get('/api/hr/departments', (req, res) => {
  // This is a simplified version - in a real app, you would have department data
  db.all(
    `SELECT 
      'Курьеры' as name,
      AVG(tr.total_score) as avg_score,
      COUNT(CASE WHEN tr.total_score > 50 THEN 1 END) as at_risk,
      COUNT(*) as employees
    FROM users u
    LEFT JOIN test_results tr ON u.employee_id = tr.employee_id
    WHERE tr.created_at = (
      SELECT MAX(created_at) 
      FROM test_results tr2 
      WHERE tr2.employee_id = u.employee_id
    )
    UNION ALL
    SELECT 
      'IT' as name,
      AVG(tr.total_score) as avg_score,
      COUNT(CASE WHEN tr.total_score > 50 THEN 1 END) as at_risk,
      COUNT(*) as employees
    FROM users u
    LEFT JOIN test_results tr ON u.employee_id = tr.employee_id
    WHERE tr.created_at = (
      SELECT MAX(created_at) 
      FROM test_results tr2 
      WHERE tr2.employee_id = u.employee_id
    )
    UNION ALL
    SELECT 
      'Логистика' as name,
      AVG(tr.total_score) as avg_score,
      COUNT(CASE WHEN tr.total_score > 50 THEN 1 END) as at_risk,
      COUNT(*) as employees
    FROM users u
    LEFT JOIN test_results tr ON u.employee_id = tr.employee_id
    WHERE tr.created_at = (
      SELECT MAX(created_at) 
      FROM test_results tr2 
      WHERE tr2.employee_id = u.employee_id
    )`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(rows);
    }
  );
});

// Get detailed HR statistics
app.get('/api/hr/statistics', (req, res) => {
  // Get total employees
  db.get('SELECT COUNT(*) as total_employees FROM users', (err, totalRow) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Get recent tests (last 7 days)
    db.get(
      `SELECT COUNT(*) as recent_tests
       FROM test_results
       WHERE created_at > datetime('now', '-7 days')`,
      (err, recentRow) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Get risk distribution
        db.all(
          `SELECT
            CASE
              WHEN tr.total_score > 50 THEN 'high'
              WHEN tr.total_score > 30 THEN 'medium'
              ELSE 'low'
            END as risk_level,
            COUNT(*) as count
          FROM (
            SELECT employee_id, MAX(created_at) as latest_test
            FROM test_results
            GROUP BY employee_id
          ) latest_tests
          JOIN test_results tr ON latest_tests.employee_id = tr.employee_id AND latest_tests.latest_test = tr.created_at
          GROUP BY
            CASE
              WHEN tr.total_score > 50 THEN 'high'
              WHEN tr.total_score > 30 THEN 'medium'
              ELSE 'low'
            END`,
          (err, riskRows) => {
            if (err) {
              console.error('Risk distribution error:', err.message);
              return res.status(500).json({ error: 'Database error' });
            }
            
            // Convert to the format expected by frontend
            const riskDistribution = {
              high: 0,
              medium: 0,
              low: 0
            };
            
            riskRows.forEach(row => {
              riskDistribution[row.risk_level] = row.count;
            });
            
            res.json({
              total_employees: totalRow.total_employees,
              recent_tests: recentRow.recent_tests,
              high_risk_count: riskDistribution.high,
              medium_risk_count: riskDistribution.medium,
              low_risk_count: riskDistribution.low
            });
          }
        );
      }
    );
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
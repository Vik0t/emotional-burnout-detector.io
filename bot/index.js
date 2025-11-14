const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
// Use built-in fetch in Node.js v18+
const fetch = globalThis.fetch || require('node-fetch');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;
const webAppUrl = process.env.WEB_APP_URL || 'http://localhost:3000/emotional-burnout-detector.io/';
const backendApiUrl = process.env.BACKEND_API_URL || 'http://localhost:3002/api';

// Middleware
app.use(express.json());

// Initialize Telegram bot
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// In-memory storage for user data (in production, use a database)
const users = new Map();
const notificationTimers = new Map();

// Welcome message and mini app integration
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || 'User';
  const chatType = msg.chat.type; // 'private', 'group', 'supergroup', etc.
  
  // Register user with backend
  try {
    const response = await fetch(`${backendApiUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employee_id: chatId.toString(),
        first_name: firstName,
        last_name: msg.from?.last_name || '',
        email: '' // Empty email for Telegram users
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to register user with backend:', response.status);
    }
  } catch (error) {
    console.error('Error registering user with backend:', error);
  }
  
  // Store user data in memory for quick access
  users.set(chatId, {
    id: chatId,
    firstName: firstName,
    lastTestDate: null,
    nextTestDate: null,
    notificationsEnabled: true,
    registrationDate: new Date()
  });
  
  // Different welcome message for private vs group chats
  if (chatType === 'private') {
    const welcomeMessage = `Привет, ${firstName}! 👋
    
Добро пожаловать в приложение для диагностики эмоционального выгорания! 🧠✨

Я помогу вам:
🔹 Пройти тест на выгорание и получить персональные рекомендации
🔹 Получать напоминания о повторном тестировании
🔹 Получать полезные советы по профилактике выгорания
🔹 Просмотреть статистику (для HR)

Нажмите кнопку ниже, чтобы открыть мини-приложение и начать путь к эмоциональному благополучию:`;
    
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Открыть мини-приложение', web_app: { url: webAppUrl } }]
        ]
      }
    };
    
    bot.sendMessage(chatId, welcomeMessage, options);
  } else {
    // For group chats, provide instructions without web app buttons
    const welcomeMessage = `Привет, ${firstName}! 👋
    
Добро пожаловать в приложение для диагностики эмоционального выгорания! 🧠✨

Для полноценного использования бота, пожалуйста, напишите мне в личные сообщения @psychological_helper_CDEK_bot.

В личных сообщениях вы сможете:
🔹 Пройти тест на выгорание и получить персональные рекомендации
🔹 Получать регулярные напоминания о повторном тестировании
🔹 Получать полезные советы по профилактике выгорания
🔹 Просмотреть статистику (для HR)

Начните прямо сейчас - забота о вашем эмоциональном здоровье важна! 💪`;
    
    bot.sendMessage(chatId, welcomeMessage);
  }
});

// Handle web app data
bot.on('message', (msg) => {
  // Skip if it's a command
  if (msg.text && msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  
  // If user sent a message, respond with help
  if (msg.text) {
    if (chatType === 'private') {
      const helpMessage = `Я бот для диагностики эмоционального выгорания! 🧠✨
      
Доступные команды:
/start - Начать работу с ботом и получить приветственное сообщение
/test - Пройти тест на выгорание через мини-приложение
/stats - Просмотреть статистику (для HR)
/help - Показать это сообщение

Кроме того, я буду отправлять вам:
🔹 Напоминания о повторном тестировании (каждые 30 дней)
🔹 Мотивационные сообщения (каждые 3 дня)
🔹 Советы по профилактике выгорания (каждые 5 дней)

Нажмите на кнопку "Открыть мини-приложение" в приветственном сообщении для начала работы!`;
      
      bot.sendMessage(chatId, helpMessage);
    } else {
      // For group chats, provide instructions
      const helpMessage = `Для полноценного использования бота, пожалуйста, напишите мне в личные сообщения @psychological_helper_CDEK_bot.
      
В личных сообщениях вы сможете:
🔹 Пройти тест на выгорание и получить персональные рекомендации
🔹 Получать регулярные напоминания о повторном тестировании
🔹 Получать полезные советы по профилактике выгорания
🔹 Просмотреть статистику (для HR)

Начните прямо сейчас - забота о вашем эмоциональном здоровье важна! 💪`;
      
      bot.sendMessage(chatId, helpMessage);
    }
  }
});

// Command to manually trigger test
bot.onText(/\/test/, (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  
  if (chatType === 'private') {
    const message = `Вы можете пройти тест на выгорание в мини-приложении:
    
1. Нажмите кнопку ниже
2. Войдите в систему
3. Пройдите тест
4. Получите персональные рекомендации`;
    
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Пройти тест', web_app: { url: webAppUrl } }]
        ]
      }
    };
    
    bot.sendMessage(chatId, message, options);
  } else {
    // For group chats, provide instructions
    const message = `Для прохождения теста на выгорание, пожалуйста, напишите мне в личные сообщения @psychological_helper_CDEK_bot.
    
В личных сообщениях вы сможете открыть мини-приложение и пройти тест.`;
    
    bot.sendMessage(chatId, message);
  }
});

// Command to show help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  
  if (chatType === 'private') {
    const helpMessage = `Я бот для диагностики эмоционального выгорания!
    
Доступные команды:
/start - Начать работу с ботом
/test - Пройти тест на выгорание
/stats - Просмотреть статистику (для HR)
/help - Показать это сообщение

Вы также можете открыть мини-приложение для более подробной информации.`;
    
    bot.sendMessage(chatId, helpMessage);
  } else {
    // For group chats, provide instructions
    const helpMessage = `Для использования бота, пожалуйста, напишите мне в личные сообщения @psychological_helper_CDEK_bot.
    
В личных сообщениях вы сможете:
🔹 Пройти тест на выгорание
🔹 Получить персональные рекомендации
🔹 Получать напоминания о повторном тестировании
🔹 Просмотреть статистику (для HR)`;
    
    bot.sendMessage(chatId, helpMessage);
  }
});

// Function to send periodic notifications
function scheduleTestReminder(chatId, days = 30) {
  // Clear existing timer if any
  if (notificationTimers.has(chatId)) {
    clearTimeout(notificationTimers.get(chatId));
  }
  
  // Schedule next notification
  const timeout = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  const timer = setTimeout(() => {
    sendTestReminder(chatId);
    // Schedule next reminder
    scheduleTestReminder(chatId, days);
  }, timeout);
  
  notificationTimers.set(chatId, timer);
}

// Function to send test reminder
function sendTestReminder(chatId) {
  const user = users.get(chatId);
  if (!user || !user.notificationsEnabled) return;
  
  // Check if we can send web app buttons (only in private chats)
  // For this example, we'll assume all registered users are in private chats
  // In a real implementation, you might want to store chat type with user data
  
  const message = `🔔 Напоминание о тесте на выгорание!
  
Прошло уже 30 дней с момента вашего последнего теста! 📅

Регулярное прохождение теста поможет вам:
🔹 Отследить изменения в вашем эмоциональном состоянии
🔹 Получить актуальные рекомендации
🔹 Вовремя заметить признаки выгорания

Нажмите кнопку ниже, чтобы открыть мини-приложение и пройти тест:`;
  
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Пройти тест заново', web_app: { url: webAppUrl } }]
      ]
    }
  };
  
  bot.sendMessage(chatId, message, options)
    .catch((error) => {
      // If web app button fails, send message without buttons
      if (error.response && error.response.error_code === 400) {
        const fallbackMessage = `🔔 Напоминание о тесте на выгорание!
        
Прошло уже 30 дней с момента вашего последнего теста! 📅
        
Регулярное прохождение теста поможет вам отследить изменения в вашем эмоциональном состоянии и получить актуальные рекомендации.
        
Пожалуйста, откройте бота в личных сообщениях, чтобы пройти тест.`;
        
        bot.sendMessage(chatId, fallbackMessage);
      } else {
        console.error('Error sending test reminder:', error);
      }
    });
}

// Function to send motivational message
function sendMotivationalMessage(chatId) {
  const messages = [
    "🌟 Помните, что забота о своем эмоциональном состоянии - это важная часть профессионального успеха!",
    "💪 Каждый день - это новая возможность заботиться о себе и своем благополучии!",
    "🌱 Маленькие шаги к заботе о себе каждый день приводят к большим изменениям!",
    "🌈 Ваше эмоциональное здоровье так же важно, как и ваше физическое здоровье!",
    "🧘‍♀️ Не забывайте делать паузы в течение дня для восстановления энергии!",
    "🌞 Начните свой день с позитивной мысли и улыбки!",
    "🌊 Дыхательные упражнения помогают снизить уровень стресса и улучшить концентрацию!",
    "🎯 Устанавливайте реалистичные цели и празднуйте маленькие победы!",
    "🌿 Создайте комфортное рабочее пространство, которое вдохновляет вас!",
    "⏰ Регулярные перерывы повышают продуктивность и снижают утомляемость!"
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  bot.sendMessage(chatId, randomMessage)
    .catch((error) => {
      console.error('Error sending motivational message:', error);
    });
}

// Function to send burnout prevention tips
function sendPreventionTip(chatId) {
  const tips = [
    "📚 Совет дня: Регулярно делайте перерывы в течение рабочего дня. Техника Помодоро (25 минут работы, 5 минут перерыв) может помочь!",
    "🚶‍♂️ Совет дня: Ежедневные прогулки на свежем воздухе помогают снизить уровень стресса и улучшить настроение!",
    "😴 Совет дня: Обеспечьте себе 7-8 часов сна в сутки. Качественный сон - ключ к эмоциональному восстановлению!",
    "🧘 Совет дня: Практикуйте техники релаксации, такие как медитация или дыхательные упражнения!",
    "🍽️ Совет дня: Правильное питание влияет на ваше эмоциональное состояние. Не забывайте про полноценные приемы пищи!",
    "📱 Совет дня: Ограничьте использование гаджетов за 1 час до сна для лучшего засыпания!",
    "🎨 Совет дня: Найдите хобби вне работы, которое приносит вам радость и вдохновение!",
    "👥 Совет дня: Поддерживайте социальные связи с коллегами и друзьями!",
    "🎯 Совет дня: Разделяйте большие задачи на маленькие шаги для снижения стресса!",
    "🌿 Совет дня: Добавьте растения в ваше рабочее пространство для улучшения настроения!"
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  bot.sendMessage(chatId, randomTip)
    .catch((error) => {
      console.error('Error sending prevention tip:', error);
    });
}

// Function to send wellness tip
function sendWellnessTip(chatId) {
  const tips = [
    "🌟 Еженедельный совет по благополучию: Практикуйте благодарность! Каждый день записывайте 3 вещи, за которые благодарны. Это помогает развить позитивное мышление и улучшить настроение!",
    "🧘 Еженедельный совет по благополучию: Создайте ритуал завершения рабочего дня. Это может быть 5-минутная прогулка, глубокое дыхание или запись в дневник. Это помогает отделить работу от личного времени!",
    "🌱 Еженедельный совет по благополучию: Установите границы между работой и личной жизнью. Определите конкретное время для проверки электронной почты и придерживайтесь его!",
    "🎨 Еженедельный совет по благополучию: Практикуйте творчество! Даже 15 минут рисования, пения или написания поможет снизить уровень стресса и улучшить настроение!",
    "👥 Еженедельный совет по благополучию: Поддерживайте социальные связи. Планируйте регулярные встречи с друзьями или коллегами для общения вне работы!",
    "🏋️ Еженедельный совет по благополучию: Включите физическую активность в свой распорядок дня. Даже 10-минутная прогулка помогает улучшить кровообращение и настроение!",
    "🌙 Еженедельный совет по благополучию: Создайте ритуал подготовки ко сну. Избегайте экранов за час до сна и создайте спокойную атмосферу в спальне!",
    "🎯 Еженедельный совет по благополучию: Делегируйте задачи, когда это возможно. Не бойтесь просить о помощи или делегировать задачи коллегам!",
    "📚 Еженедельный совет по благополучию: Читайте книги или статьи, которые вдохновляют вас и расширяют кругозор. Это помогает развивать личностный рост!",
    "🌿 Еженедельный совет по благополучию: Добавьте растения в ваше рабочее пространство. Они улучшают качество воздуха и создают более приятную атмосферу!"
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  bot.sendMessage(chatId, randomTip)
    .catch((error) => {
      console.error('Error sending wellness tip:', error);
    });
}

// Function to send admin notification (for HR)
function sendAdminNotification(adminChatId, message) {
  bot.sendMessage(adminChatId, `📢 Уведомление для HR:\n\n${message}`);
}

// Schedule periodic notifications
function schedulePeriodicNotifications(chatId) {
  // Clear existing timers if any
  if (notificationTimers.has(`motivational-${chatId}`)) {
    clearTimeout(notificationTimers.get(`motivational-${chatId}`));
  }
  
  if (notificationTimers.has(`tip-${chatId}`)) {
    clearTimeout(notificationTimers.get(`tip-${chatId}`));
  }
  
  if (notificationTimers.has(`wellness-${chatId}`)) {
    clearTimeout(notificationTimers.get(`wellness-${chatId}`));
  }
  
  // Schedule motivational message (every 3 days)
  const motivationalTimer = setTimeout(() => {
    sendMotivationalMessage(chatId);
    // Schedule next motivational message
    schedulePeriodicNotifications(chatId);
  }, 3 * 24 * 60 * 60 * 1000); // 3 days
  
  // Schedule prevention tip (every 5 days)
  const tipTimer = setTimeout(() => {
    sendPreventionTip(chatId);
  }, 5 * 24 * 60 * 60 * 1000); // 5 days
  
  // Schedule weekly wellness tip (every 7 days)
  const wellnessTimer = setTimeout(() => {
    sendWellnessTip(chatId);
  }, 7 * 24 * 60 * 60 * 1000); // 7 days
  
  notificationTimers.set(`motivational-${chatId}`, motivationalTimer);
  notificationTimers.set(`tip-${chatId}`, tipTimer);
  notificationTimers.set(`wellness-${chatId}`, wellnessTimer);
}

// API endpoint to register user test completion
app.post('/api/test-completed', async (req, res) => {
  const { chatId, testResults } = req.body;
  
  if (!chatId) {
    return res.status(400).json({ error: 'Chat ID is required' });
  }
  
  // Update user data in memory
  if (users.has(chatId)) {
    const user = users.get(chatId);
    user.lastTestDate = new Date();
    user.nextTestDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    users.set(chatId, user);
    
    // Schedule next reminder
    scheduleTestReminder(chatId, 30);
    
    // Schedule periodic notifications
    schedulePeriodicNotifications(chatId);
  }
  
  // Also update the backend with test completion
  try {
    // First, get the test results from the backend to verify completion
    const response = await fetch(`${backendApiUrl}/test-results/${chatId}`, {
      method: 'GET',
    });
    
    if (response.ok) {
      // Test results exist, we can proceed
      console.log(`Test completion registered for user ${chatId}`);
      
      // Send test results to backend
      if (testResults) {
        const saveResponse = await fetch(`${backendApiUrl}/test-results`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employee_id: chatId,
            ...testResults
          }),
        });
        
        if (!saveResponse.ok) {
          console.error(`Failed to save test results for user ${chatId}:`, saveResponse.status);
        }
      }
    } else {
      console.error(`Failed to verify test completion for user ${chatId}:`, response.status);
    }
  } catch (error) {
    console.error(`Error verifying test completion for user ${chatId}:`, error);
  }
  
  res.json({ success: true });
});

// Command to show statistics (for HR)
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  
  if (chatType === 'private') {
    try {
      // Fetch statistics from backend
      const response = await fetch(`${backendApiUrl}/hr/statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const stats = await response.json();
        const totalUsers = stats.total_employees || 0;
        const recentTests = stats.recent_tests || 0;
        const highRiskCount = stats.high_risk_count || 0;
        const mediumRiskCount = stats.medium_risk_count || 0;
        const lowRiskCount = stats.low_risk_count || 0;
        
        const statsMessage = `📊 Статистика по сотрудникам:
    
👥 Всего пользователей: ${totalUsers}
📝 Тестов пройдено за последнюю неделю: ${recentTests}
🔴 Высокий уровень выгорания: ${highRiskCount}
🟡 Средний уровень выгорания: ${mediumRiskCount}
🟢 Низкий уровень выгорания: ${lowRiskCount}
    
Для получения подробной статистики по отдельным сотрудникам используйте мини-приложение с правами HR.`;
        
        bot.sendMessage(chatId, statsMessage);
      } else {
        // Fallback to in-memory data if backend is not available
        const totalUsers = users.size;
        const recentTests = Array.from(users.values()).filter(user =>
          user.lastTestDate &&
          new Date() - new Date(user.lastTestDate) < 7 * 24 * 60 * 60 * 1000
        ).length;
        
        const statsMessage = `📊 Статистика по сотрудникам:
    
👥 Всего пользователей: ${totalUsers}
📝 Тестов пройдено за последнюю неделю: ${recentTests}
    
Для получения подробной статистики по отдельным сотрудникам используйте мини-приложение с правами HR.`;
        
        bot.sendMessage(chatId, statsMessage);
      }
    } catch (error) {
      // Fallback to in-memory data if backend is not available
      console.error('Error fetching statistics from backend:', error);
      const totalUsers = users.size;
      const recentTests = Array.from(users.values()).filter(user =>
        user.lastTestDate &&
        new Date() - new Date(user.lastTestDate) < 7 * 24 * 60 * 60 * 1000
      ).length;
      
      const statsMessage = `📊 Статистика по сотрудникам:
    
👥 Всего пользователей: ${totalUsers}
📝 Тестов пройдено за последнюю неделю: ${recentTests}
    
Для получения подробной статистики по отдельным сотрудникам используйте мини-приложение с правами HR.`;
      
      bot.sendMessage(chatId, statsMessage);
    }
  } else {
    // For group chats, provide instructions
    const statsMessage = `Для просмотра статистики по сотрудникам, пожалуйста, напишите мне в личные сообщения @psychological_helper_CDEK_bot.
    
В личных сообщениях вы сможете получить актуальную статистику по тестированию.`;
    
    bot.sendMessage(chatId, statsMessage);
  }
});

// API endpoint to get user stats (for HR)
app.get('/api/user-stats/:chatId', async (req, res) => {
  const { chatId } = req.params;
  
  try {
    // Try to fetch user stats from backend
    const response = await fetch(`${backendApiUrl}/users/${chatId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const userData = await response.json();
      return res.json({
        firstName: userData.first_name,
        lastTestDate: userData.last_test_date,
        nextTestDate: userData.next_test_date,
        notificationsEnabled: userData.notifications_enabled
      });
    } else if (response.status === 404) {
      // User not found in backend, try in-memory storage
      if (!users.has(chatId)) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = users.get(chatId);
      return res.json({
        firstName: user.firstName,
        lastTestDate: user.lastTestDate,
        nextTestDate: user.nextTestDate,
        notificationsEnabled: user.notificationsEnabled
      });
    } else {
      // Backend error, fallback to in-memory storage
      console.error('Backend API error:', response.status);
      if (!users.has(chatId)) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = users.get(chatId);
      return res.json({
        firstName: user.firstName,
        lastTestDate: user.lastTestDate,
        nextTestDate: user.nextTestDate,
        notificationsEnabled: user.notificationsEnabled
      });
    }
  } catch (error) {
    // Network error, fallback to in-memory storage
    console.error('Error fetching user stats from backend:', error);
    if (!users.has(chatId)) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users.get(chatId);
    return res.json({
      firstName: user.firstName,
      lastTestDate: user.lastTestDate,
      nextTestDate: user.nextTestDate,
      notificationsEnabled: user.notificationsEnabled
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', users: users.size });
});

// Start server
app.listen(port, () => {
  console.log(`Telegram bot server running on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  // Clear all timers
  notificationTimers.forEach(timer => clearTimeout(timer));
  process.exit(0);
});

module.exports = app;
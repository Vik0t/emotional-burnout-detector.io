const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

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
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || 'User';
  const chatType = msg.chat.type; // 'private', 'group', 'supergroup', etc.
  
  // Store user data
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
    
Добро пожаловать в приложение для диагностики эмоционального выгорания!

Вы можете:
🔹 Пройти тест на выгорание
🔹 Получить персональные рекомендации
🔹 Просмотреть статистику (для HR)

Нажмите кнопку ниже, чтобы открыть мини-приложение:`;
    
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Открыть мини-приложение', web_app: { url: 'https://your-app-url.com' } }]
        ]
      }
    };
    
    bot.sendMessage(chatId, welcomeMessage, options);
  } else {
    // For group chats, provide instructions without web app buttons
    const welcomeMessage = `Привет, ${firstName}! 👋
    
Добро пожаловать в приложение для диагностики эмоционального выгорания!

Для использования бота, пожалуйста, напишите мне в личные сообщения @psychological_helper_CDEK_bot.

В личных сообщениях вы сможете:
🔹 Пройти тест на выгорание
🔹 Получить персональные рекомендации
🔹 Получать напоминания о повторном тестировании
🔹 Просмотреть статистику (для HR)`;
    
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
          [{ text: 'Пройти тест', web_app: { url: 'https://your-app-url.com' } }]
        ]
      }
    };
    
    bot.sendMessage(chatId, message, options);
  } else {
    // For group chats, provide instructions
    const message = `Для прохождения теста на выгорание, пожалуйста, напишите мне в личные сообщения @your_bot_username.
    
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
    const helpMessage = `Для использования бота, пожалуйста, напишите мне в личные сообщения @psychological_helper_CDEK_bot
    
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
  
Прошло уже некоторое время с момента вашего последнего теста. Рекомендуем пройти тест заново, чтобы отследить изменения в вашем состоянии.
  
Нажмите кнопку ниже, чтобы открыть мини-приложение и пройти тест:`;
  
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Пройти тест заново', web_app: { url: 'https://your-app-url.com' } }]
      ]
    }
  };
  
  bot.sendMessage(chatId, message, options)
    .catch((error) => {
      // If web app button fails, send message without buttons
      if (error.response && error.response.error_code === 400) {
        const fallbackMessage = `🔔 Напоминание о тесте на выгорание!
        
Прошло уже некоторое время с момента вашего последнего теста. Рекомендуем пройти тест заново, чтобы отследить изменения в вашем состоянии.
        
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
    "🧘‍♀️ Не забывайте делать паузы в течение дня для восстановления энергии!"
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
    "🍽️ Совет дня: Правильное питание влияет на ваше эмоциональное состояние. Не забывайте про полноценные приемы пищи!"
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  bot.sendMessage(chatId, randomTip)
    .catch((error) => {
      console.error('Error sending prevention tip:', error);
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
  
  notificationTimers.set(`motivational-${chatId}`, motivationalTimer);
  notificationTimers.set(`tip-${chatId}`, tipTimer);
}

// API endpoint to register user test completion
app.post('/api/test-completed', (req, res) => {
  const { chatId } = req.body;
  
  if (!chatId) {
    return res.status(400).json({ error: 'Chat ID is required' });
  }
  
  // Update user data
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
  
  res.json({ success: true });
});

// Command to show statistics (for HR)
bot.onText(/\/stats/, (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  
  // In a real implementation, you would check if the user is an admin
  // For now, we'll just show a placeholder message
  const totalUsers = users.size;
  const recentTests = Array.from(users.values()).filter(user =>
    user.lastTestDate &&
    new Date() - new Date(user.lastTestDate) < 7 * 24 * 60 * 60 * 1000
  ).length;
  
  if (chatType === 'private') {
    const statsMessage = `📊 Статистика по сотрудникам:
    
👥 Всего пользователей: ${totalUsers}
📝 Тестов пройдено за последнюю неделю: ${recentTests}
    
Для получения подробной статистики по отдельным сотрудникам используйте мини-приложение с правами HR.`;
    
    bot.sendMessage(chatId, statsMessage);
  } else {
    // For group chats, provide instructions
    const statsMessage = `Для просмотра статистики по сотрудникам, пожалуйста, напишите мне в личные сообщения @your_bot_username.
    
В личных сообщениях вы сможете получить актуальную статистику по тестированию.`;
    
    bot.sendMessage(chatId, statsMessage);
  }
});

// API endpoint to get user stats (for HR)
app.get('/api/user-stats/:chatId', (req, res) => {
  const { chatId } = req.params;
  
  if (!users.has(chatId)) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const user = users.get(chatId);
  res.json({
    firstName: user.firstName,
    lastTestDate: user.lastTestDate,
    nextTestDate: user.nextTestDate,
    notificationsEnabled: user.notificationsEnabled
  });
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
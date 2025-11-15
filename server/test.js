// Тестовый файл для проверки функциональности
const { generateChatbotResponse } = require('./services/chatbotService.cjs');

// Тестовые данные
const testResult = {
  emotional_exhaustion: 15,
  depersonalization: 8,
  personal_accomplishment: 25,
  total_score: 48
};

const testMessage = "Мне тяжело работать, чувствую стресс";

async function testChatbot() {
  console.log('=== Testing Chatbot Service ===');
  console.log('Test Result:', testResult);
  console.log('Test Message:', testMessage);
  
  try {
    const response = await generateChatbotResponse(testResult, testMessage, 'test_user');
    console.log('Chatbot Response:', response);
    console.log('=== Test Completed ===');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Запуск теста если файл выполняется напрямую
if (require.main === module) {
  testChatbot();
}

module.exports = { testChatbot };
const OpenAI = require('openai');

async function generateChatbotResponse(testResult, message) {
  const { emotional_exhaustion, depersonalization, personal_accomplishment } = testResult;
  
  // Create a personalized prompt that includes the user's test results
  const prompt = `Вы AI-ассистент по профилактике эмоционального выгорания.
У сотрудника следующие показатели:
- Эмоциональное истощение: ${emotional_exhaustion}/30
- Деперсонализация: ${depersonalization}/24
- Личные достижения: ${personal_accomplishment}/30

На основе этих показателей и вопроса сотрудника, дайте персонализированный совет.
Вопрос сотрудника: "${message}"

Ответите на русском языке, дайте полезный и поддерживающий совет, учитывая показатели выгорания.
Если показатели высокие, дайте более осторожные рекомендации.
Если показатели в норме, можно дать общие советы по поддержанию баланса.`;

  // Try to use Hugging Face API with OpenAI-compatible client, fallback to original logic if it fails
  try {
    const token = process.env.HF_TOKEN;
    console.log('Attempting to use Hugging Face API with token:', token ? 'Token provided' : 'No token');
    
    if (!token || token === 'your_hugging_face_token_here') {
      // If no API key is set, fall back to the original keyword-based responses
      console.log('No Hugging Face token provided, using fallback responses');
      return generateFallbackResponse(testResult, message);
    }

    console.log('Sending request to Hugging Face API with prompt:', prompt);

    // Using OpenAI-compatible API from Hugging Face
    const client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: token,
    });

    const chatCompletion = await client.chat.completions.create({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      timeout: 10000, // 10 second timeout
    });

    console.log('Hugging Face API response:', chatCompletion);

    if (chatCompletion && chatCompletion.choices && chatCompletion.choices.length > 0) {
      const botResponse = chatCompletion.choices[0].message.content;
      
      // Add the personalized test results context
      return `📊 Ваши показатели:
• Эмоциональное истощение: ${emotional_exhaustion}/30
• Деперсонализация: ${depersonalization}/24
• Личные достижения: ${personal_accomplishment}/30

${botResponse}`;
    } else {
      throw new Error('No response from model');
    }
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);
    // Fall back to the original keyword-based responses
    return generateFallbackResponse(testResult, message);
  }
}

// Original keyword-based responses as fallback
function generateFallbackResponse(testResult, message) {
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

module.exports = { generateChatbotResponse };
// server/services/chatbotService.js
const { OpenAI } = require("openai");
const dotenv = require('dotenv');
dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;
const client = new OpenAI({
	baseURL: "https://router.huggingface.co/v1",
	apiKey: HF_TOKEN,
});

// Система понимания интентов
const INTENT_PATTERNS = {
  STRESS_RELATED: [
    'стресс', 'напряжен', 'напряжение', 'давление', 'перегружен', 'завал', 
    'завал', 'тяжело', 'сложно', 'устал', 'выгорание', 'burnout', 'нервы',
    'тревож', 'беспокой', 'паника', 'истерика'
  ],
  WORK_LIFE_BALANCE: [
    'баланс', 'отдых', 'свободное время',
    'семья', 'дом', 'хобби', 'увлечения', 'выходные', 'отпуск'
  ],
  RELAXATION: [
    'релакс', 'отдых', 'расслаб', 'успокоит', 'медитация', 'йога',
    'дыхание', 'сон', 'восстанов', 'разрядк', 'перерыв'
  ],
  TIME_MANAGEMENT: [
    'тайм', 'время', 'планиров', 'приоритет', 'организа', 'делегир',
    'продуктив', 'эффектив', 'срочно', 'важно'
  ],
  GENERAL_BURNOUT: [
    'выгорание', 'burnout', 'усталост', 'истощен', 'мотивац',
    'энергия', 'силы', 'настроени', 'депресс', 'апат'
  ],
  IRRELEVANT: [
    'политика', 'религия', 'спорт', 'фильм', 'музыка', 'еда', 'погода',
    'новости', 'покупки', 'деньги', 'акции', 'криптовалют', 'машина',
    'квартира', 'ремонт', 'готовка'
  ]
};

// Шаблоны рекомендаций
const RECOMMENDATION_TEMPLATES = {
  STRESS_MANAGEMENT: {
    low: [
      "Попробуйте технику глубокого дыхания: 4 секунды вдох, 4 задержка, 4 выдох",
      "Делайте 5-минутные перерывы каждый час для разминки"
    ],
    medium: [
      "Освойте прогрессивную мышечную релаксацию по 10 минут утром и вечером",
      "Введите правило 'без экранов' за час до сна",
      "Практикуйте осознанность: 5 минут медитации в день"
    ],
    high: [
      "Обратитесь к психологу для профессиональной поддержки",
      "Рассмотрите возможность временного снижения нагрузки",
      "Изучите техники управления стрессом с специалистом"
    ]
  },
  WORK_LIFE_BALANCE: {
    low: [
      "Установите четкие границы рабочего времени",
      "Планируйте приятные активности на выходные"
    ],
    medium: [
      "Создайте ритуал перехода от работы к отдыху",
      "Научитесь говорить 'нет' дополнительным задачам",
      "Выделите время для хобби и общения с близкими"
    ],
    high: [
      "Пересмотрите рабочие обязанности с руководителем",
      "Рассмотрите гибкий график или удаленную работу",
      "Обязательно планируйте отпуск в ближайшее время"
    ]
  },
  RELAXATION: {
    low: [
      "Слушайте расслабляющую музыку во время работы",
      "Делайте легкую растяжку в перерывах"
    ],
    medium: [
      "Практикуйте йогу или пилатес 2-3 раза в неделю",
      "Организуйте спа-вечер раз в неделю",
      "Попробуйте ароматерапию с эфирными маслами"
    ],
    high: [
      "Запишитесь на профессиональный массаж",
      "Рассмотрите санаторно-курортное лечение",
      "Изучите техники релаксации с инструктором"
    ]
  }
};

class ChatbotService {
  constructor() {
    // Простое хранилище рекомендаций в памяти (в реальном проекте - БД)
    this.recommendations = new Map();
  }

  async analyzeIntent(message) {
    const msg = message.toLowerCase();
    console.log('Analyzing intent for message:', message);

    try {
      // Проверяем нерелевантные темы
      for (const keyword of INTENT_PATTERNS.IRRELEVANT) {
        if (msg.includes(keyword)) {
          console.log('Detected irrelevant intent for keyword:', keyword);
          return 'IRRELEVANT';
        }
      }
      
      // Подсчитываем совпадения для каждого интента
      const scores = {
        STRESS_RELATED: 0,
        WORK_LIFE_BALANCE: 0,
        RELAXATION: 0,
        TIME_MANAGEMENT: 0,
        GENERAL_BURNOUT: 0
      };
      
      for (const [intent, keywords] of Object.entries(INTENT_PATTERNS)) {
        if (intent === 'IRRELEVANT') continue;
        
        for (const keyword of keywords) {
          if (msg.includes(keyword)) {
            scores[intent]++;
            console.log(`Found keyword "${keyword}" for intent "${intent}"`);
          }
        }
      }
      
      // Возвращаем интент с наибольшим количеством совпадений
      const maxScore = Math.max(...Object.values(scores));
      console.log('Intent scores:', scores);
      
      if (maxScore === 0) {
        console.log('No keywords matched, returning GENERAL intent');
        return 'GENERAL';
      }
      
      const detectedIntent = Object.keys(scores).find(key => scores[key] === maxScore);
      console.log('Detected intent:', detectedIntent);
      return detectedIntent;
    } catch (error) {
      console.error('Error in analyzeIntent:', error);
      return 'GENERAL';
    }
  }
    
  getBurnoutLevel(testResult) {
    const { emotional_exhaustion, depersonalization } = testResult;
    
    if (emotional_exhaustion > 15 || depersonalization > 10) {
      return 'high';
    } else if (emotional_exhaustion > 10 || depersonalization > 6) {
      return 'medium';
    }
    return 'low';
  }

  generatePersonalizedRecommendations(intent, level, testResult) {
    const recommendations = [];
    const templates = RECOMMENDATION_TEMPLATES;
    
    // Добавляем рекомендации по основному интенту
    if (templates[intent] && templates[intent][level]) {
      recommendations.push(...templates[intent][level]);
    }
    
    // Добавляем общие рекомендации в зависимости от уровня выгорания
    if (level === 'high') {
      recommendations.push(
        "Важно обратиться за профессиональной помощью",
        "Рассмотрите возможность временного изменения рабочего графика"
      );
    } else if (level === 'medium') {
      recommendations.push(
        "Регулярно отслеживайте свое состояние",
        "Поддерживайте социальные связи с коллегами и друзьями"
      );
    } else {
      recommendations.push(
        "Поддерживайте здоровые привычки",
        "Продолжайте заботиться о балансе работы и отдыха"
      );
    }
    
    return recommendations;
  }

  saveRecommendations(employeeId, recommendations) {
    if (!this.recommendations.has(employeeId)) {
      this.recommendations.set(employeeId, []);
    }

    const current = this.recommendations.get(employeeId);
    const newRecommendations = recommendations.map(rec => ({
      id: Date.now() + Math.random(),
      text: rec,
      completed: false,
      createdAt: new Date().toISOString()
    }));

    this.recommendations.set(employeeId, [...current, ...newRecommendations]);

    return JSON.stringify(newRecommendations, null, 2);
  }

  getIncompleteRecommendations(employeeId) {
    if (!this.recommendations.has(employeeId)) {
      return [];
    }

    return this.recommendations.get(employeeId).filter(rec => !rec.completed);
  }

  markRecommendationComplete(employeeId, recommendationId) {
    if (!this.recommendations.has(employeeId)) {
      return false;
    }

    const recommendations = this.recommendations.get(employeeId);
    const recommendation = recommendations.find(rec => rec.id === recommendationId);

    if (recommendation) {
      recommendation.completed = true;
      recommendation.completedAt = new Date().toISOString();
      return true;
    }

    return false;
  }

  extractRecommendations(response) {
    // Simple extraction of recommendations from response
    // In a real implementation, you might want to use more sophisticated NLP
    const lines = response.split('\n');
    const recommendations = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Look for lines that start with a number followed by a dot or bullet points
      if (/^[\d•\-\*]/.test(trimmed) || trimmed.length > 20) {
        // Remove numbering or bullet points
        const cleanLine = trimmed.replace(/^[\d•\-\*\s]+/, '').trim();
        if (cleanLine.length > 10) {
          recommendations.push(cleanLine);
        }
      }
    }
    
    return recommendations;
  }

  async generateResponse(testResult, message, employeeId) {
    console.log('=== Generate Response Started ===');
    console.log('Message:', message);
    console.log('Employee ID:', employeeId);
    console.log('Test Result:', testResult);

    const { emotional_exhaustion, depersonalization, personal_accomplishment } = testResult;
    const level = this.getBurnoutLevel(testResult);
    console.log('Burnout level:', level);

    // Try to use Hugging Face API for generating response
    try {
      const systemPrompt = `Ты AI-ассистент по профилактике профессионального выгорания.
      У сотрудника уровень выгорания: ${level} (${emotional_exhaustion}/30 истощение, ${depersonalization}/24 деперсонализация, ${personal_accomplishment}/30 личные достижения).
      Отвечай на вопросы, связанные с выгоранием, стрессом и психологическим состоянием на работе.
      Давай персонализированные рекомендации, основанные на показателях сотрудника.
      Не отвечай на вопросы, не связанные с темой выгорания, работы и психологического состояния.`;

      const completion = await client.chat.completions.create({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const aiResponse = completion.choices[0].message.content.trim();

      // Save recommendations from AI response
      const recommendations = this.extractRecommendations(aiResponse);
      this.saveRecommendations(employeeId, recommendations);

      console.log('=== Generate Response Completed ===');
      return aiResponse;
    } catch (error) {
      console.error('Error generating response with HF API:', error);
      // Fallback to template-based responses
      console.log('Falling back to template-based responses');
    }

    const intent = await this.analyzeIntent(message);
    console.log('Detected intent:', intent);

    if (intent === 'IRRELEVANT') {
      console.log('Returning irrelevant response');
      return `Я специализируюсь на вопросах, связанных с эмоциональным выгоранием и стрессом на работе.

Могу помочь вам с:
✅ Управлением стрессом и техниками релаксации
✅ Балансом работы и личной жизни  
✅ Тайм-менеджментом и продуктивностью
✅ Улучшением качества сна и энергии

Пожалуйста, задайте вопрос, связанный с вашим эмоциональным состоянием на работе.`;
    }

    const recommendations = this.generatePersonalizedRecommendations(intent, level, testResult);
    console.log('Generated recommendations:', recommendations);
    const recommendationsJson = this.saveRecommendations(employeeId, recommendations);

    let response = `📊 Ваши показатели:
• Эмоциональное истощение: ${emotional_exhaustion}/30
• Деперсонализация: ${depersonalization}/24  
• Личные достижения: ${personal_accomplishment}/30

`;

    switch (intent) {
      case 'STRESS_RELATED':
        response += `Понимаю, что стресс влияет на ваше состояние. Вот персонализированные рекомендации:

`;
        break;
      case 'WORK_LIFE_BALANCE':
        response += `Отличный вопрос о балансе! Давайте найдем способы улучшить ваше состояние:

`;
        break;
      case 'RELAXATION':
        response += `Техники релаксации помогут восстановить ваши силы:

`;
        break;
      case 'TIME_MANAGEMENT':
        response += `Хорошее планирование поможет снизить нагрузку:

`;
        break;
      case 'GENERAL_BURNOUT':
        response += `Давайте обсудим ваше общее состояние и способы улучшения:

`;
        break;
      default:
        response += `Я готов помочь вам с вопросами о выгорании:

`;
    }

    recommendations.forEach((rec, index) => {
      response += `${index + 1}. ${rec}\n`;
    });

    response += `\n💡 Рекомендации сохранены в вашем профиле - вы сможете отслеживать прогресс выполнения.

`;

    const incomplete = this.getIncompleteRecommendations(employeeId);
    if (incomplete.length > 0) {
      response += `📋 У вас есть невыполненные рекомендации:
`;
      incomplete.slice(0, 3).forEach(rec => {
        response += `• ${rec.text}\n`;
      });
      if (incomplete.length > 3) {
        response += `... и еще ${incomplete.length - 3} рекомендаций\n`;
      }
      response += `\n`;
    }

    response += `Хотите узнать подробнее о какой-то технике или обсудить другие аспекты выгорания?`;

    console.log('=== Generate Response Completed ===');
    return response;
  }
}

const chatbotService = new ChatbotService();

async function generateChatbotResponse(testResult, message, employeeId = '1') {
  console.log('=== Generate Chatbot Response Started ===');
  console.log('Parameters:', { testResult, message, employeeId });
  
  try {
    console.log('Calling chatbotService.generateResponse...');
    const result = await chatbotService.generateResponse(testResult, message, employeeId);
    console.log('Chatbot response generated successfully');
    console.log('=== Generate Chatbot Response Completed ===');
    return result;
  } catch (error) {
    console.error('Error in generateChatbotResponse:', error);
    console.error('Error stack:', error.stack);
    return 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.';
  }
}

module.exports = { generateChatbotResponse, chatbotService };
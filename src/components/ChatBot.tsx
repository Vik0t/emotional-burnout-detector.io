import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { TestResults } from './BurnoutTest';

interface ChatBotProps {
  testResults: TestResults;
  employeeId: string;
  onGoToDashboard: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function ChatBot({ testResults, employeeId, onGoToDashboard }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Начальное сообщение от бота
    const initialMessage = getInitialMessage();
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setMessages([{ role: 'assistant', content: initialMessage, timestamp: timeString }]);
  }, []);

  const getInitialMessage = () => {
    const { emotionalExhaustion, depersonalization, personalAccomplishment } = testResults;
    
    let level = 'низкий';
    let color = 'зелёном';
    
    if (emotionalExhaustion > 15 || depersonalization > 10) {
      level = 'высокий';
      color = 'красном';
    } else if (emotionalExhaustion > 10 || depersonalization > 6) {
      level = 'средний';
      color = 'жёлтом';
    }

    return `Здравствуйте! Я AI-ассистент CDEK по профилактике выгорания. 

По результатам теста ваш уровень риска выгорания - **${level}** (в ${color} диапазоне).

📊 Ваши показатели:
• Эмоциональное истощение: ${emotionalExhaustion}/30
• Деперсонализация: ${depersonalization}/24  
• Личные достижения: ${personalAccomplishment}/30

${level === 'высокий' 
  ? 'Я вижу, что вы испытываете серьёзные признаки выгорания. Важно обратить на это внимание и принять меры.'
  : level === 'средний'
  ? 'Есть некоторые признаки усталости. Давайте обсудим, как можно улучшить ваше состояние.'
  : 'Ваши показатели в норме! Но всегда можно улучшить баланс работы и отдыха.'
}

Чем я могу вам помочь? Вы можете спросить меня:
• Как справиться со стрессом?
• Как улучшить баланс работы и жизни?
• Техники релаксации
• Советы по тайм-менеджменту`;
  };

  const generateResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('стресс') || msg.includes('напряжен')) {
      return `Понимаю, стресс - это серьёзная проблема. Вот несколько проверенных техник:

🧘‍♀️ **Техника "4-7-8" дыхания:**
• Вдох на 4 счёта
• Задержка дыхания на 7 счётов
• Выдох на 8 счётов
Повторите 4 раза

⏰ **Микроперерывы:**
Каждые 90 минут делайте 5-минутный перерыв. Встаньте, потянитесь, пройдитесь.

📝 **Практика благодарности:**
Записывайте 3 вещи, за которые вы благодарны сегодня.

Что из этого хотели бы попробовать в первую очередь?`;
    }

    if (msg.includes('баланс') || msg.includes('личн') || msg.includes('время')) {
      return `Отличный вопрос! Баланс работы и личной жизни критически важен.

⚖️ **Установите границы:**
• Определите чёткое время окончания рабочего дня
• Отключайте рабочие уведомления после работы
• Научитесь говорить "нет" дополнительным задачам

🎯 **Приоритизация:**
Используйте матрицу Эйзенхауэра:
1. Срочно и важно - делать сейчас
2. Важно, не срочно - планировать
3. Срочно, не важно - делегировать
4. Не срочно, не важно - отказаться

💚 **Время для себя:**
Заблокируйте минимум 30 минут в день для своего хобби или отдыха.

Хотите узнать больше о какой-то из этих техник?`;
    }

    if (msg.includes('релакс') || msg.includes('отдых') || msg.includes('расслаб')) {
      return `Техники релаксации помогут восстановить силы:

🌅 **Прогрессивная мышечная релаксация:**
Напрягайте и расслабляйте каждую группу мышц от ног до головы по 5 секунд.

🎵 **Медитация и музыка:**
• 10 минут медитации в день снижают стресс на 30%
• Слушайте спокойную музыку во время обеда

🚶‍♂️ **Активный отдых:**
• Прогулка на свежем воздухе 15-20 минут
• Лёгкая растяжка или йога

🛁 **Вечерний ритуал:**
• Тёплая ванна или душ
• Чтение книги (не с экрана!)
• Ароматерапия (лаванда, мята)

Что вам ближе всего?`;
    }

    if (msg.includes('тайм') || msg.includes('управление') || msg.includes('продуктивн')) {
      return `Эффективное управление временем - ключ к снижению стресса:

⏱️ **Метод Помодоро:**
• 25 минут работы
• 5 минут перерыва
• После 4 циклов - 15-30 минут отдыха

📋 **Планирование дня:**
• Вечером составьте список из 3 главных задач на завтра
• Начинайте с самой сложной задачи утром
• Группируйте похожие задачи вместе

🚫 **Защита от отвлечений:**
• Отключите уведомления на время глубокой работы
• Используйте приложения для блокировки соцсетей
• Обозначьте время для проверки почты (не чаще 3 раз в день)

✅ **Делегирование:**
Какие задачи можно передать коллегам или автоматизировать?

Хотите подробнее о конкретном методе?`;
    }

    if (msg.includes('сон') || msg.includes('усталост') || msg.includes('энерг')) {
      return `Качественный сон - основа восстановления:

😴 **Гигиена сна:**
• Ложитесь в одно и то же время
• Спите 7-9 часов
• За час до сна - никаких экранов
• Проветрите комнату, температура 18-20°C

⚡ **Энергия в течение дня:**
• Завтракайте в течение часа после пробуждения
• Пейте воду - минимум 1.5л в день
• Избегайте кофеин после 15:00
• Короткий дневной сон (15-20 мин) даёт заряд

🥗 **Питание:**
Регулярные приёмы пищи каждые 3-4 часа помогают поддерживать стабильную энергию.

Есть проблемы с засыпанием или качеством сна?`;
    }

    if (msg.includes('колле') || msg.includes('команд') || msg.includes('отношен')) {
      return `Отношения с коллегами важны для комфорта на работе:

🤝 **Коммуникация:**
• Используйте "Я-сообщения" вместо обвинений
• Активно слушайте коллег
• Давайте конструктивную обратную связь

🎯 **Границы:**
• Вежливо отказывайте от задач, которые не в вашей зоне
• Не участвуйте в офисных сплетнях
• Уважайте личное пр��странство других

💬 **Поддержка:**
• Поделитесь переживаниями с доверенным коллегой
• Участвуйте в корпоративных мероприятиях
• Благодарите за помощь и поддержку

Есть конкретная ситуация, которую хотите обсудить?`;
    }

    // Общий ответ
    return `Спасибо за ваш вопрос! Я могу помочь вам с:

✅ Управлением стрессом и техниками релаксации
✅ Балансом работы и личной жизни
✅ Тайм-менеджментом и продуктивностью
✅ Улучшением качества сна и энергии
✅ Коммуникацией с коллегами

О чём бы вы хотели узнать подробнее?`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const userMessage: Message = { role: 'user', content: input, timestamp: timeString };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Имитация задержки ответа
    setTimeout(() => {
      const response = generateResponse(input);
      const responseTime = new Date();
      const responseTimeString = `${responseTime.getHours().toString().padStart(2, '0')}:${responseTime.getMinutes().toString().padStart(2, '0')}`;
      const assistantMessage: Message = { role: 'assistant', content: response, timestamp: responseTimeString };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            onClick={onGoToDashboard}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft size={20} />
            Вернуться в дашборд
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-[#00B33C] text-white px-3 py-1 rounded">
              CDEK
            </div>
            <div>
              <h1 className="text-gray-900">AI-Ассистент</h1>
              <p className="text-sm text-gray-500">ID: {employeeId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex gap-2 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#00B33C] flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`flex-1 max-w-2xl ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-[#00B33C] text-white rounded-tr-sm'
                        : 'bg-[#F5F5F5] text-gray-900 rounded-tl-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-[#00B33C] flex items-center justify-center flex-shrink-0">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div className="bg-[#F5F5F5] px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите сообщение..."
            className="flex-1 h-11 bg-gray-50 border-gray-200 rounded-full px-4"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-11 w-11 rounded-full bg-[#00B33C] hover:bg-[#009933] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

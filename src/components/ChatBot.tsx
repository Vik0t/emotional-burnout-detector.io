import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';
import cdekLogo from '../assets/cdek-logo.svg';
import { TestResults } from './BurnoutTest';
import { apiService } from '../services/api';

interface ChatBotProps {
  testResults: TestResults;
  employeeId: string;
  onGoToDashboard: () => void;
  onBackToAccount?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function ChatBot({ testResults, employeeId, onGoToDashboard, onBackToAccount }: ChatBotProps) {
  const [messages, setMessages] = useState([] as Message[]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null as HTMLDivElement | null);

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

  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      // Get response from backend API
      const response = await apiService.getChatbotResponse(employeeId, userMessage);
      
      // Save the chat message to the database
      try {
        await apiService.saveChatMessage(employeeId, userMessage, response);
      } catch (saveError) {
        console.error('Failed to save chat message:', saveError);
        // Continue even if saving fails
      }
      
      return response;
    } catch (error) {
      console.error('Failed to get chatbot response from backend:', error);
      return 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.';
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
    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await generateResponse(input);
      const responseTime = new Date();
      const responseTimeString = `${responseTime.getHours().toString().padStart(2, '0')}:${responseTime.getMinutes().toString().padStart(2, '0')}`;
      const assistantMessage: Message = { role: 'assistant', content: response, timestamp: responseTimeString };
      setMessages((prev: Message[]) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const responseTime = new Date();
      const responseTimeString = `${responseTime.getHours().toString().padStart(2, '0')}:${responseTime.getMinutes().toString().padStart(2, '0')}`;
      const assistantMessage: Message = { role: 'assistant', content: 'Извините, произошла ошибка. Попробуйте еще раз.', timestamp: responseTimeString };
      setMessages((prev: Message[]) => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex gap-2 order-2 sm:order-1 w-full sm:w-auto">
            {onBackToAccount && (
              <Button
                onClick={onBackToAccount}
                outlined
                className="gap-2 text-sm sm:text-base flex-1 sm:flex-none"
                size="small"
                icon={<ArrowLeft size={16} className="sm:w-5 sm:h-5" />}
              >
                <span className="hidden sm:inline">В личный кабинет</span>
                <span className="sm:hidden">Кабинет</span>
              </Button>
            )}
            <Button
              onClick={onGoToDashboard}
              outlined
              className="gap-2 text-sm sm:text-base flex-1 sm:flex-none"
              size="small"
              icon={<ArrowLeft size={16} className="sm:w-5 sm:h-5" />}
            >
              <span className="hidden sm:inline">Вернуться в дашборд</span>
              <span className="sm:hidden">Дашборд</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-start">
            <img src={cdekLogo} alt="CDEK" className="h-5 sm:h-6" />
            <div className="flex-1 sm:flex-none">
              <h1 className="text-gray-900 text-base sm:text-xl">AI-Ассистент</h1>
              <p className="text-xs sm:text-sm text-gray-500">Персональные рекомендации</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6" style={{ paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-3 sm:space-y-4">
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
                    className={`inline-block px-4 py-3 rounded-2xl text-[13px] sm:text-base ${
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
      <div className="bg-white border-t border-gray-200 px-3 sm:px-4 py-3 sm:py-4 flex-shrink-0 sticky bottom-0 left-0 right-0">
        <div className="max-w-4xl mx-auto flex gap-2">
          <InputText
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите сообщение..."
            className="flex-1 h-10 sm:h-11 rounded-full"
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0"
            rounded
            severity="success"
            icon={<Send size={16} className="sm:w-[18px] sm:h-[18px]" />}
          />
        </div>
      </div>
    </div>
  );
}
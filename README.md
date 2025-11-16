<!-- PROJECT LOGO -->
<br />
<p align="center">
  <!-- <img src="src/preview.jpg" width=200> -->
  <h3 align="center">ИИ-ассистент для работы с эмоциональным выгоранием</h3>
</p>

<p align="center">
  <a href=""><b>Алексей Спиркин</b></a> •
  <a href=""><b>Виктор Порошков</b></a> •
  <a href=""><b>Роман Томилов</b></a> •
  <br />
  <a href=""><b>Яна Дементьева</b></a> •
  <a href=""><b>Арсений Семенов</b></a>
  <br />
  Институт интеллектуальной робототехники
  <br />
  Новосибирский государственный университет
</p>

## О проекте

ИИ-ассистент, позволяющий проводить мониторинг эмоционального состояния сотрудников:

* Тестирование сотрудников по методике MBI
* Выполнение еженедельных заданий в геймифицированном формате
* Получение персональных рекомендаций
* Мониторинг состояния сотрудников для HR

<<<<<<< HEAD
  Run `npm run dev` to start the development server.
  
  To start the Telegram bot, in a separate terminal:
  ```bash
  cd bot
  npm start
  ```
  
  ## Hugging Face Integration
  
  The chatbot now uses Hugging Face's OpenAI-compatible API to generate AI-powered responses.
  To enable this feature, you need to:
  1. Get a free API key from [Hugging Face](https://huggingface.co/join)
  2. Set it in the `server/.env` file as `HF_TOKEN=your_actual_api_key_here`
  3. Restart the server
  
  When properly configured, the chatbot will generate personalized responses based on the user's
  test results and questions. If the API is unavailable or no token is provided,
  the chatbot will automatically fall back to predefined responses based on keywords.
  This ensures the chatbot always works, even without an API key.
  
  ## Telegram Bot
  
  The project includes a Telegram bot that integrates with the main application.
  The bot provides:
  - Welcome message with mini-app integration
  - Periodic test reminders
  - Motivational messages
  - Burnout prevention tips
  - User data management with SQLite database
  - Group chat support
  
  To run the Telegram bot:
  1. Create a new bot with BotFather on Telegram
  2. Copy the bot token
  3. Create a `.env` file in the `bot` directory with your bot token:
     ```
     TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
     PORT=3001
     WEB_APP_URL=http://localhost:3000/emotional-burnout-detector.io/
     ```
  4. Install dependencies:
     ```bash
     cd bot
     npm install
     ```
  5. Start the bot:
     ```bash
     npm start
     ```
  
  The bot connects to the same database used by the main application and shares user data with it.
  
=======
## Установка и запуск (вручную)

1. Склонируйте репозиторий.

```
git clone https://git.truetecharena.ru/sistema-xak-novosibirsk-22/truetecharena1763103693-team-19929/repozitorij-dlya-raboty-334.git
cd repozitorij-dlya-raboty-334
```

### Frontend

2. Перейдите в папку с файлами серверной части и установите зависимости.

```
cd server
npm install
```

3. Запустите проект.

```
npm run dev
```

### Backend

2. Перейдите в папку с файлами серверной части и установите зависимости.

```
cd server
npm install
```

3. Инициализируйте БД и загрузите в нее стартовые значения.

```
npm run init-db
npm run migrate
```

4. Запустите проект.

```
npm run dev
```

## Установка и запуск (Docker)

1. Склонируйте репозиторий.

```
git clone https://git.truetecharena.ru/sistema-xak-novosibirsk-22/truetecharena1763103693-team-19929/repozitorij-dlya-raboty-334.git
cd repozitorij-dlya-raboty-334
```

2. Укажите все необходимые параметры в файле `docker-compose.yml`.
3. Запустите `docker compose`.

```
docker compose up -d
```
>>>>>>> d3cca690 (Ensure cdek-ui-kit installment. Add docker configs. Update README.)

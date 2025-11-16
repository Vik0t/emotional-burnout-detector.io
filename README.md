
  # AI Burnout Detection Tool

  This is a code bundle for AI Burnout Detection Tool. The original project is available at https://www.figma.com/design/5VeNcEx0C9tZJBTC6Us8nW/AI-Burnout-Detection-Tool.

  ## Running the code

  Run `npm i` to install the dependencies.

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
  
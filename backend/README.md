# Telegram Bot for Emotional Burnout Detection

This is the backend service for the Telegram bot that integrates with the emotional burnout detection application.

## Features

- Welcome message with mini-app integration
- Periodic test reminders
- Motivational messages
- Burnout prevention tips
- User data management
- API endpoints for frontend integration
- Group chat support

## Setup

1. Create a new bot with BotFather on Telegram
2. Copy the bot token
3. Create a `.env` file in this directory with your bot token:
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   PORT=3001
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the bot:
   ```bash
   npm start
   ```
   
   Or for development:
   ```bash
   npm run dev
   ```

## Environment Variables

- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token from BotFather
- `PORT`: Port to run the server on (default: 3001)

## API Endpoints

- `POST /api/test-completed`: Register user test completion
- `GET /api/user-stats/:chatId`: Get user statistics
- `GET /health`: Health check endpoint

## Commands

- `/start`: Start the bot and show welcome message
- `/test`: Open the test in mini-app
- `/stats`: View statistics (for HR)
- `/help`: Show help message

## Group Chat Support

The bot supports both private chats and group chats. In group chats, users are directed to use the bot in private messages for full functionality, as web app buttons are only supported in private chats.

## Integration with Frontend

The bot communicates with the frontend application through API endpoints. When a user completes a test in the frontend, the application should call the `/api/test-completed` endpoint to register the completion and schedule the next reminder.

## Notification System

The bot sends several types of notifications:
- Test reminders (every 30 days by default)
- Motivational messages (every 3 days)
- Burnout prevention tips (every 5 days)

All notifications are only sent in private chats to avoid spamming group chats.

  # AI Burnout Detection Tool

  This is a code bundle for AI Burnout Detection Tool. The original project is available at https://www.figma.com/design/5VeNcEx0C9tZJBTC6Us8nW/AI-Burnout-Detection-Tool.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
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
  
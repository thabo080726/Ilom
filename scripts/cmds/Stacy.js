const axios = require('axios');
const rateLimit = new Map();
const conversationHistory = new Map();

module.exports = {
  config: {
    name: "Stacy",
    version: "1.0",
    author: "Raphael",
    countDown: 5,
    role: 0,
    shortDescription: "AI-powered chatbot",
    longDescription: "An AI-powered chatbot with various features including conversation, image generation, and weather information.",
    category: "ai",
    guide: {
      en: "{p}Stacy [message/command]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const input = args.join(" ");

    if (!input) {
      return api.sendMessage("Please provide a message or command.", threadID, messageID);
    }

    await this.run({ api, args, event });
  },

  run: async function ({ api, args, event }) {
    const { threadID, messageID, senderID } = event;
    const input = args.join(' ').trim();

    if (rateLimit.has(senderID) && (Date.now() - rateLimit.get(senderID)) < 2000) {
      return api.sendMessage("Please wait a moment before sending another request.", threadID, messageID);
    }
    rateLimit.set(senderID, Date.now());

    const command = input.toLowerCase().split(' ')[0];

    switch (command) {
      case 'clear':
        try {
          await this.sendRequest('/history', { cmd: 'yes', chat_id: senderID });
          conversationHistory.delete(senderID);
          api.sendMessage('Successfully cleared chat history.', threadID, messageID);
        } catch (error) {
          api.sendMessage(error.message, threadID, messageID);
        }
        break;

      case 'help':
        const helpMessage = `
          **Chatbot Command Help**
          - **chatbot [question]**: Ask the chatbot a question.
          - **chatbot clear**: Clear chat history.
          - **chatbot help**: Show this help message.
          - **chatbot history**: Show conversation history.
          - **chatbot image [prompt]**: Generate an image based on the prompt.
          - **chatbot weather [location]**: Get current weather information.
          - **chatbot forecast [location]**: Get extended weather forecast.
        `;
        api.sendMessage(helpMessage, threadID, messageID);
        break;

      case 'history':
        const history = conversationHistory.get(senderID) || [];
        const historyMessage = history.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
        api.sendMessage(historyMessage || 'No conversation history available.', threadID, messageID);
        break;

      case 'image':
        const imagePrompt = args.slice(1).join(' ');
        if (!imagePrompt) {
          return api.sendMessage("Please provide a prompt for image generation.", threadID, messageID);
        }
        try {
          const imageUrl = await this.generateImage(imagePrompt);
          api.sendMessage({ attachment: await global.utils.getStreamFromURL(imageUrl) }, threadID, messageID);
        } catch (error) {
          api.sendMessage(error.message, threadID, messageID);
        }
        break;

      case 'weather':
        const location = args.slice(1).join(' ');
        if (!location) {
          return api.sendMessage("Please provide a location for weather information.", threadID, messageID);
        }
        try {
          const weatherInfo = await this.getWeather(location);
          api.sendMessage(weatherInfo

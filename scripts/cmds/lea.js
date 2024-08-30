const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = 'AIzaSyDexXPq3VSDwWSfzfnONTEKStfs42sTRIY';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const MAX_HISTORY = 10;
const AUTHORIZED_AUTHOR = 'Raphael Scholar';
const USER_DATA_FILE = path.join(__dirname, 'userData.json');
const CONVERSATION_EXPIRY = 30 * 60 * 1000; // 30 minutes

let userData = {};
if (fs.existsSync(USER_DATA_FILE)) {
  userData = JSON.parse(fs.readFileSync(USER_DATA_FILE, 'utf8'));
}

async function geminiAPI(prompt, userId, retries = 0) {
  try {
    const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      contents: [{ parts: [{ text: prompt }] }]
    }, {
      params: { key: GEMINI_API_KEY },
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error in geminiAPI:', error);
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return geminiAPI(prompt, userId, retries + 1);
    }
    return "I apologize, but I'm experiencing technical difficulties at the moment. Please try again later.";
  }
}

async function getAIResponse(input, userId) {
  const userProfile = getUserProfile(userId);
  const context = userProfile.history.join('\n');
  const fullPrompt = `${context}\nUser: ${input}\nAI:`;
  const response = await geminiAPI(fullPrompt, userId);
  addUserMessageToHistory(userId, `User: ${input}\nAI: ${response}`);
  return response;
}

function saveUserData() {
  fs.writeFileSync(USER_DATA_FILE, JSON.stringify(userData, null, 2));
}

function getUserProfile(userId) {
  if (!userData[userId]) {
    userData[userId] = { preferences: {}, history: [], lastInteraction: Date.now() };
  }
  return userData[userId];
}

function addUserMessageToHistory(userId, message) {
  const profile = getUserProfile(userId);
  profile.history.push(message);
  if (profile.history.length > MAX_HISTORY) {
    profile.history.shift();
  }
  profile.lastInteraction = Date.now();
  saveUserData();
}

function getGreetingMessage(userId) {
  const hours = new Date().getHours();
  let greeting = hours < 12 ? "Good morning!" : hours < 18 ? "Good afternoon!" : "Good evening!";
  const profile = getUserProfile(userId);
  greeting += profile.preferences.name ? ` 😊 I'm Lea, your AI assistant created by Raphael Scholar. How can I help you today, ${profile.preferences.name}?` : " 😊 I'm Lea, your AI assistant created by Raphael Scholar. How can I help you today?";
  return greeting;
}

function clearExpiredConversations() {
  const now = Date.now();
  for (const userId in userData) {
    if (now - userData[userId].lastInteraction > CONVERSATION_EXPIRY) {
      userData[userId].history = [];
    }
  }
  saveUserData();
}

setInterval(clearExpiredConversations, 60 * 60 * 1000); // Run every hour

module.exports = {
  config: {
    name: 'lea',
    description: "Interact with Lea, an AI assistant powered by Gemini",
    usage: "{prefix}lea <message>",
    cooldown: 3,
    permissions: [0, 1, 2],
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, senderID, messageID } = event;
    const input = args.join(' ');

    if (!input) {
      return message.reply(getGreetingMessage(senderID));
    }

    if (input.toLowerCase() === 'clear history') {
      clearUserHistory(senderID);
      return message.reply("Your conversation history has been cleared.");
    }

    if (input.toLowerCase().startsWith('set name')) {
      const name = input.slice(9).trim();
      setUserPreference(senderID, 'name', name);
      return message.reply(`Great! I'll remember your name as ${name}.`);
    }

    const aiResponse = await getAIResponse(input, senderID);
    return message.reply(aiResponse);
  },

  onChat: async function ({ api, event, message }) {
    const { threadID, senderID, messageID, body } = event;

    if (body.toLowerCase().startsWith('lea')) {
      const input = body.slice(3).trim();
      if (!input) {
        return message.reply(getGreetingMessage(senderID));
      }
      const aiResponse = await getAIResponse(input, senderID);
      return message.reply(aiResponse);
    }
  }
};

function clearUserHistory(userId) {
  const profile = getUserProfile(userId);
  profile.history = [];
  saveUserData();
}

function setUserPreference(userId, key, value) {
  const profile = getUserProfile(userId);
  profile.preferences[key] = value;
  saveUserData();
}

function generatePersonalizedResponse(userId, response) {
  const profile = getUserProfile(userId);
  if (profile.preferences.name) {
    response = response.replace(/\b(you|user)\b/gi, profile.preferences.name);
  }
  return response;
}

async function getAIResponse(input, userId) {
  const userProfile = getUserProfile(userId);
  const context = userProfile.history.join('\n');
  const fullPrompt = `${context}\nUser: ${input}\nAI:`;
  let response = await geminiAPI(fullPrompt, userId);
  response = generatePersonalizedResponse(userId, response);
  addUserMessageToHistory(userId, `User: ${input}\nAI: ${response}`);
  return response;
}

function isAuthorized(userId) {
  // Implement your authorization logic here
  return true; // For now, everyone is authorized
}

async function geminiAPI(prompt, userId, retries = 0) {
  if (!isAuthorized(userId)) {
    return "I'm sorry, but you're not authorized to use this service.";
  }

  try {
    const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
      ]
    }, {
      params: { key: GEMINI_API_KEY },
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error in geminiAPI:', error);
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return geminiAPI(prompt, userId, retries + 1);
    }
    return "I apologize, but I'm experiencing technical difficulties at the moment. Please try again later.";
  }
}

// New feature: Sentiment analysis
async function analyzeSentiment(text) {
  // This is a placeholder. In a real implementation, you'd use a sentiment analysis API or library
  const sentiment = text.toLowerCase().includes('happy') ? 'positive' : 
                    text.toLowerCase().includes('sad') ? 'negative' : 'neutral';
  return sentiment;
}

// New feature: Language detection
async function detectLanguage(text) {
  // This is a placeholder. In a real implementation, you'd use a language detection API or library
  return 'en'; // Assuming English for now
}

// Enhanced getAIResponse function
async function getAIResponse(input, userId) {
  const userProfile = getUserProfile(userId);
  const context = userProfile.history.join('\n');
  const sentiment = await analyzeSentiment(input);
  const language = await detectLanguage(input);
  
  const fullPrompt = `
    Context: ${context}
    User Input: ${input}
    Detected Sentiment: ${sentiment}
    Detected Language: ${language}
    
    Please provide a response that takes into account the user's sentiment and language.
    AI:`;
  
  let response = await geminiAPI(fullPrompt, userId);
  response = generatePersonalizedResponse(userId, response);
  addUserMessageToHistory(userId, `User: ${input}\nAI: ${response}`);
  return response;
}

// New feature: Command handler
function handleCommand(command, args, userId) {
  switch (command) {
    case 'clear':
      clearUserHistory(userId);
      return "Your conversation history has been cleared.";
    case 'setname':
      const name = args.join(' ');
      setUserPreference(userId, 'name', name);
      return `Great! I'll remember your name as ${name}.`;
    case 'help':
      return `
        Available commands:
        - clear: Clear your conversation history
        - setname <name>: Set your name
        - help: Show this help message
      `;
    default:
      return null;
  }
}

// Enhanced onStart function
onStart: async function ({ api, event, args, message }) {
  const { threadID, senderID, messageID } = event;
  const input = args.join(' ');

  if (!input) {
    return message.reply(getGreetingMessage(senderID));
  }

  if (input.startsWith('!')) {
    const [command, ...commandArgs] = input.slice(1).split(' ');
    const result = handleCommand(command, commandArgs, senderID);
    if (result) {
      return message.reply(result);
    }
  }

  const aiResponse = await getAIResponse(input, senderID);
  return message.reply(aiResponse);
},

// New feature: Periodic tips
function sendPeriodicTip(api, threadID) {
  const tips = [
    "Did you know you can clear your conversation history by typing '!clear'?",
    "You can set your name using the '!setname' command for a more personalized experience!",
    "Type '!help' to see all available commands.",
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  api.sendMessage(randomTip, threadID);
}

setInterval(() => {
  for (const threadID in userData) {
    sendPeriodicTip(api, threadID);
  }
}, 24 * 60 * 60 * 1000); // Send tips every 24 hours

// New feature: User feedback
function handleUserFeedback(feedback, userId) {
  const profile = getUserProfile(userId);
  if (!profile.feedback) {
    profile.feedback = [];
  }
  profile.feedback.push(feedback);
  saveUserData();
  return "Thank you for your feedback! We appreciate your input to help improve our service.";
}

// New feature: Conversation summarization
async function summarizeConversation(userId) {
  const profile = getUserProfile(userId);
  const conversation = profile.history.join('\n');
  const summary = await geminiAPI(`Please summarize the following conversation:\n${conversation}`, userId);
  return summary;
}

// Enhanced onStart function
onStart: async function ({ api, event, args, message }) {
  const { threadID, senderID, messageID } = event;
  const input = args.join(' ');

  if (!input) {
    return message.reply(getGreetingMessage(senderID));
  }

  if (input.startsWith('!')) {
    const [command, ...commandArgs] = input.slice(1).split(' ');
    switch (command) {
      case 'clear':
      case 'setname':
      case 'help':
        const result = handleCommand(command, commandArgs, senderID);
        return message.reply(result);
      case 'feedback':
        const feedback = commandArgs.join(' ');
        return message.reply(handleUserFeedback(feedback, senderID));
      case 'summary':
        const summary = await summarizeConversation(senderID);
        return message.reply(`Here's a summary of our conversation:\n${summary}`);
      default:
        return message.reply("Unknown command. Type '!help' for a list of available commands.");
    }
  }

  const aiResponse = await getAIResponse(input, senderID);
  return message.reply(aiResponse);
},

// New feature: Error handling and logging
function logError(error, context) {
  console.error(`Error in ${context}:`, error);
  // In a production environment, you might want to log this to a file or external service
}

// Enhance geminiAPI function with better error handling
async function geminiAPI(prompt, userId, retries = 0) {
  if (!isAuthorized(userId)) {
    return "I'm sorry, but you're not authorized to use this service.";
  }

  try {
    const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
      ]
    }, {
      params: { key: GEMINI_API_KEY },
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    logError(error, 'geminiAPI');
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return geminiAPI(prompt, userId, retries + 1);
    }
    return "I apologize, but I'm experiencing technical difficulties at the moment. Please try again later.";
  }
}

// New feature: User engagement tracking
function trackUserEngagement(userId, action) {
  const profile = getUserProfile(userId);
  if (!profile.engagement) {
    profile.engagement = { interactions: 0, lastActive: null };
  }
  profile.engagement.interactions++;
  profile.engagement.lastActive = Date.now();
  saveUserData();
}

// New feature: Personalized recommendations
async function getPersonalizedRecommendation(userId) {
  const profile = getUserProfile(userId);
  const interests = profile.preferences.interests || [];
  const prompt = `Based on the user's interests: ${interests.join(', ')}, please provide a personalized recommendation for an activity or topic they might enjoy.`;
  return await geminiAPI(prompt, userId);
}

// Enhanced onStart function with new features
onStart: async function ({ api, event, args, message }) {
  const { threadID, senderID, messageID } = event;
  const input = args.join(' ');

  trackUserEngagement(senderID, 'command');

  if (!input) {
    return message.reply(getGreetingMessage(senderID));
  }

  if (input.startsWith('!')) {
    const [command, ...commandArgs] = input.slice(1).split(' ');
    switch (command) {
      case 'clear':
      case 'setname':
      case 'help':
        const result = handleCommand(command, commandArgs, senderID);
        return message.reply(result);
      case 'feedback':
        const feedback = commandArgs.join(' ');
        return message.reply(handleUserFeedback(feedback, senderID));
      case 'summary':
        const summary = await summarizeConversation(senderID);
        return message.reply(`Here's a summary of our conversation:\n${summary}`);
      case 'recommend':
        const recommendation = await getPersonalizedRecommendation(senderID);
        return message.reply(`Here's a personalized recommendation for you:\n${recommendation}`);
      default:
        return message.reply("Unknown command. Type '!help' for a list of available commands.");
    }
  }

  const aiResponse = await getAIResponse(input, senderID);
  return message.reply(aiResponse);
},

// New feature: Conversation context management
function manageConversationContext(userId, input, response) {
  const profile = getUserProfile(userId);
  const context = {
    input,
    response,
    timestamp: Date.now()
  };
  if (!profile.contextHistory) {
    profile.contextHistory = [];
  }
  profile.contextHistory.push(context);
  if (profile.contextHistory.length > 5) { // Keep last 5 interactions for context
    profile.contextHistory.shift();
  }
  saveUserData();
}

// Enhanced getAIResponse function with context management
async function getAIResponse(input, userId) {
  const userProfile = getUserProfile(userId);
  const context = userProfile.contextHistory ? userProfile.contextHistory.map(c => `User: ${c.input}\nAI: ${c.response}`).join('\n') : '';
  const sentiment = await analyzeSentiment(input);
  const language = await detectLanguage(input);

const fullPrompt = `
  Context: ${context}
  User Input: ${input}
  Detected Sentiment: ${sentiment}
  Detected Language: ${language}
  
  Please provide a response that takes into account the user's sentiment, language, and previous context.
  AI:`;

let response = await geminiAPI(fullPrompt, userId);
response = generatePersonalizedResponse(userId, response);
manageConversationContext(userId, input, response);
return response;
}

// New feature: Multi-language support
const translations = {
  en: {
    greeting: "Hello! How can I help you today?",
    farewell: "Goodbye! Have a great day!",
    // Add more translations as needed
  },
  es: {
    greeting: "¡Hola! ¿Cómo puedo ayudarte hoy?",
    farewell: "¡Adiós! ¡Que tengas un buen día!",
    // Add more translations as needed
  },
  // Add more languages as needed
};

function getTranslation(key, language) {
  return translations[language]?.[key] || translations.en[key];
}

// New feature: User preferences
function setUserLanguagePreference(userId, language) {
  const profile = getUserProfile(userId);
  profile.preferences.language = language;
  saveUserData();
}

// Enhanced onStart function with multi-language support and more features
onStart: async function ({ api, event, args, message }) {
  const { threadID, senderID, messageID } = event;
  const input = args.join(' ');

  trackUserEngagement(senderID, 'command');

  const userProfile = getUserProfile(senderID);
  const userLanguage = userProfile.preferences.language || 'en';

  if (!input) {
    return message.reply(getTranslation('greeting', userLanguage));
  }

  if (input.startsWith('!')) {
    const [command, ...commandArgs] = input.slice(1).split(' ');
    switch (command) {
      case 'clear':
      case 'setname':
      case 'help':
        const result = handleCommand(command, commandArgs, senderID);
        return message.reply(result);
      case 'feedback':
        const feedback = commandArgs.join(' ');
        return message.reply(handleUserFeedback(feedback, senderID));
      case 'summary':
        const summary = await summarizeConversation(senderID);
        return message.reply(`Here's a summary of our conversation:\n${summary}`);
      case 'recommend':
        const recommendation = await getPersonalizedRecommendation(senderID);
        return message.reply(`Here's a personalized recommendation for you:\n${recommendation}`);
      case 'setlanguage':
        const newLanguage = commandArgs[0];
        setUserLanguagePreference(senderID, newLanguage);
        return message.reply(`Language preference set to ${newLanguage}`);
      default:
        return message.reply("Unknown command. Type '!help' for a list of available commands.");
    }
  }

  const aiResponse = await getAIResponse(input, senderID);
  return message.reply(aiResponse);
},

// New feature: Conversation analytics
function analyzeConversation(userId) {
  const profile = getUserProfile(userId);
  const analytics = {
    totalInteractions: profile.engagement?.interactions || 0,
    averageResponseLength: 0,
    mostCommonTopics: [],
    sentimentTrend: ''
  };

  if (profile.contextHistory) {
    const responseLengths = profile.contextHistory.map(c => c.response.length);
    analytics.averageResponseLength = responseLengths.reduce((a, b) => a + b, 0) / responseLengths.length;

    // This is a simplified topic extraction. In a real scenario, you'd use NLP

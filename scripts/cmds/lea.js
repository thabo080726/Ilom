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
      params: { key:

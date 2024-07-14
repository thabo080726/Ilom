const axios = require('axios');

async function fetchFromAI(url, params) {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getAIResponse(input, userId, messageID) {
  const services = [
    { url: 'https://soyeon-api.onrender.com', params: { prompt: input, uid: userId } },
    { url: 'https://openaikey-x20f.onrender.com/api', params: { prompt: input } },
    { url: 'http://fi1.bot-hosting.net:6518/gpt', params: { query: input } },
    { url: 'https://ai-chat-gpt-4-lite.onrender.com/api/hercai', params: { question: input } }
  ];

  let response = "༄༆heis brõkêñ 💙🎧🖤 ༆༄🌹🥀 \nHi cutie 🥺 am heis broken bot ask me anything I'm willing to reply and gives you better answers";
  let currentIndex = 0;

  for (let i = 0; i < services.length; i++) {
    const service = services[currentIndex];
    const data = await fetchFromAI(service.url, service.params);
    if (data && (data.gpt4 || data.reply || data.response)) {
      response = data.gpt4 || data.reply || data.response;
      break;
    }
    currentIndex = (currentIndex + 1) % services.length; // Move to the next service in the cycle
  }

  return { response, messageID };
}
const prefixes = ['ai', 'amebo'];

module.exports = {
  config: {
    name: 'ai',
    author: 'Arn',
    role: 0,
    category: 'ai',
    shortDescription: 'ai to ask anything',
  },
  onStart: async function ({ api, event, args }) {
    const input = args.join(' ').trim();
    if (!input) {
      api.sendMessage(`༄༆heis brõkêñ 💙🎧🖤༆༄🌹🥀\n━━━━━━━━━━━━━━━━━\nHi cutie 🥺 am hêîs brõkêñ 💙🎧🖤 ask me anything I'm willing to reply and gives you better answers .\n━━━━━━━━━━━━━━━━━\n🌹💜💙🎧`, event.threadID, event.messageID);
      return;
    }

    const { response, messageID } = await getAIResponse(input, event.senderID, event.messageID);
    api.sendMessage(`༄༆heis brõkêñ 💙🎧🖤༆༄🌹🥀\n━━━━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━━━━\n`, event.threadID, messageID);
  },
  onChat: async function ({ event, message, args }) {
    const messageContent = event.body.trim().toLowerCase();
    if (prefixes.some(prefix => messageContent.startsWith(prefix))){
      const input = args.join(" ").trim();
      const { response, messageID } = await getAIResponse(input, event.senderID, message.messageID);
      message.reply(`༄༆heis broken 💙🎧🖤༆༄🌹🥀\n━━━━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━━━━\n`, messageID);
    }
  }
};

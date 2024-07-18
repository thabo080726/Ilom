const axios = require('axios');

module.exports = {
  config: {
    name: 'sim',
    version: '1.0.1',
    author: 'ArYAN',
    role: 0,
    category: 'ai',
    longDescription: {
      en: 'Chat with SimiSimi ( added onReply ).',
    },
    guide: {
      en: '',
    },
  },
  onStart: async ({ api, event, args }) => {
    try {
      const prompt = args.join(' ');
      const response = await axios.get(`https://global-sprak.onrender.com/api/sim?chat=${encodeURIComponent(prompt)}&lang=en`);

      if (response.status !== 200 || !response.data) throw new Error('Invalid or missing response from API');

      const answer = response.data.chat;
      api.sendMessage(answer, event.threadID, (err, info) => {
        if (err) return console.error(err);
        global.GoatBot.onReply.set(info.messageID, { commandName: module.exports.config.name, messageID: info.messageID, author: event.senderID });
      });
    } catch (error) {
      console.error(error);
      api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID);
    }
  },

  onReply: async ({ api, event, Reply }) => {
    const { author } = Reply;

    if (event.senderID !== author) return;

    try {
      const userReply = event.body.trim();
      const response = await axios.get(`https://global-sprak.onrender.com/api/sim?chat=${encodeURIComponent(userReply)}&lang=en`);

      if (response.status !== 200 || !response.data) throw new Error('Invalid or missing response from API');

      const followUpAnswer = response.data.chat;
      api.sendMessage(followUpAnswer, event.threadID, (err, info) => {
        if (err) return console.error(err);
        global.GoatBot.onReply.set(info.messageID, { commandName: module.exports.config.name, messageID: info.messageID, author: event.senderID });
      });
    } catch (error) {
      console.error(error);
      api.sendMessage("🚧 | An error occurred while processing your reply.", event.threadID);
    }
  }
};

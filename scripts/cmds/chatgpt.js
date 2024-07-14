const axios = require('axios');



module.exports = {

  config: {

    name: 'chatgpt',

    version: '1.0.1',

    author: 'ArYAN',

    role: 0,

    category: 'ai',

    longDescription: {

      en: 'This is a large AI language model trained by OpenAI, designed to assist with a wide range of tasks.',

    },

    guide: {

      en: '',

    },

  },

  onStart: async ({ api, event, args }) => {

    try {

      const prompt = args.join(' ');

      const response = await axios.get(`https://global-sprak.onrender.com/api/chatgpt?prompt=${encodeURIComponent(prompt)}`);



      if (response.status !== 200 || !response.data) throw new Error('Invalid or missing response from API');



      const answer = response.data.answer;

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

      const response = await axios.get(`https://global-sprak.onrender.com/api/chatgpt?prompt=${encodeURIComponent(userReply)}`);



      if (response.status !== 200 || !response.data) throw new Error('Invalid or missing response from API');



      const followUpAnswer = response.data.answer;

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

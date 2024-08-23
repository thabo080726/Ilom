const axios = require('axios');

module.exports = {
  config: {
    name: "triviaquiz",
    version: "1.0",
    author: "Raphael ilom",
    countDown: 5,
    role: 0,
    shortDescription: "Start a trivia quiz game.",
    longDescription: {
      en: "This command allows you to start a trivia quiz game."
    },
    category: "Fun",
    guide: {
      en: "{prefix}triviaquiz"
    }
  },

  onStart: async function({ api, event }) {
    try {
      const response = await axios.get('https://opentdb.com/api.php?amount=1&category=17');
      const question = response.data.results[0];
      const message = `Question: ${question.question}\nA: ${question.correct_answer}\nB: ${question.incorrect_answers[0]}\nC: ${question.incorrect_answers[1]}\nD: ${question.incorrect_answers[2]}`;
      api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
      console.error(`Error fetching trivia question: ${error.message}`);
      api.sendMessage("An error occurred while fetching the trivia question.", event.threadID, event.messageID);
    }
  }
};

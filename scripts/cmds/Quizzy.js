const axios = require('axios');

const questions = [
  {
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    answer: "Paris"
  },
  {
    question: "Who wrote 'To Kill a Mockingbird'?",
    options: ["Harper Lee", "Mark Twain", "Ernest Hemingway", "F. Scott Fitzgerald"],
    answer: "Harper Lee"
  },
  // Add more questions as needed
];

let currentQuestionIndex = 0;

async function sendQuestion(sender, sendMessage) {
  if (currentQuestionIndex < questions.length) {
    const question = questions[currentQuestionIndex];
    const options = question.options.map((option, index) => ({
      type: "postback",
      title: option,
      payload: `ANSWER_${index}`
    }));

    await sendMessage(sender, {
      text: question.question,
      quick_replies: options
    });
  } else {
    await sendMessage(sender, { text: "Quiz over! Thanks for playing." });
    currentQuestionIndex = 0; // Reset for next game
  }
}

module.exports = { sendQuestion, questions };

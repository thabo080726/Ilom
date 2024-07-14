 const axios = require('axios');



module.exports = {

  config: {

    name: "quiz",

    aliases: [],

    version: "2.0",

    author: "Jun",

    countDown: 2,

    role: 0,

    shortDescription: {

      vi: "",

      en: "Game to earn money and enhance your IQ, compete with other players"

    },

    longDescription: {

      vi: "",

      en: ""

    },

    category: "games",

    guide: {

      en: "{pn} <category>\n{pn} rank\n- View your rank\n{pn} leaderboard\n- View top players\nTo submit a bug report or feedback, just type:\nquizr <your message>\n"

    },

    envConfig: {

      reward: 10000 // Default reward for correct answers

    }

  },

  langs: {

    en: {

      reply: "Please reply your answer with the letter only\n=========================",

      correct: "🎉 Correct! You won $10000!",

      wrong: "😔 Wrong answer! The correct answer is: "

    }

  },

  onStart: async function ({ message, event, usersData, commandName, getLang, args, api }) {

    const category = args[0] ? args[0].toLowerCase() : '';



    if (!['english', 'math', 'physics', 'filipino', 'biology', 'chemistry', 'history', 'philosophy', 'random', 'science', 'anime', 'country', 'torf'].includes(category)) {

      const { getPrefix } = global.utils;

      const p = getPrefix(event.threadID);

      message.reply(`Please add a valid category\nHere's the list of categories:\n==============\nenglish\nmath\nphysics\nchemistry\nhistory\nphilosophy\nrandom\nfilipino\nscience\n\nanime, country\n-with pic\n\ntorf <true or false>\n-react only to answer\n==============\nExample usage: ${p}${commandName} english`);

      return;

    }



    try {

      let response;

      if (category === 'torf') {

        response = await axios.get(`https://quiz-v1.onrender.com/api/quiz?category=torf`);

        const data = response.data;



        const quizz = {

          commandName,

          author: event.senderID,

          question: data.question,

          answer: data.answer === "true" ? true : false,

          messageID: null, // Placeholder for message ID

          reacted: false // Flag to track reaction

        };



        const info = await message.reply(`${data.question}\n\n😆: true 😮: false`);

        quizz.messageID = info.messageID;

        global.GoatBot.onReaction.set(info.messageID, quizz);



        setTimeout(() => {

          api.unsendMessage(info.messageID);

          global.GoatBot.onReaction.delete(info.messageID);

        }, 20000); // Message deletion timeout

      } else if (category === 'anime') {

        response = await axios.get(`https://quiz-v1.onrender.com/api/quiz?category=anime`);

        const Qdata = response.data;



        if (!Qdata || !Qdata.photoUrl || !Qdata.animeName) {

          return;

        }



        const imageUrl = Qdata.photoUrl;

        const characterName = Qdata.animeName;



        message.reply({

          attachment: await global.utils.getStreamFromURL(imageUrl),

          body: `Please reply with the character's name from the anime.`

        }, async (err, info) => {

          global.GoatBot.onReply.set(info.messageID, {

            commandName,

            messageID: info.messageID,

            author: event.senderID,

            answer: characterName,

            answered: false,

            category,

          });



          setTimeout(() => {

            const reply = global.GoatBot.onReply.get(info.messageID);

            if (!reply.answered) {

              message.unsend(info.messageID);

              global.GoatBot.onReply.delete(info.messageID);

            }

          }, 30000); // Adjust timeout as needed

        });

      } else {

        response = await axios.get(`https://quiz-v1.onrender.com/api/quiz?category=${category}`);

        const Qdata = response.data;



        if (!Qdata || !Qdata.answer) {

          return;

        }



        const { question, options, answer } = Qdata;



        // Format options with letters (A, B, C, D)

        const formattedOptions = options.map((opt, index) => `${String.fromCharCode(65 + index)}. ${opt}`).join('\n');



        message.reply({ body: `${getLang('reply')}\n\n${question}\n\n${formattedOptions}` }, async (err, info) => {

          global.GoatBot.onReply.set(info.messageID, {

            commandName,

            messageID: info.messageID,

            author: event.senderID,

            answer: answer,

            options: options,

            answered: false,

            category,

          });



          setTimeout(() => {

            const reply = global.GoatBot.onReply.get(info.messageID);

            if (!reply.answered) {

              message.unsend(info.messageID);

              global.GoatBot.onReply.delete(info.messageID);

            }

          }, 100000); // Adjust timeout as needed

        });

      }



    } catch (error) {

      message.reply(`Sorry, there was an error getting questions for the ${category} category. Please try again later.`);

      console.error('Error fetching quiz data:', error);

    }

  },



  onReply: async function ({ message, Reply, event, api, usersData, envConfig, getLang }) {

    const { author, messageID, answer, options, answered, category } = Reply;



    // Check if the reply is from the sender and hasn't been answered yet

    if (answered || author !== event.senderID) {

      message.reply("⚠ You are not the player of this question!");

      return;

    }



    const reward = envConfig?.reward || 10000; // Default reward, safely access reward



    // Check if the provided answer matches any of the choices or exact answer for anime category

    const correctIndex = options.findIndex((opt, index) => formatText(event.body) === formatText(opt));



    if ((correctIndex !== -1 && !answered) || (formatText(event.body) === formatText(answer))) {

      global.GoatBot.onReply.delete(messageID);

      message.unsend(event.messageReply.messageID);



      // Update user's money

      const userData = await usersData.get(event.senderID);

      userData.money += reward;

      await usersData.set(event.senderID, userData);



      // Send correct answer message

      message.reply(getLang('correct'));

    } else {

      // Send wrong answer message

      message.reply(`${getLang('wrong')} ${answer}`);



      // Mark question as answered to prevent multiple responses

      global.GoatBot.onReply.set(messageID, { ...Reply, answered: true });

    }

  },



  onReaction: async function ({ message, event, Reaction, api, usersData }) {

    const { author, question, answer, messageID, reacted } = Reaction;



    // Ensure the reaction is from the author and hasn't been reacted to yet

    if (event.userID !== author || reacted) return;



    const reward = 10000; // Default reward for correct answer in torf category



    // Determine if the reaction is correct based on the emoji

    const isCorrect = (event.reaction === '😆' && answer === true) || (event.reaction === '😮' && answer === false);



    if (isCorrect) {

      global.GoatBot.onReaction.delete(messageID);



      // Update user's money

      const userData = await usersData.get(event.userID);

      userData.money += reward;

      await usersData.set(event.userID, userData);



      // Send correct answer message

      api.sendMessage(`🎉 Correct! You won $10000!`, event.threadID);

    } else {

      // Send wrong answer message

      api.sendMessage(`😔 Wrong answer! The correct answer is: ${answer}`, event.threadID);



      // Mark question as reacted

      global.GoatBot.onReaction.set(messageID, { ...Reaction, reacted: true });

    }

  }

};



function formatText(text) {

  return text.trim().toLowerCase(); // Format text for comparison (lowercase and trim whitespace)

        }

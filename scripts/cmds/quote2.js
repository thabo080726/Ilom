const axios = require('axios');

module.exports = {
    config: {
        name: "quote",
        aliases: ['inspire', 'motivation'],
        author: "Hassan",
        version: "1.0",
        shortDescription: "Get a random quote",
        longDescription: "Retrieve a random inspirational quote using the Quotable API.",
        category: "Quote of the day",
        guide: {
            vi: "",
            en: ""
        }
    },

    onStart: async function ({ message }) {
        try {
            const url = 'https://api.quotable.io/random';

            const response = await axios.get(url);
            const quoteData = response.data;

            const quote = quoteData.content;
            const author = quoteData.author;

            return message.reply(`📜 Here's an inspirational quote for you:\n\n"${quote}"\n\n- ${author}`);
        } catch (error) {
            console.error(error);
            return message.reply("Sorry, there was an error fetching the quote.");
        }
    }
        }

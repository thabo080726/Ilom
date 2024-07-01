const axios = require('axios');

module.exports = {
    config: {
        name: "def",
        aliases: ['Define', 'define'],
        author: "Hassan",
        version: "1.0",
        shortDescription: "Get the definition of a word",
        longDescription: "Retrieve the definition of a specified word using the Hassan Dictionary API.",
        category: "education",
        guide: {
            vi: "",
            en: ""
        }
    },

    onStart: async function ({ message, args }) {
        if (args.length === 0) {
            return message.reply("Please provide a word to define.");
        }

        const word = args[0];
        const url = `https://hassan-definition-api.onrender.com/dictionary/${word}`;
        
        try {
            message.reply(`🔄 searching"${word}"...`);

            const response = await axios.get(url);
            const data = response.data;

            if (!data.valid) {
                return message.reply(`Sorry, no definition found for "${word}".`);
            }

            const definition = data.definition;

            return message.reply(`📖 Definition of "${word}":\n\n${definition}`);
        } catch (error) {
            console.error('Error fetching definition:', error);
            return message.reply("Sorry, there was an error fetching the definition.");
        }
    }
          

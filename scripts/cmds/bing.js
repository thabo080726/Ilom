const axios = require('axios');
const cookies = '14yfroS1Vhp4PzndacSZuzWudwWmviiwPA2jYnI1Ac5F2P7kYMBiiEMkLjoBiiyUfTSwLMKdiL3E0ippPvseX7krYbsIhy1LekgiFR33KYiqGuZDHnmOr_TE5rZ1kTGQW7pDIwLvovpH6s68RuqzgdS_JR09ODq3IYvaSCjWAiloIHm7mfGKrBclPlUA6eQzKy-inpGrQOPKZiIDAj8a_NQ'; //Add here your cookies 

module.exports = {
  config: {
    name: "bing",
    version: "10.5",
    author: "ArYAN",
    shortDescription: { en: 'Converts text to image' },
    longDescription: { en: "Generates images based on provided text using Bing API." },
    category: "image",
    countDown: 10,
    role: 0,
    guide: { en: '{pn} your prompt' }
  },

  onStart: async function ({ api, event, args, message }) {
    const startTime = new Date().getTime();
    const text = args.join(" ");

    if (!text) {
      return message.reply("🔴 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗨𝘀𝗮𝗴𝗲\n━━━━━━━━━━━━\n\nPlease provide some prompts\n\nExample:\nA magical forest bathed in golden sunlight, with beams filtering through the canopy and illuminating a clear stream meandering through the undergrowth, 4K, HD Graphics, --v3, v2.");
    }

    message.reply(`⚙ Creating your imagination, please be patient...`, async (err, info) => {
      if (err) {
        console.error(err);
        return;
      }
      
      let ui = info.messageID;
      api.setMessageReaction("⏰", event.messageID, () => {}, true);

      try {
        const response = await axios.get(`https://global-sprak.onrender.com/api/bing?prompt=${encodeURIComponent(text)}&cookie=${encodeURIComponent(cookies)}`);
        
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        const images = response.data.result;
        if (!images || images.length === 0) {
          throw new Error("No images found in the response");
        }

        api.unsendMessage(ui);

        const endTime = new Date().getTime();
        const timeTaken = (endTime - startTime) / 1000;

        let imagesInfo = `
🖼 [𝗕𝗜𝗡𝗚] 
━━━━━━━━━━━━

👑 𝗣𝗿𝗼𝗺𝗽𝘁𝘀: ${text}

🌟 𝗡𝘂𝗺𝗯𝗲𝗿 𝗼𝗳 𝗜𝗺𝗮𝗴𝗲𝘀: ${images.length}

⚙ 𝗜𝗺𝗮𝗴𝗲𝘀 𝗟𝗶𝗻𝗸𝘀:
${images.map((img, index) => `(${index + 1}) ${img}`).join("\n")}

⏰ 𝗧𝗶𝗺𝗲 𝗧𝗮𝗸𝗲𝗻: ${timeTaken.toFixed(2)} seconds
━━━━━━━━━━━━`;

        message.reply({
          body: imagesInfo,
          attachment: await Promise.all(images.map(img => global.utils.getStreamFromURL(img))) 
        }, async (err) => {
          if (err) {
            console.error(err);
          }
        });
      } catch (error) {
        console.error(error);
        api.sendMessage(`⚙ An error occurred: ${error.message}. Please contact Aryan or check if your cookies are working.`, event.threadID, event.messageID);
      }
    });
  },
};

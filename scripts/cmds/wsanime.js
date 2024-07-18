const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "wsanime",
    aliases: ["wa"],
    version: "1.0",
    author: "ArYAN",
    role: 0,
    countDown: 20,
    longDescription: {
      en: "Search Wallpapers."
    },
    category: "media",
    guide: {
      en: ""
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const fs = require("fs-extra");
      const keySearch = args.join(" ");
      if (!keySearch.includes("-")) {
        return api.sendMessage(
          "Please enter the search query and number of images.",
          event.threadID,
          event.messageID
        );
      }
      const keySearchs = keySearch.substr(0, keySearch.indexOf('-'));
      let numberSearch = keySearch.split("-").pop() || 99;
      if (numberSearch > 99) {
        numberSearch = 99;
      }

      const apiUrl = `https://global-sprak.onrender.com/api/wsanime?name=${encodeURIComponent(keySearchs)}&number=${numberSearch}`;

      const res = await axios.get(apiUrl);
      const data = res.data;

      const imgData = [];
      let messageBody = `📸 𝗔𝗻𝗶𝗺𝗲 𝗪𝗮𝗹𝗹𝗮𝗽𝗲𝗿𝘀\n━━━━━━━━━━━━━━━\n\n𝖧𝖾𝗋𝖾 𝗂𝗌 𝗍𝗁𝖾 𝗍𝗈𝗉 ${numberSearch} 𝗋𝖾𝗌𝗎𝗅𝗍𝗌 𝖿𝗈𝗋 𝗒𝗈𝗎𝗋 𝗊𝗎𝖾𝗋𝗒 ${keySearchs}\n\n`;

      for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
        const imgResponse = await axios.get(data[i].image, {
          responseType: "arraybuffer"
        });
        const imgPath = path.join(__dirname, "cache", `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
        
        const title = data[i].title;
        const imageUrl = data[i].image;

        messageBody += `${i + 1}. 𝗧𝗶𝘁𝗹𝗲: ${title}\n\n⚙️ 𝗨𝗿𝗹: ${imageUrl}\n\n`;
      }

      const sentMessage = await api.sendMessage({
        body: messageBody,
        attachment: imgData,
      }, event.threadID, event.messageID);

      api.listenMqtt(sentMessage.threadID, async (err, info) => {
        if (err) return console.error(err);
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          imageUrls: data.map(item => item.image)
        });
      });

      await fs.remove(path.join(__dirname, "cache"));
    } catch (error) {
      console.error(error);
      api.sendMessage(`❌ Error occurred: ${error.message}`, event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const { author, imageUrls } = Reply;
    if (event.senderID !== author) return;

    try {
      const reply = parseInt(args[0]);
      if (reply >= 1 && reply <= imageUrls.length) {
        const img = imageUrls[reply - 1];
        message.reply({ attachment: await global.utils.getStreamFromURL(img) });
      } else {
        message.reply("❌ Invalid image number. Please reply with a number between 1 and " + imageUrls.length + ".");
      }
    } catch (error) {
      console.error(error);
      api.sendMessage(`❌ Error occurred: ${error.message}`, event.threadID);
    }

    message.unsend(Reply.messageID);
  }
};

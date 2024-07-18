const axios = require('axios');
const tinyurl = require('tinyurl');

module.exports = {
  config: {
    name: 'screenshot',
    aliases: ["ss"],
    version: '1.6',
    author: 'ArYAN',
    description: 'Takes a screenshot of a given URL or processes an image URL',
    category: 'Utility'
  },
  onStart: async function ({ event, api, args, message }) {
    if (args[0] === 'help') {
      return api.sendMessage(
        {
          body: `📸 Screenshot Command Guide 📸\n\n` +
                `This command allows you to take a screenshot of a given URL or process an image URL.\n\n` +
                `Usage:\n` +
                `1. **Take a Screenshot of a URL**: \n` +
                `   ➤ \`!screenshot <URL>\`\n` +
                `   Example: \`!screenshot https://example.com\`\n\n` +
                `2. **Process an Image URL**: \n` +
                `   ➤ \`!screenshot <image URL>\`\n` +
                `   Example: \`!screenshot https://example.com/image.png\`\n\n` +
                `3. **Reply with an Image to Process**: \n` +
                `   ➤ Reply to an image or sticker with \`!screenshot\`\n` +
                `   Example: Reply to an image with \`!screenshot\`\n\n` +
                `If you need further assistance, please refer to the examples above or contact support.`
        },
        event.threadID
      );
    }

    let url;
    let imageUrl;

    if (event.type === "message_reply") {
      const replyAttachment = event.messageReply.attachments[0];
      if (["photo", "sticker"].includes(replyAttachment?.type)) {
        imageUrl = replyAttachment.url;
      } else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g)) {
        imageUrl = args[0];
      } else {
        return api.sendMessage(
          { body: `Please reply to an image or provide a valid image URL.` },
          event.threadID
        );
      }
    } else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g)) {
      imageUrl = args[0];
    } else if (args.length > 0) {
      url = args.join(' ');
      if (!isValidUrl(url)) {
        return api.sendMessage(
          { body: `Please provide a valid URL.` },
          event.threadID
        );
      }
    } else {
      return api.sendMessage(
        { body: `Please provide a valid URL or reply to an image.` },
        event.threadID
      );
    }

    if (imageUrl) {
      try {
        const startTime = new Date().getTime();
        const shortenedUrl = await tinyurl.shorten(imageUrl);
        const apiUrl = `https://global-sprak.onrender.com/api/screenshot?url=${encodeURIComponent(shortenedUrl)}`;
        const response = await axios.get(apiUrl, { responseType: 'stream' });
        const imageStream = response.data;
        const endTime = new Date().getTime();
        const timeTaken = (endTime - startTime) / 1000;

        api.sendMessage({
         body: `🖼️ 𝗦𝗰𝗿𝗲𝗲𝗻𝗦𝗵𝗼𝘁 𝗧𝗮𝗸𝗲𝗻 🖼️\n\n` +
                  `━━━━━━━━━━━━━━━━━━\n\n` +
                  `⚙️ 𝗨𝗥𝗟: ${shortenedUrl}\n\n` +
                  `⏰ 𝗧𝗮𝗸𝗲𝗻 𝗧𝗶𝗺𝗲: ${timeTaken.toFixed(2)} seconds`,
          attachment: imageStream
        }, event.threadID);
      } catch (error) {
        console.error(error);
        api.sendMessage(`Error processing image: ${error.message}`, event.threadID);
      }
    } else {
      message.reply('Generating screenshot...', async (err, info) => {
        if (err) {
          console.error(err);
          return;
        }
        let ui = info.messageID;
        api.setMessageReaction("⏰", event.messageID, () => {}, true);
        try {
          const startTime = new Date().getTime();
          const shortenedUrl = await tinyurl.shorten(url);
          const apiUrl = `https://global-sprak.onrender.com/api/screenshot?url=${encodeURIComponent(shortenedUrl)}`;
          const response = await axios.get(apiUrl, { responseType: 'stream' });
          const imageStream = response.data;
          const endTime = new Date().getTime();
          const timeTaken = (endTime - startTime) / 1000;

          api.setMessageReaction("✅", event.messageID, () => {}, true);
          api.unsendMessage(ui);
          api.sendMessage({
            body: `🖼️ 𝗦𝗰𝗿𝗲𝗲𝗻𝗦𝗵𝗼𝘁 𝗧𝗮𝗸𝗲𝗻 🖼️\n\n` +
                  `━━━━━━━━━━━━━━━━━━\n\n` +
                  `⚙️ 𝗨𝗥𝗟: ${shortenedUrl}\n\n` +
                  `⏰ 𝗧𝗮𝗸𝗲𝗻 𝗧𝗶𝗺𝗲: ${timeTaken.toFixed(2)} seconds`,
            attachment: imageStream
          }, event.threadID);
        } catch (error) {
          console.error(error);
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          api.sendMessage(`Error taking screenshot: ${error.message}`, event.threadID);
        }
      });
    }
  },
  onReply: async function ({ event, api, args, message, usersData }) {
    if (event.messageReply.senderID === event.senderID) {
      let url;
      let imageUrl;

      if (event.type === "message_reply") {
        const replyAttachment = event.messageReply.attachments[0];
        if (["photo", "sticker"].includes(replyAttachment?.type)) {
          imageUrl = replyAttachment.url;
        } else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g)) {
          imageUrl = args[0];
        } else {
          return api.sendMessage(
            { body: `Please reply to an image or provide a valid image URL.` },
            event.threadID
          );
        }
      } else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g)) {
        imageUrl = args[0];
      } else if (args.length > 0) {
        url = args.join(' ');
        if (!isValidUrl(url)) {
          return api.sendMessage(
            { body: `Please provide a valid URL.` },
            event.threadID
          );
        }
      } else {
        return api.sendMessage(
          { body: `Please provide a valid URL or reply to an image.` },
          event.threadID
        );
      }

      if (imageUrl) {
        try {
          const startTime = new Date().getTime();
          const shortenedUrl = await tinyurl.shorten(imageUrl);
          const apiUrl = `https://global-sprak.onrender.com/api/screenshot?url=${encodeURIComponent(shortenedUrl)}`;
          const response = await axios.get(apiUrl, { responseType: 'stream' });
          const imageStream = response.data;
          const endTime = new Date().getTime();
          const timeTaken = (endTime - startTime) / 1000;

          api.sendMessage({
            body: `🖼️ 𝗦𝗰𝗿𝗲𝗲𝗻𝗦𝗵𝗼𝗿𝘁 𝗧𝗮𝗸𝗲𝗻 🖼️\n\n` +
                  `━━━━━━━━━━━━━━━━━━\n\n` +
                  `⚙️ 𝗨𝗥𝗟: ${shortenedUrl}\n\n` +
                  `⏰ 𝗧𝗶𝗺𝗲 𝗧𝗮𝗸𝗲𝗻: ${timeTaken.toFixed(2)} seconds`,
            attachment: imageStream
          }, event.threadID);
        } catch (error) {
          console.error(error);
          api.sendMessage(`Error processing image: ${error.message}`, event.threadID);
        }
      } else {
        try {
          const startTime = new Date().getTime();
          const shortenedUrl = await tinyurl.shorten(url);
          const apiUrl = `https://global-sprak.onrender.com/api/screenshot?url=${encodeURIComponent(shortenedUrl)}`;
          const response = await axios.get(apiUrl, { responseType: 'stream' });
          const imageStream = response.data;
          const endTime = new Date().getTime();
          const timeTaken = (endTime - startTime) / 1000;

          api.sendMessage({
            body: `🖼️ 𝗦𝗰𝗿𝗲𝗲𝗻𝗦𝗵𝗼𝗿𝘁 𝗧𝗮𝗸𝗲𝗻 🖼️\n\n` +
                  `━━━━━━━━━━━━━━━━━━\n\n` +
                  `⚙️ 𝗨𝗥𝗟: ${shortenedUrl}\n\n` +
                  `⏰ 𝗧𝗶𝗺𝗲 𝗧𝗮𝗸𝗲𝗻: ${timeTaken.toFixed(2)} seconds`,
            attachment: imageStream
          }, event.threadID);
        } catch (error) {
          console.error(error);
          api.sendMessage(`Error taking screenshot: ${error.message}`, event.threadID);
        }
      }
    }
  }
};

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

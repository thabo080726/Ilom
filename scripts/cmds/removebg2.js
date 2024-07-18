const axios = require('axios');
const tinyurl = require('tinyurl');

module.exports = {
  config: {
    name: 'removebg',
    aliases: ["rmbg"],
    version: '1.0',
    author: 'ArYAN',
    description: 'Removes the background from a given image URL or a replied image',
    category: 'Utility'
  },
  onStart: async function ({ event, api, args }) {
    function isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    }

    let imageUrl;

    if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
      const replyAttachment = event.messageReply.attachments[0];
      if (["photo", "sticker"].includes(replyAttachment.type)) {
        imageUrl = replyAttachment.url;
      } else {
        return api.sendMessage({ body: `Please reply to a valid image.` }, event.threadID);
      }
    } else if (args[0] && isValidUrl(args[0]) && args[0].match(/\.(png|jpg|jpeg)$/)) {
      imageUrl = args[0];
    } else {
      return api.sendMessage({ body: `Please provide a valid image URL or reply to an image.` }, event.threadID);
    }

    try {
      const startTime = new Date().getTime();
      const shortenedUrl = await tinyurl.shorten(imageUrl);

      // Remove background using custom API with GET method
      const apiUrl = `https://global-sprak.onrender.com/api/removebg?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      if (response && response.data) {
        const endTime = new Date().getTime();
        const timeTaken = (endTime - startTime) / 1000;

        const imageStream = response.data;

        api.sendMessage({
          body: `🖼️ 𝗥𝗲𝗺𝗼𝘃𝗲𝗕𝗚\n\n━━━━━━━━━━━━━\n` +
                `⚙️ 𝗨𝗥𝗟: ${shortenedUrl}\n` +
                `⏰ 𝗧𝗶𝗺𝗲 𝗧𝗮𝗸𝗲𝗻: ${timeTaken.toFixed(2)} seconds`,
          attachment: imageStream
        }, event.threadID, event.messageID);
      } else {
        throw new Error(`Failed to fetch image or empty response`);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      api.sendMessage({ body: `Error processing image: ${error.message}` }, event.threadID, event.messageID);
    }
  }
};

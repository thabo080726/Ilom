const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "imgbb",
    version: "1.0",
    author: "ArYAN",
    countDown: 1,
    role: 0,
    longDescription: {
      en: "Upload image to imgbb by replying to photo"
    },
    category: "tools",
    guide: {
      en: ".imgur reply with image"
    }
  },

  onStart: async function ({ api, event }) {
    const imgbbApiKey = "1b4d99fa0c3195efe42ceb62670f2a25"; // Replace "YOUR_API_KEY_HERE" with your actual API key
    const linkanh = event.messageReply?.attachments[0]?.url;
    if (!linkanh) {
      return api.sendMessage('⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗨𝘀𝗲\n━━━━━━━━━━━━━━━━━━━━\n\nPlease reply to an image.', event.threadID, event.messageID);
    }

    try {
      const response = await axios.get(linkanh, { responseType: 'arraybuffer' });
      const formData = new FormData();
      formData.append('image', Buffer.from(response.data, 'binary'), { filename: 'image.png' });
      const res = await axios.post('https://api.imgbb.com/1/upload', formData, {
        headers: formData.getHeaders(),
        params: {
          key: imgbbApiKey
        }
      });
      const imageLink = res.data.data.url;
      await api.sendMessage(`⛔|𝗜𝗺𝗴𝗯𝗯\n━━━━━━━━━━━\n\nHere is your image imgbb link created\n\n➤ ${imageLink}`, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      return api.sendMessage('Failed to upload image to imgbb.', event.threadID, event.messageID);
    }
  }
};

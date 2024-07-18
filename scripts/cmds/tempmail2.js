const axios = require("axios");

module.exports = {
  config: {
    name: "tempmail",
    aliases: [`tm`],
    version: "1.0.0",
    author: "UPoL | ArYAN",//re-modify by Aryan
    role: 0,
    countDown: 5,
    longDescription: {
      en: "Generate temporary email and check inbox"
    },
    category: "email",
    guide: {
      en: "{p}tempmail <subcommand>\n\nFor Example:\n{p}tempmail gen\n{p}tempmail inbox <tempmail>",
      vi: "{p}tempmail <lệnh con>\n\nVí dụ:\n{p}tempmail gen\n{p}tempmail inbox <email tạm thời>"
    }
  },
  onStart: async function ({ api, event, args }) {
    try {
      if (args[0].toLowerCase() === "gen") {
        const response = await axios.get("https://global-sprak.onrender.com/api/tempmail/get");
        const responseData = response.data.tempmail;
        api.sendMessage(`📮 | 𝗧𝗲𝗺𝗽𝗺𝗮𝗶𝗹\n━━━━━━━━━━━━━\n\n𝖧𝖾𝗋𝖾 𝗂𝗌 𝗒𝗈𝗎𝗋 𝗀𝖾𝗇𝖾𝗋𝖺𝗍𝖾𝖽 𝗍𝖾𝗆𝗉𝗆𝖺𝗂𝗅\n\n📍 | 𝗘𝗺𝗮𝗶𝗹\n➤ ${responseData}`, event.threadID, event.messageID);
      } else if (args[0].toLowerCase() === "inbox" && args.length === 2) {
        const email = args[1];
        try {
          const response = await axios.get(`https://global-sprak.onrender.com/api/tempmail/inbox?email=${email}`);
          const data = response.data;
          if (data.length === 0) {
            api.sendMessage("📭 | 𝗜𝗻𝗯𝗼𝘅 𝗠𝗲𝘀𝘀𝗮𝗴𝗲\n━━━━━━━━━━━━━━━\n\n𝖸𝗈𝗎𝗋 𝗍𝖾𝗆𝗉𝗆𝖺𝗂𝗅 𝗂𝗇𝗉𝗈𝗑 𝗂𝗌 𝖼𝗎𝗋𝗋𝖾𝗇𝗍𝗅𝗒 𝖾𝗆𝗉𝗍𝗒.", event.threadID, event.messageID);
          } else {
            const inboxMessages = data.map(({ from, subject, body, date }) => `📬 | 𝗧𝗲𝗺𝗽𝗺𝗮𝗶𝗹 𝗜𝗻𝗯𝗼𝘅\n━━━━━━━━━━━━━━━\n\n🔎 𝗙𝗿𝗼𝗺\n${from}\n📭 𝗦𝘂𝗯𝗷𝗲𝗰𝘁\n➤ ${subject || 'Not Found'}\n\n📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲\n➤ ${body}\n🗓 𝗗𝗮𝘁𝗲\n➤ ${date}`).join('\n\n');
            api.sendMessage(inboxMessages, event.threadID, event.messageID);
          }
        } catch (error) {
          console.error("🔴 Error", error);
          api.sendMessage("❌ | Can't retrieve emails. Please try again later.", event.threadID, event.messageID);
        }
      } else {
        api.sendMessage("❌ | Use 'Tempmail gen' to generate email and 'Tempmail inbox {email}' to check inbox emails.", event.threadID, event.messageID);
      }
    } catch (error) {
      console.error("❌ | Error", error);
      api.sendMessage("❌ | An error occurred. Please try again later.", event.threadID, event.messageID);
    }
  }
};

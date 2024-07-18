const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: "goatbin",
    version: "1.0",
    author: "Itz Aryan | Goatmart",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Upload files to pastebin and send the cmd link"
    },
    longDescription: {
      en: "This command allows you to upload files to goatbin and sends the link to the file."
    },
    category: "goatmart",
    guide: {
      en: "To use this command, type goatbin <filename>. The file must be located in the 'cmds' folder."
    }
  },

  onStart: async function({ api, event, args }) {
    const fileName = args[0];
    const filePathWithoutExtension = path.join(__dirname, '..', 'cmds', fileName);
    const filePathWithExtension = path.join(__dirname, '..', 'cmds', fileName + '.js');

    // Check if the file exists
    if (!fs.existsSync(filePathWithoutExtension) && !fs.existsSync(filePathWithExtension)) {
      return api.sendMessage('Command not found. Please check your command list by typing .help to see all available commands.', event.threadID, event.messageID);
    }

    const filePath = fs.existsSync(filePathWithoutExtension) ? filePathWithoutExtension : filePathWithExtension;

    // Read file content
    fs.readFile(filePath, 'utf8', async (err, data) => {
      if (err) {
        return api.sendMessage('An error occurred while reading the file.', event.threadID);
      }

      try {
        // Upload file content to goatbin
        const response = await axios.post('https://goatbin.onrender.com/api/goatbin/v1', { code: data });

        if (response.data && response.data.link) {
          const goatbinLink = response.data.link;
          api.sendMessage(`👑 𝗚𝗼𝗮𝘁𝗕𝗶𝗻\n\nSuccessfully created your command goatbin link:\n\n${goatbinLink}`, event.threadID, event.messageID);
        } else {
          api.sendMessage('Failed to upload the command to goatbin. Please try again later.', event.threadID);
        }
      } catch (uploadErr) {
        console.error(uploadErr);
        api.sendMessage('An error occurred while uploading the command to goatbin.', event.threadID);
      }
    });
  },
};

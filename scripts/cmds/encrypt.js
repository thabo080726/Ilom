
const { resolve } = require("path");
const axios = require("axios");
const fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const JavaScriptObfuscator = require("javascript-obfuscator");
const { PasteClient } = require("pastebin-api");

module.exports = {
  config: {
    name: "enc",
    aliases: ["encode", "encrypt", "obf", "obfuscate"],
    version: "1.0",
    author: "Samir B. Thakuri",
    countDown: 5,
    role: 0,
    shortDescription: "Encrypt javascript from directory Files",
    longDescription: "",
    category: "owner",
    guide: {
      vi: "{pn} <filename>",
      en: "{pn} <filename>",
    },
  },
  onStart: async function ({ api, event, args, messageReply, type }) {
    const permission = global.GoatBot.config.GOD;
    if (!permission.includes(event.senderID)) {
      api.sendMessage(
        "You don't have enough permission to use this command. Only My Authors Have Access.",
        event.threadID,
        event.messageID
      );
      return;
    }

    const { senderID, threadID, messageID } = event;

    var name = args[0];
    var text = "";

    if (type === "message_reply") {
      text = messageReply.body;
    }

    if (!text && !name) {
      api.sendMessage(
        "Please reply to the link you want to apply the code to or write the file name to upload the code to pastebin!",
        threadID,
        messageID
      );
      return;
    }

    // Function to obfuscate and upload code to Pastebin
    async function obfuscateAndUpload(name, code) {
      const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
        compact: false,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        stringArrayThreshold: 1,
      });

      const obfuscatedCode = obfuscationResult.getObfuscatedCode();

      const client = new PasteClient("2vC__X6_nsSPBcq03DYtoDYNXfwcU0sH"); // Replace with your Pastebin API key
      const url = await client.createPaste({
        code: obfuscatedCode,
        expireDate: "N",
        format: "javascript",
        name: name,
        publicity: 1,
      });

      var id = url.split("/")[3];
      return "https://pastebin.com/raw/" + id;
    }

    // Handle file upload to Pastebin
    if (!text && name) {
      try {
        var data = fs.readFileSync(resolve(__dirname, `${name}.js`), "utf-8");
        var link = await obfuscateAndUpload(args[1] || "noname", data);
        return api.sendMessage(link, threadID, messageID);
      } catch (error) {
        return api.sendMessage(
          `Error reading or uploading file: ${error.message}`,
          threadID,
          messageID
        );
      }
    }

    // Handle code from links
    var urlR = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    var url = text.match(urlR);

    if (!url) {
      return api.sendMessage(
        "Invalid URL provided.",
        threadID,
        messageID
      );
    }

    if (url[0].includes("pastebin")) {
      try {
        const response = await axios.get(url[0]);
        var data = response.data;
        fs.writeFileSync(resolve(__dirname, `${args[0]}.js`), data, "utf-8");
        api.sendMessage(
          `Code applied to ${args[0]}.js, use the 'load' command to use it!`,
          threadID,
          messageID
        );
      } catch (error) {
        return api.sendMessage(
          `Error fetching code from Pastebin: ${error.message}`,
          threadID,
          messageID
        );
      }
    } else if (url[0].includes("buildtool") || url[0].includes("tinyurl.com")) {
      request(
        {
          method: "GET",
          url: messageReply.body,
        },
        function (error, response, body) {
          if (error) {
            return api.sendMessage(
              "Please only reply to the link (contains nothing but links)",
              threadID,
              messageID
            );
          }
          const load = cheerio.load(body);
          const code = load(".language-js").first().text();
          if (!code) {
            return api.sendMessage(
              "Could not find any JavaScript code in the link",
              threadID,
              messageID
            );
          }
          fs.writeFileSync(
            resolve(__dirname, `${args[0]}.js`),
            code,
            "utf-8"
          );
          return api.sendMessage(
            `Added this code to "${args[0]}.js", use the 'load' command to use it!`,
            threadID,
            messageID
          );
        }
      );
    } else if (url[0].includes("drive.google")) {
      var id = url[0].match(/[-\w]{25,}/);
      const path = resolve(__dirname, `${args[0]}.js`);
      try {
        // You'll need to implement 'utils.downloadFile' yourself
        // It should download a file from the given URL to the specified path
        await utils.downloadFile(
          `https://drive.google.com/u/0/uc?id=${id}&export=download`,
          path
        );
        return api.sendMessage(
          `Added this code to "${args[0]}.js". If an error occurs, change the drive file to txt!`,
          threadID,
          messageID
        );
      } catch (e) {
        return api.sendMessage(
          `An error occurred while applying the new code to "${args[0]}.js".`,
          threadID,
          messageID
        );
      }
    } else {
      return api.sendMessage(
        "Unsupported URL provided.",
        threadID,
        messageID
      );
    }
  },
};


                            

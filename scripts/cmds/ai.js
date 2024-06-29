const axios = require('axios');
const fs = require('fs-extra');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const path = require('path');
const moment = require('moment');

const apiEndpoint = "https://itsaryanapis.onrender.com";

module.exports = {
  config: {
    name: "ai",
    aliases: [],
    version: "1.5",
    author: "ArYAN",
    role: 0,
    shortDescription: {
      en: "Interact with OpenAI's GPT models.",
      vi: "Tương tác với các mô hình GPT của OpenAI."
    },
    longDescription: {
      en:
        "Explore various GPT models provided by OpenAI. This command allows users to ask questions, receive detailed answers from the AI, get lyrics of a song, as well as send images, videos, songs, and more much..",
      vi:
        "Tương tác với nhiều mô hình GPT khác nhau do OpenAI cung cấp. Lệnh này cho phép người dùng đặt câu hỏi, nhận câu trả lời chi tiết từ AI, nhận lời bài hát cũng như gửi hình ảnh và video."
    },
    category: "ai",
    guide: {
      en: `
🔎 𝗚𝗨𝗜𝗗𝗘\n
ai [question] - Replace {p} with your command prefix and 'question' with your actual query. 
ai models to list available models. 
ai lyrics [ songName ] to fetch song lyrics. 
ai pin query ( title ) - (number ) to fetch images (split with '-'). 
ai send video [ query ] to fetch videos. 
ai send song [ query ] to fetch songs. 
ai send shoti. 
ai tm gen/inbox ( mail )
ai dl fb ( link )
ai stalk git (username)
ai bard (question)
`
    }
  },
  onStart: async function() {},
  onChat: async function({ api, event, args, message }) {
    try {
      const prefix = 'ai';

      if (!event.body.toLowerCase().startsWith(prefix)) return;

      const prompt = event.body.substring(prefix.length).trim();

      if (!prompt)
        return message.reply(
          "𝖧𝖾𝗅𝗅𝗈! 𝗉𝗅𝖾𝖺𝗌𝖾 𝖺𝖽𝖽 𝗒𝗈𝗎𝗋 𝗣𝗿𝗼𝗺𝗽𝘁 𝗜𝗻𝘁𝗿𝘂𝗰𝗮𝘁𝗶𝗼𝗻 𝗍𝗈 𝗀𝖾𝗍 𝖺 𝖲𝗉𝖾𝖼𝗂𝖿𝗂𝖼 𝖱𝖾𝗌𝗉𝗈𝗇𝗌𝖾. \n\n╭──🌼 \n│𝖺𝗂 ( 𝖸𝗈𝗎𝗋 𝗇𝗈𝗋𝗆𝖺𝗅 𝗉𝗋𝗈𝗆𝗉𝗍𝗌) \n│𝖺𝗂 𝗌𝖾𝗇𝗍 𝗅𝗒𝗋𝗂𝖼𝗌 ( 𝗌𝗈𝗇𝗀𝖭𝖺𝗆𝖾 ) \n│𝖺𝗂 𝗍𝖾𝗇/𝗂𝗇𝖻𝗈𝗑 ( 𝖾𝗆𝖺𝗂𝗅 ) \n│𝖺𝗂 𝗌𝖾𝗇𝖽 𝗌𝗈𝗇𝗀 ( 𝗌𝗈𝗇𝗀𝖭𝖺𝗆𝖾 ) \n│𝖺𝗂 𝗌𝖾𝗇𝖽 𝗌𝗁𝗈𝗍𝗂 \n│𝖺𝗂 𝗌𝖾𝗇𝖽 𝗏𝗂𝖽𝖾𝗈 ( 𝗏𝗂𝖽𝖾𝗈 𝗍𝗂𝗍𝗅𝖾) \n│𝖺𝗂 𝗉𝗂𝗇 𝗊𝗎𝖾𝗋𝘆 ( 𝗍𝗂𝗍𝗅𝖾 ) - (𝗇𝗎𝗆𝖻𝖾𝗋)\n│𝖺𝗂 𝗉𝖾𝗑𝖾𝗅𝗌 𝗊𝗎𝖾𝗋𝗒 ( 𝗍𝗂𝗍𝗅𝖾 ) - (𝗇𝗎𝗆𝖻𝖾𝗋) \n│𝖺𝗂 𝖽𝗅 𝖿𝖻 ( 𝗅𝗂𝗇𝗄 ) \n│𝖺𝗂 𝗌𝗍𝖺𝗅𝗄 𝗀𝗂𝗍 ( 𝗎𝗌𝖾𝗋𝗇𝖺𝗆𝖾)\n│𝖺𝗂 𝖻𝖺𝗋𝖽 ( 𝗊𝗎𝖾𝗌𝗍𝗂𝗈𝗇 )\n╰─────────────🌼\n\n 📝 𝗲𝘅𝗮𝗺𝗽𝗹𝗲: ai send 𝗌𝗈𝗇𝗀 metamorphosis."
        );

      switch (true) {
        case prompt.toLowerCase().startsWith('bard query'): {
          const bardPrompt = prompt.split(' ').slice(2).join(' ');
          if (!bardPrompt) {
            await api.sendMessage("❗Please provide a prompt for the Bard response.", event.threadID, event.messageID);
            return;
          }

          try {
            const { data } = await axios.get(`${apiEndpoint}/api/bard?prompt=${encodeURIComponent(bardPrompt)}`);
            await api.sendMessage({
              body: `💭 𝗕𝗮𝗿𝗱\n━━━━━━━━━━\n\n${data}`,
            }, event.threadID, event.messageID);
          } catch (error) {
            console.error('Error fetching Bard response:', error);
            await api.sendMessage({ body: `Error fetching Bard response. Please try again later.` }, event.threadID, event.messageID);
          }
          return;
        }

        case prompt.toLowerCase().startsWith('dl'): {
          try {
            if (args[1] === "fb") {
              api.sendMessage(`Processing request!!!`, event.threadID, (err, info) => {
                setTimeout(() => {
                  api.unsendMessage(info.messageID);
                }, 100);
              }, event.messageID);

              const path1 = `${__dirname}/cache/1.mp4`;
              const videoData = (await axios.get(event.attachments[0].playableUrl, { responseType: "arraybuffer" })).data;
              fs.writeFileSync(path1, Buffer.from(videoData, "binary"));

              return api.sendMessage(
                {
                  body: `🟢 𝗙𝗕𝗗𝗟\n━━━━━━━━━━\n\nHere is your requested video.`,
                  attachment: fs.createReadStream(path1),
                },
                event.threadID
              );
            }
          } catch (error) {
            console.error(error);
            return api.sendMessage(`Unable to process the request`, event.threadID, event.messageID);
          }
          return;
        }
      }

      switch (true) {
        case prompt.toLowerCase().startsWith('stalk git'): {
          if (!args[2]) {
            api.sendMessage("❗Please provide a GitHub username!", event.threadID, event.messageID);
            return;
          }

          try {
            const username = encodeURI(args.slice(2).join(" "));
            const response = await axios.get(`https://api.github.com/users/${username}`);
            const { login, avatar_url, name, id, html_url, public_repos, followers, following, location, created_at, bio } = response.data;

            const info = `👑 𝗚𝗶𝘁𝗵𝘂𝗯 𝗦𝘁𝗮𝗹𝗸
━━━━━━━━━━━━
⚙️ 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${login}
🆔 𝗜𝗗: ${id}
📝 𝗕𝗶𝗼: ${bio || "No Bio"}
👀 𝗣𝘂𝗯𝗹𝗶𝗰 𝗥𝗲𝗽𝗼𝘀𝗶𝘁𝗼𝗿𝗶𝗲𝘀: ${public_repos || "None"}
🔎 𝗙𝗼𝗹𝗹𝗼𝘄𝗲𝗿𝘀: ${followers}
🏷️ 𝗙𝗼𝗹𝗹𝗼𝘄𝗶𝗻𝗴: ${following}
🌐 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: ${location || "No Location"}
📅 𝗖𝗿𝗲𝗮𝘁𝗲𝗱 𝗔𝘁: ${moment.utc(created_at).format("dddd, MMMM Do YYYY")}`;

            const imageBuffer = await axios.get(avatar_url, { responseType: "arraybuffer" }).then((res) => res.data);
            const filePath = `${__dirname}/cache/avatargithub.png`;
            fs.writeFileSync(filePath, Buffer.from(imageBuffer));

            api.sendMessage(
              {
                attachment: fs.createReadStream(filePath),
                body: info,
              },
              event.threadID,
              async () => {
                fs.unlinkSync(filePath);
              }
            );
          } catch (err) {
            console.error(err);
            api.sendMessage("User not found. Please provide a valid username!", event.threadID, event.messageID);
          }

          api.setMessageReaction("✅", event.messageID, () => {}, true);
          return;
        }
      }

      switch (true) {
        case prompt.toLowerCase().startsWith('send song'): {
          const songName = prompt.split(' ').slice(2).join(' ');
          const searchResults = await yts(songName);

          if (!searchResults.videos.length)
            return message.reply("❗No song found for the given query.");

          const video = searchResults.videos[0];
          const stream = ytdl(video.url, { filter: "audioonly" });
          const filePath = path.join(__dirname, "tmp", "music.mp3");

          stream.pipe(fs.createWriteStream(filePath));
          stream.on('end', async () => {
            const audioStream = fs.createReadStream(filePath);

            await message.reply({
              body: `🎧 𝗠𝗨𝗦𝗜𝗖\n━━━━━━━━━━━━━━━\n\n📝 𝗧𝗶𝘁𝗹𝗲: ${video.title}\n🔎 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${video.author.name}\n📅 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗱: ${video.uploadedDate}\n👀 𝗩𝗶𝗲𝘄𝘀: ${video.views}\n🖇 𝗨𝗥𝗟: ${video.url}\n⏰ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${video.timestamp}`,
              attachment: audioStream
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);
          });

          return;
        }

        case prompt.toLowerCase().startsWith('tm'): {
          const args = prompt.toLowerCase().split(' ').slice(1);
          if (args.length === 0) {
            await api.sendMessage("Use 'tempmail gen' to generate an email or 'tempmail inbox {email}' to check the inbox.", event.threadID, event.messageID);
            return;
          }

          if (args[0] === "gen") {
            try {
              const { data } = await axios.get("${apiEndpoint}/api/tempmail/get");
              await api.sendMessage({
                body: `📮|𝗧𝗲𝗺𝗽𝗺𝗮𝗶𝗹\n━━━━━━━━━━━━━\n\nHere is your generated tempmail\n\n📍|𝗘𝗺𝗮𝗶𝗹\n➤ ${data.tempmail}`,
              }, event.threadID, event.messageID);
            } catch (error) {
              console.error("❌ | Error", error);
              await api.sendMessage("❌|Unable to generate email address. Please try again later...", event.threadID, event.messageID);
            }
          } else if (args[0] === "inbox" && args.length === 2) {
            const email = args[1];
            try {
              const { data } = await axios.get(`${apiEndpoint}/api/tempmail/inbox?email=${email}`);
              const inboxMessages = data.map(({ from, subject, body, date }) =>
                `📍|𝗧𝗲𝗺𝗺𝗮𝗶𝗹 𝗜𝗻𝗯𝗼𝘅\n━━━━━━━━━━━━\n\n` +
                `🔎 𝗙𝗿𝗼𝗺: ${from}\n` +
                `📭 𝗦𝘂𝗯𝗷𝗲𝗰𝘁: ${subject || 'Not Found'}\n\n` +
                `📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: ${body}\n` +
                `🗓 𝗗𝗮𝘁𝗲: ${date}`).join('\n\n');
              await api.sendMessage(inboxMessages, event.threadID, event.messageID);
            } catch (error) {
              console.error("🔴 Error", error);
              await api.sendMessage("❌|Can't get any mail yet. Please send mail first.", event.threadID, event.messageID);
            }
          } else {
            await api.sendMessage("❌ | Use 'tempmail gen' to generate email and 'tempmail inbox {email}' to get the inbox emails.", event.threadID, event.messageID);
          }
          return;
        }

        case prompt.toLowerCase().startsWith('send video'): {
          try {
            const songName = prompt.split(' ').slice(2).join(' ');
            const searchResults = await yts(songName);

            if (!searchResults || !searchResults.all || searchResults.all.length === 0) {
              return message.reply("❗No video found for the given query.");
            }

            const video = searchResults.all.find(result => result.type === 'video');

            if (!video) {
              return message.reply("❗No video found for the given query.");
            }

            const stream = ytdl(video.url);
            const filePath = path.join(__dirname, "tmp", "music.mp4");
            const writer = fs.createWriteStream(filePath);
            let videoSize = 0;

            stream.pipe(writer);
            stream.on('data', chunk => {
              videoSize += chunk.length;

              if (videoSize > 55 * 1024 * 1024) {
                stream.destroy();
                writer.close();
                fs.unlinkSync(filePath);
                return message.reply("❗Video size exceeds the limit of 55 MB.");
              }
            });

            stream.on('end', async () => {
              const videoStream = fs.createReadStream(filePath);

              await api.sendMessage({
                body: `📹 𝗩𝗜𝗗𝗘𝗢\n━━━━━━━━━━ \n\n📝 𝗧𝗶𝘁𝗹𝗲: ${video.title} \n🔎 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${video.author.name}\n 📅 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗱: ${video.uploadedDate} \n👀 𝗩𝗶𝗲𝘄𝘀: ${video.views} \n🔗 𝗨𝗿𝗹: ${video.url} \n⏰ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${video.timestamp}`,
                attachment: videoStream,
              }, event.threadID, event.messageID);

              fs.unlinkSync(filePath);
            });
          } catch (error) {
            console.error(error);
            return api.sendMessage("❌ An error occurred while processing your request.", event.threadID, event.messageID);
          }

          api.setMessageReaction("✅", event.messageID, () => {}, true);
          return;
        }

        case prompt.toLowerCase().startsWith('send shoti'): {
          try {
            const response = await axios.get(`${apiEndpoint}/api/shoti`);
            const data = response.data.data;

            const username = data.user.username || "@user_unknown";
            const nickname = data.user.nickname || "@unknown_nickname";
            const region = data.region || "unknown region";
            const duration = data.duration || "unknown duration";
            const title = data.title || "unknown title";
            const userID = data.user.userID || "unknown userID";

            const videoResponse = await axios.get(data.url, { responseType: "stream" });
            const tempVideoPath = path.join(__dirname, "cache", `${Date.now()}.mp4`);
            const writer = fs.createWriteStream(tempVideoPath);

            videoResponse.data.pipe(writer);

            writer.on("finish", async () => {
              const stream = fs.createReadStream(tempVideoPath);

              await message.reply({
                body: `🌼 𝗦𝗵𝗼𝘁𝗶 𝘃2 \n━━━━━━━━━━━━━━━\n\n📝 𝖳𝗂𝘁𝗹𝖾: ${title}\n🔎 𝖴𝘀𝖾𝗋𝗇𝖺𝗆𝖾: ${username}\n🏷 𝖭𝗂𝖼𝗄𝗇𝖺𝗆𝖾: ${nickname}"\n🌐 𝖱𝖾𝗀𝗂𝗈𝗇: "${region}"\n⏰ 𝖣𝗎𝗋𝖺𝗍𝗂𝗈𝗇: ${duration}\n🆔 𝖴𝗌𝖾𝗋𝖨𝖣: "${userID}`,
                attachment: stream,
              });

              api.setMessageReaction("✅", event.messageID, () => {}, true);

              fs.unlink(tempVideoPath, (err) => {
                if (err) console.error(err);
                console.log(`Deleted ${tempVideoPath}`);
              });
            });
          } catch (error) {
            console.error(error);
            message.reply("Sorry, an error occurred while processing your request.");
          }

          return;
        }

        case prompt.toLowerCase().startsWith('send lyrics'): {
          try {
            const songName = args.join(" ");
            if (!songName) {
              api.sendMessage(`⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗨𝘀𝗮𝗴𝗲\n━━━━━━━━━━\n\nPlease provide a song name!`, event.threadID, event.messageID);
              return;
            }

            const apiUrl = `${apiEndpoint}/api/lyrics?songName=${encodeURIComponent(songName)}`;
  
            const response = await axios.get(apiUrl);
            const { lyrics, title, artist, image } = response.data;
  
            if (!lyrics) {
              api.sendMessage(`⛔ 𝗡𝗼𝘁 𝗙𝗼𝘂𝗻𝗱\n━━━━━━━━━━\n\nSorry, lyrics ${songName} not found, please provide another song name!`, event.threadID, event.messageID);
              return;
            }
  
            let message = `ℹ 𝗟𝘆𝗿𝗶𝗰𝘀 𝗧𝗶𝘁𝗹𝗲\n➤ ${title}\n👑 𝗔𝗿𝘁𝗶𝘀𝘁\n➤ ${artist}\n\n✅ 𝗛𝗘𝗥𝗘 𝗜𝗦 𝗬𝗢𝗨𝗥 𝗟𝗬𝗥𝗜𝗖𝗦\n━━━━━━━━━━━━━━━\n${lyrics}\n\n━━━━━━𝗘𝗡𝗗━━━━━━━`;
            let attachment = await global.utils.getStreamFromURL(image);
            api.sendMessage({ body: message, attachment }, event.threadID, (err, info) => {
              let id = info.messageID;
            });
          } catch (error) {
            console.error(error);
            api.sendMessage(`⛔ 𝗡𝗼𝘁 𝗙𝗼𝘂𝗻𝗱\n━━━━━━━━━━\n\nSorry, lyrics not found, please provide another song name!`, event.threadID, event.messageID);
          }
  
          api.setMessageReaction("✅", event.messageID, () => {}, true);
          return;
        }

        case prompt.toLowerCase().startsWith('pexels query'): {
          try {
            const query = args.join(" ");

            if (!query.includes("-")) {
              return api.sendMessage(
                "⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗨𝘀𝗮𝗴𝗲𝘀\n━━━━━━━━━━━━━━━\n\nPlease enter the search query and number of images (1-99)",
                event.threadID,
                event.messageID
              );
            }

            const [keySearchs, numberSearch] = query.split("-");
            let num = parseInt(numberSearch.trim()) || 20;
            const searchLimit = Math.min(num, 99);
            const apiUrl = `${apiEndpoint}/api/pexels?query=${encodeURIComponent(keySearchs.trim())}&keysearch=${searchLimit}`;
            const res = await axios.get(apiUrl);
            const data = res.data.result;
            const imgData = [];

            for (let i = 0; i < Math.min(searchLimit, data.length); i++) {
              const imgResponse = await axios.get(data[i], { responseType: "arraybuffer" });
              const imgPath = path.join(__dirname, "cache", `${i + 1}.jpg`);
              await fs.outputFile(imgPath, imgResponse.data);
              imgData.push(fs.createReadStream(imgPath));
            }

            await api.sendMessage(
              {
                body: `📸 𝗣𝗲𝘅𝗲𝗹𝘀\n━━━━━━━━━━━━━━━\n\nShowing top ${searchLimit} results for your query "${keySearchs.trim()}"`,
                attachment: imgData
              },
              event.threadID,
              event.messageID
            );

            // Remove cached images after sending
            await fs.remove(path.join(__dirname, "cache"));
          } catch (error) {
            console.error(error);
            return api.sendMessage(`An error occurred.`, event.threadID, event.messageID);
          }

          return;
        }

        case prompt.toLowerCase().startsWith('pin query'): {
          try {
            const query = args.join(" ");

            if (!query.includes("-")) {
              return api.sendMessage(
                "⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗨𝘀𝗮𝗴𝗲𝘀\n━━━━━━━━━━━━━━━\n\nPlease enter the search query and number of images (1-99)",
                event.threadID,
                event.messageID
              );
            }

            const [keySearchs, numberSearch] = query.split("-");
            let num = parseInt(numberSearch.trim()) || 20;
            const searchLimit = Math.min(num, 99);
            const apiUrl = `${apiEndpoint}/api/pinterest?query=${encodeURIComponent(keySearchs.trim())}&limits=${searchLimit}`;
            const res = await axios.get(apiUrl);
            const data = res.data;
            const imgData = [];

            for (let i = 0; i < Math.min(searchLimit, data.length); i++) {
              const imgResponse = await axios.get(data[i], { responseType: "arraybuffer" });
              const imgPath = path.join(__dirname, "cache", `${i + 1}.jpg`);
              await fs.outputFile(imgPath, imgResponse.data);
              imgData.push(fs.createReadStream(imgPath));
            }

            await api.sendMessage(
              {
                body: `📸 𝗣𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁\n━━━━━━━━━━━━━━━\n\nShowing top ${searchLimit} results for your query "${keySearchs.trim()}"`,
                attachment: imgData
              },
              event.threadID,
              event.messageID
            );

            // Remove cached images after sending
            await fs.remove(path.join(__dirname, "cache"));
          } catch (error) {
            console.error(error);
            return api.sendMessage(`An error occurred.`, event.threadID, event.messageID);
          }

          return;
        }

        default: {
          const { data } = await axios.get(
            `${apiEndpoint}/ask/gpt?prompt=${encodeURIComponent(prompt)}`
          );

          message.reply(`💭 𝗚𝗣𝗧 \n━━━━━━━━━━━━\n\n${data}`);
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        }
      }
    } catch (error) {
      console.error(error);
      message.reply("");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};

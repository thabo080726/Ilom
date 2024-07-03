const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const config = {
  name: 'pinterest',
  aliases: ['pin'],
  version: '1.0',
  author: 'softrilez',
  role: 0,
  countDown: 10,
  category: 'utility',
  shortDescription: { en: 'Search for images on Pinterest.' },
  longDescription: { en: 'Search for images on Pinterest and display them.' },
  guide: { en: '{pn} [keyword] | [number of images]\n{pn} funny cats | 5' },
};

const onStart = async ({ api, args, message, event, usersData }) => {
  if (!event.isGroup) return;

  const [searchQuery, numImages = 1] = args.join(" ").split("|").map(item => item.trim());
  const { senderID } = event;
  const userData = await usersData.get(senderID);

  if (numImages > userData.money) {
    return message.reply(`You don't have enough quota for ${numImages} images.\n\nUse ;daily to get more quota.`);
  }

  if (!searchQuery) {
    return message.reply("Please enter a keyword\nExample: ;pin funny stickers | 8");
  }

  try {
    await usersData.set(senderID, { money: userData.money - numImages, data: userData.data });
    message.reaction("🆗", event.messageID);

    const response = await axios.get("https://samirxpikachu.onrender.com/pinterest", {
      params: { query: searchQuery, number: Math.min(parseInt(numImages), 15) },
    });

    const { result } = response.data;

    if (result && result.length > 0) {
      const downloadFolder = "tmp";
      const imagePaths = [];

      for (const [index, imageUrl] of result.entries()) {
        const imagePath = path.join(__dirname, downloadFolder, `image_${index + 1}.png`);
        const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
        await fs.writeFile(imagePath, imageResponse.data);
        imagePaths.push(imagePath);
      }

      message.reply({
        body: `Here are your images!`,
        attachment: imagePaths.map(imagePath => fs.createReadStream(imagePath)),
      }, async () => {
        for (const imagePath of imagePaths) {
          await fs.unlink(imagePath);
        }
      });
    } else {
      message.reply("No images found 🗿");
    }
  } catch (error) {
    console.error(error);
    message.reply("Couldn't find anything 🗿🤦🏻‍♂");
  }
};

module.exports = { config, onStart };

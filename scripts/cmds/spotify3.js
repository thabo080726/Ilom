const axios = require("axios");
const fs = require('fs');

module.exports = {
  config: {
    name: "musik",
    aliases: [`spotify`],
    version: "1.0",
    author: "Samir Œ",
    countDown: 0,
    role: 0,
    shortDescription: "Ambil audio dari Spotify",
    longDescription: "Ambil audio dari Spotify",
    category: "musik",
    guide: "{pn} balas atau tambahkan tautan gambar"
  },

  onStart: async function ({ api, event, args, message }) {
    if (!event.isGroup) return;

    const query = args.join(" ");
    if (!query) {
      return message.reply("Harap berikan nama lagu.");
    }

    try {
      const tracks = await fetchTracks(query);
      if (tracks.length === 0) {
        return message.reply("| Tidak ditemukan lagu untuk pencarian tersebut.");
      }

      const { trackInfo, attachments } = await prepareTracksForReply(tracks.slice(0, 6));
      const replyMessage = await message.reply({
        body: `${trackInfo}\n\nKetik 'next' untuk melihat lagu lebih banyak atau balas dengan nomor untuk memilih.`,
        attachment: attachments,
      });

      const data = {
        commandName: this.config.name,
        messageID: replyMessage.messageID,
        tracks: tracks,
        currentIndex: 6,
        originalQuery: query,
      };
      global.GoatBot.onReply.set(replyMessage.messageID, data);
    } catch (error) {
      console.error(error);
      api.sendMessage("Kesalahan: " + error, event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const userInput = args[0].toLowerCase();
    const { tracks, currentIndex, originalQuery } = Reply;

    message.unsend(Reply.messageID);

    if (userInput === 'next') {
      await handleNextCommand(api, event, message, tracks, currentIndex, originalQuery);
    } else if (!isNaN(userInput) && userInput >= 1 && userInput <= tracks.length) {
      await handleTrackSelection(api, event, message, tracks[userInput - 1]);
    }
  }
};

async function fetchTracks(query) {
  const url = 'https://itzpire.com/search/spotify?query=' + encodeURIComponent(query);
  const response = await axios.get(url);
  return response.data.data;
}

async function prepareTracksForReply(tracks) {
  const trackInfo = tracks.map((track, index) =>
    `${index + 1}. ${track.name}\nArtis: ${track.artists.map(artist => artist.name).join(', ')}\nAlbum: ${track.album.name}\nDurasi: ${track.duration_ms} ms\nTanggal Rilis: ${track.album.release_date}`
  ).join("\n\n");

  const thumbnails = tracks.map((track) => track.album.images[0].url);
  const attachments = await Promise.all(
    thumbnails.map((thumbnail) => global.utils.getStreamFromURL(thumbnail))
  );

  return { trackInfo, attachments };
}

async function handleNextCommand(api, event, message, tracks, currentIndex, originalQuery) {
  const nextTracks = await fetchTracks(originalQuery);

  if (nextTracks.length <= currentIndex) {
    return message.reply("\u26A0 | Tidak ada lagi lagu untuk pencarian tersebut.");
  }

  const { trackInfo, attachments } = await prepareTracksForReply(nextTracks.slice(currentIndex, currentIndex + 6));
  message.reply({
    body: `${trackInfo}\n\nKetik 'next' untuk melihat lagu lebih banyak atau balas dengan nomor untuk memilih.`,
    attachment: attachments,
  }, async (replyError, replyMessage) => {
    const data = {
      commandName: this.config.name,
      messageID: replyMessage.messageID,
      tracks: nextTracks,
      currentIndex: currentIndex + 6,
      originalQuery: originalQuery,
      previousMessageID: replyMessage.messageID,
      isFirstReply: false,
    };
    global.GoatBot.onReply.set(replyMessage.messageID, data);
  });
}

async function handleTrackSelection(api, event, message, selectedTrack) {
  const downloadingMessage = await message.reply(`| Mengunduh lagu "${selectedTrack.name}"`);

  const downloadUrl = 'https://itzpire.com/download/spotify?url=' + encodeURIComponent(selectedTrack.external_urls.spotify);

  try {
    const apiResponse = await axios.get(downloadUrl);
    if (apiResponse.data) {
      const metadata = apiResponse.data.data;
      const audioUrl = apiResponse.data.data.download;

      const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(__dirname + '/cache/spotify.mp3', Buffer.from(audioResponse.data));

      message.reply({
        body: `• Judul: ${metadata.title}\n• Artis: ${metadata.artist}`,
        attachment: fs.createReadStream(__dirname + '/cache/spotify.mp3')
      });
    } else {
      message.reply("Maaf, konten Spotify tidak dapat diunduh.");
    }
  } catch (error) {
    console.error(error);
    message.reply("Maaf, terjadi kesalahan saat memproses permintaan Anda.");
  }

  message.unsend(downloadingMessage.messageID);
  }
        

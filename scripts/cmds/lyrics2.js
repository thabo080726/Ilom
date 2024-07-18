const axios = require('axios');

module.exports = {
  config: {
    name: 'lyrics',
    version: '1.1',
    author: 'softriley',
    role: 0,
    shortDescription: 'Get lyrics for a song',
    category: 'music',
    guide: '{p}lyrics [song name]',
  },

  onStart: async function ({ api, event, args }) {
    if (!event.isGroup) return; 
    const songName = args.join(' ');

    if (!songName) {
      api.sendMessage('Please provide the name of the song.', event.threadID);
      return;
    }

    try {
      const apiUrl = `https://lyrist.vercel.app/api/${encodeURIComponent(songName)}`;
      const response = await axios.get(apiUrl);

      const lyrics = response.data.lyrics;
      const artist = response.data.artist;
      const title = response.data.title;

      if (!lyrics) {
        api.sendMessage('Lyrics not found for the given song.', event.threadID);
        return;
      }

      const infoMessage = `Lyrics for "${title}" by ${artist}:\n\n${lyrics}`;
      api.sendMessage(infoMessage, event.threadID);
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      api.sendMessage('An error occurred while fetching lyrics.', event.threadID);
    }
  },
};

module.exports = {
  config: {
    name: "profile",
    aliases: ["userinfo", "stalk"],
    version: "1.0",
    author: "Shikaki",
    countDown: 60,
    role: 0,
    shortDescription: "Lihat info pengguna dan avatar",
    longDescription: "Lihat info pengguna dan avatar dengan menyebutkan mereka",
    category: "info",
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];
    let uid;

    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        uid = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) {
          uid = match[1];
        }
      }
    }

    if (!uid) {
      uid = event.type === "message_reply" ? event.messageReply.senderID : uid2 || uid1;
    }

    api.getUserInfo(uid, async (err, userInfo) => {
      if (err) {
        return message.reply("Gagal mengambil informasi pengguna. ❌");
      }

      const avatarUrl = await usersData.getAvatarUrl(uid);

      let genderText;
      switch (userInfo[uid].gender) {
        case 1:
          genderText = "Cewek 👧";
          break;
        case 2:
          genderText = "Cowok 👦";
          break;
        default:
          genderText = "Tidak diketahui ❓";
      }

      const userInformation = `
        📝 Nama: ${userInfo[uid].name}
        🌐 URL Profil: ${userInfo[uid].profileUrl}
        🚻 Jenis Kelamin: ${genderText}
        👤 Tipe Pengguna: ${userInfo[uid].type}
        🤝 Teman: ${userInfo[uid].isFriend ? "Ya" : "Tidak"}
        🎉 Ulang Tahun Hari Ini: ${userInfo[uid].isBirthday ? "Ya 🎂" : "Tidak"}
      `;

      message.reply({
        body: userInformation.trim(),
        attachment: await global.utils.getStreamFromURL(avatarUrl)
      });
    });
  }
};

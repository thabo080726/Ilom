const fs = require('fs');
const ytdl = require('ytdl-core');
const { resolve } = require('path');
const moment = require("moment-timezone");

async function getdl(link, path) {
    var timestart = Date.now();
    if (!link) return 'Thiếu link';
    var resolveFunc, rejectFunc;
    var returnPromise = new Promise((resolve, reject) => {
        resolveFunc = resolve;
        rejectFunc = reject;
    });
    ytdl(link, {
        filter: format =>
            format.quality == 'tiny' && format.audioBitrate == 128 && format.hasAudio == true
    }).pipe(fs.createWriteStream(path))
        .on("close", async () => {
            var data = await ytdl.getInfo(link);
            var result = {
                title: data.videoDetails.title,
                dur: Number(data.videoDetails.lengthSeconds),
                viewCount: data.videoDetails.viewCount,
                likes: data.videoDetails.likes,
                uploadDate: data.videoDetails.uploadDate,
                sub: data.videoDetails.author.subscriber_count,
                author: data.videoDetails.author.name,
                timestart: timestart
            };
            resolveFunc(result);
        });
    return returnPromise;
}

function convertHMS(value) {
    const sec = parseInt(value, 10); 
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec % 3600) / 60); 
    let seconds = sec % 60; 
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return (hours != '00' ? hours + ':' : '') + minutes + ':' + seconds;
}

module.exports = {
    config: {
        name: "sing",
        version: "1.0",
        author: "LocDev",
        countDown: 5,
        role: 0,
        description: {
            vi: "",
            en: "",
        },
        category: "media",
        guide: {
            vi: "",
            en: "",
        },
    },
    langs: {
        vi: {},
        en: {},
    },
    onReply: async function ({ api, event, Reply }) {
        const axios = require('axios');
        const { createReadStream, unlinkSync, statSync } = require("fs-extra");
        const id = Reply.link[event.body - 1];
        try {
            const fileName = `${event.senderID}.mp3`;
            const path = `${__dirname}/cache/${fileName}`;
            const data = await getdl(`https://www.youtube.com/watch?v=${id}`, path);      
            if (fs.statSync(path).size > 26214400) {
                return api.sendMessage('❎ File quá lớn, vui lòng chọn bài khác!', event.threadID, () => fs.unlinkSync(path), event.messageID);
            }
            api.unsendMessage(Reply.messageID);
            return api.sendMessage({
                body: `🎬 Title: ${data.title}`,
                attachment: createReadStream(path)
            }, event.threadID, () => fs.unlinkSync(path), event.messageID);
        } catch (e) {
            console.log(e);
        }
    },
    onStart: async function ({ api, event, commandName, args }) {
        if (args.length == 0 || !args) return api.sendMessage('❎ Phần tìm kiếm không được để trống!', event.threadID, event.messageID);
        const keywordSearch = args.join(" ");
        const path = `${__dirname}/cache/sing-${event.senderID}.mp3`;
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
        }
        try {
            const link = [];
            const Youtube = require('youtube-search-api');
            const data = (await Youtube.GetListByKeyword(keywordSearch, false, 8)).items;
            const msg = data.map((value, index) => {
                link.push(value.id);
                return `|› ${index + 1}. ${value.title}\n|› 👤 Kênh: ${value.channelTitle}\n|› ⏱️ Thời lượng: ${value.length.simpleText}\n──────────────`;
            }).join('\n');
            return api.sendMessage(`📝 Có ${link.length} kết quả trùng với từ khóa tìm kiếm của bạn:\n──────────────\n${msg}\n\n📌 Reply (phản hồi) STT để tải nhạc`, event.threadID, (error, info) => global.GoatBot.onReply.set(info.messageID, {
                type: 'reply',
                commandName,
                messageID: info.messageID,
                author: event.senderID,
                link
            }), event.messageID);
        } catch (e) {
            return api.sendMessage('❎ Đã xảy ra lỗi, vui lòng thử lại sau!\n' + e, event.threadID, event.messageID);
        }
    }
}

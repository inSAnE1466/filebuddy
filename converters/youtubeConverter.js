// converters/youtubeConverter.js
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const convertYoutubeToMp3 = async (url, outputPath) => {
    return new Promise(async (resolve, reject) => {
        const videoInfo = await ytdl.getInfo(url);
        const title = videoInfo.videoDetails.title.replace(/[<>:"/\\|?*]+/g, '');
        const finalOutputPath = outputPath || `${title}.mp3`;

        const audioStream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });

        ffmpeg(audioStream)
            .audioBitrate(128)
            .toFormat('mp3')
            .on('error', (err) => reject(new Error(`FFMPEG Error: ${err.message}`)))
            .on('end', () => resolve(finalOutputPath))
            .save(finalOutputPath);
    });
};

module.exports = { convertYoutubeToMp3 };
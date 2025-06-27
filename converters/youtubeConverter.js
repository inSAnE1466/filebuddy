const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const os = require('os');

ffmpeg.setFfmpegPath(ffmpegPath);

const convertYoutubeToMp3 = async (url, outputPath, onProgress) => {
    try {
        // Get video info first
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[<>:"/\\|?*]+/g, '');
        
        // Determine final output path
        let finalOutputPath = outputPath;
        if (!outputPath) {
            const desktopPath = path.join(os.homedir(), 'Desktop');
            finalOutputPath = path.join(desktopPath, `${title}.mp3`);
        }
        
        return new Promise((resolve, reject) => {
            try {
                // Create audio stream with highest quality
                const audioStream = ytdl(url, {
                    filter: 'audioonly',
                    quality: 'highestaudio',
                    highWaterMark: 1 << 25 // 32MB buffer for better performance
                });
                
                let downloadedBytes = 0;
                const totalBytes = parseInt(info.formats.find(f => f.hasAudio && !f.hasVideo)?.contentLength || 0);
                
                // Track download progress
                audioStream.on('data', (chunk) => {
                    downloadedBytes += chunk.length;
                    if (onProgress && totalBytes > 0) {
                        const progress = Math.floor((downloadedBytes / totalBytes) * 50); // 50% for download
                        onProgress({ 
                            phase: 'downloading', 
                            progress,
                            downloaded: downloadedBytes,
                            total: totalBytes
                        });
                    }
                });
                
                audioStream.on('error', (err) => {
                    reject(new Error(`Download failed: ${err.message}`));
                });
                
                // Convert to MP3 with FFmpeg
                const ffmpegCommand = ffmpeg(audioStream)
                    .audioBitrate(320) // Highest quality as requested
                    .toFormat('mp3')
                    .on('error', (err) => {
                        reject(new Error(`Conversion failed: ${err.message}`));
                    })
                    .on('progress', (progress) => {
                        if (onProgress) {
                            // Convert progress to 50-100% range for conversion phase
                            const convertProgress = 50 + Math.floor((progress.percent || 0) / 2);
                            onProgress({ 
                                phase: 'converting', 
                                progress: convertProgress,
                                timeProcessed: progress.timemark
                            });
                        }
                    })
                    .on('end', () => {
                        resolve({
                            success: true,
                            title,
                            outputPath: finalOutputPath,
                            url
                        });
                    })
                    .save(finalOutputPath);
                    
            } catch (streamError) {
                reject(new Error(`Stream creation failed: ${streamError.message}`));
            }
        });
        
    } catch (error) {
        throw new Error(`YouTube conversion failed: ${error.message}`);
    }
};

const getVideoInfo = async (url) => {
    try {
        const info = await ytdl.getInfo(url);
        return {
            title: info.videoDetails.title,
            duration: info.videoDetails.lengthSeconds,
            author: info.videoDetails.author.name,
            viewCount: info.videoDetails.viewCount
        };
    } catch (error) {
        throw new Error(`Failed to get video info: ${error.message}`);
    }
};

module.exports = { 
    convertYoutubeToMp3, 
    getVideoInfo 
};
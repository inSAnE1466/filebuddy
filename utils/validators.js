const fs = require('fs');
const path = require('path');

const isYouTubeUrl = (input) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)/;
    return youtubeRegex.test(input);
};

const isValidFile = (filePath) => {
    try {
        return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch {
        return false;
    }
};

const getSupportedImageFormats = () => {
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'tiff', 'avif'];
};

const isImageFile = (filePath) => {
    const ext = path.extname(filePath).toLowerCase().slice(1);
    return getSupportedImageFormats().includes(ext);
};

const validateInput = (input) => {
    if (isYouTubeUrl(input)) {
        return { type: 'youtube', valid: true };
    }
    
    if (isValidFile(input)) {
        if (isImageFile(input)) {
            return { type: 'image', valid: true };
        }
        return { type: 'unknown', valid: false, error: 'Unsupported file format' };
    }
    
    return { type: 'unknown', valid: false, error: 'Invalid input: not a valid URL or file path' };
};

module.exports = {
    isYouTubeUrl,
    isValidFile,
    isImageFile,
    getSupportedImageFormats,
    validateInput
};
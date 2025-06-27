const sharp = require('sharp');
const path = require('path');
const os = require('os');

const convertImage = async (inputPath, outputPath, options = {}) => {
    try {
        const inputInfo = path.parse(inputPath);
        
        // If no output path specified, use Desktop with same name but different extension
        let finalOutputPath = outputPath;
        if (!outputPath) {
            const desktopPath = path.join(os.homedir(), 'Desktop');
            finalOutputPath = path.join(desktopPath, `${inputInfo.name}.jpg`);
        }
        
        const outputExt = path.extname(finalOutputPath).toLowerCase().slice(1);
        
        // Create Sharp instance
        let sharpInstance = sharp(inputPath);
        
        // Apply format-specific options
        switch (outputExt) {
            case 'jpg':
            case 'jpeg':
                sharpInstance = sharpInstance.jpeg({ 
                    quality: options.quality || 90,
                    progressive: true 
                });
                break;
            case 'png':
                sharpInstance = sharpInstance.png({ 
                    compressionLevel: options.compression || 6 
                });
                break;
            case 'webp':
                sharpInstance = sharpInstance.webp({ 
                    quality: options.quality || 90 
                });
                break;
            case 'avif':
                sharpInstance = sharpInstance.avif({ 
                    quality: options.quality || 80 
                });
                break;
            case 'tiff':
                sharpInstance = sharpInstance.tiff({ 
                    compression: 'lzw' 
                });
                break;
            case 'gif':
                // Note: Sharp doesn't support GIF output, would need different library
                throw new Error('GIF output not supported yet');
            default:
                throw new Error(`Unsupported output format: ${outputExt}`);
        }
        
        // Perform conversion
        await sharpInstance.toFile(finalOutputPath);
        
        return {
            success: true,
            inputPath,
            outputPath: finalOutputPath,
            inputFormat: inputInfo.ext.slice(1),
            outputFormat: outputExt
        };
        
    } catch (error) {
        throw new Error(`Image conversion failed: ${error.message}`);
    }
};

const getSupportedFormats = () => {
    return {
        input: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'tiff', 'avif', 'svg'],
        output: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff']
    };
};

module.exports = { 
    convertImage, 
    getSupportedFormats 
};
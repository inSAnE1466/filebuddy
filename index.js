#!/usr/bin/env node

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const { convertImage } = require('./converters/imageConverter');
const { convertYoutubeToMp3, getVideoInfo } = require('./converters/youtubeConverter');
const { validateInput, logger, createProgressBar, createDownloadProgress } = require('./utils');

const APP_NAME = 'FileBuddy';
const VERSION = '1.0.0';

// Main conversion function
const handleConvert = async (input, output) => {
    try {
        logger.title(`\n=' ${APP_NAME} v${VERSION}`);
        logger.info(`Processing: ${input}`);
        
        // Validate input
        const validation = validateInput(input);
        if (!validation.valid) {
            logger.error(validation.error);
            process.exit(1);
        }
        
        let result;
        
        switch (validation.type) {
            case 'youtube':
                result = await handleYouTubeConversion(input, output);
                break;
            case 'image':
                result = await handleImageConversion(input, output);
                break;
            default:
                logger.error(`Unsupported input type: ${validation.type}`);
                process.exit(1);
        }
        
        if (result.success) {
            logger.success(`Conversion complete!`);
            logger.info(`Output: ${result.outputPath}`);
        }
        
    } catch (error) {
        logger.error(`Conversion failed: ${error.message}`);
        process.exit(1);
    }
};

// Handle YouTube to MP3 conversion
const handleYouTubeConversion = async (url, outputPath) => {
    try {
        // Get video info first
        logger.info('Fetching video information...');
        const videoInfo = await getVideoInfo(url);
        logger.info(`Title: ${videoInfo.title}`);
        logger.info(`Author: ${videoInfo.author}`);
        logger.dim(`Duration: ${Math.floor(videoInfo.duration / 60)}:${(videoInfo.duration % 60).toString().padStart(2, '0')}`);
        
        // Create progress bar
        const progressBar = createDownloadProgress();
        progressBar.start(100, 0, { speed: 'N/A', eta: 'N/A' });
        
        let lastProgress = 0;
        
        const result = await convertYoutubeToMp3(url, outputPath, (progress) => {
            if (progress.progress > lastProgress) {
                lastProgress = progress.progress;
                
                if (progress.phase === 'downloading') {
                    const speed = progress.downloaded && progress.total 
                        ? `${Math.round(progress.downloaded / 1024 / 1024 * 10) / 10}MB`
                        : 'N/A';
                    progressBar.update(progress.progress, { 
                        speed: `${speed}`, 
                        eta: progress.progress > 0 ? Math.round((100 - progress.progress) * 0.5) : 'N/A'
                    });
                } else if (progress.phase === 'converting') {
                    progressBar.update(progress.progress, { 
                        speed: 'Converting...', 
                        eta: progress.progress > 50 ? Math.round((100 - progress.progress) * 0.2) : 'N/A'
                    });
                }
            }
        });
        
        progressBar.stop();
        return result;
        
    } catch (error) {
        throw new Error(`YouTube conversion failed: ${error.message}`);
    }
};

// Handle image conversion
const handleImageConversion = async (inputPath, outputPath) => {
    try {
        logger.info('Converting image...');
        
        const progressBar = createProgressBar('Converting');
        progressBar.start(100, 0);
        
        // Simulate progress for image conversion (Sharp is usually very fast)
        const progressInterval = setInterval(() => {
            progressBar.increment(10);
        }, 50);
        
        const result = await convertImage(inputPath, outputPath);
        
        clearInterval(progressInterval);
        progressBar.update(100);
        progressBar.stop();
        
        return result;
        
    } catch (error) {
        throw new Error(`Image conversion failed: ${error.message}`);
    }
};

// Interactive mode
const handleInteractive = async () => {
    const inquirer = require('inquirer');
    
    logger.title(`\n=' ${APP_NAME} Interactive Mode`);
    
    try {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'input',
                message: 'Enter file path or YouTube URL:',
                validate: (input) => {
                    if (!input.trim()) {
                        return 'Please enter a valid file path or URL';
                    }
                    const validation = validateInput(input.trim());
                    return validation.valid || validation.error;
                }
            },
            {
                type: 'input',
                name: 'output',
                message: 'Output path (optional - will use Desktop):',
                default: ''
            }
        ]);
        
        await handleConvert(answers.input.trim(), answers.output.trim() || null);
        
    } catch (error) {
        if (error.isTtyError) {
            logger.error('Interactive mode not supported in this environment');
        } else {
            logger.error(`Interactive mode error: ${error.message}`);
        }
        process.exit(1);
    }
};

// CLI setup with Yargs
yargs(hideBin(process.argv))
    .scriptName('filebuddy')
    .usage('$0 <command> [options]')
    .version(VERSION)
    
    // Convert command
    .command(
        'convert <input> [output]',
        'Convert a file or YouTube URL',
        (yargs) => {
            yargs
                .positional('input', {
                    describe: 'Input file path or YouTube URL',
                    type: 'string'
                })
                .positional('output', {
                    describe: 'Output file path (optional)',
                    type: 'string'
                });
        },
        (argv) => {
            handleConvert(argv.input, argv.output);
        }
    )
    
    // Interactive command
    .command(
        'interactive',
        'Start interactive mode',
        {},
        () => {
            handleInteractive();
        }
    )
    
    // Default command
    .command(
        '$0 [input] [output]',
        'Convert a file or YouTube URL (default command)',
        (yargs) => {
            yargs
                .positional('input', {
                    describe: 'Input file path or YouTube URL',
                    type: 'string'
                })
                .positional('output', {
                    describe: 'Output file path (optional)',
                    type: 'string'
                });
        },
        (argv) => {
            if (argv.input) {
                handleConvert(argv.input, argv.output);
            } else {
                handleInteractive();
            }
        }
    )
    
    .example('$0 convert "https://youtube.com/watch?v=abc123"', 'Convert YouTube video to MP3')
    .example('$0 convert image.png image.jpg', 'Convert PNG to JPG')
    .example('$0 interactive', 'Start interactive mode')
    .example('$0', 'Start interactive mode (default)')
    
    .help()
    .alias('help', 'h')
    .alias('version', 'v')
    .demandCommand(0)
    .strict()
    .parse();
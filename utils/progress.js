const cliProgress = require('cli-progress');
const chalk = require('chalk');

const createProgressBar = (label = 'Progress') => {
    return new cliProgress.SingleBar({
        format: `${chalk.cyan(label)} |${chalk.cyan('{bar}')}| {percentage}% | {value}/{total}`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
};

const createDownloadProgress = () => {
    return new cliProgress.SingleBar({
        format: `${chalk.blue('Downloading')} |${chalk.blue('{bar}')}| {percentage}% | {speed} | ETA: {eta}s`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
};

module.exports = {
    createProgressBar,
    createDownloadProgress
};
const chalk = require('chalk');

const logger = {
    info: (message) => console.log(chalk.blue('ℹ'), message),
    success: (message) => console.log(chalk.green('✓'), message),
    error: (message) => console.log(chalk.red('✗'), message),
    warning: (message) => console.log(chalk.yellow('⚠'), message),
    title: (message) => console.log(chalk.bold.cyan(message)),
    dim: (message) => console.log(chalk.dim(message))
};

module.exports = logger;
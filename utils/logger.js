const chalk = require('chalk');

const logger = {
    info: (message) => console.log(chalk.blue('[INFO]'), message),
    success: (message) => console.log(chalk.green('[OK]'), message),
    error: (message) => console.log(chalk.red('[ERROR]'), message),
    warning: (message) => console.log(chalk.yellow('[WARN]'), message),
    title: (message) => console.log(chalk.bold.cyan(message)),
    dim: (message) => console.log(chalk.dim(message))
};

module.exports = logger;
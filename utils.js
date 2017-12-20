const colors = require('colors/safe');
colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function prettyJsonPrint(json) {
    console.log(JSON.stringify(json, undefined, 2))
}

function printError(err) {
    console.log(colors.error(`[*] ERROR: ${err.message}`));
}

module.exports = {
    getRandomInt,
    prettyJsonPrint,
    printError
};
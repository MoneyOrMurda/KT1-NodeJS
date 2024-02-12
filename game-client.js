const fs = require('fs');
const zmq = require('zeromq');
const requester = zmq.socket('req');

const range = process.argv.slice(2).map(Number);
const min = Math.min(...range);
const max = Math.max(...range);

const logFilePath = 'client-log.txt';

function log(message) {
    console.log(message);
    fs.appendFileSync(logFilePath, message + '\n', 'utf8');
}

requester.connect('tcp://127.0.0.1:5050');
requester.send(JSON.stringify({ range: `${min}-${max}` }));

requester.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.answer !== undefined) {
        const guess = message.answer;
        log(`The client guessed the number: ${guess}`);

        if (guess < max) {
            log('Clue: More');
            requester.send(JSON.stringify({ hint: 'more' }));
        } else if (guess > min) {
            log('Clue: Less');
            requester.send(JSON.stringify({ hint: 'less' }));
        } else {
            log('The hidden number was guessed!');
            requester.close();
        }
    }
});

process.on('SIGINT', () => {
    requester.close();
    process.exit();
});
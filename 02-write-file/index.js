const fs = require('fs');
const path = require('path');
const readline = require('readline');
const process = require('process');

const { stdin, stdout } = process;

const output = fs.createWriteStream(path.join(__dirname, 'text.txt'));
const rl = readline.createInterface(stdin, stdout);

console.log('Please enter some text:');
rl.on('line', (input) => {
  if (input === 'exit') {
    quit();
  }

  output.write(`${input}\n`);
});

rl.on('SIGINT', () => {
  quit();
});

const quit = () => {
  console.log('Thank you for the text! Goodbye!');
  rl.close();
  process.exit();
};

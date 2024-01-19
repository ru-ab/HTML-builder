const fs = require('fs');
const path = require('path');

const readableStream = fs.createReadStream(
  path.join(__dirname, 'text.txt'),
  'utf-8',
);

let fileContent = '';
readableStream.on('data', (chunk) => (fileContent += chunk));
readableStream.on('end', () => console.log(fileContent));
readableStream.on('error', (error) => console.log('Error', error.message));

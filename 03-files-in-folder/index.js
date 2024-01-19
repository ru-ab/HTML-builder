const fsPromises = require('fs').promises;
const path = require('path');

const FOLDER_NAME = 'secret-folder';

(async function () {
  const objectsInFolder = await fsPromises.readdir(
    path.join(__dirname, FOLDER_NAME),
  );

  for (const name of objectsInFolder) {
    const filePath = path.join(__dirname, FOLDER_NAME, name);

    const stats = await fsPromises.stat(filePath);
    if (stats.isFile()) {
      const filename = path.parse(filePath).name;
      const fileExt = path.extname(filePath).slice(1);
      const fileSize = stats.size / 1000;

      console.log(`${filename} - ${fileExt} - ${fileSize}kb`);
    }
  }
})();

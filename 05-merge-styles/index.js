const fsPromises = require('fs').promises;
const path = require('path');

async function getFilesList(dirname) {
  return fsPromises.readdir(path.join(__dirname, dirname));
}

async function isStyle(filePath) {
  const stats = await fsPromises.stat(filePath);
  if (!stats.isFile()) {
    return false;
  }

  const fileExt = path.extname(filePath);
  return fileExt === '.css';
}

async function removeFile(filePath) {
  try {
    await fsPromises.unlink(filePath);
  } catch (e) {
    if (!e.code === 'ENOENT') {
      throw e;
    }
  }
}

(async function () {
  const targetFilePath = path.join(__dirname, 'project-dist', 'bundle.css');
  await removeFile(targetFilePath);

  const styles = await getFilesList('styles');
  for (const style of styles) {
    const filePath = path.join(__dirname, 'styles', style);
    if (await isStyle(filePath)) {
      const fileContent = await fsPromises.readFile(filePath);
      await fsPromises.appendFile(targetFilePath, fileContent);
    }
  }
})();

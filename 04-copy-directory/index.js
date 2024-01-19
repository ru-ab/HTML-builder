const fsPromises = require('fs').promises;
const path = require('path');

async function createDir(dirname) {
  await fsPromises.mkdir(path.join(__dirname, dirname), { recursive: true });
}

async function removeDir(dirname) {
  await fsPromises.rm(path.join(__dirname, dirname), {
    recursive: true,
    force: true,
  });
}

async function getFilesList(dirname) {
  return fsPromises.readdir(path.join(__dirname, dirname));
}

(async function () {
  await removeDir('files-copy');
  await createDir('files-copy');
  const filenames = await getFilesList('files');
  for (const filename of filenames) {
    const source = path.join(__dirname, 'files', filename);
    const dest = path.join(__dirname, 'files-copy', filename);
    await fsPromises.copyFile(source, dest);
  }
})();

const fsPromises = require('fs').promises;
const path = require('path');

async function createDir(dirPath) {
  await fsPromises.mkdir(dirPath, { recursive: true });
}

async function getFilesList(dirPath) {
  return fsPromises.readdir(dirPath);
}

async function isFile(filePath) {
  const stats = await fsPromises.stat(filePath);
  return stats.isFile();
}

async function hasExt(filePath, ext) {
  if (!(await isFile(filePath))) {
    return false;
  }

  const fileExt = path.extname(filePath);
  return fileExt === ext;
}

async function loadComponents(dirPath) {
  const components = new Map();

  const filenames = await getFilesList(dirPath);
  for (const filename of filenames) {
    const filePath = path.join(dirPath, filename);
    if (await hasExt(filePath, '.html')) {
      const filenameWithoutExt = filename.split('.')[0];
      const componentContent = await fsPromises.readFile(filePath, 'utf-8');
      components.set(filenameWithoutExt, componentContent.trim());
    }
  }

  return components;
}

async function createFile(filePath, fileContent) {
  await fsPromises.writeFile(filePath, fileContent);
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

async function removeDir(dirPath) {
  await fsPromises.rm(dirPath, {
    recursive: true,
    force: true,
  });
}

async function generateHtml(componentsDirPath, templateFilePath, htmlFilePath) {
  const components = await loadComponents(componentsDirPath);

  let resultHtml = await fsPromises.readFile(templateFilePath, 'utf-8');
  const templateComponents = Array.from(
    resultHtml.matchAll(/{{\s*[\w-]+\s*}}/g),
  ).reverse();

  for (const templateComponent of templateComponents) {
    const componentName = templateComponent[0].slice(2, -2).trim();
    if (!components.has(componentName)) {
      throw new Error(
        `The component "${componentName}" is not found in the components folder`,
      );
    }

    const partBefore = resultHtml.slice(0, templateComponent.index);
    const replacement = components.get(componentName);
    const partAfter = resultHtml.slice(
      templateComponent.index + templateComponent[0].length,
    );

    resultHtml = `${partBefore}${replacement}${partAfter}`;
  }

  await removeFile(htmlFilePath);
  await createFile(htmlFilePath, resultHtml);
}

async function generateCss(stylesDirPath, cssFilePath) {
  await removeFile(cssFilePath);

  const styles = await getFilesList(stylesDirPath);
  for (const style of styles) {
    const filePath = path.join(stylesDirPath, style);
    if (await hasExt(filePath, '.css')) {
      const fileContent = await fsPromises.readFile(filePath);
      await fsPromises.appendFile(cssFilePath, fileContent);
    }
  }
}

async function copyDir(fromPath, toPath) {
  await removeDir(toPath);
  await createDir(toPath);
  const filenames = await getFilesList(fromPath);
  for (const filename of filenames) {
    const source = path.join(fromPath, filename);
    const dest = path.join(toPath, filename);
    if (await isFile(source)) {
      await fsPromises.copyFile(source, dest);
    } else {
      const destDirPath = path.join(toPath, path.basename(source));
      await copyDir(source, destDirPath);
    }
  }
}

(async function () {
  const distDir = path.join(__dirname, 'project-dist');
  await createDir(distDir);

  const componentsDirPath = path.join(__dirname, 'components');
  const templateFilePath = path.join(__dirname, 'template.html');
  const htmlFilePath = path.join(distDir, 'index.html');
  await generateHtml(componentsDirPath, templateFilePath, htmlFilePath);

  const stylesDirPath = path.join(__dirname, 'styles');
  const cssFilePath = path.join(distDir, 'style.css');
  await generateCss(stylesDirPath, cssFilePath);

  const assetsSourcePath = path.join(__dirname, 'assets');
  const assetsDestPath = path.join(distDir, 'assets');
  await copyDir(assetsSourcePath, assetsDestPath);
})();

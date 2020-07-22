const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const builder = require('electron-builder');
const paths = require('../webpack/paths');

function shouldBuildOs(os) {
  const { ELECTRON_OS } = process.env;

  return !ELECTRON_OS || ELECTRON_OS === os;
}

async function buildElectron() {
  console.log('Beginning Electron build process...');
  const jsBuildDir = paths.dist;
  const electronBuildsDir = paths.electronBuilds;
  const compression = 'store';

  console.log('Clearing out old builds...');
  rimraf.sync(electronBuildsDir);

  const buildPackageLocation = path.join(jsBuildDir, 'package.json');

  if (fs.existsSync(buildPackageLocation)) {
    fs.unlinkSync(path.join(jsBuildDir, 'package.json'));
  }

  const copyToAppDir = (sourceUrl, destinationFilename) => {
    fs.copyFileSync(sourceUrl, path.join(jsBuildDir, destinationFilename));
  };

  // Builder requires package.json be in the app directory, so copy it in
  copyToAppDir(path.join(paths.root, 'package.json'), 'package.json');
  copyToAppDir(path.join(paths.electron, 'main/index.js'), 'main.js');
  copyToAppDir(path.join(paths.electron, 'main/preload.js'), 'preload.js');
  copyToAppDir(path.join(paths.electron, 'main/logger.js'), 'logger.js');

  const productName = 'TimeNode';

  console.log('Building...');
  try {
    await builder.build({
      mac: shouldBuildOs('mac') ? ['zip', 'dmg'] : undefined,
      win: shouldBuildOs('windows') ? ['nsis'] : undefined,
      linux: shouldBuildOs('linux') ? ['AppImage'] : undefined,
      x64: true,
      ia32: false,
      config: {
        appId: 'com.github.chronologic.timenode',
        productName,
        artifactName: '${productName}-${version}-${arch}.${ext}',
        directories: {
          app: jsBuildDir,
          output: electronBuildsDir
        },
        mac: {
          category: 'public.app-category.finance',
          icon: path.join(paths.electron, 'icons/icon.icns'),
          compression
        },
        win: {
          icon: path.join(paths.electron, 'icons/icon.ico'),
          compression
        },
        linux: {
          category: 'Finance',
          icon: path.join(paths.electron, 'icons/icon.png'),
          compression
        },
        // IMPORTANT: Prevents from auto publishing to GitHub in CI environments
        publish: [
          {
            provider: 'bintray',
            repo: 'TimeNode',
            owner: 'chronologic'
          }
        ],
        // IMPORTANT: Prevents extending configs in node_modules
        extends: null
      }
    });

    console.info(`Electron builds are finished! Available at ${electronBuildsDir}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

buildElectron();

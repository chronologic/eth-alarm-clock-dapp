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

  // Builder requires package.json be in the app directory, so copy it in
  fs.copyFileSync(path.join(paths.root, 'package.json'), path.join(jsBuildDir, 'package.json'));
  fs.copyFileSync(path.join(paths.electron, 'main/index.js'), path.join(jsBuildDir, 'main.js'));

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
        productName: 'TimeNode',
        artifactName: '${productName}-${version}-${arch}-${env.TRAVIS_COMMIT}.${ext}',
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
            package: 'Package-1',
            repo: 'eth-alarm-clock-dapp',
            owner: 'kuzirashi',
            user: 'kuzirashi'
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

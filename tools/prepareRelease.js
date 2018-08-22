const fs = require('fs');
const paths = require('../webpack/paths');
const path = require('path');
const rimraf = require('rimraf');

rimraf.sync(path.join(paths.electronBuilds, 'mac'));
rimraf.sync(path.join(paths.electronBuilds, 'linux-unpacked'));
rimraf.sync(path.join(paths.electronBuilds, 'win-unpacked'));
fs.renameSync(paths.electronBuilds, path.join(paths.dist, 'electron-builds'));

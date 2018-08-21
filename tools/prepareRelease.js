const fs = require('fs');
const paths = require('../webpack/paths');
const path = require('path');

fs.renameSync(paths.electronBuilds, path.join(paths.dist, 'electron-builds'));

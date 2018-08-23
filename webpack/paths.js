const path = require('path');

const root = path.join(__dirname, '../');
const dist = path.join(root, 'dist');

module.exports = {
  root,
  src: path.join(__dirname, '../app'),
  dist,
  electron: path.join(__dirname, '../electron-app'),
  electronBuilds: path.join(root, 'electron-builds')
};

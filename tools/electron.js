const url = require('url');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  
  const WEB_FOLDER = '../out';
  const PROTOCOL = 'file';

  electron.protocol.interceptFileProtocol(PROTOCOL, (request, callback) => {
    // // Strip protocol
    let url = request.url.substr(PROTOCOL.length + 1);

    // Build complete path for node require function
    url = path.join(__dirname, WEB_FOLDER, url);

    // Replace backslashes by forward slashes (windows)
    // url = url.replace(/\\/g, '/');
    url = path.normalize(url);

    console.log(url);
    callback({path: url});
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false
    }
  });

  mainWindow.toggleDevTools();
  const mainPath =  isDev ? 'http://localhost:8080' : url.format({
    pathname: 'index.html',
    protocol: PROTOCOL + ':',
    slashes: true
  });

  // and load the index.html of the app.
  mainWindow.loadURL(mainPath);

  mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

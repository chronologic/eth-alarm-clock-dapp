const url = require('url');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {

  const WEB_FOLDER = '../out';
  const PROTOCOL = 'file';

  electron.protocol.interceptFileProtocol(PROTOCOL, (request, callback) => {
    // // Strip protocol
    let url = request.url.substr(PROTOCOL.length + 1);

    // Build complete path for node require function for file paths
    url = path.join(__dirname, WEB_FOLDER, url);

    // Replace backslashes by forward slashes (windows)
    // url = url.replace(/\\/g, '/');
    url = path.normalize(url);

    callback({ path: url });
  });

  const webPreferences = {
    nodeIntegration: false,
    devTools: isDev ? true : false
  };

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: webPreferences
  });

  if ( isDev ) {
    mainWindow.toggleDevTools();
  }

  const mainPath =  isDev ? 'http://localhost:8080' : url.format({
    pathname: 'index.html',
    protocol: PROTOCOL + ':',
    slashes: true
  });

  mainWindow.loadURL(mainPath);

  mainWindow.once('ready-to-show', async () => {
    await mainWindow.webContents.executeJavaScript( 'setElectron();');
    mainWindow.show();
  });

  mainWindow.on('closed', () => (mainWindow = null));


  const template = [{
      label: 'Application',
      submenu: [
          { label: 'Quit', accelerator: 'Command+Q', click: function() { app.quit(); } }
      ] }, {
      label: 'Edit',
      submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
          { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ] }
  ];

  if (!isDev) {
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }
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

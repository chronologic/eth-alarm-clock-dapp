// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, shell, protocol, globalShortcut } = require('electron');
const path = require('path');
const urlLib = require('url');

const packageJson = require('./package.json');

const isDev = require('electron-is-dev');

const PROTOCOL = 'file';

const MAIN_URL = urlLib.format({
  protocol: PROTOCOL,
  slashes: true,
  pathname: path.join(__dirname, 'index.html')
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // mainWindow.toggleDevTools();

  // Handle files that do not have the correct paths set (assets, worker file, etc.)
  protocol.interceptFileProtocol(PROTOCOL, (request, callback) => {
    let url = request.url.substr(PROTOCOL.length + 1);

    if (request.url.indexOf(__dirname) < 0) {
      const filename = request.url.split(PROTOCOL + '://')[1];
      url = `/${__dirname}${filename}`;
    }

    callback({ path: url });
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html of the app.
  mainWindow.loadURL(MAIN_URL);

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  const HELP_MENU = {
    role: 'help',
    submenu: [
      {
        label: `TimeNode v${packageJson.version}`,
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Report a Bug',
        click() {
          shell.openExternal(`${packageJson.repository.url}/issues/new`);
        }
      }
    ]
  };

  const template = [
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ]
    },
    HELP_MENU
  ];

  if (process.platform === 'darwin') {
    app.getName = () => 'TimeNode';

    template.unshift({
      label: 'TimeNode',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  if (!isDev) {
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  mainWindow.webContents.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== MAIN_URL) {
      event.preventDefault();
    }
  });

  mainWindow.reload = () => {
    mainWindow.loadURL(MAIN_URL);
  };

  globalShortcut.register('F5', mainWindow.reload);
  globalShortcut.register('CommandOrControl+R', mainWindow.reload);

  mainWindow.getDirName = () => __dirname;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, protocol, shell } = require('electron');
const path = require('path');
const os = require('os');

const isDev = require('electron-is-dev');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  const PROTOCOL = 'file';

  // mainWindow.toggleDevTools();

  const prepareElectron = () => {
    mainWindow.webContents.once('dom-ready', async () => {
      await mainWindow.webContents.executeJavaScript('setElectron();');
    });
  };

  protocol.interceptFileProtocol(PROTOCOL, (request, callback) => {
    // Strip protocol
    let url = request.url.substr(PROTOCOL.length + 1);

    let packagePath = __dirname;
    const windows = os.platform() === 'win32';

    if (windows) {
      packagePath = packagePath.replace(/\\/g, '/');

      if (url.indexOf('///') === 0) {
        url = url.slice(3, url.length);
      }
    }

    if (url.indexOf(packagePath) === -1) {
      // Build complete path for node require function for file paths
      if (windows) {
        url = path.join(packagePath, url.slice(3, url.length));

        // Replace backslashes by forward slashes (windows)
        url = url.replace(/\\/g, '/');
      } else {
        url = path.join(packagePath, url);
      }

      url = path.normalize(url);
    }

    callback({ path: url });

    if (url.indexOf('index.html') > -1) prepareElectron();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

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
    }
  ];

  if (process.platform === 'darwin') {
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

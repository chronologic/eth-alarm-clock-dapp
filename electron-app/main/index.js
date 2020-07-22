/* eslint-disable no-console */

// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, Menu, shell, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const FileLogger = require('./logger');

const path = require('path');
const urlLib = require('url');

const packageJson = require('./package.json');

const isDev = require('electron-is-dev');

const APP_NAME = 'TimeNode';
const PROTOCOL = 'file';

const logsFile = `${app.getPath('userData')}/timenode.log`;
const logger = new FileLogger(logsFile, 1);

let MAIN_URL = urlLib.format({
  protocol: PROTOCOL,
  slashes: true,
  pathname: path.join(__dirname, 'index.html')
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isMacOS = process.platform === 'darwin';

autoUpdater.autoDownload = false;
let shouldShowUpToDate = false;
let updateInProgress = false;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
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

  mainWindow.reload = () => {
    mainWindow.loadURL(MAIN_URL);
  };

  const HELP_MENU = {
    role: 'help',
    submenu: [
      {
        label: `TimeNode v${packageJson.version}`,
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Open Dev Tools',
        click() {
          mainWindow.webContents.openDevTools();
        }
      },
      {
        label: 'Report an Issue',
        click() {
          shell.openExternal(`${packageJson.repository.url}/issues/new`);
        }
      }
    ]
  };

  const checkForUpdates = {
    label: 'Check for Updates...',
    click() {
      shouldShowUpToDate = true;

      if (isMacOS) {
        shell.openExternal(`${packageJson.repository.url}/releases`);
      } else if (updateInProgress) {
        dialog.showMessageBox(
          {
            type: 'info',
            title: 'Update in progress...',
            message: 'Update in progress...',
            detail:
              'There is another update in progress. Please wait for it to finish before checking for new updates.'
          },
          () => console.log('Blocked checking for updates.')
        );
      } else {
        autoUpdater.checkForUpdates();
      }
    }
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
    {
      label: 'Window',
      submenu: [{ label: 'Reload', accelerator: 'CmdOrCtrl+R', click: mainWindow.reload }]
    },
    HELP_MENU
  ];

  if (isMacOS) {
    app.getName = () => APP_NAME;

    template.unshift({
      label: APP_NAME,
      submenu: [
        { role: 'about' },
        checkForUpdates,
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
  } else {
    template.unshift({
      label: 'File',
      submenu: [checkForUpdates, { type: 'separator' }, { role: 'quit' }]
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  if (!isMacOS) {
    autoUpdater.checkForUpdates();
  }
  createWindow();
});

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

autoUpdater.on('update-available', info => {
  dialog.showMessageBox(
    {
      type: 'info',
      title: `New version available!`,
      message: `${APP_NAME} update available!`,
      detail: `Do you want update to version ${
        info.version
      } now?\nWe highly recommend using the latest version of ${APP_NAME}.`,
      buttons: ['Yes', 'No']
    },
    buttonIndex => {
      if (buttonIndex === 0) {
        autoUpdater.downloadUpdate();
      }
    }
  );
});

autoUpdater.on('update-not-available', () => {
  if (shouldShowUpToDate) {
    dialog.showMessageBox({
      type: 'info',
      title: 'No Updates',
      message: 'No Updates.',
      detail: 'Current version is up-to-date.'
    });
  }
});

// DOWNLOAD SECTION
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(
    {
      type: 'info',
      title: 'Updates downloaded',
      message: 'Updates downloaded',
      detail: 'The application will now restart to perform the update.',
      buttons: ['Restart']
    },
    () => {
      updateInProgress = false;
      mainWindow.webContents.executeJavaScript(`localStorage.removeItem('changelogSeen')`);
      setImmediate(() => autoUpdater.quitAndInstall());
    }
  );
});

let shownDownloadInProgressScreen = false;
autoUpdater.on('download-progress', progressObj => {
  updateInProgress = true;

  const { percent, transferred, total } = progressObj;
  mainWindow.setProgressBar(percent / 100);
  console.log(`Downloading updates... Downloaded ${percent.toFixed(2)}% (${transferred}/${total})`);

  if (!shownDownloadInProgressScreen) {
    shownDownloadInProgressScreen = true;
    dialog.showMessageBox(
      {
        type: 'info',
        title: 'The update is starting...',
        message: 'The update is starting...',
        detail: `Check the progress bar on the ${APP_NAME} icon.`
      },
      () => console.log('Shown download screen.')
    );
  }
});

autoUpdater.on('error', error => {
  dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString());
});

ipcMain.on('save-timenode-logs', (event, log) => {
  logger.log(log);
});

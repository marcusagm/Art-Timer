// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Menu} = require('electron');

// Cria a estrutura do menu do sistema
// import mainMenuTemplate from './electron/MainMenu.js';
const mainMenuTemplate = [];

// const ioHook = require('iohook');

// ioHook.on('mousemove', event => {
//   console.log(event); // { type: 'mousemove', x: 700, y: 400 }
// });

// // Register and start hook
// ioHook.start();

// app.disableHardwareAcceleration();

app.setName('ArtTimer');
if (process.platform === 'darwin') {

    app.setAboutPanelOptions({
        applicationName: "ArtTimer",
        applicationVersion: "0.0.1",
        copyright: "Marcus Maia",
        website: "marcusmaia.com"
    });
    mainMenuTemplate.unshift({
        label: 'ArtTimer',
        submenu: [{
            label: `About ArtTimer`,
            role: 'about'
        }, {
            type: 'separator'
        }, {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function () {
              app.exit();
            }
        }]
    });
}

// delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
// process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 180, 
        height: 115, 
        show: false,
        frame: false,
        minimizable: false,
        maximizable: false,
        closable: false,
        // movable:true,
        resizable: false,
        hasShadow: false,
        transparent: true,
        alwaysOnTop: true,
        titleBarStyle: 'hidden',
        title: "ArtTimer",
        webPreferences: {
          nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile('./src/views/index.htm');
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        app.quit();
    });

    // Adiciona o menu através de um template
    if (process.platform === 'darwin') {
        // const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
        // Menu.setApplicationMenu(mainMenu);
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('close-me', function(evt, arg) {
    app.exit();
});

ipcMain.on('open-config', function(evt, arg) {
    createConfigWindow();
});

ipcMain.on('close-config', function(evt, arg) {
    if (configWindow) {
        configWindow.close();
    }
    mainWindow.webContents.send('update-config', arg);
});

let configWindow = null;
function createConfigWindow() {
    if (configWindow !== null) {
        configWindow.focus();
    } else {
        configWindow = new BrowserWindow({
            width: 300, 
            height: 400, 
            show: false,
            parent: mainWindow,
            modal: true,
            webPreferences: {
                nodeIntegration: true
            }
        });

        // and load the index.html of the app.
        configWindow.loadFile('./src/views/config.htm');
        configWindow.once("ready-to-show", () => {
            configWindow.show();
        });

        // Open the DevTools.
        // mainWindow.webContents.openDevTools()

        // Emitted when the window is closed.
        configWindow.on('closed', function () {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            configWindow = null;
        });
    }
}
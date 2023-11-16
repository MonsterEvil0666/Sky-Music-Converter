const { app, BrowserWindow, Menu } = require('electron');

let mainWindow;

const path = require('path');
const iconPath = path.join(__dirname, 'Resource', 'SkyIcon.png');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 566,
    resizable: false, // Desabilita a capacidade de redimensionar a janela
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('index.html');

  // Remover a barra de menus
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

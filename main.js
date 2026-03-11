const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // icon: path.join(__dirname, 'public', 'favicon.ico')
  });

  const url = isDev ? 'http://localhost:3000' : 'http://localhost:3000'; // Tetap localhost karena server berjalan di background
  
  // Tunggu sebentar sampai server naik (di dev mode)
  if (isDev) {
    setTimeout(() => {
      mainWindow.loadURL(url);
    }, 5000);
  } else {
    mainWindow.loadURL(url);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  const serverPath = isDev ? 'server.ts' : path.join(__dirname, 'dist', 'server.js');
  
  if (isDev) {
    serverProcess = spawn('npx', ['ts-node', serverPath], {
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' }
    });
  } else {
    serverProcess = spawn('node', [serverPath], {
      shell: true,
      env: { ...process.env, NODE_ENV: 'production', PORT: 3000 }
    });
  }

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
    if (data.toString().includes('Ready on')) {
      if (!mainWindow) createWindow();
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });
}

app.on('ready', () => {
  startServer();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

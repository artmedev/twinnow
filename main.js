const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  const w = new BrowserWindow({ width: 1400, height: 900, webPreferences: { preload: path.join(__dirname, 'preload.js') } });
  w.setMenuBarVisibility(false);
  w.loadFile(path.join(__dirname, 'dist', 'index.html'));
});
app.on('window-all-closed', () => app.quit());

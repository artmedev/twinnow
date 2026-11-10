const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs'), fsp = fs.promises, path = require('path');

const EXT = new Set(['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp', '.tif', '.tiff']);
const SKIP = new Set(['windows', 'program files', 'program files (x86)', 'programdata', 'appdata', 'node_modules', '$recycle.bin', 'system volume information']);
const isImg = f => EXT.has(path.extname(f).toLowerCase());

app.whenReady().then(() => {
  const w = new BrowserWindow({ width: 1400, height: 900, webPreferences: { preload: path.join(__dirname, 'preload.js') } });
  w.setMenuBarVisibility(false);
  w.loadFile(path.join(__dirname, 'dist', 'index.html'));
});
app.on('window-all-closed', () => app.quit());

ipcMain.handle('pickDir', async () => {
  const r = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});

// Recursively find folders containing images
ipcMain.handle('scan', async (e, root) => {
  const out = [];
  async function walk(dir) {
    let ents;
    try { ents = await fsp.readdir(dir, { withFileTypes: true }); } catch { return; }
    let n = 0;
    for (const d of ents) {
      if (d.isDirectory()) {
        if (!SKIP.has(d.name.toLowerCase()) && !d.name.startsWith('.')) await walk(path.join(dir, d.name));
      } else if (isImg(d.name)) n++;
    }
    if (n) { out.push({ dir, n }); e.sender.send('scanProgress', out.length); }
  }
  await walk(root);
  return out;
});


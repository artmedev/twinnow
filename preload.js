const { contextBridge, ipcRenderer } = require('electron');
const call = ch => (...a) => ipcRenderer.invoke(ch, ...a);
contextBridge.exposeInMainWorld('api', {
  pickDir: call('pickDir'), scan: call('scan'),
  onScan: cb => ipcRenderer.on('scanProgress', (e, n) => cb(n)),
});

const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const path = require("path");
const { startServer } = require("./server");

const PORT = 47613;   // FIJO: el origen (http://127.0.0.1:47613) es donde se guardan tus partidas; no lo cambies
const ROOT = path.join(__dirname, "..", "www");

if (!app.requestSingleInstanceLock()) app.quit();

let win;
async function crear() {
  try { await startServer(ROOT, PORT); }
  catch (e) { dialog.showErrorBox("F1 Glory", `No pude abrir el puerto ${PORT} (¿ya hay otra copia abierta?).\n${e.message}`); return app.quit(); }

  Menu.setApplicationMenu(Menu.buildFromTemplate([{ role: "viewMenu" }]));   // Alt → Ver → Herramientas de desarrollo
  win = new BrowserWindow({ width: 1180, height: 820, minWidth: 380, minHeight: 600, backgroundColor: "#15151e", autoHideMenuBar: true, title: "F1 Glory" });
  win.loadURL(`http://127.0.0.1:${PORT}/`);
  const esLocal = u => u.startsWith(`http://127.0.0.1:${PORT}/`);
  win.webContents.setWindowOpenHandler(({ url }) => { if (!esLocal(url)) shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!esLocal(url)) { e.preventDefault(); shell.openExternal(url); } });
}
app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(crear);
app.on("window-all-closed", () => app.quit());

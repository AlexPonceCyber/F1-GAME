// Mini servidor INTERNO de la app de Windows (solo escucha en 127.0.0.1). Sirve www/ tal cual lo haría la web,
// para que rutas como /ico/xxx.png y el localStorage se comporten igual. No hay que instalar ni encender nada.
const http = require("http"), fs = require("fs"), path = require("path");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".gif": "image/gif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf" };

function startServer(root, port) {
  root = path.normalize(root);
  return new Promise((resolve, reject) => {
    const srv = http.createServer((req, res) => {
      let p;
      try { p = decodeURIComponent(req.url.split("?")[0]); } catch (e) { res.writeHead(400); return res.end(); }
      if (p.startsWith("/api/") || p.startsWith("/_vercel/")) {       // el ranking online no existe en tu copia
        res.writeHead(404, { "Content-Type": "application/json" }); return res.end('{"ok":false}');
      }
      if (p === "/") p = "/index.html";
      const f = path.normalize(path.join(root, p));
      if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
      fs.readFile(f, (err, data) => {
        if (err) { res.writeHead(404); return res.end(); }
        res.writeHead(200, { "Content-Type": MIME[path.extname(f).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
        res.end(data);
      });
    });
    srv.on("error", reject);
    srv.listen(port, "127.0.0.1", () => resolve(srv));
  });
}
module.exports = { startServer };

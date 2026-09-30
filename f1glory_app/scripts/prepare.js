// Prepara la carpeta www/ (lo que empaquetan Android y Windows):
//  1) baja las imágenes que falten a game/   2) copia game/ -> www/
//  3) baja las fuentes de Google para que funcione sin internet   4) pequeños parches
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), GAME = path.join(ROOT, "game"), WWW = path.join(ROOT, "www");
const BASE = "https://f1-glory.com/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function get(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return Buffer.from(await r.arrayBuffer());
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); }));
}

(async () => {
  // 1) imágenes
  const lista = fs.readFileSync(path.join(GAME, "assets.txt"), "utf8").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const faltan = lista.filter(a => !fs.existsSync(path.join(GAME, a)));
  let ok = 0, no = 0;
  await pool(faltan, 8, async a => {
    try {
      const d = await get(BASE + a.split("/").map(encodeURIComponent).join("/"));
      fs.mkdirSync(path.dirname(path.join(GAME, a)), { recursive: true });
      fs.writeFileSync(path.join(GAME, a), d); ok++;
    } catch (e) { no++; }
  });
  console.log(`Imágenes: ${lista.length - faltan.length} ya estaban, ${ok} bajadas, ${no} no encontradas (algunas es normal)`);
  if (faltan.length && ok === 0) console.warn("⚠️  No se bajó ninguna imagen: ¿sin internet?");

  // 2) copiar
  fs.rmSync(WWW, { recursive: true, force: true });
  fs.cpSync(GAME, WWW, { recursive: true, filter: s => path.basename(s) !== "assets.txt" });
  let html = fs.readFileSync(path.join(WWW, "index.html"), "utf8");

  // 3) fuentes locales
  try {
    const m = html.match(/href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/);
    if (m) {
      const css = (await get(m[1].replace(/&amp;/g, "&"))).toString();
      const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(x => x[1]))];
      fs.mkdirSync(path.join(WWW, "fonts"), { recursive: true });
      let out = css, i = 0;
      for (const u of urls) {
        const ext = (u.match(/\.(woff2|woff|ttf)(?:\?|$)/) || [null, "woff2"])[1];
        const name = `f${i++}.${ext}`;
        fs.writeFileSync(path.join(WWW, "fonts", name), await get(u));
        out = out.split(u).join("fonts/" + name);
      }
      fs.writeFileSync(path.join(WWW, "fonts.css"), out);
      html = html.replace(m[1], "fonts.css");
      console.log(`Fuentes: ${urls.length} archivos guardados en local`);
    }
  } catch (e) { console.warn("⚠️  Fuentes no descargadas (se usarán las de Google si hay internet):", e.message); }

  // 4) parche: esconder la cinta «BETA» (fuera de f1-glory.com el juego se cree en una beta y la pinta;
  //    además, en ese modo no envía puntuaciones al ranking, que es lo que queremos)
  html = html.replace("</head>", "<style>#betaBar{display:none!important}</style></head>");
  fs.writeFileSync(path.join(WWW, "index.html"), html);

  // icono para Windows
  const ic = path.join(WWW, "icon-512.png");
  if (fs.existsSync(ic)) { fs.mkdirSync(path.join(ROOT, "build"), { recursive: true }); fs.copyFileSync(ic, path.join(ROOT, "build", "icon.png")); }
  console.log("www/ listo");
})().catch(e => { console.error(e); process.exit(1); });

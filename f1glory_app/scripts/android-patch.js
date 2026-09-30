// Se ejecuta en la nube justo después de `npx cap add android`. Hace dos cosas:
//  1) FIRMA FIJA: usa siempre el mismo keystore (keystore/f1glory-debug.keystore). Sin esto cada compilación
//     saldría firmada distinta y Android no te dejaría instalar la nueva encima de la vieja (perderías las partidas).
//  2) ICONO: pone el icono del juego (si hay ImageMagick; si falla, se queda el icono por defecto).
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, ".."), AND = path.join(ROOT, "android");

// 1) firma
const gp = path.join(AND, "app", "build.gradle");
let g = fs.readFileSync(gp, "utf8");
if (!g.includes("f1glory-debug.keystore")) {
  g = g.replace(/android \{\n/, `android {
    signingConfigs {
        debug {
            storeFile file('../../keystore/f1glory-debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
`);
  fs.writeFileSync(gp, g);
}
if (!g.includes("f1glory-debug.keystore")) { console.error("No pude parchear build.gradle"); process.exit(1); }
console.log("Firma fija: OK");

// 2) icono
try {
  const src = path.join(ROOT, "www", "icon-512.png");
  if (!fs.existsSync(src)) throw new Error("no hay www/icon-512.png");
  const res = path.join(AND, "app", "src", "main", "res");
  const sizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  const bin = (() => { for (const b of ["magick", "convert"]) { try { execFileSync(b, ["-version"]); return b; } catch (e) {} } throw new Error("sin ImageMagick"); })();
  for (const [d, s] of Object.entries(sizes)) {
    for (const n of ["ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"]) {
      const out = path.join(res, `mipmap-${d}`, n);
      execFileSync(bin, [src, "-resize", `${s}x${s}`, out]);
    }
  }
  fs.rmSync(path.join(res, "mipmap-anydpi-v26"), { recursive: true, force: true });  // icono adaptativo por defecto fuera
  console.log("Icono: OK");
} catch (e) { console.warn("Icono por defecto (no pasa nada):", e.message); }

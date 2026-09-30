const fs = require("fs");
module.exports = {
  appId: "local.f1glory.app",
  productName: "F1 Glory",
  directories: { output: "dist", buildResources: "build" },
  files: ["electron/**", "www/**", "package.json"],
  win: { target: [{ target: "nsis", arch: ["x64"] }], ...(fs.existsSync("build/icon.png") ? { icon: "build/icon.png" } : {}) },
  nsis: { oneClick: true, perMachine: false, artifactName: "F1-Glory-Setup.exe" }
};

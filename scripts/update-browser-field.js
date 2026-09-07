#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const browserEntries = [];

const addEntry = (from, to) => {
  browserEntries.push([from, to]);
};

// Redirect the resolved main file for legacy bundlers that do not use exports.
addEntry('./lib/index.js', './es/index.mjs');

/** Keep legacy browser request names while pointing them at the emitted ESM files. */
const addDirMappings = (dirPath, browserPrefix, targetPrefix) => {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.mjs'))
    .map((dirent) => dirent.name)
    .sort()
    .forEach((file) => {
      const name = path.basename(file, '.mjs');
      const target = `${targetPrefix}/${file}`;

      addEntry(`${browserPrefix}/${name}`, target);
      addEntry(`${browserPrefix}/${name}.js`, target);
    });
};

addDirMappings(path.join(rootDir, 'es', 'locale'), './locale', './es/locale');
addDirMappings(path.join(rootDir, 'es', 'generate'), './generate', './es/generate');

const browser = Object.fromEntries(browserEntries.sort((a, b) => a[0].localeCompare(b[0])));

pkg.browser = browser;

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(`Updated browser field with ${browserEntries.length} entries.`);

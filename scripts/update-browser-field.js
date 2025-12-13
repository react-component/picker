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

// Preserve previous behavior of preferring the ES build for the main entry.
addEntry('./lib/index.js', './es/index.js');

const addDirMappings = (dirPath, browserPrefix, targetPrefix) => {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  fs.readdirSync(dirPath)
    .filter((file) => file.endsWith('.js'))
    .sort()
    .forEach((file) => {
      const name = path.basename(file, '.js');
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

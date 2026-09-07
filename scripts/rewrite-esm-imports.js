const fs = require('node:fs');
const path = require('node:path');

const esDirectory = path.resolve(__dirname, '../es');
const moduleSpecifierPattern =
  /(\b(?:from|import)\s*(?:\(\s*)?)(['"])(\.\.?\/[^'"]+|\.\.?)\2(\s*\)?)/g;

fs.writeFileSync(path.join(esDirectory, 'package.json'), '{\n  "type": "module"\n}\n');

function collectModuleFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectModuleFiles(entryPath);
    }

    return entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.d.ts'))
      ? [entryPath]
      : [];
  });
}

function resolveModuleSpecifier(filePath, specifier) {
  if (path.extname(specifier)) {
    return specifier;
  }

  const absoluteSpecifier = path.resolve(path.dirname(filePath), specifier);
  if (fs.existsSync(`${absoluteSpecifier}.js`)) {
    return `${specifier}.js`;
  }
  if (fs.existsSync(path.join(absoluteSpecifier, 'index.js'))) {
    return `${specifier}/index.js`;
  }

  throw new Error(`Cannot resolve ${specifier} from ${path.relative(esDirectory, filePath)}`);
}

let rewriteCount = 0;

collectModuleFiles(esDirectory).forEach((filePath) => {
  const source = fs.readFileSync(filePath, 'utf8');
  const rewrittenSource = source.replace(
    moduleSpecifierPattern,
    (match, prefix, quote, specifier, suffix) => {
      const rewrittenSpecifier = resolveModuleSpecifier(filePath, specifier);
      if (rewrittenSpecifier !== specifier) {
        rewriteCount += 1;
      }
      return `${prefix}${quote}${rewrittenSpecifier}${quote}${suffix}`;
    },
  );

  if (rewrittenSource !== source) {
    fs.writeFileSync(filePath, rewrittenSource);
  }
});

console.log(`Rewrote ${rewriteCount} ESM module specifiers.`);

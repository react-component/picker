const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const packageDirectory = path.resolve(__dirname, '..');
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'rc-picker-node-types-'));
const scopedModulesDirectory = path.join(temporaryDirectory, 'node_modules/@rc-component');

try {
  fs.mkdirSync(scopedModulesDirectory, { recursive: true });
  fs.symlinkSync(
    packageDirectory,
    path.join(scopedModulesDirectory, 'picker'),
    process.platform === 'win32' ? 'junction' : 'dir',
  );

  fs.writeFileSync(
    path.join(temporaryDirectory, 'package.json'),
    JSON.stringify({ private: true, type: 'module' }),
  );
  fs.writeFileSync(
    path.join(temporaryDirectory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        noEmit: true,
        skipLibCheck: false,
        strict: true,
      },
      include: ['index.ts'],
    }),
  );
  fs.writeFileSync(
    path.join(temporaryDirectory, 'index.ts'),
    `import Picker from '@rc-component/picker';
import momentGenerateConfig from '@rc-component/picker/generate/moment';
import enUS from '@rc-component/picker/locale/en_US';

void Picker;
void momentGenerateConfig;
void enUS;
`,
  );

  execFileSync(
    process.execPath,
    [path.join(packageDirectory, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'],
    { cwd: temporaryDirectory, stdio: 'inherit' },
  );
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

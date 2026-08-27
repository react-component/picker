const assert = require('node:assert/strict');

const entryPoints = [
  '@rc-component/picker',
  '@rc-component/picker/generate',
  '@rc-component/picker/generate/moment',
  '@rc-component/picker/interface',
  '@rc-component/picker/locale/en_US',
  '@rc-component/picker/lib/generate',
  '@rc-component/picker/lib/generate/moment',
  '@rc-component/picker/lib/interface',
  '@rc-component/picker/lib/locale/en_US',
  '@rc-component/picker/es/generate',
  '@rc-component/picker/es/generate/moment',
  '@rc-component/picker/es/interface',
  '@rc-component/picker/es/locale/en_US',
];

async function testNodeExports() {
  const commonJSModules = entryPoints.map((entryPoint) => require(entryPoint));
  const esModules = await Promise.all(entryPoints.map((entryPoint) => import(entryPoint)));

  assert.equal(commonJSModules.length, entryPoints.length);
  assert.equal(esModules.length, entryPoints.length);
}

testNodeExports().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

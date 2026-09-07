import { defineConfig } from 'father';

export default defineConfig({
  plugins: ['@rc-component/father-plugin'],
  esm: {
    output: 'es',
    platform: 'node',
    autoExtension: true,
    resolveDepSubpath: true,
  },
  cjs: {
    output: 'lib',
    autoExtension: true,
  },
});

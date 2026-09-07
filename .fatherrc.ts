import type {} from '@rc-component/father-plugin';
import { defineConfig } from 'father';

export default defineConfig({
  plugins: ['@rc-component/father-plugin'],
  cjsDefaultInterop: true,
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

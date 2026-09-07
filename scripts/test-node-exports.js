#!/usr/bin/env node
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const requireFromPackage = createRequire(path.join(root, 'package.json'));

async function main() {
  // Resolve the public exports from an independent consumer, without source aliases.
  const consumer = fs.mkdtempSync(path.join(os.tmpdir(), 'picker-node-exports-'));
  try {
    const modules = path.join(consumer, 'node_modules');
    fs.mkdirSync(path.join(modules, '@rc-component'), { recursive: true });
    fs.symlinkSync(root, path.join(modules, pkg.name), 'junction');
    for (const name of ['react', 'react-dom', 'moment']) {
      const directory = path.dirname(requireFromPackage.resolve(`${name}/package.json`));
      fs.symlinkSync(directory, path.join(modules, name), 'junction');
    }
    fs.symlinkSync(
      path.dirname(path.dirname(requireFromPackage.resolve('@types/react/package.json'))),
      path.join(modules, '@types'),
      'junction',
    );
    fs.writeFileSync(path.join(consumer, 'package.json'), '{"private":true,"type":"module"}');

    const entries = [];
    for (const [key, entry] of Object.entries(pkg.exports)) {
      if (typeof entry === 'string') continue; // CSS / Less assets are not Node modules.
      if (!key.includes('*')) {
        entries.push(key);
        continue;
      }
      const target = entry.import.default;
      const dir = path.dirname(target);
      const suffix = path.basename(target).slice(1);
      for (const file of fs.readdirSync(path.join(root, dir))) {
        if (file.endsWith(suffix)) entries.push(key.replace('*', file.slice(0, -suffix.length)));
      }
    }

    // An .mjs file makes import resolution start in the consumer package.
    fs.writeFileSync(
      path.join(consumer, 'import.mjs'),
      'export const load = (name) => import(name);',
    );
    const { load } = await import(pathToFileURL(path.join(consumer, 'import.mjs')).href);
    const requireFromConsumer = createRequire(path.join(consumer, 'require.cjs'));
    for (const entry of entries) {
      const name = entry === '.' ? pkg.name : pkg.name + entry.slice(1);
      const esm = await load(name);
      const cjs = requireFromConsumer(name);
      assert.deepEqual(
        Object.keys(esm).sort(),
        Object.keys(cjs)
          .filter((key) => key !== '__esModule')
          .sort(),
        `${name}: ESM and CommonJS public exports differ`,
      );
      if (entry === '.') {
        assert.equal(esm.default, esm.Picker);
        assert.equal(cjs.default, cjs.Picker);
        assert.equal(esm.default.$$typeof, Symbol.for('react.forward_ref'));
        assert.equal(cjs.default.$$typeof, Symbol.for('react.forward_ref'));
      } else if (entry.includes('/locale/') && esm.default) {
        assert.deepEqual(esm.default, cjs.default, `${name}: locale must not be double wrapped`);
        if (entry.endsWith('/en_US')) assert.equal(esm.default.locale, 'en_US');
      } else if (entry.includes('/generate/') && !entry.endsWith('/index')) {
        assert.equal(typeof esm.default.getNow, 'function', name);
        assert.equal(typeof cjs.default.getNow, 'function', name);
        assert.equal(esm.default.getYear(esm.default.getFixedDate('2024-01-02')), 2024, name);
        assert.equal(cjs.default.getYear(cjs.default.getFixedDate('2024-01-02')), 2024, name);
      }
    }

    const { createElement } = requireFromConsumer('react');
    const { renderToString } = requireFromConsumer('react-dom/server');
    for (const getModule of [load, requireFromConsumer]) {
      const { default: Picker, RangePicker } = await getModule(pkg.name);
      const { default: locale } = await getModule(`${pkg.name}/locale/en_US`);
      const { default: generateConfig } = await getModule(`${pkg.name}/generate/moment`);
      const date = generateConfig.getFixedDate('2024-01-02');
      for (const [Component, props] of [
        [Picker, { value: date }],
        [Picker, { multiple: true, value: [date] }],
        [RangePicker, { value: [date, date] }],
      ]) {
        const html = renderToString(createElement(Component, { locale, generateConfig, ...props }));
        assert.match(html, /2024-01-02/, 'SSR should render the selected date');
      }
    }

    for (const [name, target] of Object.entries(pkg.browser)) {
      assert.ok(
        fs.existsSync(path.join(root, target)),
        `Missing browser target: ${name} -> ${target}`,
      );
    }
    assert.equal(pkg.browser['./locale/en_US.js'], './es/locale/en_US.mjs');
    assert.equal(pkg.browser['./generate/dayjs'], './es/generate/dayjs.mjs');

    const source = `
import { createElement } from 'react';
import type { Moment } from 'moment';
import Picker, { type PickerProps, type PickerPanelProps } from '@rc-component/picker';
import type { GenerateConfig } from '@rc-component/picker/generate';
import type { Locale } from '@rc-component/picker/interface';
import moment from '@rc-component/picker/generate/moment';
import dayjs from '@rc-component/picker/generate/dayjs';
import dateFns from '@rc-component/picker/generate/dateFns';
import luxon from '@rc-component/picker/generate/luxon';
import enUS from '@rc-component/picker/locale/en_US';
import oldLocale from '@rc-component/picker/lib/locale/en_US';
import oldESLocale from '@rc-component/picker/es/locale/en_US';
import oldMoment from '@rc-component/picker/lib/generate/moment';
import oldESMoment from '@rc-component/picker/es/generate/moment';
import type { GenerateConfig as OldConfig } from '@rc-component/picker/lib/generate';
import type { GenerateConfig as OldESConfig } from '@rc-component/picker/es/generate';
import type { Locale as OldLocale } from '@rc-component/picker/lib/interface';
import type { Locale as OldESLocale } from '@rc-component/picker/es/interface';

const locale: Locale & OldLocale & OldESLocale = enUS;
const locales: Locale[] = [oldLocale, oldESLocale];
const configs: GenerateConfig<Moment>[] = [moment, oldMoment, oldESMoment];
const config: OldConfig<Moment> & OldESConfig<Moment> = moment;
const props: PickerProps<Moment> = { generateConfig: config, locale };
const emptyPanel: PickerPanelProps<Moment> = { generateConfig: config, locale, defaultValue: null };
const multiplePanel: PickerPanelProps<Moment> = {
  generateConfig: config, locale, multiple: true, defaultValue: [moment.getNow()],
};
createElement(Picker<Moment>, props);
dayjs.getNow().format('YYYY');
dateFns.getNow().getFullYear();
luxon.getNow().toISO();
void [locales, configs, emptyPanel, multiplePanel];
`;
    for (const extension of ['mts', 'cts']) {
      fs.writeFileSync(path.join(consumer, `consumer.${extension}`), source);
    }
    fs.writeFileSync(
      path.join(consumer, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          target: 'ES2020',
          strict: true,
          skipLibCheck: false,
          noEmit: true,
          esModuleInterop: true,
          types: ['node', 'react'],
        },
        files: ['consumer.mts', 'consumer.cts'],
      }),
    );
    execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', consumer], {
      stdio: 'inherit',
    });
    console.log(
      `Verified ${entries.length} public imports and requires, SSR, browser targets, and NodeNext ESM/CJS types.`,
    );
  } finally {
    fs.rmSync(consumer, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

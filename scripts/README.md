# Native Node ESM validation

The build uses Father 4.6.37 or newer, including the module output support from [umijs/father#869](https://github.com/umijs/father/pull/869).

```sh
npm install --legacy-peer-deps
npm run compile
npm run browser-field
npm run test:node-exports
```

The root package remains CommonJS. Father emits `.mjs` / `.d.mts` under `es` and `.js` / `.d.ts` under `lib`, completing relative references and legacy dependency subpaths such as `dayjs/plugin/weekday`. The public exports select matching runtime and declaration files for `import` and `require`. Existing extensionless public subpaths, including the `/lib` and `/es` compatibility aliases, are retained.

`test:node-exports` creates an independent temporary consumer and checks every JavaScript export (including all locale and generator wildcard entries) through native Node `import()` and `require()`. It checks representative default values, browser mapping targets, and TypeScript NodeNext ESM and CJS consumers with `strict: true` and `skipLibCheck: false`. It runs before the release command.

SSR checks cover single, multiple, and range pickers in both module formats. Picker normalizes the default exports of trigger, resize-observer, and overflow, whose published Node entries are still transpiled CommonJS. This keeps that interop detail out of consumer code. The panel's base type also omits the time configuration's `defaultValue`, allowing the panel's own nullable and multiple selection declarations to pass strict checking.

When checking a packed artifact, build and regenerate the browser mappings first, then use `npm pack --ignore-scripts`. This avoids invoking the interactive release command. Install that tarball into a separate consumer with its peer dependencies and repeat the original issue's imports. The same verification script also accepts the installed package directory as its first argument; that installation must include its runtime and type dependencies.

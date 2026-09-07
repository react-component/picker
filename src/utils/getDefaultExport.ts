/** Normalize transpiled CommonJS dependencies when loaded by native Node ESM. */
// TODO: Remove this helper and its call sites after upgrading @rc-component/trigger,
// @rc-component/resize-observer, and @rc-component/overflow to versions whose native
// ESM entry points work without default-export unwrapping, including their dependencies.
export default function getDefaultExport<T>(value: T): T {
  if (
    value &&
    typeof value === 'object' &&
    '__esModule' in value &&
    value.__esModule &&
    'default' in value
  ) {
    return value.default as T;
  }
  return value;
}

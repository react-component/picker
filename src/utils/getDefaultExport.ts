/** Normalize transpiled CommonJS dependencies when loaded by native Node ESM. */
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

export function toArray<T>(val: T | T[]): T[] {
  if (val === null || val === undefined) {
    return [];
  }

  return Array.isArray(val) ? val : [val];
}

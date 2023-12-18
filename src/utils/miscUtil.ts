export function leftPad(str: string | number, length: number, fill: string = '0') {
  let current = String(str);
  while (current.length < length) {
    current = `${fill}${current}`;
  }
  return current;
}

export const tuple = <T extends string[]>(...args: T) => args;

/**
 * Convert `value` to array. Will provide `[]` if is null or undefined.
 */
export function toArray<T>(val: T | T[]): T[] {
  if (val === null || val === undefined) {
    return [];
  }

  return Array.isArray(val) ? val : [val];
}

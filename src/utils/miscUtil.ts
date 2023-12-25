export function leftPad(str: string | number, length: number, fill: string = '0') {
  let current = String(str);
  while (current.length < length) {
    current = `${fill}${current}`;
  }
  return current;
}

/**
 * Convert `value` to array. Will provide `[]` if is null or undefined.
 */
export function toArray<T>(val: T | T[]): T[] {
  if (val === null || val === undefined) {
    return [];
  }

  return Array.isArray(val) ? val : [val];
}

export function fillIndex<T extends any[]>(ori: T, index: number, value: T[number]): T {
  const clone = [...ori] as T;
  clone[index] = value;

  return clone;
}

export function pickProps<T extends object>(props: T, keys: (keyof T)[] | readonly (keyof T)[]) {
  const clone = {} as T;
  keys.forEach((key) => {
    if (props[key] !== undefined) {
      clone[key] = props[key];
    }
  });

  return clone;
}

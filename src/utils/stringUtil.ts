export function leftPad(
  str: string | number,
  length: number,
  fill: string = '0',
) {
  let current = String(str);
  while (current.length < length) {
    current = `${fill}${str}`;
  }
  return current;
}

export const tuple = <T extends string[]>(...args: T) => args;

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

export function toArray<T>(val: T | T[]): T[] {
  if (val === null || val === undefined) {
    return [];
  }

  return Array.isArray(val) ? val : [val];
}

export default function getDataOrAriaProps(props: any) {
  const retProps: any = {};

  Object.keys(props).forEach(key => {
    if (
      (key.substr(0, 5) === 'data-' ||
        key.substr(0, 5) === 'aria-' ||
        key === 'role') &&
      key.substr(0, 7) !== 'data-__'
    ) {
      retProps[key] = props[key];
    }
  });

  return retProps;
}

export function fillIndex<T extends any[]>(ori: T, index: number, value: T[number]): T {
  const clone = [...ori] as T;
  clone[index] = value;

  return clone;
}

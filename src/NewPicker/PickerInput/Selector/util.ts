const FORMAT_KEYS = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss', 'SSS'] as const;

const REPLACE_KEY = '顧';

export function getMaskRange(key: string): [startVal: number, endVal: number, defaultVal?: number] {
  const PresetRange: Record<(typeof FORMAT_KEYS)[number], [number, number, number?]> = {
    YYYY: [0, 9999, new Date().getFullYear()],
    MM: [1, 12],
    DD: [1, 31],
    HH: [0, 23],
    mm: [0, 59],
    ss: [0, 59],
    SSS: [0, 999],
  };

  return PresetRange[key];
}

export function getMask(format: string): [maskFormat: string, cellCount: number] {
  const replaceKeys = FORMAT_KEYS.map((key) => `(${key})`).join('|');
  const replaceReg = new RegExp(replaceKeys, 'g');

  const replacedFormat = format.replace(
    replaceReg,
    // Use Chinese character to avoid user use it in format
    (key: string) => REPLACE_KEY.repeat(key.length),
  );

  return [replacedFormat, format.match(replaceReg)?.length || 0];
}

export function matchFormat(maskFormat: string, text: string = '') {
  for (let i = 0; i < maskFormat.length; i += 1) {
    const maskChar = maskFormat[i];

    if (maskChar !== REPLACE_KEY && maskChar !== text[i]) {
      return false;
    }
  }

  return true;
}

export function getCellRange(maskFormat: string, cellIndex: number) {
  let startIndex = 0;
  let endIndex = 0;

  let matchKey = false;
  let matchIndex = -1;

  for (let i = 0; i < maskFormat.length; i += 1) {
    const maskChar = maskFormat[i];

    if (maskChar === REPLACE_KEY && !matchKey) {
      matchKey = true;
      matchIndex += 1;
      startIndex = i;
    } else if (maskChar !== REPLACE_KEY && matchKey) {
      matchKey = false;
      endIndex = i;

      if (cellIndex === matchIndex) {
        break;
      }
    } else if (i === maskFormat.length - 1) {
      endIndex = i + 1;
    }
  }

  return [startIndex, endIndex];
}

export function getCellIndex(maskFormat: string, selectionStart: number) {
  let str = maskFormat.slice(0, selectionStart + 1);
  // const cellReg = new RegExp(`(${REPLACE_KEY}+)|([^${REPLACE_KEY}]+)`, 'g');
  // const match = maskFormat.match(cellReg) || [];

  // let strIndex = 0;

  // for (let i = 0; i < match.length; i += 1) {
  //   const cell = match[i];

  //   if () {}
  // }
  return str;
}

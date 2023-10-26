const FORMAT_KEYS = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss', 'SSS'];

const REPLACE_KEY = '顧';

// Format logic
//
// First time on focus:
//  1. check if the text is valid, if not fill with format
//  2. set highlight cell to the first cell
// Cells
//  1. Selection the index cell, set inner `cacheValue` to ''
//  2. Key input filter non-number char, patch after the `cacheValue`
//    1. Replace the `cacheValue` with input align the cell length
//    2. Re-selection the mask cell
//  3. If `cacheValue` match the limit length or cell format (like 1 ~ 12 month), go to next cell

export function getMask(format: string) {
  const replaceKeys = FORMAT_KEYS.map((key) => `(${key})`).join('|');
  const replaceReg = new RegExp(replaceKeys, 'g');

  const replacedFormat = format.replace(
    replaceReg,
    // Use Chinese character to avoid user use it in format
    (key: string) => REPLACE_KEY.repeat(key.length),
  );

  return replacedFormat;
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
    }
  }

  return [startIndex, endIndex];
}

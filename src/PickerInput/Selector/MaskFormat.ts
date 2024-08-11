const FORMAT_KEYS = ['YYYY', 'MM', 'DD', 'd', 'HH', 'hh', 'mm', 'ss', 'SSS', 'AA', 'aa'];
const MERIDIEM_KEYS = ['A', 'a'];

export type FormatKey = (typeof FORMAT_KEYS)[number];

// Use Chinese character to avoid conflict with the mask format
const REPLACE_KEY = '顧';

export interface Cell {
  text: string;
  mask: boolean;
  start: number;
  end: number;
}

export default class MaskFormat {
  format: string;
  maskFormat: string;
  cells: Cell[];
  maskCells: Cell[];

  constructor(format: string) {
    this.format = format;

    const transformRegex = new RegExp(
      [...FORMAT_KEYS, ...MERIDIEM_KEYS].map((key) => `(${key})`).join('|'),
      'g',
    );
    const transformedFormat = format.replace(transformRegex, (key) =>
      key.length === 1 ? `${key}${key}` : key,
    );

    // Generate mask format
    const replaceKeys = FORMAT_KEYS.map((key) => `(${key})`).join('|');
    const replaceReg = new RegExp(replaceKeys, 'g');
    this.maskFormat = transformedFormat.replace(
      replaceReg,
      // Use Chinese character to avoid user use it in format
      (key: string) => REPLACE_KEY.repeat(key.length),
    );

    // Generate cells
    const cellReg = new RegExp(`(${FORMAT_KEYS.join('|')})`);
    const strCells = (transformedFormat.split(cellReg) || []).filter((str) => str);

    let offset = 0;
    this.cells = strCells.map((text) => {
      const mask = FORMAT_KEYS.includes(text);

      const start = offset;
      const end = offset + text.length;
      offset = end;

      return {
        text,
        mask,
        start,
        end,
      };
    });

    // Mask cells
    this.maskCells = this.cells.filter((cell) => cell.mask);
  }

  getSelection(maskCellIndex: number): [start: number, end: number] {
    const { start, end } = this.maskCells[maskCellIndex] || {};
    return [start || 0, end || 0];
  }

  /** Check given text match format */
  match(text: string) {
    for (let i = 0; i < this.maskFormat.length; i += 1) {
      const maskChar = this.maskFormat[i];
      const textChar = text[i];

      if (
        (!textChar && i !== this.maskFormat.length - 1) ||
        (maskChar !== REPLACE_KEY && maskChar !== textChar)
      ) {
        return false;
      }
    }

    return true;
  }

  /** Get mask cell count */
  size() {
    return this.maskCells.length;
  }

  getMaskCellIndex(anchorIndex: number) {
    let closetDist = Number.MAX_SAFE_INTEGER;
    let closetIndex = 0;

    for (let i = 0; i < this.maskCells.length; i += 1) {
      const { start, end } = this.maskCells[i];
      if (anchorIndex >= start && anchorIndex <= end) {
        return i;
      }

      const dist = Math.min(Math.abs(anchorIndex - start), Math.abs(anchorIndex - end));
      if (dist < closetDist) {
        closetDist = dist;
        closetIndex = i;
      }
    }

    return closetIndex;
  }
}

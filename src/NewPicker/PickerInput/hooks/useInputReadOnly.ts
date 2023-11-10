import type { FormatType } from '../../interface';

export default function useInputReadOnly<DateType = any>(
  formatList: FormatType<DateType>[],
  inputReadOnly?: boolean,
) {
  if (typeof formatList[0] === 'function') {
    return true;
  }

  return inputReadOnly;
}

import { mount as originMount, ReactWrapper } from 'enzyme';
import moment, { Moment, unitOfTime } from 'moment';

export const mount = originMount as (
  ...args: Parameters<typeof originMount>
) => ReactWrapper & {
  openPicker: () => void;
  closePicker: () => void;
  isOpen: () => boolean;
  selectDate: (date: number) => void;
  clearValue: () => void;
};

export function getMoment(str: string): Moment {
  const formatList = ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD'];
  for (let i = 0; i < formatList.length; i += 1) {
    const date = moment(str, formatList[i], true);
    if (date.isValid()) {
      return date;
    }
  }
  throw new Error(`Format not match with: ${str}`);
}

export function isSame(
  date: Moment,
  dateStr: string,
  type: unitOfTime.StartOf = 'date',
) {
  return date.isSame(getMoment(dateStr), type);
}

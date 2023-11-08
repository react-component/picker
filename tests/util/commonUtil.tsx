import React from 'react';
// import { mount as originMount, ReactWrapper } from 'enzyme';
import { act, fireEvent } from '@testing-library/react';
import dayjs, { type Dayjs } from 'dayjs';
import moment, { type Moment, type unitOfTime } from 'moment';
import Picker, { PickerPanel, type PickerProps } from '../../src';
import dayGenerateConfig from '../../src/generate/dayjs';
import momentGenerateConfig from '../../src/generate/moment';
import enUS from '../../src/locale/en_US';
import zh_CN from '../../src/locale/zh_CN';
import NewRangePicker, { type RangePickerProps } from '../../src/NewPicker/PickerInput/RangePicker';
import type { PickerBaseProps, PickerDateProps, PickerTimeProps } from '../../src/Picker';
import type {
  PickerPanelBaseProps,
  PickerPanelDateProps,
  PickerPanelTimeProps,
} from '../../src/PickerPanel';
import RangePicker, {
  type RangePickerBaseProps,
  type RangePickerDateProps,
  type RangePickerTimeProps,
} from '../../src/RangePicker';

const FULL_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// export type Wrapper = ReactWrapper & {
//   confirmOK: () => void;
//   openPicker: (index?: number) => void;
//   closePicker: (index?: number) => void;
//   isOpen: () => boolean;
//   findCell: (text: number | string, index?: number) => Wrapper;
//   selectCell: (text: number | string, index?: number) => Wrapper;
//   clearValue: (index?: number) => void;
//   keyDown: (which: number, info?: object, index?: number) => void;
//   clickButton: (type: 'prev' | 'next' | 'super-prev' | 'super-next') => Wrapper;
//   inputValue: (text: string, index?: number) => Wrapper;
// };

// export const mount = originMount as (...args: Parameters<typeof originMount>) => Wrapper;

export function getMoment(str: string): Moment {
  const formatList = [FULL_FORMAT, 'YYYY-MM-DD', 'HH:mm:ss', 'YYYY'];
  for (let i = 0; i < formatList.length; i += 1) {
    const date = moment(str, formatList[i], true);
    if (date.isValid()) {
      return date;
    }
  }
  throw new Error(`Format not match with: ${str}`);
}

export function isSame(date: Moment | null, dateStr: string, type: unitOfTime.StartOf = 'date') {
  if (!date) {
    return false;
  }

  if (date.isSame(getMoment(dateStr), type)) {
    return true;
  }

  throw new Error(`${date.format(FULL_FORMAT)} is not same as expected: ${dateStr}`);
}

interface MomentDefaultProps {
  locale?: PickerProps<Moment>['locale'];
  generateConfig?: PickerProps<Moment>['generateConfig'];
}

type InjectDefaultProps<Props> = Omit<Props, 'locale' | 'generateConfig'> & MomentDefaultProps;

// Moment Picker
export type MomentPickerProps =
  | InjectDefaultProps<PickerBaseProps<Moment>>
  | InjectDefaultProps<PickerDateProps<Moment>>
  | InjectDefaultProps<PickerTimeProps<Moment>>;

export class MomentPicker extends React.Component<MomentPickerProps> {
  pickerRef = React.createRef<Picker<Moment>>();

  render() {
    return (
      <Picker<Moment>
        generateConfig={momentGenerateConfig}
        locale={enUS}
        ref={this.pickerRef}
        {...this.props}
      />
    );
  }
}

// Moment Panel Picker
export type MomentPickerPanelProps =
  | InjectDefaultProps<PickerPanelBaseProps<Moment>>
  | InjectDefaultProps<PickerPanelDateProps<Moment>>
  | InjectDefaultProps<PickerPanelTimeProps<Moment>>;

export const MomentPickerPanel = (props: MomentPickerPanelProps) => (
  <PickerPanel<Moment> generateConfig={momentGenerateConfig} locale={enUS} {...props} />
);

// Moment Range Picker
export type MomentRangePickerProps =
  | InjectDefaultProps<RangePickerBaseProps<Moment>>
  | InjectDefaultProps<RangePickerDateProps<Moment>>
  | InjectDefaultProps<RangePickerTimeProps<Moment>>;

export class MomentRangePicker extends React.Component<MomentRangePickerProps> {
  rangePickerRef = React.createRef<RangePicker<Moment>>();

  render() {
    return (
      <RangePicker<Moment>
        generateConfig={momentGenerateConfig}
        locale={enUS}
        ref={this.rangePickerRef}
        {...this.props}
      />
    );
  }
}

// ====================================== UTIL ======================================
export function openPicker(container: HTMLElement, index = 0) {
  const input = container.querySelectorAll('input')[index];
  fireEvent.mouseDown(input);
  fireEvent.click(input);
  fireEvent.focus(input);
}

export function closePicker(container: HTMLElement, index = 0) {
  const input = container.querySelectorAll('input')[index];
  fireEvent.blur(input);

  act(() => {
    jest.runAllTimers();
  });
}

export function isOpen() {
  const dropdown = document.querySelector('.rc-picker-dropdown');
  console.log(dropdown.className);
  return dropdown && !dropdown.classList.contains('rc-picker-dropdown-hidden');
}

export function findCell(text: string | number, index = 0) {
  let matchCell: HTMLElement;

  const table = document.querySelectorAll('table')[index];

  Array.from(table.querySelectorAll('td')).forEach((td) => {
    if (td.textContent === String(text) && td.className.includes('-in-view')) {
      matchCell = td;
    }
  });
  if (!matchCell) {
    throw new Error('Cell not match in picker panel.');
  }

  return matchCell;
}

export function selectCell(text: string | number, index = 0) {
  const td = findCell(text, index);
  fireEvent.click(td);

  return td;
}

export function clickButton(type: string) {
  let matchBtn: HTMLButtonElement;
  Array.from(document.querySelectorAll('button')).forEach((btn) => {
    if (btn.className.includes(`-header-${type}-btn`)) {
      matchBtn = btn;
    }
  });

  fireEvent.click(matchBtn);

  return matchBtn;
}

export function confirmOK() {
  fireEvent.click(document.querySelector('.rc-picker-ok > *'));
}

export function clearValue() {
  const clearBtn = document.querySelector('.rc-picker-clear');
  fireEvent.mouseDown(clearBtn);
  fireEvent.mouseUp(clearBtn);
  fireEvent.click(clearBtn);
}

export function inputValue(text: string, index = 0) {
  fireEvent.change(document.querySelectorAll('input')[index], { target: { value: text } });
}

// ===================================== Day JS =====================================
export const DayRangePicker = (props: Partial<Omit<RangePickerProps<Dayjs>, 'generateConfig'>>) => {
  return <NewRangePicker generateConfig={dayGenerateConfig} locale={zh_CN} {...props} />;
};

export function getDay(str: string): Dayjs {
  const formatList = [FULL_FORMAT, 'YYYY-MM-DD', 'HH:mm:ss', 'YYYY'];
  for (let i = 0; i < formatList.length; i += 1) {
    const date = dayjs(str, formatList[i], true);
    if (date.isValid()) {
      return date;
    }
  }
  throw new Error(`Format not match with: ${str}`);
}
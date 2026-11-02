import { fireEvent, render } from '@testing-library/react';
import type { AllowClearConfig } from '@rc-component/util';
import * as React from 'react';
import enUS from '../src/locale/en_US';
import { DayPicker, DayRangePicker, getDay } from './util/commonUtil';

const date = getDay('2026-10-13');
const cases = [
  [
    'single',
    (allowClear: boolean | AllowClearConfig, onClear: VoidFunction) => (
      <DayPicker defaultValue={date} allowClear={allowClear} onClear={onClear} suffix="suffix" />
    ),
  ],
  [
    'multiple',
    (allowClear: boolean | AllowClearConfig, onClear: VoidFunction) => (
      <DayPicker
        multiple
        defaultValue={[date]}
        allowClear={allowClear}
        onClear={onClear}
        suffix="suffix"
      />
    ),
  ],
  [
    'range',
    (allowClear: boolean | AllowClearConfig, onClear: VoidFunction) => (
      <DayRangePicker
        defaultValue={[date, date]}
        allowClear={allowClear}
        onClear={onClear}
        suffix="suffix"
      />
    ),
  ],
  [
    'time',
    (allowClear: boolean | AllowClearConfig, onClear: VoidFunction) => (
      <DayPicker
        picker="time"
        defaultValue={date}
        allowClear={allowClear}
        onClear={onClear}
        suffix="suffix"
      />
    ),
  ],
] as const;

describe.each(cases)('allowClear %s', (_, picker) => {
  it('removes the clear entry and restores all configuration fields', () => {
    const onClear = jest.fn();
    const config = Object.freeze({ clearIcon: 'custom', label: 'Erase', tabIndex: -1 });
    const { container, getByRole, queryByRole, rerender } = render(picker(false, onClear));
    const markup = container.innerHTML;
    rerender(picker({ ...config, disabled: true }, onClear));
    expect(container.innerHTML).toBe(markup);
    expect(container.querySelector('.rc-picker-clear')).toBeNull();
    expect(container.querySelector('.rc-picker-suffix')).toHaveTextContent('suffix');
    expect(onClear).not.toHaveBeenCalled();

    rerender(picker(config, onClear));
    const button = getByRole('button', { name: 'Erase' });
    expect(button).toHaveTextContent('custom');
    expect(button.tabIndex).toBe(-1);
    rerender(picker({ ...config, tabIndex: 0 }, onClear));
    expect(getByRole('button', { name: 'Erase' }).tabIndex).toBe(0);
    fireEvent.click(getByRole('button', { name: 'Erase' }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(queryByRole('button', { name: 'Erase' })).toBeNull();
  });
});

it('keeps the default clear behavior and locale label', () => {
  const { getByRole, rerender } = render(<DayPicker defaultValue={date} />);
  expect(getByRole('button', { name: 'Clear' }).tabIndex).toBe(0);
  rerender(<DayPicker defaultValue={date} locale={{ ...enUS, clear: '清除' }} />);
  expect(getByRole('button', { name: '清除' })).toBeTruthy();
});

it('falls back to an accessible label when the locale omits clear', () => {
  const locale = { ...enUS, clear: undefined };
  const { getByRole, rerender } = render(<DayPicker defaultValue={date} locale={locale} />);
  expect(getByRole('button', { name: 'Clear' })).toBeTruthy();

  rerender(<DayPicker defaultValue={date} locale={locale} allowClear={{ label: 'Erase' }} />);
  expect(getByRole('button', { name: 'Erase' })).toBeTruthy();
});

it('keeps the component and range endpoint disabled restrictions', () => {
  const { container, rerender } = render(
    <DayPicker value={date} disabled allowClear={{ disabled: false }} />,
  );
  expect(container.querySelector('.rc-picker-clear')).toBeNull();
  rerender(
    <DayRangePicker
      value={[date, date]}
      disabled={[true, true]}
      allowClear={{ disabled: false }}
    />,
  );
  expect(container.querySelector('.rc-picker-clear')).toBeNull();
  rerender(
    <DayRangePicker
      value={[date, null]}
      disabled={[true, false]}
      allowClear={{ disabled: false }}
    />,
  );
  expect(container.querySelector('.rc-picker-clear')).toBeNull();
  rerender(
    <DayRangePicker
      value={[date, date]}
      disabled={[true, false]}
      allowClear={{ disabled: false }}
    />,
  );
  expect(container.querySelector('.rc-picker-clear')).not.toBeNull();
  rerender(
    <DayRangePicker
      value={[date, date]}
      disabled={[true, false]}
      allowClear={{ disabled: true }}
    />,
  );
  expect(container.querySelector('.rc-picker-clear')).toBeNull();
});

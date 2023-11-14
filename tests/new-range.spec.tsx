// In theory, all RangePicker test cases should be paired with SinglePicker
import { act, fireEvent, render } from '@testing-library/react';
import { type Dayjs } from 'dayjs';
import { resetWarned } from 'rc-util/lib/warning';
import React from 'react';
import zh_CN from '../src/locale/zh_CN';
import {
  closePicker,
  DayRangePicker,
  getDay,
  isOpen,
  isSame,
  openPicker,
  selectCell,
} from './util/commonUtil';

describe('NewPicker.Range', () => {
  beforeEach(() => {
    resetWarned();
    jest.useFakeTimers().setSystemTime(getDay('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('PickerValue', () => {
    it('defaultPickerValue should reset every time when opened', () => {
      const { container } = render(
        <DayRangePicker defaultPickerValue={[getDay('2000-01-01'), getDay('2023-09-03')]} />,
      );

      // Left
      openPicker(container);

      for (let i = 0; i < 13; i += 1) {
        fireEvent.click(document.querySelector('.rc-picker-header-prev-btn'));
      }
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('1998年12月');

      // Right
      openPicker(container, 1);

      for (let i = 0; i < 13; i += 1) {
        fireEvent.click(document.querySelector('.rc-picker-header-next-btn'));
      }
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('2024年10月');

      // Left again
      openPicker(container);
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('2000年1月');

      // Right again
      openPicker(container, 1);
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('2023年9月');
    });

    it('onPickerValueChange', () => {
      let nextPickerValues: [Dayjs | null, Dayjs | null];
      const onPickerValueChange = jest.fn();

      const { container } = render(
        <DayRangePicker
          pickerValue={[getDay('1990-02-03'), getDay('1990-02-03')]}
          defaultPickerValue={[getDay('2000-01-01'), getDay('2023-09-03')]}
          onPickerValueChange={onPickerValueChange}
        />,
      );

      // Left
      openPicker(container);
      expect(onPickerValueChange).toHaveBeenCalledTimes(1);

      nextPickerValues = onPickerValueChange.mock.calls[0][0];
      expect(isSame(nextPickerValues[0], '2000-01-01'));
      expect(isSame(nextPickerValues[1], '1990-02-03'));
      expect(onPickerValueChange.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          source: 'reset',
          range: 'start',
        }),
      );
      onPickerValueChange.mockReset();

      // Right
      openPicker(container, 1);
      expect(onPickerValueChange).toHaveBeenCalledTimes(1);

      nextPickerValues = onPickerValueChange.mock.calls[0][0];
      expect(isSame(nextPickerValues[0], '1990-02-03'));
      expect(isSame(nextPickerValues[1], '2023-09-03'));
      expect(onPickerValueChange.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          source: 'reset',
          range: 'end',
        }),
      );
    });

    it('half set defaultPickerValue', () => {
      const onPickerValueChange = jest.fn();

      const { container } = render(
        <DayRangePicker
          defaultPickerValue={[getDay('2000-01-01'), null]}
          onPickerValueChange={onPickerValueChange}
        />,
      );

      openPicker(container);

      // Left
      for (let i = 0; i < 13; i += 1) {
        onPickerValueChange.mockReset();
        fireEvent.click(document.querySelector('.rc-picker-header-prev-btn'));
      }

      expect(isSame(onPickerValueChange.mock.calls[0][0][0], '1998-12-01')).toBeTruthy();
      expect(onPickerValueChange.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          source: 'panel',
          range: 'start',
        }),
      );
      onPickerValueChange.mockReset();

      // Right
      selectCell(7);

      const lastCalled = onPickerValueChange.mock.calls[onPickerValueChange.mock.calls.length - 1];
      expect(isSame(lastCalled[0][1], '1998-12-07')).toBeTruthy();
      expect(lastCalled[1]).toEqual(
        expect.objectContaining({
          source: 'reset',
          range: 'end',
        }),
      );
    });
  });

  describe('field', () => {
    it('not open for function key', () => {
      const { container } = render(<DayRangePicker />);
      const firstInput = container.querySelector<HTMLInputElement>('input');

      fireEvent.keyDown(firstInput, {
        key: 'Shift',
      });
      expect(isOpen()).toBeFalsy();

      fireEvent.change(firstInput, {
        target: {
          value: 'a',
        },
      });
      expect(isOpen()).toBeTruthy();
    });

    it('preserveInvalidOnBlur=false', () => {
      const { container } = render(<DayRangePicker />);
      const firstInput = container.querySelector<HTMLInputElement>('input');

      openPicker(container);
      fireEvent.change(firstInput, {
        target: {
          value: 'invalidate 123',
        },
      });

      closePicker(container);
      act(() => {
        jest.runAllTimers();
      });
      expect(firstInput).toHaveValue('');
    });

    it('preserveInvalidOnBlur=true', () => {
      const { container } = render(<DayRangePicker preserveInvalidOnBlur />);
      const firstInput = container.querySelector<HTMLInputElement>('input');

      openPicker(container);
      fireEvent.change(firstInput, {
        target: {
          value: 'invalidate 123',
        },
      });

      closePicker(container);
      act(() => {
        jest.runAllTimers();
      });
      expect(firstInput).toHaveValue('invalidate 123');
    });
  });

  describe('format', () => {
    it('support BBBB', () => {
      const onChange = jest.fn();

      const { container } = render(
        <DayRangePicker
          picker="year"
          onChange={onChange}
          locale={{
            ...zh_CN,
            fieldYearFormat: 'BBBB',
            cellYearFormat: 'BBBB',
            yearFormat: 'BBBB',
          }}
        />,
      );

      openPicker(container);

      // Title
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('2533-2542');

      // Cell
      selectCell(2538);
      selectCell(2551, 1);

      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['2538', '2551']);

      expect(container.querySelectorAll('input')[0]).toHaveValue('2538');
      expect(container.querySelectorAll('input')[1]).toHaveValue('2551');
    });

    it('support LTS', () => {
      const { rerender } = render(<DayRangePicker picker="time" format="LT" open />);
      expect(document.querySelectorAll('.rc-picker-time-panel-column')).toHaveLength(3);

      // With second
      rerender(<DayRangePicker picker="time" format="LTS" open />);
      expect(document.querySelectorAll('.rc-picker-time-panel-column')).toHaveLength(4);
    });
  });
});

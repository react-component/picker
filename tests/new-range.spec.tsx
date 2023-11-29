// In theory, all RangePicker test cases should be paired with SinglePicker
import { act, fireEvent, render } from '@testing-library/react';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/ar';
import { spyElementPrototype } from 'rc-util/lib/test/domHook';
import { resetWarned } from 'rc-util/lib/warning';
import React from 'react';
import zh_CN from '../src/locale/zh_CN';
import {
  closePicker,
  DayRangePicker,
  findCell,
  getDay,
  isOpen,
  isSame,
  openPicker,
  selectCell,
  waitFakeTimer,
} from './util/commonUtil';

describe('NewPicker.Range', () => {
  beforeEach(() => {
    resetWarned();
    jest.useFakeTimers().setSystemTime(getDay('1990-09-03 00:00:00').valueOf());
    dayjs.locale('zh-cn');

    spyElementPrototype(HTMLLIElement, 'offsetTop', {
      get() {
        const childList = Array.from(this.parentNode?.childNodes || []);
        return childList.indexOf(this) * 30;
      },
    });
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

  describe('format and panel', () => {
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

    it('cellDateFormat should work', () => {
      render(
        <DayRangePicker
          locale={{
            ...zh_CN,
            cellDateFormat: '!DD!',
          }}
          open
        />,
      );

      expect(document.querySelector('[title="1990-11-04"]').textContent).toEqual('!04!');
    });

    it('cellQuarterFormat should work', () => {
      render(
        <DayRangePicker
          locale={{
            ...zh_CN,
            cellQuarterFormat: '第Q季度',
          }}
          picker="quarter"
          open
        />,
      );

      expect(document.querySelector('[title="1990-Q1"]').textContent).toEqual('第1季度');
    });

    it('cellMeridiemFormat should work', () => {
      render(
        <DayRangePicker
          picker="time"
          locale={{
            ...zh_CN,
            cellMeridiemFormat: 'A',
          }}
          showTime={{
            use12Hours: true,
          }}
          open
        />,
      );

      expect(
        document.querySelectorAll('[data-type="meridiem"] .rc-picker-time-panel-cell')[0]
          .textContent,
      ).toEqual('早上');
      expect(
        document.querySelectorAll('[data-type="meridiem"] .rc-picker-time-panel-cell')[1]
          .textContent,
      ).toEqual('晚上');
    });
  });

  it('showTime.changeOnScroll', () => {
    const onCalendarChange = jest.fn();

    const { container } = render(
      <DayRangePicker
        picker="time"
        value={[getDay('1990-09-03 11:11:11'), getDay('1990-09-03 11:11:11')]}
        showTime={{
          changeOnScroll: true,
        }}
        onCalendarChange={onCalendarChange}
      />,
    );

    openPicker(container);
    act(() => {
      jest.runAllTimers();
    });

    fireEvent.scroll(document.querySelector('.rc-picker-time-panel-column'), {
      target: {
        scrollTop: 0,
      },
    });
    act(() => {
      jest.runAllTimers();
    });

    expect(onCalendarChange).toHaveBeenCalledWith(
      expect.anything(),
      ['00:11:11', '11:11:11'],
      expect.anything(),
    );
  });

  describe('disabled', () => {
    it('select time column should not trigger change', () => {
      const onCalendarChange = jest.fn();
      const { container } = render(
        <DayRangePicker disabledDate={() => true} onCalendarChange={onCalendarChange} showTime />,
      );

      openPicker(container);
      fireEvent.click(
        document.querySelector('.rc-picker-time-panel-column .rc-picker-time-panel-cell'),
      );

      expect(onCalendarChange).toHaveBeenCalled();

      // Check button disabled
      expect(document.querySelector('.rc-picker-ok button')).toBeDisabled();
    });

    it('not trigger on disabled all hours', () => {
      const onCalendarChange = jest.fn();
      const { container } = render(
        <DayRangePicker
          onCalendarChange={onCalendarChange}
          showTime={{
            disabledTime: () => ({
              disabledHours: () => new Array(24).fill(0).map((_, index) => index),
            }),
          }}
        />,
      );

      openPicker(container);
      selectCell(9);

      expect(onCalendarChange).toHaveBeenCalled();

      // Check button disabled
      expect(document.querySelector('.rc-picker-ok button')).toBeDisabled();
    });

    it('not trigger onChange if presets is invalidate', () => {
      const onChange = jest.fn();
      const onCalendarChange = jest.fn();
      const { container } = render(
        <DayRangePicker
          onChange={onChange}
          onCalendarChange={onCalendarChange}
          presets={[
            {
              label: 'Now',
              value: [dayjs(), dayjs()],
            },
          ]}
          disabledDate={() => true}
        />,
      );

      openPicker(container);
      fireEvent.click(document.querySelector('.rc-picker-presets li'));

      expect(onChange).not.toHaveBeenCalled();
      expect(onCalendarChange).toHaveBeenCalled();
    });

    it('not trigger onChange if showNow is invalidate', () => {
      const onChange = jest.fn();
      const onCalendarChange = jest.fn();
      const { container } = render(
        <DayRangePicker
          onChange={onChange}
          onCalendarChange={onCalendarChange}
          showNow
          showTime
          disabledDate={() => true}
        />,
      );

      openPicker(container);
      fireEvent.click(document.querySelector('.rc-picker-now-btn'));
      fireEvent.click(document.querySelector('.rc-picker-now-btn'));

      expect(onChange).not.toHaveBeenCalled();
      expect(onCalendarChange).toHaveBeenCalledWith(
        expect.anything(),
        ['1990-09-03 00:00:00', '1990-09-03 00:00:00'],
        expect.anything(),
      );
    });

    it('not select disabled time', () => {
      const onCalendarChange = jest.fn();
      const { container } = render(
        <DayRangePicker
          picker="time"
          showTime={{
            disabledTime: () => ({
              disabledMinutes: () => [0],
            }),
          }}
          onCalendarChange={onCalendarChange}
        />,
      );

      openPicker(container);
      fireEvent.click(
        document.querySelector('.rc-picker-time-panel-column .rc-picker-time-panel-cell'),
      );

      expect(onCalendarChange).toHaveBeenCalledWith(
        expect.anything(),
        ['00:01:00', ''],
        expect.anything(),
      );
    });

    it('disabledTime has error style', () => {
      // rc-picker-invalid
      const { container } = render(
        <DayRangePicker
          picker="time"
          showTime={{
            disabledTime: () => ({
              disabledHours: () => [0],
            }),
          }}
        />,
      );

      const startInput = container.querySelectorAll<HTMLInputElement>('input')[0];
      const endInput = container.querySelectorAll<HTMLInputElement>('input')[1];

      fireEvent.focus(startInput);
      fireEvent.change(startInput, {
        target: {
          value: '00:00:00',
        },
      });
      expect(startInput).toHaveAttribute('aria-invalid', 'true');
      fireEvent.keyDown(startInput, {
        key: 'Enter',
      });

      fireEvent.change(endInput, {
        target: {
          value: '00:00:00',
        },
      });
      expect(startInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('type disabled time should not clickable ok', () => {
      const { container } = render(
        <DayRangePicker
          picker="time"
          showTime={{
            disabledTime: () => ({
              disabledHours: () => [0],
            }),
          }}
        />,
      );

      const input = container.querySelectorAll<HTMLInputElement>('input')[0];

      openPicker(container);

      // Enabled
      fireEvent.change(input, {
        target: {
          value: '01:00:00',
        },
      });
      expect(document.querySelector('.rc-picker-ok button')).not.toBeDisabled();

      // Disabled
      fireEvent.change(input, {
        target: {
          value: '00:00:00',
        },
      });
      expect(document.querySelector('.rc-picker-ok button')).toBeDisabled();
    });
  });

  it('showTime.defaultValue', () => {
    const onCalendarChange = jest.fn();
    const { container } = render(
      <DayRangePicker
        onCalendarChange={onCalendarChange}
        showTime={{
          defaultValue: [getDay('01:03:05'), getDay('02:04:06')],
        }}
      />,
    );

    openPicker(container);

    // Start field
    selectCell(6);
    expect(onCalendarChange).toHaveBeenCalledWith(
      expect.anything(),
      ['1990-09-06 01:03:05', ''],
      expect.anything(),
    );
    onCalendarChange.mockReset();

    // End field
    fireEvent.click(document.querySelector('.rc-picker-ok button'));
    selectCell(7);
    expect(onCalendarChange).toHaveBeenCalledWith(
      expect.anything(),
      ['1990-09-06 01:03:05', '1990-09-07 02:04:06'],
      expect.anything(),
    );
  });

  it('not trigger onChange when in half', () => {
    const onChange = jest.fn();

    const { container } = render(
      <DayRangePicker
        onChange={onChange}
        defaultValue={[getDay('1990-09-10 00:00:00'), getDay('1990-09-20 00:00:00')]}
      />,
    );

    openPicker(container);
    selectCell(5);
    expect(onChange).not.toHaveBeenCalled();

    selectCell(22);
    expect(onChange).toHaveBeenCalledWith(expect.anything(), ['1990-09-05', '1990-09-22']);
  });

  describe('needConfirm', () => {
    it('normal picker need confirm', () => {
      const onChange = jest.fn();
      const { container } = render(
        <>
          <DayRangePicker onChange={onChange} needConfirm />
          <button className="focus" />
        </>,
      );

      // Nothing happen if not confirmed
      openPicker(container);
      selectCell(5);
      closePicker(container);

      expect(container.querySelectorAll('input')[0]).toHaveValue('');

      act(() => {
        jest.runAllTimers();
      });

      container.querySelector<HTMLButtonElement>('.focus').focus();

      // Changed by click OK
      openPicker(container);
      selectCell(10);
      fireEvent.click(document.querySelector('.rc-picker-ok button'));

      expect(container.querySelectorAll('input')[0]).toHaveValue('1990-09-10');

      // End time
      selectCell(15, 1);
      expect(onChange).not.toHaveBeenCalled();
      fireEvent.click(document.querySelector('.rc-picker-ok button'));

      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['1990-09-10', '1990-10-15']);
    });

    it('no need confirm is blur to submit', () => {
      const onChange = jest.fn();
      const { container } = render(
        <DayRangePicker needConfirm={false} picker="time" onChange={onChange} />,
      );

      // Change start time (manually focus since fireEvent.focus not change activeElement)
      openPicker(container);
      fireEvent.click(
        document.querySelector('.rc-picker-time-panel-column').querySelectorAll('li')[6],
      );
      document.querySelector<HTMLDivElement>('.rc-picker-panel-container').focus();

      act(() => {
        jest.runAllTimers();
      });

      // Close panel to auto focus next end field
      fireEvent.click(document.body);
      expect(container.querySelectorAll('input')[1]).toHaveFocus();

      expect(isOpen()).toBeTruthy();

      // Select end time
      fireEvent.click(
        document.querySelector('.rc-picker-time-panel-column').querySelectorAll('li')[11],
      );

      act(() => {
        jest.runAllTimers();
      });

      // Close panel to auto focus next end field
      fireEvent.click(document.body);

      act(() => {
        jest.runAllTimers();
      });

      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['06:00:00', '11:00:00']);
    });

    it('double click to confirm if needConfirm', () => {
      const onChange = jest.fn();

      const { container } = render(<DayRangePicker showTime onChange={onChange} />);
      openPicker(container);

      fireEvent.click(findCell(5));
      fireEvent.doubleClick(findCell(5));

      act(() => {
        jest.runAllTimers();
      });

      const li = document.querySelector('.rc-picker-time-panel-column').querySelectorAll('li')[11];
      fireEvent.click(li);
      fireEvent.doubleClick(li);

      expect(onChange).toHaveBeenCalledWith(expect.anything(), [
        '1990-09-05 00:00:00',
        '1990-09-05 11:00:00',
      ]);
    });
  });

  describe('open', () => {
    it('open = false can also submit', () => {
      const onChange = jest.fn();
      const { container } = render(
        <DayRangePicker onChange={onChange} picker="time" open={false} />,
      );

      const startInput = container.querySelectorAll<HTMLInputElement>('input')[0];
      const endInput = container.querySelectorAll<HTMLInputElement>('input')[1];

      startInput.focus();
      fireEvent.change(startInput, {
        target: {
          value: '00:00:00',
        },
      });
      fireEvent.keyDown(startInput, {
        key: 'Tab',
      });

      endInput.focus();
      fireEvent.change(endInput, {
        target: {
          value: '02:00:00',
        },
      });
      fireEvent.keyDown(startInput, {
        key: 'Tab',
      });

      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['00:00:00', '02:00:00']);
    });

    // https://github.com/ant-design/ant-design/issues/30525
    it('strange open case', async () => {
      const onChange = jest.fn();
      const renderDemo = (open: boolean) => <DayRangePicker open={open} onChange={onChange} />;
      const { rerender } = render(renderDemo(true));
      await waitFakeTimer();

      fireEvent.focus(document.querySelector('.rc-picker-panel-container'));
      selectCell(5);
      selectCell(10);

      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['1990-09-05', '1990-09-10']);
      onChange.mockReset();

      // Force close and open again
      rerender(renderDemo(false));
      fireEvent.blur(document.querySelector('.rc-picker-panel-container'));
      await waitFakeTimer();

      rerender(renderDemo(true));
      fireEvent.blur(document.querySelector('.rc-picker-panel-container'));
      await waitFakeTimer();

      fireEvent.focus(document.querySelector('.rc-picker-panel-container'));
      selectCell(7);
      selectCell(11);

      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['1990-09-07', '1990-09-11']);
    });
  });

  describe('components', () => {
    it('panel', () => {
      render(
        <DayRangePicker
          picker="time"
          components={{
            time: () => <h1 className="bamboo">Hello</h1>,
          }}
          open
        />,
      );

      expect(document.querySelector('.bamboo').textContent).toEqual('Hello');
    });

    it('input', () => {
      const Input = React.forwardRef<HTMLInputElement, React.HTMLAttributes<HTMLInputElement>>(
        (props, ref) => <input {...props} ref={ref} data-id="input-it" />,
      );

      const { container } = render(
        <DayRangePicker
          components={{
            input: Input,
          }}
        />,
      );

      expect(container.querySelector('input')).toHaveAttribute('data-id', 'input-it');
    });
  });
});

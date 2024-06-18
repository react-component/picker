import { act, createEvent, fireEvent, render } from '@testing-library/react';
import KeyCode from 'rc-util/lib/KeyCode';
import { resetWarned } from 'rc-util/lib/warning';
import React from 'react';
import {
  closePicker,
  DayPicker,
  DayPickerPanel,
  DayRangePicker,
  getMoment,
  isOpen,
  isSame,
  openPicker,
} from './util/commonUtil';

// TODO: New keyboard interactive
describe('Picker.Keyboard', () => {
  function keyDown(keyCode: number, info?: object, index = 0) {
    const input = document.querySelectorAll('input')[index];
    const event = createEvent.keyDown(input, {
      keyCode,
      which: keyCode,
      charCode: keyCode,
      ...info,
    });

    fireEvent(input, event);

    return event;
  }

  function panelKeyDown(keyCode: number, info?: object) {
    fireEvent.keyDown(document.querySelector('.rc-picker-panel') as HTMLElement, {
      keyCode,
      which: keyCode,
      charCode: keyCode,
      ...info,
    });
    document.querySelector('.rc-picker-panel').simulate('keyDown', { which: keyCode, ...info });
  }

  beforeEach(() => {
    resetWarned();
    document.body.innerHTML = '';
    jest.useFakeTimers().setSystemTime(getMoment('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('type confirm', () => {
    const onChange = jest.fn();
    const onCalendarChange = jest.fn();
    const { container } = render(
      <DayPicker onCalendarChange={onCalendarChange} onChange={onChange} />,
    );

    const inputEle = container.querySelector('input');

    // Focus
    fireEvent.focus(inputEle);
    expect(isOpen()).toBeFalsy();

    // Key to open
    fireEvent.keyDown(inputEle, {
      key: 'Enter',
    });
    expect(isOpen()).toBeTruthy();

    // type date
    fireEvent.change(inputEle, {
      target: {
        value: '2000-03-03',
      },
    });
    expect(onCalendarChange).toHaveBeenCalledWith(expect.anything(), '2000-03-03', {});

    // Submit
    fireEvent.keyDown(inputEle, {
      key: 'Enter',
    });
    expect(onChange).toHaveBeenCalledWith(expect.anything(), '2000-03-03');
  });

  it('warning for legacy preventDefault', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(
      <DayPicker
        onKeyDown={(e, preventDefault) => {
          preventDefault();
        }}
      />,
    );

    fireEvent.keyDown(container.querySelector('input'), {
      key: 'Escape',
    });

    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: `preventDefault` callback is deprecated. Please call `event.preventDefault` directly.',
    );
  });

  describe('esc to close popup', () => {
    it('should work', () => {
      const { container } = render(<DayPicker />);

      openPicker(container);
      fireEvent.keyDown(container.querySelector('input'), {
        key: 'Escape',
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(isOpen()).toBeFalsy();
    });

    it('preventDefault should work', () => {
      const { container } = render(<DayPicker onKeyDown={(e) => e.preventDefault()} />);

      openPicker(container);
      fireEvent.keyDown(container.querySelector('input'), {
        key: 'Escape',
      });
      expect(isOpen()).toBeTruthy();
    });
  });

  return;
  it('open to select', () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    const { container } = render(<DayPicker onSelect={onSelect} onChange={onChange} />);
    fireEvent.focus(container.querySelector('input'));
    fireEvent.keyDown(container.querySelector('input'), {
      keyCode: KeyCode.ENTER,
      which: KeyCode.ENTER,
      charCode: KeyCode.ENTER,
    });
    expect(isOpen()).toBeTruthy();

    // Tab to operate popup panel
    keyDown(KeyCode.TAB);
    expect(document.querySelector('.rc-picker-panel-focused')).toBeTruthy();

    // Down
    keyDown(KeyCode.DOWN);
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-10')).toBeTruthy();

    // UP
    onSelect.mockReset();
    keyDown(KeyCode.UP);
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();

    // LEFT
    onSelect.mockReset();
    keyDown(KeyCode.LEFT);
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-02')).toBeTruthy();

    // RIGHT
    onSelect.mockReset();
    keyDown(KeyCode.RIGHT);
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // Control + Left
    onSelect.mockReset();
    keyDown(KeyCode.LEFT, { ctrlKey: true });
    expect(isSame(onSelect.mock.calls[0][0], '1989-09-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // Control + RIGHT
    onSelect.mockReset();
    keyDown(KeyCode.RIGHT, { ctrlKey: true });
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // PageUp
    onSelect.mockReset();
    keyDown(KeyCode.PAGE_UP);
    expect(isSame(onSelect.mock.calls[0][0], '1990-08-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // PageDown
    onSelect.mockReset();
    keyDown(KeyCode.PAGE_DOWN);
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // Other key
    onSelect.mockReset();
    keyDown(KeyCode.B);
    expect(onSelect).not.toHaveBeenCalled();

    // Double RIGHT
    keyDown(KeyCode.RIGHT);

    // ENTER
    keyDown(KeyCode.ENTER);
    expect(isOpen()).toBeFalsy();
    expect(onChange.mock.calls[0][1]).toEqual('1990-09-04');
  });

  it('ESC to cancel', () => {
    const onChange = jest.fn();
    const { container } = render(<DayPicker onChange={onChange} />);
    openPicker(container);

    // Change value
    keyDown(KeyCode.TAB);
    keyDown(KeyCode.DOWN);

    // ESC
    keyDown(KeyCode.ESC);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('any key to open', () => {
    render(<DayPicker />);
    keyDown(KeyCode.A);
    expect(isOpen()).toBeTruthy();
  });

  it('not change focus to panel', () => {
    const { container } = render(<DayPicker />);
    openPicker(container);

    // Not change focus
    keyDown(KeyCode.B);
    expect(isOpen()).toBeTruthy();

    expect(document.querySelector('.rc-picker-panel-focused')).toBeFalsy();
  });

  it('Tab into Panel and back to input', () => {
    const { container } = render(<DayPicker />);
    openPicker(container);

    // Focus Panel
    keyDown(KeyCode.TAB);
    expect(document.querySelector('.rc-picker-panel-focused')).toBeTruthy();

    // Focus Back
    keyDown(KeyCode.TAB, { shiftKey: true });
    expect(document.querySelector('.rc-picker-panel-focused')).toBeFalsy();
  });

  describe('datetime Tab control', () => {
    it('Picker', () => {
      jest.useFakeTimers();

      const { container } = render(<DayPicker showTime />);
      openPicker(container);

      // Focus Panel
      keyDown(KeyCode.TAB);
      expect(document.querySelector('.rc-picker-panel-focused')).toBeTruthy();

      // Focus Date Panel
      keyDown(KeyCode.TAB);
      expect(document.querySelector('.rc-picker-date-panel-active')).toBeTruthy();

      // Focus Time Panel
      keyDown(KeyCode.TAB);
      expect(document.querySelector('.rc-picker-time-panel-active')).toBeTruthy();

      // Close should not focus
      closePicker(container);
      act(() => {
        jest.runAllTimers();
      });
      expect(document.querySelector('.rc-picker-time-panel-active')).toBeFalsy();

      jest.useRealTimers();
    });

    describe('PickerPanel', () => {
      describe('switch panels', () => {
        [
          {
            name: 'Tab switch first',
            operate: () => {
              panelKeyDown(KeyCode.TAB);
            },
          },
          {
            name: 'Arrow switch first',
            operate: () => {
              // Nothing happen
              panelKeyDown(KeyCode.A);

              // Switch
              panelKeyDown(KeyCode.DOWN);
            },
          },
        ].forEach(({ name, operate }) => {
          it(name, () => {
            const onSelect = jest.fn();
            render(<DayPickerPanel onSelect={onSelect} showTime />);

            // Focus Panel
            fireEvent.focus(document.querySelector('.rc-picker-panel'));
            // document.querySelector('.rc-picker-panel').simulate('focus');

            // Focus Date Panel
            operate();
            expect(document.querySelector('.rc-picker-date-panel-active')).toBeTruthy();

            // Select
            panelKeyDown(KeyCode.DOWN);
            expect(isSame(onSelect.mock.calls[0][0], '1990-09-10')).toBeTruthy();

            // Focus Time Panel
            panelKeyDown(KeyCode.TAB);
            expect(document.querySelector('.rc-picker-time-panel-active')).toBeTruthy();

            // Select
            onSelect.mockReset();
            panelKeyDown(KeyCode.UP);
            panelKeyDown(KeyCode.DOWN);
            expect(isSame(onSelect.mock.calls[0][0], '1990-09-10 01:00:00', 'second')).toBeTruthy();

            // Next column select
            onSelect.mockReset();
            panelKeyDown(KeyCode.RIGHT);
            panelKeyDown(KeyCode.UP);
            expect(isSame(onSelect.mock.calls[0][0], '1990-09-10 01:59:00', 'second')).toBeTruthy();

            // Enter to exit column edit
            onSelect.mockReset();
            expect(document.querySelector('.rc-picker-time-panel-column-active')).toBeTruthy();
            panelKeyDown(KeyCode.ENTER);
            expect(document.querySelector('.rc-picker-time-panel-column-active')).toBeFalsy();
            expect(isSame(onSelect.mock.calls[0][0], '1990-09-10 01:59:00', 'second')).toBeTruthy();

            // Close should not focus
            fireEvent.blur(document.querySelector('.rc-picker-panel'));
            expect(document.querySelector('.rc-picker-time-panel-active')).toBeFalsy();
          });
        });
      });

      it('Enter to next view', () => {
        render(<DayPickerPanel />);
        fireEvent.click(document.querySelector('.rc-picker-year-btn'));
        fireEvent.click(document.querySelector('.rc-picker-decade-btn'));

        // Decade
        expect(document.querySelector('.rc-picker-decade-panel')).toBeTruthy();

        // Year
        panelKeyDown(KeyCode.ENTER);
        expect(document.querySelector('.rc-picker-year-panel')).toBeTruthy();

        // Month
        panelKeyDown(KeyCode.ENTER);
        expect(document.querySelector('.rc-picker-month-panel')).toBeTruthy();

        // Date
        panelKeyDown(KeyCode.ENTER);
        expect(document.querySelector('.rc-picker-date-panel')).toBeTruthy();
      });
    });
  });

  it('time enter will trigger onSelect', () => {
    const onSelect = jest.fn();
    render(<DayPickerPanel picker="time" onSelect={onSelect} />);
    panelKeyDown(KeyCode.ENTER);
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03 00:00:00', 'second')).toBeTruthy();
  });

  describe('arrow trigger onSelect', () => {
    // Same as 'open to select' test. But with other panel
    it('month', () => {
      const onSelect = jest.fn();
      render(
        <DayPickerPanel
          picker="month"
          defaultValue={getMoment('1990-09-03')}
          onSelect={onSelect}
        />,
      );

      // Left
      panelKeyDown(KeyCode.LEFT);
      expect(isSame(onSelect.mock.calls[0][0], '1990-08-03')).toBeTruthy();

      // Control + Right
      onSelect.mockReset();
      panelKeyDown(KeyCode.RIGHT, { ctrlKey: true });
      expect(isSame(onSelect.mock.calls[0][0], '1991-08-03')).toBeTruthy();

      // Down
      onSelect.mockReset();
      panelKeyDown(KeyCode.DOWN);
      expect(isSame(onSelect.mock.calls[0][0], '1991-11-03')).toBeTruthy();
    });

    it('quarter', () => {
      const onSelect = jest.fn();
      render(
        <DayPickerPanel
          picker="quarter"
          defaultValue={getMoment('1990-09-03')}
          onSelect={onSelect}
        />,
      );

      // Left
      panelKeyDown(KeyCode.LEFT);
      expect(isSame(onSelect.mock.calls[0][0], '1990-06-03')).toBeTruthy();

      // Control + Right
      onSelect.mockReset();
      panelKeyDown(KeyCode.RIGHT, { ctrlKey: true });
      expect(isSame(onSelect.mock.calls[0][0], '1991-06-03')).toBeTruthy();

      // Down
      onSelect.mockReset();
      panelKeyDown(KeyCode.DOWN);
      expect(isSame(onSelect.mock.calls[0][0], '1992-06-03')).toBeTruthy();
    });

    it('year', () => {
      const onSelect = jest.fn();
      render(
        <DayPickerPanel picker="year" defaultValue={getMoment('1990-09-03')} onSelect={onSelect} />,
      );

      // Left
      panelKeyDown(KeyCode.LEFT);
      expect(isSame(onSelect.mock.calls[0][0], '1989-09-03')).toBeTruthy();

      // Control + Right
      onSelect.mockReset();
      panelKeyDown(KeyCode.RIGHT, { ctrlKey: true });
      expect(isSame(onSelect.mock.calls[0][0], '1999-09-03')).toBeTruthy();

      // Down
      onSelect.mockReset();
      panelKeyDown(KeyCode.DOWN);
      expect(isSame(onSelect.mock.calls[0][0], '2002-09-03')).toBeTruthy();
    });

    it('decade', () => {
      const onPanelChange = jest.fn();
      render(
        <DayPickerPanel
          mode="decade"
          defaultValue={getMoment('1990-09-03')}
          onPanelChange={onPanelChange}
        />,
      );

      // Left
      panelKeyDown(KeyCode.LEFT);
      panelKeyDown(KeyCode.ENTER);
      expect(isSame(onPanelChange.mock.calls[0][0], '1980', 'year')).toBeTruthy();

      // Control + Right
      onPanelChange.mockReset();
      panelKeyDown(KeyCode.RIGHT, { ctrlKey: true });
      panelKeyDown(KeyCode.ENTER);
      expect(isSame(onPanelChange.mock.calls[0][0], '2080', 'year')).toBeTruthy();

      // Down
      onPanelChange.mockReset();
      panelKeyDown(KeyCode.DOWN);
      panelKeyDown(KeyCode.ENTER);
      expect(isSame(onPanelChange.mock.calls[0][0], '2110', 'year')).toBeTruthy();
    });
  });

  describe('range picker', () => {
    it('full step', () => {
      jest.useFakeTimers();
      const onCalendarChange = jest.fn();
      const onChange = jest.fn();
      const { container } = render(
        <DayRangePicker onCalendarChange={onCalendarChange} onChange={onChange} />,
      );

      // Start Date
      openPicker(container);
      fireEvent.change(container.querySelector('input'), { target: { value: '1990-01-01' } });
      keyDown(KeyCode.TAB);
      keyDown(KeyCode.DOWN);
      keyDown(KeyCode.ENTER);
      expect(onCalendarChange.mock.calls[0][1]).toEqual(['1990-01-08', '']);
      expect(onChange).not.toHaveBeenCalled();

      // End Date
      act(() => {
        jest.runAllTimers();
      });
      expect(document.querySelectorAll('.rc-picker-input')[1]).toHaveClass(
        'rc-picker-input-active',
      );
      onCalendarChange.mockReset();

      fireEvent.change(document.querySelectorAll('input')[1], {
        target: { value: '2000-01-01' },
      });
      keyDown(KeyCode.TAB, {}, 1);
      keyDown(KeyCode.DOWN, {}, 1);
      keyDown(KeyCode.ENTER, {}, 1);
      expect(onCalendarChange.mock.calls[0][1]).toEqual(['1990-01-08', '2000-01-08']);
      expect(onChange.mock.calls[0][1]).toEqual(['1990-01-08', '2000-01-08']);

      jest.useRealTimers();
    });

    it('full step', () => {
      const onCalendarChange = jest.fn();
      const onChange = jest.fn();
      const onFocus = jest.fn();
      const { container } = render(
        <DayRangePicker
          onFocus={onFocus}
          onCalendarChange={onCalendarChange}
          onChange={onChange}
        />,
      );

      openPicker(container);
      expect(onFocus).toHaveBeenCalled();

      fireEvent.change(container.querySelector('input'), { target: { value: '1990-01-01' } });
      keyDown(KeyCode.ESC);
      expect(container.querySelector('input').value).toEqual('');
    });

    it('move based on current date on first keyboard event', () => {
      const onCalendarChange = jest.fn();
      const onChange = jest.fn();
      const { container } = render(
        <DayRangePicker onCalendarChange={onCalendarChange} onChange={onChange} />,
      );

      // Start Date
      openPicker(container);
      // wrapper
      //   .find('input')
      //   .first()
      //   .simulate('change', { target: { value: '' } });
      fireEvent.change(container.querySelector('input'), { target: { value: '' } });
      keyDown(KeyCode.TAB);
      keyDown(KeyCode.RIGHT);
      keyDown(KeyCode.ENTER);
      expect(onCalendarChange.mock.calls[0][1]).toEqual(['1990-09-04', '']);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it('enter should prevent default to avoid form submit', () => {
    render(<DayPicker />);
    const event = keyDown(KeyCode.ENTER);

    expect(event.defaultPrevented).toBeTruthy();
  });

  describe('keyboard should not trigger on disabledDate', () => {
    it('picker', () => {
      const onChange = jest.fn();
      const onSelect = jest.fn();
      const { container } = render(
        <DayPicker
          showTime
          onSelect={onSelect}
          onChange={onChange}
          disabledDate={(date) => date.date() % 2 === 0}
        />,
      );
      // document.querySelector('input').simulate('focus');
      fireEvent.focus(container.querySelector('input'));
      keyDown(KeyCode.ENTER);
      keyDown(KeyCode.TAB);
      keyDown(KeyCode.TAB);
      keyDown(KeyCode.DOWN);
      expect(isSame(onSelect.mock.calls[0][0], '1990-09-10')).toBeTruthy();

      // Not enter to change
      keyDown(KeyCode.ENTER);
      expect(onChange).not.toHaveBeenCalled();

      // Not button enabled
      expect(
        document.querySelector<HTMLButtonElement>('.rc-picker-ok button').disabled,
      ).toBeTruthy();

      // Another can be enter
      keyDown(KeyCode.RIGHT);
      expect(
        document.querySelector<HTMLButtonElement>('.rc-picker-ok button').disabled,
      ).toBeFalsy();
      keyDown(KeyCode.ENTER);
      expect(onChange).toHaveBeenCalled();
    });

    it('panel', () => {
      const onChange = jest.fn();
      const onSelect = jest.fn();
      render(
        <DayPickerPanel
          onSelect={onSelect}
          onChange={onChange}
          disabledDate={(date) => date.date() % 2 === 0}
        />,
      );

      fireEvent.focus(document.querySelector('.rc-picker-panel'));
      // 9-02、9-04、9-10 is disabled
      panelKeyDown(KeyCode.LEFT);
      panelKeyDown(KeyCode.RIGHT);
      panelKeyDown(KeyCode.DOWN);
      expect(onSelect).not.toHaveBeenCalled();

      // 7-27、8-27 is enabled
      panelKeyDown(KeyCode.UP);
      expect(isSame(onSelect.mock.calls[0][0], '1990-08-27')).toBeTruthy();
      onSelect.mockReset();
      panelKeyDown(KeyCode.PAGE_UP);
      expect(isSame(onSelect.mock.calls[0][0], '1990-07-27')).toBeTruthy();
      onSelect.mockReset();
      panelKeyDown(KeyCode.PAGE_DOWN);
      expect(isSame(onSelect.mock.calls[0][0], '1990-08-27')).toBeTruthy();
    });

    it('month panel', () => {
      const onChange = jest.fn();
      const onSelect = jest.fn();
      const now = new Date();
      render(
        <DayPickerPanel
          picker="month"
          onSelect={onSelect}
          onChange={onChange}
          disabledDate={(date) => date.month() < now.getMonth()}
        />,
      );

      fireEvent.focus(document.querySelector('.rc-picker-panel'));

      // PAGE_UP and PAGE_DOWN do not trigger the select
      panelKeyDown(KeyCode.PAGE_UP);
      panelKeyDown(KeyCode.PAGE_DOWN);
      expect(onSelect).not.toHaveBeenCalled();

      // The disabled date is before August
      panelKeyDown(KeyCode.LEFT);
      panelKeyDown(KeyCode.UP);
      expect(onSelect).not.toHaveBeenCalled();

      // August and subsequent dates are enable
      panelKeyDown(KeyCode.RIGHT);
      expect(isSame(onSelect.mock.calls[0][0], '1990-10-03')).toBeTruthy();
      onSelect.mockReset();
      panelKeyDown(KeyCode.LEFT);
      onSelect.mockReset();
      panelKeyDown(KeyCode.DOWN);
      expect(isSame(onSelect.mock.calls[0][0], '1990-12-03')).toBeTruthy();
    });
  });
});

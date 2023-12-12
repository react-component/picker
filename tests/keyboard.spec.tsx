import { act, createEvent, fireEvent, render } from '@testing-library/react';
import React from 'react';
import {
  closePicker,
  getMoment,
  isOpen,
  isSame,
  MomentPicker,
  MomentPickerPanel,
  MomentRangePicker,
  openPicker,
} from './util/commonUtil';

describe('Picker.Keyboard', () => {
  function keyDown(key: string, info?: object, index = 0) {
    const input = document.querySelectorAll('input')[index];
    const event = createEvent.keyDown(input, { key, ...info });

    fireEvent(input, event);

    return event;
  }

  function panelKeyDown(key: string, info?: object) {
    fireEvent.keyDown(document.querySelector('.rc-picker-panel') as HTMLElement, { key, ...info });
    // document.querySelector('.rc-picker-panel').simulate('keyDown', { key, ...info });
  }

  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers().setSystemTime(getMoment('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('open to select', () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    const { container } = render(<MomentPicker onSelect={onSelect} onChange={onChange} />);
    fireEvent.focus(container.querySelector('input'));
    fireEvent.keyDown(container.querySelector('input'), { key: 'Enter' });
    expect(isOpen()).toBeTruthy();

    // Tab to operate popup panel
    keyDown('Tab');
    expect(document.querySelector('.rc-picker-panel-focused')).toBeTruthy();

    // Down
    keyDown('ArrowDown');
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-10')).toBeTruthy();

    // UP
    onSelect.mockReset();
    keyDown('ArrowUp');
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();

    // LEFT
    onSelect.mockReset();
    keyDown('ArrowLeft');
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-02')).toBeTruthy();

    // RIGHT
    onSelect.mockReset();
    keyDown('ArrowRight');
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // Control + Left
    onSelect.mockReset();
    keyDown('ArrowLeft', { ctrlKey: true });
    expect(isSame(onSelect.mock.calls[0][0], '1989-09-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // Control + RIGHT
    onSelect.mockReset();
    keyDown('ArrowRight', { ctrlKey: true });
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // PageUp
    onSelect.mockReset();
    keyDown('PageUp');
    expect(isSame(onSelect.mock.calls[0][0], '1990-08-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // PageDown
    onSelect.mockReset();
    keyDown('PageDown');
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    // Other key
    onSelect.mockReset();
    keyDown('b');
    expect(onSelect).not.toHaveBeenCalled();

    // Double RIGHT
    keyDown('ArrowRight');

    // ENTER
    keyDown('Enter');
    expect(isOpen()).toBeFalsy();
    expect(onChange.mock.calls[0][1]).toEqual('1990-09-04');
  });

  it('ESC to cancel', () => {
    const onChange = jest.fn();
    const { container } = render(<MomentPicker onChange={onChange} />);
    openPicker(container);

    // Change value
    keyDown('Tab');
    keyDown('ArrowDown');

    // ESC
    keyDown('Escape');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('any key to open', () => {
    render(<MomentPicker />);
    keyDown('a');
    expect(isOpen()).toBeTruthy();
  });

  it('not change focus to panel', () => {
    const { container } = render(<MomentPicker />);
    openPicker(container);

    // Not change focus
    keyDown('b');
    expect(isOpen()).toBeTruthy();

    expect(document.querySelector('.rc-picker-panel-focused')).toBeFalsy();
  });

  it('Tab into Panel and back to input', () => {
    const { container } = render(<MomentPicker />);
    openPicker(container);

    // Focus Panel
    keyDown('Tab');
    expect(document.querySelector('.rc-picker-panel-focused')).toBeTruthy();

    // Focus Back
    keyDown('Tab', { shiftKey: true });
    expect(document.querySelector('.rc-picker-panel-focused')).toBeFalsy();
  });

  describe('datetime Tab control', () => {
    it('Picker', () => {
      jest.useFakeTimers();

      const { container } = render(<MomentPicker showTime />);
      openPicker(container);

      // Focus Panel
      keyDown('Tab');
      expect(document.querySelector('.rc-picker-panel-focused')).toBeTruthy();

      // Focus Date Panel
      keyDown('Tab');
      expect(document.querySelector('.rc-picker-date-panel-active')).toBeTruthy();

      // Focus Time Panel
      keyDown('Tab');
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
              panelKeyDown('Tab');
            },
          },
          {
            name: 'Arrow switch first',
            operate: () => {
              // Nothing happen
              panelKeyDown('a');

              // Switch
              panelKeyDown('ArrowDown');
            },
          },
        ].forEach(({ name, operate }) => {
          it(name, () => {
            const onSelect = jest.fn();
            render(<MomentPickerPanel onSelect={onSelect} showTime />);

            // Focus Panel
            fireEvent.focus(document.querySelector('.rc-picker-panel'));
            // document.querySelector('.rc-picker-panel').simulate('focus');

            // Focus Date Panel
            operate();
            expect(document.querySelector('.rc-picker-date-panel-active')).toBeTruthy();

            // Select
            panelKeyDown('ArrowDown');
            expect(isSame(onSelect.mock.calls[0][0], '1990-09-10')).toBeTruthy();

            // Focus Time Panel
            panelKeyDown('Tab');
            expect(document.querySelector('.rc-picker-time-panel-active')).toBeTruthy();

            // Select
            onSelect.mockReset();
            panelKeyDown('ArrowUp');
            panelKeyDown('ArrowDown');
            expect(isSame(onSelect.mock.calls[0][0], '1990-09-10 01:00:00', 'second')).toBeTruthy();

            // Next column select
            onSelect.mockReset();
            panelKeyDown('ArrowRight');
            panelKeyDown('ArrowUp');
            expect(isSame(onSelect.mock.calls[0][0], '1990-09-10 01:59:00', 'second')).toBeTruthy();

            // Enter to exit column edit
            onSelect.mockReset();
            expect(document.querySelector('.rc-picker-time-panel-column-active')).toBeTruthy();
            panelKeyDown('Enter');
            expect(document.querySelector('.rc-picker-time-panel-column-active')).toBeFalsy();
            expect(isSame(onSelect.mock.calls[0][0], '1990-09-10 01:59:00', 'second')).toBeTruthy();

            // Close should not focus
            fireEvent.blur(document.querySelector('.rc-picker-panel'));
            expect(document.querySelector('.rc-picker-time-panel-active')).toBeFalsy();
          });
        });
      });

      it('Enter to next view', () => {
        render(<MomentPickerPanel />);
        fireEvent.click(document.querySelector('.rc-picker-year-btn'));
        fireEvent.click(document.querySelector('.rc-picker-decade-btn'));

        // Decade
        expect(document.querySelector('.rc-picker-decade-panel')).toBeTruthy();

        // Year
        panelKeyDown('Enter');
        expect(document.querySelector('.rc-picker-year-panel')).toBeTruthy();

        // Month
        panelKeyDown('Enter');
        expect(document.querySelector('.rc-picker-month-panel')).toBeTruthy();

        // Date
        panelKeyDown('Enter');
        expect(document.querySelector('.rc-picker-date-panel')).toBeTruthy();
      });
    });
  });

  it('time enter will trigger onSelect', () => {
    const onSelect = jest.fn();
    render(<MomentPickerPanel picker="time" onSelect={onSelect} />);
    panelKeyDown('Enter');
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-03 00:00:00', 'second')).toBeTruthy();
  });

  describe('arrow trigger onSelect', () => {
    // Same as 'open to select' test. But with other panel
    it('month', () => {
      const onSelect = jest.fn();
      render(
        <MomentPickerPanel
          picker="month"
          defaultValue={getMoment('1990-09-03')}
          onSelect={onSelect}
        />,
      );

      // Left
      panelKeyDown('ArrowLeft');
      expect(isSame(onSelect.mock.calls[0][0], '1990-08-03')).toBeTruthy();

      // Control + Right
      onSelect.mockReset();
      panelKeyDown('ArrowRight', { ctrlKey: true });
      expect(isSame(onSelect.mock.calls[0][0], '1991-08-03')).toBeTruthy();

      // Down
      onSelect.mockReset();
      panelKeyDown('ArrowDown');
      expect(isSame(onSelect.mock.calls[0][0], '1991-11-03')).toBeTruthy();
    });

    it('quarter', () => {
      const onSelect = jest.fn();
      render(
        <MomentPickerPanel
          picker="quarter"
          defaultValue={getMoment('1990-09-03')}
          onSelect={onSelect}
        />,
      );

      // Left
      panelKeyDown('ArrowLeft');
      expect(isSame(onSelect.mock.calls[0][0], '1990-06-03')).toBeTruthy();

      // Control + Right
      onSelect.mockReset();
      panelKeyDown('ArrowRight', { ctrlKey: true });
      expect(isSame(onSelect.mock.calls[0][0], '1991-06-03')).toBeTruthy();

      // Down
      onSelect.mockReset();
      panelKeyDown('ArrowDown');
      expect(isSame(onSelect.mock.calls[0][0], '1992-06-03')).toBeTruthy();
    });

    it('year', () => {
      const onSelect = jest.fn();
      render(
        <MomentPickerPanel
          picker="year"
          defaultValue={getMoment('1990-09-03')}
          onSelect={onSelect}
        />,
      );

      // Left
      panelKeyDown('ArrowLeft');
      expect(isSame(onSelect.mock.calls[0][0], '1989-09-03')).toBeTruthy();

      // Control + Right
      onSelect.mockReset();
      panelKeyDown('ArrowRight', { ctrlKey: true });
      expect(isSame(onSelect.mock.calls[0][0], '1999-09-03')).toBeTruthy();

      // Down
      onSelect.mockReset();
      panelKeyDown('ArrowDown');
      expect(isSame(onSelect.mock.calls[0][0], '2002-09-03')).toBeTruthy();
    });

    it('decade', () => {
      const onPanelChange = jest.fn();
      render(
        <MomentPickerPanel
          mode="decade"
          defaultValue={getMoment('1990-09-03')}
          onPanelChange={onPanelChange}
        />,
      );

      // Left
      panelKeyDown('ArrowLeft');
      panelKeyDown('Enter');
      expect(isSame(onPanelChange.mock.calls[0][0], '1980', 'year')).toBeTruthy();

      // Control + Right
      onPanelChange.mockReset();
      panelKeyDown('ArrowRight', { ctrlKey: true });
      panelKeyDown('Enter');
      expect(isSame(onPanelChange.mock.calls[0][0], '2080', 'year')).toBeTruthy();

      // Down
      onPanelChange.mockReset();
      panelKeyDown('ArrowDown');
      panelKeyDown('Enter');
      expect(isSame(onPanelChange.mock.calls[0][0], '2110', 'year')).toBeTruthy();
    });
  });

  describe('range picker', () => {
    it('full step', () => {
      jest.useFakeTimers();
      const onCalendarChange = jest.fn();
      const onChange = jest.fn();
      const { container } = render(
        <MomentRangePicker onCalendarChange={onCalendarChange} onChange={onChange} />,
      );

      // Start Date
      openPicker(container);
      fireEvent.change(container.querySelector('input'), { target: { value: '1990-01-01' } });
      keyDown('Tab');
      keyDown('ArrowDown');
      keyDown('Enter');
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
      keyDown('Tab', {}, 1);
      keyDown('ArrowDown', {}, 1);
      keyDown('Enter', {}, 1);
      expect(onCalendarChange.mock.calls[0][1]).toEqual(['1990-01-08', '2000-01-08']);
      expect(onChange.mock.calls[0][1]).toEqual(['1990-01-08', '2000-01-08']);

      jest.useRealTimers();
    });

    it('full step', () => {
      const onCalendarChange = jest.fn();
      const onChange = jest.fn();
      const onFocus = jest.fn();
      const { container } = render(
        <MomentRangePicker
          onFocus={onFocus}
          onCalendarChange={onCalendarChange}
          onChange={onChange}
        />,
      );

      openPicker(container);
      expect(onFocus).toHaveBeenCalled();

      fireEvent.change(container.querySelector('input'), { target: { value: '1990-01-01' } });
      keyDown('Escape');
      expect(container.querySelector('input').value).toEqual('');
    });

    it('move based on current date on first keyboard event', () => {
      const onCalendarChange = jest.fn();
      const onChange = jest.fn();
      const { container } = render(
        <MomentRangePicker onCalendarChange={onCalendarChange} onChange={onChange} />,
      );

      // Start Date
      openPicker(container);
      // wrapper
      //   .find('input')
      //   .first()
      //   .simulate('change', { target: { value: '' } });
      fireEvent.change(container.querySelector('input'), { target: { value: '' } });
      keyDown('Tab');
      keyDown('ArrowRight');
      keyDown('Enter');
      expect(onCalendarChange.mock.calls[0][1]).toEqual(['1990-09-04', '']);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it('enter should prevent default to avoid form submit', () => {
    render(<MomentPicker />);
    const event = keyDown('Enter');

    expect(event.defaultPrevented).toBeTruthy();
  });

  describe('keyboard should not trigger on disabledDate', () => {
    it('picker', () => {
      const onChange = jest.fn();
      const onSelect = jest.fn();
      const { container } = render(
        <MomentPicker
          showTime
          onSelect={onSelect}
          onChange={onChange}
          disabledDate={(date) => date.date() % 2 === 0}
        />,
      );
      // document.querySelector('input').simulate('focus');
      fireEvent.focus(container.querySelector('input'));
      keyDown('Enter');
      keyDown('Tab');
      keyDown('Tab');
      keyDown('ArrowDown');
      expect(isSame(onSelect.mock.calls[0][0], '1990-09-10')).toBeTruthy();

      // Not enter to change
      keyDown('Enter');
      expect(onChange).not.toHaveBeenCalled();

      // Not button enabled
      expect(
        document.querySelector<HTMLButtonElement>('.rc-picker-ok button').disabled,
      ).toBeTruthy();

      // Another can be enter
      keyDown('ArrowRight');
      expect(
        document.querySelector<HTMLButtonElement>('.rc-picker-ok button').disabled,
      ).toBeFalsy();
      keyDown('Enter');
      expect(onChange).toHaveBeenCalled();
    });

    it('panel', () => {
      const onChange = jest.fn();
      const onSelect = jest.fn();
      render(
        <MomentPickerPanel
          onSelect={onSelect}
          onChange={onChange}
          disabledDate={(date) => date.date() % 2 === 0}
        />,
      );

      fireEvent.focus(document.querySelector('.rc-picker-panel'));
      // 9-02、9-04、9-10 is disabled
      panelKeyDown('ArrowLeft');
      panelKeyDown('ArrowRight');
      panelKeyDown('ArrowDown');
      expect(onSelect).not.toHaveBeenCalled();

      // 7-27、8-27 is enabled
      panelKeyDown('ArrowUp');
      expect(isSame(onSelect.mock.calls[0][0], '1990-08-27')).toBeTruthy();
      onSelect.mockReset();
      panelKeyDown('PageUp');
      expect(isSame(onSelect.mock.calls[0][0], '1990-07-27')).toBeTruthy();
      onSelect.mockReset();
      panelKeyDown('PageDown');
      expect(isSame(onSelect.mock.calls[0][0], '1990-08-27')).toBeTruthy();
    });

    it('month panel', () => {
      const onChange = jest.fn();
      const onSelect = jest.fn();
      const now = new Date();
      render(
        <MomentPickerPanel
          picker="month"
          onSelect={onSelect}
          onChange={onChange}
          disabledDate={(date) => date.month() < now.getMonth()}
        />,
      );

      fireEvent.focus(document.querySelector('.rc-picker-panel'));

      // PAGE_UP and PAGE_DOWN do not trigger the select
      panelKeyDown('PageUp');
      panelKeyDown('PageDown');
      expect(onSelect).not.toHaveBeenCalled();

      // The disabled date is before August
      panelKeyDown('ArrowLeft');
      panelKeyDown('ArrowUp');
      expect(onSelect).not.toHaveBeenCalled();

      // August and subsequent dates are enable
      panelKeyDown('ArrowRight');
      expect(isSame(onSelect.mock.calls[0][0], '1990-10-03')).toBeTruthy();
      onSelect.mockReset();
      panelKeyDown('ArrowLeft');
      onSelect.mockReset();
      panelKeyDown('ArrowDown');
      expect(isSame(onSelect.mock.calls[0][0], '1990-12-03')).toBeTruthy();
    });
  });
});

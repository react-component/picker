import { act, fireEvent, render } from '@testing-library/react';
import { resetWarned } from '@rc-component/util';
import React from 'react';
import { DateFnsSinglePicker, DayPicker, getMoment, isOpen, openPicker } from './util/commonUtil';

// TODO: New keyboard interactive
describe('Picker.Keyboard', () => {
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

  describe('tab into open popup', () => {
    it('moves focus into the panel instead of leaving the picker', () => {
      const { container } = render(<DayPicker />);

      openPicker(container);
      expect(isOpen()).toBeTruthy();

      const tabEvent = fireEvent.keyDown(container.querySelector('input'), {
        key: 'Tab',
      });

      act(() => {
        jest.runAllTimers();
      });

      // Default Tab (which would move focus out of the picker) is prevented
      expect(tabEvent).toBeFalsy();
      // Focus landed on the panel's active (roving-tabindex) cell
      expect(isOpen()).toBeTruthy();
      expect(document.activeElement).toBe(document.querySelector('td[tabindex="0"]'));
    });

    it('shift+tab still confirms and leaves the picker', () => {
      const { container } = render(<DayPicker />);

      openPicker(container);
      fireEvent.keyDown(container.querySelector('input'), {
        key: 'Tab',
        shiftKey: true,
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(isOpen()).toBeFalsy();
    });
  });

  describe('enter on a date cell', () => {
    it('selects, closes and returns focus to the input', () => {
      const onChange = jest.fn();
      const { container } = render(<DayPicker onChange={onChange} />);

      openPicker(container);

      // Move focus into the panel, then Enter on the active cell
      fireEvent.keyDown(container.querySelector('input'), { key: 'Tab' });
      act(() => {
        jest.runAllTimers();
      });

      const activeCell = document.querySelector('td[tabindex="0"]');
      fireEvent.keyDown(activeCell, { key: 'Enter' });

      act(() => {
        jest.runAllTimers();
      });

      expect(onChange).toHaveBeenCalled();
      expect(isOpen()).toBeFalsy();
      expect(document.activeElement).toBe(container.querySelector('input'));
    });

    it('escape from inside the panel closes and returns focus to the input', () => {
      const { container } = render(<DayPicker />);

      openPicker(container);

      // Move focus into the panel, then Escape on the active cell
      fireEvent.keyDown(container.querySelector('input'), { key: 'Tab' });
      act(() => {
        jest.runAllTimers();
      });

      const activeCell = document.querySelector('td[tabindex="0"]');
      fireEvent.keyDown(activeCell, { key: 'Escape' });

      act(() => {
        jest.runAllTimers();
      });

      expect(isOpen()).toBeFalsy();
      expect(document.activeElement).toBe(container.querySelector('input'));
    });
  });

  describe('typing date with date-fns', () => {
    it('should not parse date if not matching format', () => {
      const { container } = render(<DateFnsSinglePicker format="dd/MM/YYYY" />);
      const input = container.querySelector('input');

      fireEvent.change(input, {
        target: {
          // Typing date partially. Picker should not try to parse it as a valid date
          value: '01/01/20',
        },
      });

      expect(input.value).toEqual('01/01/20');
    });
  });
});

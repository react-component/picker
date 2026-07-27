import { act, fireEvent, render } from '@testing-library/react';
import { resetWarned } from '@rc-component/util';
import React from 'react';
import {
  DateFnsSinglePicker,
  DayPicker,
  DayRangePicker,
  getMoment,
  isOpen,
  openPicker,
  selectCell,
  triggerFocus,
} from './util/commonUtil';

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
    triggerFocus(inputEle);
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

  // Coverage case: replace these tests if a clearer interaction can cover the
  // same behavior. / 覆盖率用例：若有更清晰的交互覆盖相同行为，可直接替换。
  it('should submit typed value on Tab without trapping focus', () => {
    const onChange = jest.fn();
    const { container, getByRole } = render(
      <>
        <DayPicker onChange={onChange} />
        <button type="button">Outside</button>
      </>,
    );
    const input = container.querySelector('input');
    const outsideButton = getByRole('button', { name: 'Outside' });

    // Tab weakly submits the typed value, while the browser remains free to
    // move focus outside. / Tab 弱提交输入值，同时不阻止浏览器将焦点移到外部。
    triggerFocus(input);
    fireEvent.change(input, {
      target: {
        value: '2000-03-03',
      },
    });
    fireEvent.keyDown(input, {
      key: 'Tab',
    });
    triggerFocus(outsideButton);

    expect(onChange).toHaveBeenCalledWith(expect.anything(), '2000-03-03');
    expect(outsideButton).toHaveFocus();
  });

  it('should keep temporary value when focus moves to popup', () => {
    const onChange = jest.fn();
    const { container } = render(<DayPicker showTime needConfirm onChange={onChange} />);
    const input = container.querySelector('input');

    // Moving focus into the popup is still inside the same Picker interaction.
    // 焦点进入 popup 仍属于同一次 Picker 交互，不应清理未确认值。
    openPicker(container);
    selectCell(5);
    const temporaryValue = input.value;
    const popup = document.querySelector<HTMLElement>('.rc-picker-panel-container');
    triggerFocus(popup);

    expect(document.activeElement).toBe(popup);
    expect(input).toHaveValue(temporaryValue);
    expect(onChange).not.toHaveBeenCalled();
    expect(isOpen()).toBeTruthy();
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

    // Coverage case: replace this test if a clearer interaction can cover the
    // same behavior. / 覆盖率用例：若有更清晰的交互覆盖相同行为，可直接替换。
    it('should reset unconfirmed RangePicker value', () => {
      const onChange = jest.fn();
      const { container } = render(<DayRangePicker showTime onChange={onChange} />);
      const startInput = container.querySelectorAll<HTMLInputElement>('input')[0];

      // Esc cancels the whole RangePicker interaction instead of submitting
      // its temporary value. / Esc 撤销整轮 RangePicker 交互，不提交临时值。
      openPicker(container);
      selectCell(5);
      expect(startInput).not.toHaveValue('');

      fireEvent.keyDown(startInput, {
        key: 'Escape',
      });
      act(() => {
        jest.runAllTimers();
      });

      expect(startInput).toHaveValue('');
      expect(onChange).not.toHaveBeenCalled();
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

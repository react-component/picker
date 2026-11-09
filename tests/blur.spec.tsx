import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import {
  closePicker,
  DayPicker,
  DayRangePicker,
  getMoment,
  openPicker,
  waitFakeTimer,
} from './util/commonUtil';

describe('Picker.ChangeOnBlur', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(getMoment('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('Picker', async () => {
    const { container } = render(<DayPicker preserveInvalidOnBlur />);

    // Open
    openPicker(container);

    const inputEle = container.querySelector('input');
    fireEvent.change(inputEle, {
      target: {
        value: 'no valid',
      },
    });

    closePicker(container);
    await waitFakeTimer();
    expect(inputEle).toHaveValue('no valid');
  });

  it('RangePicker', async () => {
    const { container } = render(<DayRangePicker preserveInvalidOnBlur />);

    const startInputEle = container.querySelectorAll('input')[0];
    const endInputEle = container.querySelectorAll('input')[1];

    // Open
    openPicker(container);
    fireEvent.change(startInputEle, {
      target: {
        value: 'no valid 1',
      },
    });

    openPicker(container, 1);
    fireEvent.change(endInputEle, {
      target: {
        value: 'no valid 2',
      },
    });

    // Close
    closePicker(container, 1);
    await waitFakeTimer();
    expect(startInputEle).toHaveValue('no valid 1');
    expect(endInputEle).toHaveValue('no valid 2');
  });
});

describe.each([
  ['Picker', DayPicker, 0],
  ['RangePicker start', DayRangePicker, 0],
  ['RangePicker end', DayRangePicker, 1],
] as const)('%s with Activity', (_name, Picker, inputIndex) => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it.each(['outside', 'null'])(
    'handles a delayed blur to %s after hiding and can reopen after restoring',
    async (target) => {
      const onBlur = jest.fn();
      const onOpenChange = jest.fn();
      const renderPicker = (mode: 'visible' | 'hidden') => (
        <React.Activity mode={mode}>
          <Picker onBlur={onBlur} onOpenChange={onOpenChange} />
        </React.Activity>
      );
      const { container, rerender } = render(renderPicker('visible'));
      const input = container.querySelectorAll('input')[inputIndex];

      openPicker(container, inputIndex);
      expect(onOpenChange).toHaveBeenLastCalledWith(true);

      rerender(renderPicker('hidden'));
      // A native blur can arrive after Activity has detached the selector ref.
      fireEvent.blur(input, { relatedTarget: target === 'outside' ? document.body : null });
      await waitFakeTimer();
      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);

      rerender(renderPicker('visible'));
      expect(container.querySelectorAll('input')[inputIndex]).toBe(input);
      openPicker(container, inputIndex);
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
    },
  );
});

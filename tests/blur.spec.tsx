import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import {
  closePicker,
  DayPicker,
  DayRangePicker,
  getDay,
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

describe('Picker.DiscardRejectedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(getMoment('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('revert the value rejected by disabledDate when popup closed', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayPicker
        format="YYYY-MM-DD"
        value={getDay('2026-06-15')}
        disabledDate={(date) => date.isBefore(getDay('2026-06-01'))}
        onChange={onChange}
      />,
    );

    const inputEle = container.querySelector('input');

    openPicker(container);
    fireEvent.change(inputEle, {
      target: {
        value: '2026-03-15',
      },
    });
    expect(inputEle).toHaveValue('2026-03-15');

    // Close from outside instead of pressing Enter
    closePicker(container);
    await waitFakeTimer();

    // The rejected value should be discarded
    expect(inputEle).toHaveValue('2026-06-15');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('still discards the rejected value when preserveInvalidOnBlur is set', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayPicker
        format="YYYY-MM-DD"
        value={getDay('2026-06-15')}
        disabledDate={(date) => date.isBefore(getDay('2026-06-01'))}
        onChange={onChange}
        preserveInvalidOnBlur
      />,
    );

    const inputEle = container.querySelector('input');

    openPicker(container);
    fireEvent.change(inputEle, {
      target: {
        value: '2026-03-15',
      },
    });
    closePicker(container);
    await waitFakeTimer();

    // The prop only covers text that cannot be parsed; a date rejected by
    // `disabledDate` is discarded on blur either way.
    expect(inputEle).toHaveValue('2026-06-15');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keep the value accepted by disabledDate', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayPicker
        format="YYYY-MM-DD"
        value={getDay('2026-06-15')}
        disabledDate={(date) => date.isBefore(getDay('2026-06-01'))}
        onChange={onChange}
      />,
    );

    const inputEle = container.querySelector('input');

    openPicker(container);
    fireEvent.change(inputEle, {
      target: {
        value: '2026-06-20',
      },
    });

    closePicker(container);
    await waitFakeTimer();

    expect(inputEle).toHaveValue('2026-06-20');
    expect(onChange).toHaveBeenCalledWith(expect.anything(), '2026-06-20');
  });

  it.each([
    { rejected: '2026-03-15', start: '2026-03-15', end: '2026-03-20' },
    { rejected: '2026-03-20', start: '2026-03-15', end: '2026-03-20' },
  ])(
    'reverts a range whose start or end is rejected on popup close ($rejected)',
    async ({ rejected, start, end }) => {
      const onChange = jest.fn();
      const { container } = render(
        <DayRangePicker
          format="YYYY-MM-DD"
          value={[getDay('2026-06-15'), getDay('2026-06-20')]}
          disabledDate={(date) => date.format('YYYY-MM-DD') === rejected}
          onChange={onChange}
        />,
      );

      const [startInputEle, endInputEle] = container.querySelectorAll('input');

      // Both fields have to participate before the round is submitted.
      openPicker(container);
      fireEvent.change(startInputEle, {
        target: {
          value: start,
        },
      });

      openPicker(container, 1);
      fireEvent.change(endInputEle, {
        target: {
          value: end,
        },
      });

      closePicker(container, 1);
      await waitFakeTimer();

      // The rejected range is discarded as a whole.
      expect(startInputEle).toHaveValue('2026-06-15');
      expect(endInputEle).toHaveValue('2026-06-20');
      expect(onChange).not.toHaveBeenCalled();
    },
  );
});

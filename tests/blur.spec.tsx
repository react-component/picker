import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import {
  closePicker,
  DayPicker,
  DayRangePicker,
  getDay,
  getMoment,
  isOpen,
  openPicker,
  triggerFocus,
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
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][1]).toBe('2026-06-20');
    expect(onChange.mock.calls[0][0].format('YYYY-MM-DD')).toBe('2026-06-20');
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

  it('reverts a confirmed but rejected start on popup close with needConfirm', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayRangePicker
        needConfirm
        format="YYYY-MM-DD"
        defaultValue={[getDay('2026-06-15'), getDay('2026-06-20')]}
        disabledDate={(date) => date.isBefore(getDay('2026-06-01'), 'day')}
        onChange={onChange}
      />,
    );

    const [startInputEle, endInputEle] = container.querySelectorAll('input');

    openPicker(container);
    fireEvent.change(startInputEle, {
      target: {
        value: '2026-03-15',
      },
    });

    // Confirm the start, which moves the focus to the end.
    fireEvent.keyDown(startInputEle, { key: 'Enter' });
    await waitFakeTimer();
    expect(document.activeElement).toBe(endInputEle);

    // Closing with an untouched end runs the final submit, which is rejected.
    closePicker(container, 1);
    await waitFakeTimer();

    expect(startInputEle).toHaveValue('2026-06-15');
    expect(endInputEle).toHaveValue('2026-06-20');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the valid pending end while switching back to correct an invalid start', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayRangePicker
        format="YYYY-MM-DD"
        defaultValue={[getDay('2026-06-15'), getDay('2026-06-20')]}
        disabledDate={(date) => date.isBefore(getDay('2026-06-01'), 'day')}
        onChange={onChange}
      />,
    );

    const [startInputEle, endInputEle] = container.querySelectorAll('input');

    openPicker(container);
    fireEvent.change(startInputEle, {
      target: {
        value: '2026-03-15',
      },
    });

    openPicker(container, 1);
    fireEvent.change(endInputEle, {
      target: {
        value: '2026-06-25',
      },
    });

    // Switching fields keeps the popup open, so the interaction is not over
    // and the pending values must stay for further correction.
    triggerFocus(startInputEle);
    await waitFakeTimer();

    expect(isOpen()).toBeTruthy();
    expect(document.activeElement).toBe(startInputEle);
    expect(onChange).not.toHaveBeenCalled();
    expect(startInputEle).toHaveValue('2026-03-15');
    expect(endInputEle).toHaveValue('2026-06-25');
  });

  it('reverts a rejected start when the popup closes right after a field switch', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayRangePicker
        format="YYYY-MM-DD"
        defaultValue={[getDay('2026-06-15'), getDay('2026-06-20')]}
        disabledDate={(date) => date.isBefore(getDay('2026-06-01'), 'day')}
        onChange={onChange}
      />,
    );

    const [startInputEle, endInputEle] = container.querySelectorAll('input');

    openPicker(container);
    fireEvent.change(startInputEle, {
      target: {
        value: '2026-03-15',
      },
    });

    triggerFocus(endInputEle);
    await waitFakeTimer();

    closePicker(container, 1);
    await waitFakeTimer();

    expect(startInputEle).toHaveValue('2026-06-15');
    expect(endInputEle).toHaveValue('2026-06-20');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the rejected value on Enter when the popup stays open', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayPicker
        open
        format="YYYY-MM-DD"
        value={getDay('2026-06-15')}
        disabledDate={(date) => date.isBefore(getDay('2026-06-01'))}
        onChange={onChange}
      />,
    );

    const inputEle = container.querySelector('input');

    fireEvent.focus(inputEle);
    fireEvent.change(inputEle, {
      target: {
        value: '2026-03-15',
      },
    });
    fireEvent.keyDown(inputEle, { key: 'Enter' });
    await waitFakeTimer();

    // The popup is not closed, so the editing is not over yet.
    expect(isOpen()).toBeTruthy();
    expect(inputEle).toHaveValue('2026-03-15');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reverts a rejected start when only the start is edited before blur', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayRangePicker
        format="YYYY-MM-DD"
        defaultValue={[getDay('2026-06-15'), getDay('2026-06-20')]}
        disabledDate={(date) => date.isBefore(getDay('2026-06-01'), 'day')}
        onChange={onChange}
      />,
    );

    const [startInputEle, endInputEle] = container.querySelectorAll('input');

    openPicker(container);
    fireEvent.change(startInputEle, {
      target: {
        value: '2026-03-15',
      },
    });

    closePicker(container);
    await waitFakeTimer();

    expect(startInputEle).toHaveValue('2026-06-15');
    expect(endInputEle).toHaveValue('2026-06-20');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('commits the edited start when only the start is edited before blur', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayRangePicker
        format="YYYY-MM-DD"
        defaultValue={[getDay('2026-06-15'), getDay('2026-06-20')]}
        onChange={onChange}
      />,
    );

    const [startInputEle, endInputEle] = container.querySelectorAll('input');

    openPicker(container);
    fireEvent.change(startInputEle, {
      target: {
        value: '2026-06-10',
      },
    });

    closePicker(container);
    await waitFakeTimer();

    expect(startInputEle).toHaveValue('2026-06-10');
    expect(endInputEle).toHaveValue('2026-06-20');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][1]).toEqual(['2026-06-10', '2026-06-20']);
  });

  it('commits the reordered range when only the start is edited before blur', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayRangePicker
        format="YYYY-MM-DD"
        defaultValue={[getDay('2026-06-15'), getDay('2026-06-20')]}
        onChange={onChange}
      />,
    );

    const [startInputEle, endInputEle] = container.querySelectorAll('input');

    openPicker(container);
    fireEvent.change(startInputEle, {
      target: {
        value: '2026-06-25',
      },
    });

    closePicker(container);
    await waitFakeTimer();

    expect(startInputEle).toHaveValue('2026-06-20');
    expect(endInputEle).toHaveValue('2026-06-25');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][1]).toEqual(['2026-06-20', '2026-06-25']);
  });

  it('reverts a draft rejected by a field switch when the popup closes untouched', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayRangePicker
        format="YYYY-MM-DD"
        defaultValue={[getDay('2026-06-15'), getDay('2026-06-20')]}
        disabledDate={(date) => date.isBefore(getDay('2026-06-01'), 'day')}
        onChange={onChange}
      />,
    );

    const [startInputEle, endInputEle] = container.querySelectorAll('input');

    openPicker(container);
    fireEvent.change(startInputEle, {
      target: {
        value: '2026-03-15',
      },
    });

    openPicker(container, 1);
    fireEvent.change(endInputEle, {
      target: {
        value: '2026-06-25',
      },
    });

    // The rejected range is kept while switching back to correct it.
    triggerFocus(startInputEle);
    await waitFakeTimer();
    expect(startInputEle).toHaveValue('2026-03-15');

    // Closing without any further change ends the editing.
    closePicker(container);
    await waitFakeTimer();

    expect(startInputEle).toHaveValue('2026-06-15');
    expect(endInputEle).toHaveValue('2026-06-20');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not touch the value when the popup closes without any change', async () => {
    const onChange = jest.fn();
    const onCalendarChange = jest.fn();
    const { container } = render(
      <DayRangePicker
        format="YYYY-MM-DD"
        defaultValue={[getDay('2026-06-15'), getDay('2026-06-20')]}
        disabledDate={(date) => date.isBefore(getDay('2026-06-01'), 'day')}
        onChange={onChange}
        onCalendarChange={onCalendarChange}
      />,
    );

    const [startInputEle, endInputEle] = container.querySelectorAll('input');

    openPicker(container);
    closePicker(container);
    await waitFakeTimer();

    expect(startInputEle).toHaveValue('2026-06-15');
    expect(endInputEle).toHaveValue('2026-06-20');
    expect(onChange).not.toHaveBeenCalled();
    expect(onCalendarChange).not.toHaveBeenCalled();
  });
});

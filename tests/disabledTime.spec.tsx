import { fireEvent, render } from '@testing-library/react';
import type { Moment } from 'moment';
import { resetWarned } from 'rc-util/lib/warning';
import React from 'react';
import {
  closePicker,
  getMoment,
  isSame,
  MomentPicker,
  MomentRangePicker,
  openPicker,
} from './util/commonUtil';

describe('Picker.DisabledTime', () => {
  it('disabledTime on TimePicker', () => {
    render(
      <MomentPicker
        open
        picker="time"
        disabledTime={() => ({
          disabledSeconds: () => new Array(59).fill(0).map((_, index) => index),
        })}
      />,
    );

    expect(
      document.querySelectorAll(
        'ul.rc-picker-time-panel-column li.rc-picker-time-panel-cell-disabled',
      ),
    ).toHaveLength(59);
  });

  it('disabledTime on TimeRangePicker', () => {
    const { container } = render(
      <MomentRangePicker
        open
        picker="time"
        disabledTime={(_, type) => ({
          disabledHours: () => (type === 'start' ? [1, 3, 5] : [2, 4]),
        })}
      />,
    );

    expect(
      document.querySelectorAll(
        'ul.rc-picker-time-panel-column li.rc-picker-time-panel-cell-disabled',
      ),
    ).toHaveLength(3);

    // Click another one
    fireEvent.mouseDown(container.querySelectorAll('input')[1]);
    expect(
      document.querySelectorAll(
        'ul.rc-picker-time-panel-column li.rc-picker-time-panel-cell-disabled',
      ),
    ).toHaveLength(2);
  });

  it('disabledTime', () => {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const disabledTime = jest.fn((_: Moment | null, __: 'start' | 'end') => ({
      disabledHours: () => [11],
    }));

    const { container } = render(
      <MomentRangePicker
        showTime
        disabledTime={disabledTime}
        defaultValue={[getMoment('1989-11-28'), getMoment('1990-09-03')]}
      />,
    );

    // Start
    openPicker(container);
    expect(
      document.querySelector('.rc-picker-time-panel-column').querySelectorAll('li')[11],
    ).toHaveClass('rc-picker-time-panel-cell-disabled');
    expect(isSame(disabledTime.mock.calls[0][0], '1989-11-28')).toBeTruthy();
    expect(disabledTime.mock.calls[0][1]).toEqual('start');
    closePicker(container);

    // End
    disabledTime.mockClear();
    openPicker(container, 1);
    expect(
      document.querySelector('.rc-picker-time-panel-column').querySelectorAll('li')[11],
    ).toHaveClass('rc-picker-time-panel-cell-disabled');

    expect(isSame(disabledTime.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    expect(disabledTime.mock.calls[0][1]).toEqual('end');
    closePicker(container, 1);
  });

  describe('warning for legacy props', () => {
    it('single', () => {
      resetWarned();
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<MomentPicker picker="time" disabledMinutes={() => []} />);
      expect(errSpy).toHaveBeenCalledWith(
        "Warning: 'disabledHours', 'disabledMinutes', 'disabledSeconds' will be removed in the next major version, please use 'disabledTime' instead.",
      );

      errSpy.mockRestore();
    });

    it('range', () => {
      resetWarned();
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<MomentRangePicker picker="time" disabledMinutes={() => []} />);
      expect(errSpy).toHaveBeenCalledWith(
        "Warning: 'disabledHours', 'disabledMinutes', 'disabledSeconds' will be removed in the next major version, please use 'disabledTime' instead.",
      );

      errSpy.mockRestore();
    });
  });
});

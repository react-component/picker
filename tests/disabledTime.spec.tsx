import { fireEvent, render } from '@testing-library/react';
import type { Moment } from 'moment';
import moment from 'moment';
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

  it('dynamic disabledTime should be correct', () => {
    jest.useFakeTimers().setSystemTime(getMoment('2023-09-05 22:02:00').valueOf());
    render(
      <MomentPicker
        open
        picker="time"
        disabledTime={() => ({
          disabledHours: () => [0, 1],
          disabledMinutes: (selectedHour) => {
            if (selectedHour === 2) {
              return [0, 1];
            } else {
              return [];
            }
          },
          disabledSeconds: (_, selectMinute) => {
            if (selectMinute === 2) {
              return [0, 1];
            } else {
              return [];
            }
          },
        })}
      />,
    );
    // click hour 3
    fireEvent.click(
      document.querySelectorAll('.rc-picker-time-panel-column')[0].querySelectorAll('li')[2],
    );
    // click minute 0
    fireEvent.click(
      document.querySelectorAll('.rc-picker-time-panel-column')[1].querySelectorAll('li')[0],
    );
    // click second 0
    fireEvent.click(
      document.querySelectorAll('.rc-picker-time-panel-column')[2].querySelectorAll('li')[0],
    );
    // click hour 2
    fireEvent.click(
      document.querySelectorAll('.rc-picker-time-panel-column')[0].querySelectorAll('li')[1],
    );
    expect(document.querySelector('.rc-picker-input input').getAttribute('value')).toEqual(
      '02:02:02',
    );
    jest.useRealTimers();
  });

  it('disabledTime should reset correctly when date changed by click', function () {
    const disabledTime = jest.fn((_: Moment | null, __: 'start' | 'end') => ({
      disabledHours: () => [0, 1, 2, 3, 4, 10],
    }));

    render(
      <MomentRangePicker
        open
        showTime
        disabledTime={disabledTime}
        defaultValue={[getMoment('1989-11-28'), getMoment('1990-09-03')]}
      />,
    );

    expect(document.querySelector('.rc-picker-input > input').getAttribute('value')).toEqual('1989-11-28 00:00:00');

    fireEvent.click(document.querySelectorAll('.rc-picker-cell-inner')[2]);

    expect(document.querySelector('.rc-picker-input > input').getAttribute('value')).toEqual('1989-10-31 05:00:00');
  });

  it('disabledTime should reset correctly when date changed by click for no default value', function () {
    const disabledTime = jest.fn((_: Moment | null, __: 'start' | 'end') => ({
      disabledHours: () => [0, 1, 2, 3, 4],
      disabledMinutes: () => [0, 1, 2, 3, 4],
      disabledSeconds: () => [0, 1, 2, 3, 4],
    }));

    const now = moment().hour(6).minute(6).second(6);

    render(<MomentRangePicker open showTime disabledTime={disabledTime} />);

    fireEvent.click(document.querySelectorAll('.rc-picker-cell-inner')[0]);

    expect(document.querySelector('.rc-picker-input > input').getAttribute('value')).toEqual(
      now.format('YYYY-MM-DD HH:mm:ss'),
    );
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

import { fireEvent, render } from '@testing-library/react';
import type { Dayjs } from 'dayjs';
import { resetWarned } from 'rc-util/lib/warning';
import React from 'react';
import {
  closePicker,
  DayPicker,
  DayRangePicker,
  getDay,
  isSame,
  openPicker,
  selectCell,
} from './util/commonUtil';

const fakeTime = getDay('1990-09-03 00:00:00').valueOf();

describe('Picker.DisabledTime', () => {
  beforeEach(() => {
    resetWarned();
    jest.useFakeTimers().setSystemTime(fakeTime);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('disabledTime on TimePicker', () => {
    render(
      <DayPicker
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
      <DayRangePicker
        picker="time"
        disabledTime={(_, type) => ({
          disabledHours: () => (type === 'start' ? [1, 3, 5] : [2, 4]),
        })}
      />,
    );

    openPicker(container);
    expect(
      document.querySelectorAll(
        'ul.rc-picker-time-panel-column li.rc-picker-time-panel-cell-disabled',
      ),
    ).toHaveLength(3);

    // Click another one
    openPicker(container, 1);
    expect(
      document.querySelectorAll(
        'ul.rc-picker-time-panel-column li.rc-picker-time-panel-cell-disabled',
      ),
    ).toHaveLength(2);
  });

  it('disabledTime', () => {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const disabledTime = jest.fn((_: Dayjs | null, __: 'start' | 'end') => {
      return {
        disabledHours: () => [11],
      };
    });

    const { container } = render(
      <DayRangePicker
        showTime
        disabledTime={disabledTime}
        defaultValue={[getDay('1989-11-28'), getDay('1990-09-03')]}
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
    jest.useFakeTimers().setSystemTime(getDay('2023-09-05 22:02:00').valueOf());
    render(
      <DayPicker
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

  it('disabledTime should reset correctly when date changed by click', async () => {
    const disabledTime = jest.fn(() => ({
      disabledHours: () => [0, 1, 2, 3, 4, 10],
    }));

    render(
      <DayRangePicker
        open
        showTime
        disabledTime={disabledTime}
        defaultValue={[getDay('1989-11-28'), getDay('1990-09-03')]}
      />,
    );

    expect(document.querySelector('.rc-picker-input > input').getAttribute('value')).toEqual(
      '1989-11-28 00:00:00',
    );

    fireEvent.click(document.querySelectorAll('.rc-picker-cell-inner')[2]);

    expect(document.querySelector('.rc-picker-input > input').getAttribute('value')).toEqual(
      '1989-11-01 05:00:00',
    );
  });

  it('disabledTime should reset correctly when date changed by click for no default value', function () {
    const disabledTime = jest.fn(() => ({
      disabledHours: () => [0, 1, 2, 3, 4],
      disabledMinutes: () => [0, 1, 2, 3, 4, 5],
      disabledSeconds: () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    }));

    const { container } = render(<DayRangePicker open showTime disabledTime={disabledTime} />);

    openPicker(container);
    selectCell(3);

    expect(container.querySelector('input')).toHaveValue('1990-09-03 05:06:10');
  });

  describe('warning for legacy props', () => {
    it('single', () => {
      resetWarned();
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<DayPicker picker="time" disabledMinutes={() => []} />);
      expect(errSpy).toHaveBeenCalledWith(
        "Warning: 'disabledHours', 'disabledMinutes', 'disabledSeconds' will be removed in the next major version, please use 'disabledTime' instead.",
      );

      errSpy.mockRestore();
    });

    it('range', () => {
      resetWarned();
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<DayRangePicker picker="time" disabledMinutes={() => []} />);
      expect(errSpy).toHaveBeenCalledWith(
        "Warning: 'disabledHours', 'disabledMinutes', 'disabledSeconds' will be removed in the next major version, please use 'disabledTime' instead.",
      );

      errSpy.mockRestore();
    });
  });
  it('limit', async () => {
    const wrapper = render(
      <DayRangePicker
        defaultValue={[getDay('2021-06-01'), getDay('2021-06-02')]}
        disabledDate={(current, { from }) => {
          if (from) {
            return Math.abs(current.diff(from, 'days')) >= 2;
          }
          return false;
        }}
      />,
    );

    openPicker(wrapper.container);
    fireEvent.click(wrapper.getByTitle('2021-06-21'));
    fireEvent.click(wrapper.getByTitle('2021-06-26'));
    closePicker(wrapper.container);
    expect(wrapper.container.querySelectorAll('input')?.[0]?.value).toBe('2021-06-21');
    expect(wrapper.container.querySelectorAll('input')?.[1]?.value).toBe('2021-06-21');
  });
});

import { fireEvent, render } from '@testing-library/react';
import { isVisible, spyElementPrototype } from '@rc-component/util';
import React from 'react';
import { DayPicker, DayRangePicker, getDay, openPicker, waitFakeTimer } from './util/commonUtil';

jest.mock('@rc-component/util/lib/Dom/isVisible', () => {
  return jest.fn(() => true);
});

describe.each([false, true])('Activity time scrolling (range=%s)', (range) => {
  let offsetTopMock: ReturnType<typeof spyElementPrototype>;

  beforeEach(() => {
    jest.mocked(isVisible).mockReturnValue(true);
    jest.useFakeTimers().setSystemTime(getDay('1990-09-03 00:00:00').valueOf());
    offsetTopMock = spyElementPrototype(HTMLLIElement, 'offsetTop', {
      get() {
        const children = Array.from(this.parentNode?.childNodes || []);
        return children.indexOf(this) * 30;
      },
    });
  });

  afterEach(() => {
    offsetTopMock.mockRestore();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe.each(['before', 'after'])('scroll arrives %s hiding', (scrollTiming) => {
    it.each([
      { restore: 'before the delay', beforeDelay: true, popupHidden: false },
      { restore: 'after the delay', beforeDelay: false, popupHidden: false },
      { restore: 'before the delay with a closed popup', beforeDelay: true, popupHidden: true },
    ])(
      'preserves the value when restored $restore and allows new scrolling',
      async ({ beforeDelay, popupHidden }) => {
        const onCalendarChange = jest.fn();
        const initialValue = getDay('1990-09-03 00:00:00');
        const view = (mode: 'visible' | 'hidden') => (
          <React.StrictMode>
            <React.Activity mode={mode}>
              {range ? (
                <DayRangePicker
                  picker="time"
                  defaultValue={[initialValue, initialValue]}
                  changeOnScroll
                  onCalendarChange={onCalendarChange}
                />
              ) : (
                <DayPicker
                  picker="time"
                  defaultValue={initialValue}
                  changeOnScroll
                  onCalendarChange={onCalendarChange}
                />
              )}
            </React.Activity>
          </React.StrictMode>
        );
        const { container, rerender } = render(view('visible'));
        const input = container.querySelector('input');
        openPicker(container);
        await waitFakeTimer();
        onCalendarChange.mockClear();
        const column = document.querySelector('.rc-picker-time-panel-column');
        const scroll = () => fireEvent.scroll(column, { target: { scrollTop: 30 } });

        if (scrollTiming === 'before') {
          scroll();
        }
        rerender(view('hidden'));
        if (scrollTiming === 'after') {
          // Browsers may deliver a queued native scroll after Activity cleanup.
          scroll();
        }
        if (beforeDelay) {
          if (popupHidden) {
            // A closed popup is still hidden when Activity reconnects its effects.
            jest.mocked(isVisible).mockReturnValue(false);
          }
          rerender(view('visible'));
        }
        await waitFakeTimer();
        expect(onCalendarChange).not.toHaveBeenCalled();
        expect(input).toHaveValue('00:00:00');

        jest.mocked(isVisible).mockReturnValue(true);
        rerender(view('visible'));
        expect(container.querySelector('input')).toBe(input);
        openPicker(container);
        await waitFakeTimer();
        onCalendarChange.mockClear();
        fireEvent.scroll(document.querySelector('.rc-picker-time-panel-column'), {
          target: { scrollTop: 60 },
        });
        await waitFakeTimer();
        expect(onCalendarChange).toHaveBeenCalledTimes(1);
        expect(onCalendarChange.mock.calls[0][1]).toEqual(
          range ? ['02:00:00', '00:00:00'] : '02:00:00',
        );
        expect(input).toHaveValue('02:00:00');
      },
    );
  });
});

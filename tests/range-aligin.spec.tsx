import { act, cleanup, render } from '@testing-library/react';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import React from 'react';
import { DayRangePicker } from './util/commonUtil';

describe('the popup arrow should be placed in the correct position.', () => {
  let rangeRect = { x: 0, y: 0, width: 0, height: 0 };

  beforeEach(() => {
    rangeRect = {
      x: 0,
      y: 0,
      width: 200,
      height: 100,
    };

    document.documentElement.scrollLeft = 0;
  });

  beforeAll(() => {
    jest.spyOn(document.documentElement, 'scrollWidth', 'get').mockReturnValue(1000);

    // Viewport size
    spyElementPrototypes(HTMLElement, {
      clientWidth: {
        get: () => 400,
      },
      clientHeight: {
        get: () => 400,
      },
    });

    // Popup size
    spyElementPrototypes(HTMLDivElement, {
      getBoundingClientRect() {
        if (this.className.includes('rc-picker-dropdown')) {
          return {
            x: 0,
            y: 0,
            width: 300,
            height: 100,
          };
        }
        if (this.className.includes('rc-picker-range')) {
          return rangeRect;
        }
      },
      offsetWidth: {
        get() {
          if (this.className.includes('rc-picker-range-wrapper')) {
            return rangeRect.width;
          }
          if (this.className.includes('rc-picker-range-arrow')) {
            return 10;
          }
          if (this.className.includes('rc-picker-input')) {
            return 100;
          }
          if (this.className.includes('rc-picker-dropdown')) {
            return 300;
          }
        },
      },
      offsetLeft: {
        get() {
          if (this.className.includes('rc-picker-input')) {
            return 0;
          }
        },
      },
    });
    spyElementPrototypes(HTMLElement, {
      offsetParent: {
        get: () => document.body,
      },
    });
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('the arrow should be set to `inset-inline-start` when the popup is aligned to `bottomLeft`.', async () => {
    render(<DayRangePicker open />);

    await act(async () => {
      jest.runAllTimers();

      await Promise.resolve();
    });
    expect(document.querySelector('.rc-picker-range-arrow')).toHaveStyle({
      'inset-inline-start': '0',
    });
  });

  it('the arrow should be set to `inset-inline-end` when the popup is aligned to `bottomRight`.', async () => {
    const mock = spyElementPrototypes(HTMLDivElement, {
      getBoundingClientRect() {
        if (this.className.includes('rc-picker-dropdown')) {
          return {
            x: 0,
            y: 0,
            width: 300,
            height: 100,
          };
        }
        if (this.className.includes('rc-picker-range')) {
          return {
            ...rangeRect,
            x: 300,
          };
        }
      },
    });

    render(<DayRangePicker open />);

    await act(async () => {
      jest.runAllTimers();

      await Promise.resolve();
    });
    expect(document.querySelector('.rc-picker-range-arrow')).toHaveStyle({
      'inset-inline-end': '0',
    });

    mock.mockRestore();
  });
});

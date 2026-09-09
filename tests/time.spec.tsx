import { createEvent, fireEvent, render } from '@testing-library/react';
import { resetWarned } from '@rc-component/util';
import React from 'react';
import dayjs from 'dayjs';
import { DayPicker, DayPickerPanel, getDay, openPicker, selectCell } from './util/commonUtil';

describe('Picker.Time', () => {
  beforeEach(() => {
    resetWarned();
    jest.useFakeTimers().setSystemTime(getDay('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('show columns for one of it is false', async () => {
    const { container } = render(<DayPicker showTime showMinute={false} />);

    openPicker(container);
    expect(document.querySelectorAll('.rc-picker-time-panel-column')).toHaveLength(2);

    // Select
    selectCell(3);

    expect(container.querySelector('input')).toHaveValue('1990-09-03 00:00');
  });

  it('hover to show placeholder', async () => {
    const { container } = render(
      <DayPicker
        showTime={{
          showMillisecond: true,
          use12Hours: true,
        }}
      />,
    );
    openPicker(container);

    const getColCell = (colIndex: number, cellIndex: number) => {
      const column = document.querySelectorAll('.rc-picker-time-panel-column')[colIndex];
      const cell = column.querySelectorAll('.rc-picker-time-panel-cell-inner')[cellIndex];

      return cell;
    };

    // Hour
    fireEvent.mouseEnter(getColCell(0, 3));
    expect(container.querySelector('input')).toHaveValue('1990-09-03 03:00:00.000 AM');

    // Let test for mouse leave
    fireEvent.mouseLeave(getColCell(0, 3));
    expect(container.querySelector('input')).toHaveValue('');

    // Minute
    fireEvent.mouseEnter(getColCell(1, 2));
    expect(container.querySelector('input')).toHaveValue('1990-09-03 12:02:00.000 AM');

    // Second
    fireEvent.mouseEnter(getColCell(2, 1));
    expect(container.querySelector('input')).toHaveValue('1990-09-03 12:00:01.000 AM');

    // Millisecond
    fireEvent.mouseEnter(getColCell(3, 1));
    expect(container.querySelector('input')).toHaveValue('1990-09-03 12:00:00.100 AM');

    // Meridiem
    fireEvent.mouseEnter(getColCell(4, 1));
    expect(container.querySelector('input')).toHaveValue('1990-09-03 12:00:00.000 PM');
  });

  it('hover should not update preview value in input when previewValue is false', async () => {
    const { container } = render(
      <DayPicker
        showTime={{
          showMillisecond: true,
          use12Hours: true,
        }}
        previewValue={false}
        defaultValue={dayjs('1990-09-03 01:02:03')}
      />,
    );
    openPicker(container);

    const getColCell = (colIndex: number, cellIndex: number) => {
      const column = document.querySelectorAll('.rc-picker-time-panel-column')[colIndex];
      const cell = column.querySelectorAll('.rc-picker-time-panel-cell-inner')[cellIndex];

      return cell;
    };

    // Hour
    fireEvent.mouseEnter(getColCell(0, 3));
    expect(container.querySelector('input')).toHaveValue('1990-09-03 01:02:03.000 AM');

    // Let test for mouse leave
    fireEvent.mouseLeave(getColCell(0, 3));
    expect(container.querySelector('input')).toHaveValue('1990-09-03 01:02:03.000 AM');

    // Minute
    fireEvent.mouseEnter(getColCell(1, 2));
    expect(container.querySelector('input')).toHaveValue('1990-09-03 01:02:03.000 AM');

    // Second
    fireEvent.mouseEnter(getColCell(2, 1));
    expect(container.querySelector('input')).toHaveValue('1990-09-03 01:02:03.000 AM');

    // Millisecond
    fireEvent.mouseEnter(getColCell(3, 1));
    expect(container.querySelector('input')).toHaveValue('1990-09-03 01:02:03.000 AM');

    // Meridiem
    fireEvent.mouseEnter(getColCell(4, 1));
    expect(container.querySelector('input')).toHaveValue('1990-09-03 01:02:03.000 AM');
  });

  describe('TimeColumn focus', () => {
    const getColumn = (index = 0) =>
      document.querySelectorAll<HTMLUListElement>('.rc-picker-time-panel-column')[index];

    const getCell = (value: number | string, columnIndex = 0) =>
      getColumn(columnIndex).querySelector<HTMLLIElement>(`li[data-value="${value}"]`);

    /** The single cell of a column that is reachable with `Tab` (roving tabindex) */
    const getTabbable = (columnIndex = 0) =>
      getColumn(columnIndex).querySelector<HTMLLIElement>('li[tabindex="0"]');

    const keyDown = (cell: HTMLElement, key: string) => {
      const event = createEvent.keyDown(cell, { key });
      fireEvent(cell, event);

      return event;
    };

    describe('roving tabindex', () => {
      it('only the selected cell of each column is tabbable', () => {
        render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 05:08:09')} />);

        [5, 8, 9].forEach((unit, columnIndex) => {
          expect(getColumn(columnIndex).querySelectorAll('li[tabindex="0"]')).toHaveLength(1);
          expect(getTabbable(columnIndex)).toBe(getCell(unit, columnIndex));
        });
      });

      it('falls back to the picker value when nothing is selected', () => {
        render(<DayPickerPanel picker="time" />);

        // `now` is 00:00:00, so the cursor sits on `0` even though no cell is selected
        expect(getTabbable()).toBe(getCell(0));
        expect(document.querySelector('.rc-picker-time-panel-cell-selected')).toBeFalsy();
      });
    });

    describe('onCellKeyDown', () => {
      it('ArrowDown moves the cursor to the next cell', () => {
        render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 05:00:00')} />);

        keyDown(getCell(5), 'ArrowDown');

        expect(getTabbable()).toBe(getCell(6));
        expect(getCell(6)).toHaveFocus();
        expect(getCell(5)).toHaveAttribute('tabindex', '-1');
      });

      it('ArrowUp moves the cursor to the previous cell', () => {
        render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 05:00:00')} />);

        keyDown(getCell(5), 'ArrowUp');

        expect(getTabbable()).toBe(getCell(4));
        expect(getCell(4)).toHaveFocus();
      });

      it('moving the cursor does not change the selected value', () => {
        const onChange = jest.fn();
        render(
          <DayPickerPanel
            picker="time"
            defaultValue={getDay('1990-09-03 05:00:00')}
            onChange={onChange}
          />,
        );

        keyDown(getCell(5), 'ArrowDown');

        expect(onChange).not.toHaveBeenCalled();
        expect(getCell(5)).toHaveClass('rc-picker-time-panel-cell-selected');
        expect(getCell(6)).not.toHaveClass('rc-picker-time-panel-cell-selected');
      });

      it('ArrowDown wraps from the last cell to the first', () => {
        render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 23:00:00')} />);

        keyDown(getCell(23), 'ArrowDown');

        expect(getTabbable()).toBe(getCell(0));
        expect(getCell(0)).toHaveFocus();
      });

      it('ArrowUp wraps from the first cell to the last', () => {
        render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 00:00:00')} />);

        keyDown(getCell(0), 'ArrowUp');

        expect(getTabbable()).toBe(getCell(23));
        expect(getCell(23)).toHaveFocus();
      });

      it('skips disabled cells', () => {
        render(
          <DayPickerPanel
            picker="time"
            defaultValue={getDay('1990-09-03 05:00:00')}
            disabledTime={() => ({ disabledHours: () => [4, 6, 7] })}
          />,
        );

        expect(getCell(6)).toHaveAttribute('aria-disabled', 'true');

        keyDown(getCell(5), 'ArrowDown');
        expect(getTabbable()).toBe(getCell(8));
        expect(getCell(8)).toHaveFocus();

        keyDown(getCell(8), 'ArrowUp');
        expect(getTabbable()).toBe(getCell(5));

        keyDown(getCell(5), 'ArrowUp');
        expect(getTabbable()).toBe(getCell(3));
      });

      it.each([
        ['Enter', 'Enter'],
        ['Space', ' '],
      ])('%s selects the cell under the cursor', (_, key) => {
        const onChange = jest.fn();
        render(
          <DayPickerPanel
            picker="time"
            defaultValue={getDay('1990-09-03 05:00:00')}
            onChange={onChange}
          />,
        );

        keyDown(getCell(5), 'ArrowDown');
        keyDown(getCell(6), key);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0].format('HH:mm:ss')).toEqual('06:00:00');
        expect(getCell(6)).toHaveClass('rc-picker-time-panel-cell-selected');
      });

      it('ignores keys it does not handle', () => {
        const onChange = jest.fn();
        render(
          <DayPickerPanel
            picker="time"
            defaultValue={getDay('1990-09-03 05:00:00')}
            onChange={onChange}
          />,
        );

        keyDown(getCell(5), 'ArrowDown');
        keyDown(getCell(6), 'a');

        expect(onChange).not.toHaveBeenCalled();
        expect(getTabbable()).toBe(getCell(6));
      });

      it.each(['ArrowDown', 'ArrowUp', 'Enter', ' '])(
        'prevents the default behavior of `%s`',
        (key) => {
          render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 05:00:00')} />);

          expect(keyDown(getCell(5), key).defaultPrevented).toBeTruthy();
        },
      );

      it('does not prevent the default behavior of other keys', () => {
        render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 05:00:00')} />);

        expect(keyDown(getCell(5), 'Tab').defaultPrevented).toBeFalsy();
      });
    });

    describe('onBlur', () => {
      it('resets the cursor when focus leaves the column', () => {
        render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 05:00:00')} />);

        keyDown(getCell(5), 'ArrowDown');
        expect(getTabbable()).toBe(getCell(6));

        fireEvent.blur(getCell(6), { relatedTarget: document.body });

        expect(getTabbable()).toBe(getCell(5));
      });

      it('resets the cursor when focus is lost entirely', () => {
        render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 05:00:00')} />);

        keyDown(getCell(5), 'ArrowDown');
        fireEvent.blur(getCell(6), { relatedTarget: null });

        expect(getTabbable()).toBe(getCell(5));
      });

      it('resets the cursor when focus moves to another column', () => {
        render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 05:08:09')} />);

        keyDown(getCell(5), 'ArrowDown');
        fireEvent.blur(getCell(6), { relatedTarget: getCell(8, 1) });

        expect(getTabbable()).toBe(getCell(5));
        expect(getTabbable(1)).toBe(getCell(8, 1));
      });

      it('keeps the cursor when focus moves within the same column', () => {
        render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 05:00:00')} />);

        keyDown(getCell(5), 'ArrowDown');
        // This is what arrow navigation itself does: focus moves from cell to cell
        fireEvent.blur(getCell(6), { relatedTarget: getCell(7) });

        expect(getTabbable()).toBe(getCell(6));
      });
    });

    describe('cursor reset', () => {
      it('follows the value when a cell is clicked', () => {
        render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 05:00:00')} />);

        keyDown(getCell(5), 'ArrowDown');
        expect(getTabbable()).toBe(getCell(6));

        fireEvent.click(getCell(10));

        expect(getTabbable()).toBe(getCell(10));
        expect(getCell(10)).toHaveClass('rc-picker-time-panel-cell-selected');
      });

      it('does not steal focus when the value changes', () => {
        render(<DayPickerPanel picker="time" defaultValue={getDay('1990-09-03 05:00:00')} />);

        fireEvent.click(getCell(10));

        expect(getCell(10)).not.toHaveFocus();
        expect(document.body).toHaveFocus();
      });
    });
  });
});

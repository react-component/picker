/* eslint-disable @typescript-eslint/no-loop-func */
import { act, createEvent, fireEvent, render } from '@testing-library/react';
import moment, { Moment } from 'moment';
import KeyCode from 'rc-util/lib/KeyCode';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import { resetWarned } from 'rc-util/lib/warning';
import React from 'react';
import type { PanelMode, PickerMode } from '../src/interface';
import {
  clearValue,
  closePicker,
  confirmOK,
  findCell,
  getMoment,
  isOpen,
  isSame,
  MomentPicker,
  openPicker,
  selectCell,
} from './util/commonUtil';

const fakeTime = getMoment('1990-09-03 00:00:00').valueOf();

describe('Picker.Basic', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(fakeTime);
  });

  afterAll(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  function keyDown(keyCode: number) {
    fireEvent.keyDown(document.querySelector('input'), {
      keyCode,
      which: keyCode,
      charCode: keyCode,
    });
  }

  describe('mode', () => {
    const modeList: { mode: PanelMode; className: string }[] = [
      {
        mode: 'decade',
        className: '.rc-picker-decade-panel',
      },
      {
        mode: 'year',
        className: '.rc-picker-year-panel',
      },
      {
        mode: 'quarter',
        className: '.rc-picker-quarter-panel',
      },
      {
        mode: 'month',
        className: '.rc-picker-month-panel',
      },
      {
        mode: 'week',
        className: '.rc-picker-week-panel',
      },
      {
        mode: 'date',
        className: '.rc-picker-date-panel',
      },
      {
        mode: 'time' as any,
        className: '.rc-picker-time-panel',
      },
    ];

    modeList.forEach(({ mode, className }) => {
      it(mode, () => {
        render(<MomentPicker mode={mode} open />);
        expect(document.querySelector(className)).toBeTruthy();
      });
    });
  });

  describe('picker', () => {
    const modeList: { picker: PickerMode; className: string }[] = [
      {
        picker: 'year',
        className: '.rc-picker-year-panel',
      },
      {
        picker: 'quarter',
        className: '.rc-picker-quarter-panel',
      },
      {
        picker: 'month',
        className: '.rc-picker-month-panel',
      },
      {
        picker: 'week',
        className: '.rc-picker-week-panel',
      },
      {
        picker: 'date',
        className: '.rc-picker-date-panel',
      },
      {
        picker: 'time',
        className: '.rc-picker-time-panel',
      },
    ];

    modeList.forEach(({ picker, className }) => {
      it(picker, () => {
        render(<MomentPicker picker={picker as any} open />);
        expect(document.querySelector(className)).toBeTruthy();
      });
    });
  });

  describe('open', () => {
    it('should work', () => {
      const onOpenChange = jest.fn();
      const { container } = render(<MomentPicker onOpenChange={onOpenChange} />);

      openPicker(container);
      expect(isOpen()).toBeTruthy();
      expect(onOpenChange).toHaveBeenCalledWith(true);
      onOpenChange.mockReset();

      closePicker(container);
      expect(isOpen()).toBeFalsy();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('controlled', () => {
      const { rerender } = render(<MomentPicker open />);
      expect(isOpen()).toBeTruthy();

      rerender(<MomentPicker open={false} />);
      expect(isOpen()).toBeFalsy();
    });

    it('fixed open need repeat trigger onOpenChange', () => {
      jest.useFakeTimers();
      const onOpenChange = jest.fn();
      render(<MomentPicker onOpenChange={onOpenChange} open />);
      expect(onOpenChange).toHaveBeenCalledTimes(0);

      for (let i = 0; i < 10; i += 1) {
        act(() => {
          fireEvent.mouseDown(document.body);
        });
        expect(onOpenChange).toHaveBeenCalledTimes(i + 1);
      }
      act(() => {
        jest.runAllTimers();
      });
      jest.useRealTimers();
    });

    it('disabled should not open', () => {
      render(<MomentPicker open disabled />);
      expect(isOpen()).toBeFalsy();
    });
  });

  describe('value', () => {
    it('defaultValue', () => {
      const { container } = render(<MomentPicker defaultValue={getMoment('1989-11-28')} />);
      expect(container.querySelector('input').value).toEqual('1989-11-28');
    });

    it('uncontrolled', () => {
      const onChange = jest.fn();
      const { container } = render(<MomentPicker onChange={onChange} />);
      openPicker(container);
      selectCell(11);
      closePicker(container);

      expect(isSame(onChange.mock.calls[0][0], '1990-09-11')).toBeTruthy();
      expect(onChange.mock.calls[0][1]).toEqual('1990-09-11');
      expect(container.querySelector('input').value).toEqual('1990-09-11');
    });

    it('controlled', () => {
      const onChange = jest.fn();
      const { container, rerender } = render(
        <MomentPicker value={getMoment('2011-11-11')} onChange={onChange} />,
      );

      openPicker(container);
      selectCell(3);
      closePicker(container);

      expect(isSame(onChange.mock.calls[0][0], '2011-11-03')).toBeTruthy();
      expect(document.querySelector('input').value).toEqual('2011-11-11');

      rerender(<MomentPicker value={onChange.mock.calls[0][0]} onChange={onChange} />);

      expect(document.querySelector('input').value).toEqual('2011-11-03');

      // Raw change value
      rerender(<MomentPicker value={getMoment('1999-09-09')} onChange={onChange} />);

      expect(document.querySelector('input').value).toEqual('1999-09-09');
    });
  });

  describe('typing to change value', () => {
    [
      {
        name: 'basic',
        value: '2000-11-11',
        selected: '.rc-picker-cell-selected',
        matchDate: '2000-11-11',
      },
      {
        name: 'week',
        picker: 'week',
        value: '2000-45th',
        matchDate: '2000-10-29',
        selected: '.rc-picker-week-panel-row-selected',
      },
    ].forEach(({ name, picker, value, matchDate, selected }) => {
      it(name, () => {
        const onChange = jest.fn();
        const { container } = render(
          <MomentPicker onChange={onChange} picker={picker as any} allowClear />,
        );
        openPicker(container);
        // document.querySelector('input').simulate('focus');
        fireEvent.focus(container.querySelector('input'));

        // Invalidate value
        // document.querySelector('input').simulate('change', {
        //   target: {
        //     value: 'abc',
        //   },
        // });
        fireEvent.change(container.querySelector('input'), {
          target: {
            value: 'abc',
          },
        });

        // Validate value
        // document.querySelector('input').simulate('change', {
        //   target: {
        //     value,
        //   },
        // });
        fireEvent.change(container.querySelector('input'), {
          target: {
            value,
          },
        });

        expect(document.querySelector('input').value).toEqual(value);
        expect(onChange).not.toHaveBeenCalled();
        keyDown(KeyCode.ENTER);

        expect(isSame(onChange.mock.calls[0][0], matchDate, picker as any)).toBeTruthy();
        expect(document.querySelector(selected)).toBeTruthy();
        onChange.mockReset();

        clearValue();
        expect(onChange).toHaveBeenCalledWith(null, '');
        expect(isOpen()).toBeFalsy();

        openPicker(container);
        expect(document.querySelector(selected)).toBeFalsy();
      });
    });
  });

  describe('focus test', () => {
    let domMock: ReturnType<typeof spyElementPrototypes>;
    let focused = false;
    let blurred = false;

    beforeAll(() => {
      domMock = spyElementPrototypes(HTMLElement, {
        focus: () => {
          focused = true;
        },
        blur: () => {
          blurred = true;
        },
      });
    });

    beforeEach(() => {
      focused = false;
      blurred = false;
    });

    afterAll(() => {
      domMock.mockRestore();
    });

    it('function call', () => {
      const ref = React.createRef<MomentPicker>();
      render(
        <div>
          <MomentPicker ref={ref} />
        </div>,
      );

      ref.current!.pickerRef.current!.focus();
      expect(focused).toBeTruthy();

      ref.current!.pickerRef.current!.blur();
      expect(blurred).toBeTruthy();
    });

    it('style', () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();

      const { container } = render(
        <div>
          <MomentPicker onFocus={onFocus} onBlur={onBlur} />
        </div>,
      );

      fireEvent.focus(container.querySelector('input'));
      expect(onFocus).toHaveBeenCalled();
      expect(document.querySelector('.rc-picker-focused')).toBeTruthy();

      fireEvent.blur(container.querySelector('input'));
      expect(onBlur).toHaveBeenCalled();
      expect(document.querySelector('.rc-picker-focused')).toBeFalsy();
    });
  });

  it('block native mouseDown in panel to prevent focus changed', () => {
    const { container } = render(<MomentPicker />);
    openPicker(container);

    const mouseDownEvent = createEvent.mouseDown(document.querySelector('td'));
    fireEvent(document.querySelector('td'), mouseDownEvent);

    expect(mouseDownEvent.defaultPrevented).toBeTruthy();
  });

  describe('full steps', () => {
    [
      {
        name: 'date',
        yearBtn: '.rc-picker-year-btn',
        finalPanel: '.rc-picker-date-panel',
        finalMode: 'date',
      },
      {
        name: 'datetime',
        yearBtn: '.rc-picker-year-btn',
        finalPanel: '.rc-picker-datetime-panel',
        finalMode: 'date',
        showTime: true,
      },
      {
        name: 'week',
        yearBtn: '.rc-picker-year-btn',
        finalPanel: '.rc-picker-week-panel',
        finalMode: 'week',
        picker: 'week',
      },
    ].forEach(({ name, finalMode, yearBtn, finalPanel, picker, showTime }) => {
      it(name, () => {
        const onChange = jest.fn();
        const onPanelChange = jest.fn();
        const { container } = render(
          <MomentPicker
            picker={picker as any}
            showTime={showTime}
            onChange={onChange}
            onPanelChange={onPanelChange}
          />,
        );

        openPicker(container);

        function expectPanelChange(dateStr: string, mode: PanelMode) {
          expect(isSame(onPanelChange.mock.calls[0][0], dateStr)).toBeTruthy();
          expect(onPanelChange.mock.calls[0][1]).toEqual(mode);
          onPanelChange.mockReset();
        }

        // Year
        onPanelChange.mockReset();
        fireEvent.click(document.querySelector(yearBtn));
        expectPanelChange('1990-09-03', 'year');

        // Decade
        onPanelChange.mockReset();
        fireEvent.click(document.querySelector('.rc-picker-decade-btn'));
        expectPanelChange('1990-09-03', 'decade');

        // Next page
        fireEvent.click(document.querySelector('.rc-picker-header-super-next-btn'));
        expectPanelChange('2090-09-03', 'decade');

        // Select decade
        selectCell('2010-2019');
        expectPanelChange('2010-09-03', 'year');

        // Select year
        selectCell('2019');
        expectPanelChange('2019-09-03', 'month');

        // Select month
        selectCell('Aug');
        expectPanelChange('2019-08-03', finalMode as any);

        // Select date
        selectCell('18');
        expect(onPanelChange).not.toHaveBeenCalled();

        expect(document.querySelector(finalPanel)).toBeTruthy();

        if (showTime) {
          confirmOK();
        }
        closePicker(container);
        expect(isSame(onChange.mock.calls[0][0], '2019-08-18')).toBeTruthy();
      });
    });

    it('date -> year -> date', () => {
      const { container } = render(<MomentPicker />);
      openPicker(container);
      fireEvent.click(document.querySelector('.rc-picker-year-btn'));
      selectCell(1990);
      expect(document.querySelector('.rc-picker-date-panel')).toBeTruthy();
    });

    it('time', () => {
      const onChange = jest.fn();
      const onOk = jest.fn();
      const { container } = render(<MomentPicker picker="time" onChange={onChange} onOk={onOk} />);
      openPicker(container);

      function selectColumn(colIndex: number, rowIndex: number) {
        fireEvent.click(document.querySelectorAll('ul')[colIndex].querySelectorAll('li')[rowIndex]);
      }

      selectColumn(0, 13);
      selectColumn(1, 22);
      selectColumn(2, 33);

      expect(onOk).not.toHaveBeenCalled();
      confirmOK();
      expect(onOk).toHaveBeenCalled();
      expect(isSame(onChange.mock.calls[0][0], '1990-09-03 13:22:33', 'second')).toBeTruthy();
    });
  });

  it('renderExtraFooter', () => {
    const renderExtraFooter = jest.fn((mode) => <div>{mode}</div>);
    const { container } = render(<MomentPicker renderExtraFooter={renderExtraFooter} />);

    function matchFooter(mode: string) {
      expect(document.querySelector('.rc-picker-footer').textContent).toEqual(mode);
      expect(renderExtraFooter.mock.calls[renderExtraFooter.mock.calls.length - 1][0]).toEqual(
        mode,
      );
    }

    // Date
    openPicker(container);
    matchFooter('date');

    // Month
    fireEvent.click(document.querySelector('.rc-picker-month-btn'));

    matchFooter('month');

    // Year
    fireEvent.click(document.querySelector('.rc-picker-year-btn'));

    matchFooter('year');
  });

  describe('showToday', () => {
    it('only works on date', () => {
      const onSelect = jest.fn();
      const { container } = render(<MomentPicker onSelect={onSelect} showToday />);
      openPicker(container);
      fireEvent.click(document.querySelector('.rc-picker-today-btn'));
      expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    });

    it('disabled when in disabledDate', () => {
      const onSelect = jest.fn();
      const { container } = render(
        <MomentPicker onSelect={onSelect} disabledDate={() => true} showToday />,
      );
      openPicker(container);
      expect(document.querySelector('.rc-picker-today-btn')).toHaveClass(
        'rc-picker-today-btn-disabled',
      );
      fireEvent.click(document.querySelector('.rc-picker-today-btn'));
      expect(onSelect).not.toHaveBeenCalled();
    });

    ['decade', 'year', 'quarter', 'month', 'week'].forEach((name) => {
      it(`not works on ${name}`, () => {
        const { container } = render(<MomentPicker picker={name as any} showToday />);
        openPicker(container);
        expect(document.querySelector('.rc-picker-today-btn')).toBeFalsy();
      });
    });
  });

  it('icon', () => {
    render(
      <MomentPicker
        defaultValue={getMoment('1990-09-03')}
        suffixIcon={<span className="suffix-icon" />}
        clearIcon={<span className="suffix-icon" />}
        allowClear
      />,
    );

    expect(document.querySelector('.rc-picker-input')).toMatchSnapshot();
  });

  it('inputRender', () => {
    render(<MomentPicker inputRender={(props) => <input {...props} />} />);

    expect(document.querySelector('.rc-picker-input')).toMatchSnapshot();
  });

  describe('showNow', () => {
    it('datetime should display now', () => {
      const onSelect = jest.fn();
      const { container } = render(<MomentPicker onSelect={onSelect} showTime />);
      openPicker(container);
      fireEvent.click(document.querySelector('.rc-picker-now > a'));

      expect(isSame(onSelect.mock.calls[0][0], '1990-09-03 00:00:00', 'second')).toBeTruthy();
    });

    it("date shouldn't display now", () => {
      const onSelect = jest.fn();
      const { container } = render(<MomentPicker onSelect={onSelect} />);
      openPicker(container);
      expect(document.querySelector('.rc-picker-now > a')).toBeFalsy();
    });

    it("datetime shouldn't display now when showNow is false", () => {
      const onSelect = jest.fn();
      const { container } = render(<MomentPicker onSelect={onSelect} showTime showNow={false} />);
      openPicker(container);
      expect(document.querySelector('.rc-picker-now > a')).toBeFalsy();
    });

    it('time should display now', () => {
      const onSelect = jest.fn();
      const { container } = render(<MomentPicker onSelect={onSelect} picker="time" />);
      openPicker(container);
      fireEvent.click(document.querySelector('.rc-picker-now > a'));

      expect(isSame(onSelect.mock.calls[0][0], '1990-09-03 00:00:00', 'second')).toBeTruthy();
    });

    it("time shouldn't display now when showNow is false", () => {
      const onSelect = jest.fn();
      const { container } = render(
        <MomentPicker onSelect={onSelect} picker="time" showNow={false} />,
      );
      openPicker(container);
      expect(document.querySelector('.rc-picker-now > a')).toBeFalsy();
    });
  });

  describe('time step', () => {
    it('work with now', () => {
      jest.setSystemTime(getMoment('1990-09-03 00:09:00').valueOf());
      const onSelect = jest.fn();
      const { container } = render(
        <MomentPicker onSelect={onSelect} picker="time" minuteStep={10} />,
      );
      openPicker(container);
      // document.querySelector('.rc-picker-now > a').simulate('click');
      fireEvent.click(document.querySelector('.rc-picker-now > a'));
      expect(isSame(onSelect.mock.calls[0][0], '1990-09-03 00:00:59', 'second')).toBeTruthy();
      jest.setSystemTime(getMoment('1990-09-03 00:00:00').valueOf());
    });

    it('should show warning when hour step is invalid', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(spy).not.toBeCalled();
      const { container } = render(<MomentPicker picker="time" hourStep={9} />);
      openPicker(container);
      expect(spy).toBeCalledWith('Warning: `hourStep` 9 is invalid. It should be a factor of 24.');
      spy.mockRestore();
    });

    it('should show warning when minute step is invalid', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(spy).not.toBeCalled();
      const { container } = render(<MomentPicker picker="time" minuteStep={9} />);
      openPicker(container);
      expect(spy).toBeCalledWith(
        'Warning: `minuteStep` 9 is invalid. It should be a factor of 60.',
      );
      spy.mockRestore();
    });

    it('should show warning when second step is invalid', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(spy).not.toBeCalled();
      const { container } = render(<MomentPicker picker="time" secondStep={9} />);
      openPicker(container);
      expect(spy).toBeCalledWith(
        'Warning: `secondStep` 9 is invalid. It should be a factor of 60.',
      );
      spy.mockRestore();
    });

    // https://github.com/ant-design/ant-design/issues/40914
    ['hour', 'minute', 'second'].forEach((unit, index) => {
      it(`should show integer when step is not integer (${unit})`, () => {
        const props = {
          [`${unit}Step`]: 5.5,
        }
        const { container } = render(<MomentPicker picker="time" {...props} />);
        openPicker(container);

        const column = document.querySelector(`.rc-picker-time-panel-column:nth-child(${index+1})`);
        expect(column).toBeTruthy();

        const cells = column.querySelectorAll('.rc-picker-time-panel-cell-inner');
        cells.forEach((cell) => {
          expect(Number.isInteger(Number(cell.textContent))).toBeTruthy();
        });
      });
    });

    it('should work when hourStep < 0', () => {
      // @ts-ignore
      const { container } = render(<MomentPicker picker="time" hourStep={-1} />);
      openPicker(container);
      expect(document.querySelectorAll('.rc-picker-time-panel-column')[0].children.length).toBe(24);
    });
  });

  it('pass data- & aria- & role', () => {
    const { container } = render(<MomentPicker data-test="233" aria-label="3334" role="search" />);

    expect(container).toMatchSnapshot();
  });

  it('support name & autoComplete prop', () => {
    const { container } = render(<MomentPicker name="bamboo" autoComplete="off" />);

    expect(container.querySelector('input')).toHaveAttribute('name', 'bamboo');
    expect(container.querySelector('input')).toHaveAttribute('autoComplete', 'off');
  });

  it('blur should reset invalidate text', () => {
    const { container } = render(<MomentPicker />);
    openPicker(container);
    fireEvent.change(container.querySelector('input'), {
      target: {
        value: 'Invalidate',
      },
    });
    closePicker(container);
    expect(document.querySelector('input').value).toEqual('');
  });

  it('should render correctly in rtl', () => {
    const { container } = render(<MomentPicker direction="rtl" allowClear />);
    expect(container).toMatchSnapshot();
  });

  it('week picker show correct year', () => {
    const { container } = render(<MomentPicker value={getMoment('2019-12-31')} picker="week" />);

    expect(container.querySelector('input').value).toEqual('2020-1st');
  });

  it('Picker should open when click inside', () => {
    const onClick = jest.fn();
    render(<MomentPicker onClick={onClick} />);
    const inputElement = document.querySelector('input');
    inputElement.focus = jest.fn();

    fireEvent.click(document.querySelector('.rc-picker'));
    expect(inputElement.focus).toHaveBeenCalled();
    expect(isOpen()).toBeTruthy();

    expect(onClick).toHaveBeenCalled();
  });

  it('not open when disabled', () => {
    const { rerender } = render(<MomentPicker disabled />);
    // document.querySelector('.rc-picker').simulate('click');
    fireEvent.click(document.querySelector('.rc-picker'));
    expect(isOpen()).toBeFalsy();

    // wrapper.setProps({ disabled: false });
    rerender(<MomentPicker disabled={false} />);
    expect(isOpen()).toBeFalsy();
  });

  it('not open when mouseup', () => {
    render(<MomentPicker />);
    const inputElement = document.querySelector('input');
    inputElement.focus = jest.fn();

    // document.querySelector('.rc-picker').simulate('mouseup');
    fireEvent.mouseUp(document.querySelector('.rc-picker'));
    expect(inputElement.focus).toHaveBeenCalledTimes(0);
    expect(isOpen()).toBeFalsy();
  });

  it('defaultOpenValue in timePicker', () => {
    resetWarned();
    const onChange = jest.fn();
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <MomentPicker
        picker="time"
        defaultOpenValue={getMoment('2000-01-01 00:10:23')}
        onChange={onChange}
      />,
    );

    expect(errSpy).toHaveBeenCalledWith(
      'Warning: `defaultOpenValue` may confuse user for the current value status. Please use `defaultValue` instead.',
    );

    openPicker(container);
    // document.querySelector('.rc-picker-ok button').simulate('click');
    fireEvent.click(document.querySelector('.rc-picker-ok button'));

    expect(isSame(onChange.mock.calls[0][0], '2000-01-01 00:10:23')).toBeTruthy();

    errSpy.mockRestore();
  });

  it('close to reset', () => {
    const { container } = render(<MomentPicker defaultValue={getMoment('2000-01-01')} />);

    openPicker(container);
    fireEvent.change(document.querySelector('input'), {
      target: {
        value: 'aaaaa',
      },
    });
    expect(document.querySelector('input').value).toEqual('aaaaa');

    closePicker(container);
    expect(document.querySelector('input').value).toEqual('2000-01-01');
  });

  it('switch picker should change format', () => {
    const { rerender } = render(
      <MomentPicker picker="date" showTime defaultValue={getMoment('1999-09-03')} />,
    );
    expect(document.querySelector('input').value).toEqual('1999-09-03 00:00:00');

    [
      ['date', '1999-09-03'],
      ['month', '1999-09'],
      ['quarter', '1999-Q3'],
      ['year', '1999'],
    ].forEach(([picker, text]) => {
      rerender(
        <MomentPicker
          picker={picker as any}
          showTime={false}
          defaultValue={getMoment('1999-09-03')}
        />,
      );

      expect(document.querySelector('input').value).toEqual(text);
    });
  });

  it('id', () => {
    const { container } = render(<MomentPicker id="light" />);
    expect(container.querySelector('input').id).toEqual('light');
  });

  it('dateRender', () => {
    render(<MomentPicker open dateRender={(date) => date.format('YYYY-MM-DD')} />);
    const tdList = document.querySelectorAll('tbody td');
    expect(tdList[tdList.length - 1].textContent).toEqual('1990-10-06');
  });

  it('format', () => {
    const { container } = render(<MomentPicker format={['YYYYMMDD', 'YYYY-MM-DD']} />);
    openPicker(container);
    fireEvent.change(container.querySelector('input'), {
      target: {
        value: '2000-01-01',
      },
    });
    closePicker(container);
    expect(document.querySelector('input').value).toEqual('20000101');
  });

  it('custom format', () => {
    const { container } = render(
      <MomentPicker
        allowClear
        defaultValue={getMoment('2020-09-17')}
        format={[(val: Moment) => `custom format:${val.format('YYYYMMDD')}`, 'YYYY-MM-DD']}
      />,
    );
    expect(document.querySelector('input')).toHaveAttribute('readOnly');
    openPicker(container);
    selectCell(24);
    closePicker(container);
    expect(document.querySelector('input').value).toEqual('custom format:20200924');

    // clear
    clearValue();
    expect(document.querySelector('input').value).toEqual('');
  });

  it('panelRender', () => {
    render(<MomentPicker open panelRender={() => <h1>Light</h1>} />);
    expect(document.querySelector('.rc-picker')).toMatchSnapshot();
  });

  it('change panel when `picker` changed', () => {
    const { rerender } = render(<MomentPicker open picker="week" />);
    expect(document.querySelector('.rc-picker-week-panel')).toBeTruthy();
    rerender(<MomentPicker open picker="month" />);

    expect(document.querySelector('.rc-picker-week-panel')).toBeFalsy();
    expect(document.querySelector('.rc-picker-month-panel')).toBeTruthy();
  });

  describe('hover value', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should restore when leave', () => {
      render(<MomentPicker open defaultValue={getMoment('2020-07-22')} />);
      const cell = findCell(24);
      fireEvent.mouseEnter(cell);
      jest.runAllTimers();

      expect(document.querySelector('input').value).toBe('2020-07-24');
      expect(document.querySelector('.rc-picker-input')).toHaveClass('rc-picker-input-placeholder');

      fireEvent.mouseLeave(cell);
      jest.runAllTimers();

      expect(document.querySelector('input').value).toBe('2020-07-22');
      expect(document.querySelector('.rc-picker-input')).not.toHaveClass(
        'rc-picker-input-placeholder',
      );
    });

    it('should restore after selecting cell', () => {
      const { container } = render(<MomentPicker defaultValue={getMoment('2020-07-22')} />);
      openPicker(container);
      const cell = findCell(24);
      // cell.simulate('mouseEnter');
      fireEvent.mouseEnter(cell);
      jest.runAllTimers();

      expect(document.querySelector('input').value).toBe('2020-07-24');
      expect(document.querySelector('.rc-picker-input')).toHaveClass('rc-picker-input-placeholder');

      selectCell(24);
      expect(document.querySelector('input').value).toBe('2020-07-24');
      expect(document.querySelector('.rc-picker-input')).not.toHaveClass(
        'rc-picker-input-placeholder',
      );
    });

    it('change value when hovering', () => {
      const { container } = render(<MomentPicker defaultValue={getMoment('2020-07-22')} />);
      openPicker(container);
      const cell = findCell(24);
      // cell.simulate('mouseEnter');
      fireEvent.mouseEnter(cell);
      jest.runAllTimers();

      expect(document.querySelector('input').value).toBe('2020-07-24');
      expect(document.querySelector('.rc-picker-input')).toHaveClass('rc-picker-input-placeholder');

      fireEvent.change(container.querySelector('input'), {
        target: {
          value: '2020-07-23',
        },
      });

      expect(document.querySelector('input').value).toBe('2020-07-23');
      expect(document.querySelector('.rc-picker-input')).not.toHaveClass(
        'rc-picker-input-placeholder',
      );

      closePicker(container);
      expect(document.querySelector('input').value).toBe('2020-07-23');
      expect(document.querySelector('.rc-picker-input')).not.toHaveClass(
        'rc-picker-input-placeholder',
      );
    });
  });

  describe('time picker open to scroll', () => {
    let domMock: ReturnType<typeof spyElementPrototypes>;
    let canBeSeen = false;
    let triggered = false;

    beforeAll(() => {
      domMock = spyElementPrototypes(HTMLElement, {
        offsetParent: {
          get: () => {
            if (canBeSeen) {
              return {};
            }
            canBeSeen = true;
            return null;
          },
        },
        scrollTop: {
          get: () => 0,
          set: () => {
            triggered = true;
          },
        },
      });
    });

    afterAll(() => {
      domMock.mockRestore();
    });

    it('work', () => {
      jest.useFakeTimers();
      const { unmount } = render(
        <MomentPicker picker="time" defaultValue={getMoment('2020-07-22 09:03:28')} open />,
      );
      jest.runAllTimers();

      expect(triggered).toBeTruthy();

      jest.useRealTimers();
      unmount();
    });
  });

  describe('prevent default on keydown', () => {
    it('should open picker panel if no prevent default', () => {
      const { container } = render(<MomentPicker />);

      closePicker(container);
      keyDown(KeyCode.ENTER);
      expect(isOpen()).toBeTruthy();
    });

    it('should not open if prevent default is called', () => {
      const onKeyDown = jest.fn(({ which }, preventDefault) => {
        if (which === 13) preventDefault();
      });
      const { container } = render(<MomentPicker onKeyDown={onKeyDown} />);

      openPicker(container);
      expect(isOpen()).toBeTruthy();

      keyDown(KeyCode.ESC);
      expect(isOpen()).toBeFalsy();

      keyDown(KeyCode.ENTER);
      expect(isOpen()).toBeFalsy();
    });
  });

  it('disabledDate should not crash', () => {
    const { container } = render(<MomentPicker open disabledDate={(d) => d.isAfter(Date.now())} />);
    fireEvent.change(container.querySelector('input'), {
      target: { value: moment().add(1, 'year').format('YYYY-MM-DD') },
    });

    keyDown(KeyCode.ENTER);
  });

  it('presets', () => {
    const onChange = jest.fn();

    render(
      <MomentPicker
        onChange={onChange}
        open
        presets={[{ label: 'Bamboo', value: moment('2000-09-03') }]}
      />,
    );

    expect(document.querySelector('.rc-picker-presets li').textContent).toBe('Bamboo');
    // document.querySelector('.rc-picker-presets li').simulate('click');
    fireEvent.click(document.querySelector('.rc-picker-presets li'));

    expect(onChange.mock.calls[0][0].format('YYYY-MM-DD')).toEqual('2000-09-03');
  });
});

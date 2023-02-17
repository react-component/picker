import { act, createEvent, fireEvent, render } from '@testing-library/react';
import moment, { Moment } from 'moment';
import KeyCode from 'rc-util/lib/KeyCode';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import React from 'react';
import type { PickerMode } from '../src/interface';
import zhCN from '../src/locale/zh_CN';
import {
  clearValue,
  clickButton,
  closePicker,
  findCell,
  getMoment,
  inputValue,
  isOpen,
  isSame,
  MomentRangePicker,
  openPicker,
  selectCell,
} from './util/commonUtil';

describe('Picker.Range', () => {
  function matchValues(container: HTMLElement, value1: string, value2: string) {
    expect(container.querySelectorAll('input')[0].value).toEqual(value1);
    expect(container.querySelectorAll('input')[1].value).toEqual(value2);
  }

  function findLast(container: HTMLElement | Document, selector: string) {
    const list = container.querySelectorAll(selector);
    return list[list.length - 1];
  }

  beforeEach(() => {
    global.scrollCalled = false;
    jest.useFakeTimers().setSystemTime(getMoment('1990-09-03 00:00:00').valueOf());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  function keyDown(container: HTMLElement, index: number, keyCode: number) {
    fireEvent.keyDown(container.querySelectorAll('input')[0], {
      keyCode,
      which: keyCode,
      charCode: keyCode,
    });
  }

  describe('value', () => {
    it('defaultValue', () => {
      const { container } = render(
        <MomentRangePicker defaultValue={[getMoment('1989-11-28'), getMoment('1990-09-03')]} />,
      );

      matchValues(container, '1989-11-28', '1990-09-03');
    });

    it('controlled', () => {
      const { container, rerender } = render(
        <MomentRangePicker value={[getMoment('1989-11-28'), getMoment('1990-09-03')]} />,
      );

      matchValues(container, '1989-11-28', '1990-09-03');

      // Update
      rerender(<MomentRangePicker value={[getMoment('2000-01-01'), getMoment('2011-12-12')]} />);

      matchValues(container, '2000-01-01', '2011-12-12');
    });

    it('uncontrolled', () => {
      const onChange = jest.fn();
      const onCalendarChange = jest.fn();
      const { container } = render(
        <MomentRangePicker onChange={onChange} onCalendarChange={onCalendarChange} />,
      );

      // Start date
      openPicker(container);
      expect(onChange).not.toHaveBeenCalled();

      selectCell(13);
      expect(onChange).not.toHaveBeenCalled();

      expect(isSame(onCalendarChange.mock.calls[0][0][0], '1990-09-13')).toBeTruthy();
      expect(onCalendarChange.mock.calls[0][0][1]).toBeFalsy();
      expect(onCalendarChange.mock.calls[0][1]).toEqual(['1990-09-13', '']);

      // End date
      onCalendarChange.mockReset();
      selectCell(14);

      expect(isSame(onChange.mock.calls[0][0][0], '1990-09-13')).toBeTruthy();
      expect(isSame(onChange.mock.calls[0][0][1], '1990-09-14')).toBeTruthy();
      expect(onChange.mock.calls[0][1]).toEqual(['1990-09-13', '1990-09-14']);

      expect(isSame(onCalendarChange.mock.calls[0][0][0], '1990-09-13')).toBeTruthy();
      expect(isSame(onCalendarChange.mock.calls[0][0][1], '1990-09-14')).toBeTruthy();
      expect(onCalendarChange.mock.calls[0][1]).toEqual(['1990-09-13', '1990-09-14']);
    });
  });

  it('exchanged value should re-order', () => {
    const { container } = render(
      <MomentRangePicker defaultValue={[getMoment('1990-09-03'), getMoment('1989-11-28')]} />,
    );

    matchValues(container, '1989-11-28', '1990-09-03');
  });

  describe('view is closed', () => {
    it('year', () => {
      const { container } = render(<MomentRangePicker picker="year" />);
      openPicker(container);
      expect(document.querySelector('.rc-picker-footer')).toBeFalsy();
      expect(document.querySelectorAll('.rc-picker-header-view')[0].textContent).toEqual(
        '1990-1999',
      );
      expect(document.querySelectorAll('.rc-picker-header-view')[1].textContent).toEqual(
        '2000-2009',
      );
    });

    it('year with footer', () => {
      const { container } = render(
        <MomentRangePicker renderExtraFooter={() => <p>footer</p>} picker="year" />,
      );
      openPicker(container);
      expect(document.querySelector('.rc-picker-footer').textContent).toEqual('footer');
      expect(document.querySelectorAll('.rc-picker-header-view')[0].textContent).toEqual(
        '1990-1999',
      );
      expect(document.querySelectorAll('.rc-picker-header-view')[1].textContent).toEqual(
        '2000-2009',
      );
    });
  });

  it('endDate can not click before startDate', () => {
    const onChange = jest.fn();

    const { container } = render(
      <MomentRangePicker
        onChange={onChange}
        disabledDate={(date) => date.date() === 28}
        allowClear
      />,
    );

    let cellNode: HTMLElement;

    // Start date
    openPicker(container);
    selectCell(23);

    // End date
    cellNode = selectCell(11);
    expect(cellNode).toHaveClass('rc-picker-cell-disabled');
    expect(onChange).not.toHaveBeenCalled();

    // Click origin disabled date
    cellNode = selectCell(28);
    expect(cellNode).toHaveClass('rc-picker-cell-disabled');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('week picker can not click before start week', () => {
    const { container } = render(<MomentRangePicker picker="week" locale={zhCN} />);
    openPicker(container);
    selectCell(11);

    expect(findCell(4)).toHaveClass('rc-picker-cell-disabled');
    expect(findCell(11)).not.toHaveClass('rc-picker-cell-disabled');
  });

  describe('Can not select when start or end first selected', () => {
    it('select end', () => {
      const { container } = render(<MomentRangePicker />);

      openPicker(container, 1);
      selectCell(7);

      expect(findCell(23)).toHaveClass('rc-picker-cell-disabled');
    });

    it('select start', () => {
      const { container } = render(<MomentRangePicker picker="quarter" />);

      openPicker(container, 0);
      selectCell('Q3');

      expect(findCell('Q1')).toHaveClass('rc-picker-cell-disabled');
    });

    it('select end', () => {
      const { container } = render(<MomentRangePicker picker="month" />);

      openPicker(container, 1);
      selectCell('May');

      expect(findCell('Dec')).toHaveClass('rc-picker-cell-disabled');
    });

    it('disabled start', () => {
      const { container } = render(
        <MomentRangePicker
          disabled={[true, false]}
          defaultValue={[getMoment('1990-01-15'), getMoment('1990-02-15')]}
        />,
      );

      openPicker(container, 1);
      expect(findCell(14)).toHaveClass('rc-picker-cell-disabled');
    });
  });

  it('allowEmpty', () => {
    const onChange = jest.fn();
    const { container } = render(
      <MomentRangePicker onChange={onChange} allowEmpty={[false, true]} allowClear />,
    );

    openPicker(container);
    selectCell(11);
    expect(onChange).toHaveBeenCalledWith([expect.anything(), null], ['1990-09-11', '']);

    clearValue();
    onChange.mockReset();

    // Not allow empty with startDate
    openPicker(container, 1);
    selectCell(23);
    closePicker(container, 1);
    expect(onChange).not.toHaveBeenCalled();
  });

  describe('disabled', () => {
    it('basic disabled check', () => {
      const { container } = render(<MomentRangePicker disabled={[true, false]} />);
      expect(container.querySelectorAll('input')[0].disabled).toBeTruthy();
      expect(container.querySelectorAll('input')[1].disabled).toBeFalsy();
    });

    it('startDate will have disabledDate when endDate is not selectable', () => {
      const onChange = jest.fn();
      const { container } = render(
        <MomentRangePicker
          disabled={[false, true]}
          defaultValue={[null, getMoment('1990-09-22')]}
          onChange={onChange}
        />,
      );

      let cellNode: HTMLElement;

      // Disabled date
      openPicker(container);
      cellNode = selectCell(25);
      expect(cellNode).toHaveClass('rc-picker-cell-disabled');
      expect(onChange).not.toHaveBeenCalled();

      // Enabled date
      openPicker(container);
      cellNode = selectCell(7);
      expect(cellNode).not.toHaveClass('rc-picker-cell-disabled');
      expect(onChange).toHaveBeenCalledWith(
        [expect.anything(), expect.anything()],
        ['1990-09-07', '1990-09-22'],
      );
    });

    it('null value with disabled', () => {
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      render(<MomentRangePicker disabled={[false, true]} value={[null, null]} />);

      expect(errSpy).toHaveBeenCalledWith(
        'Warning: `disabled` should not set with empty `value`. You should set `allowEmpty` or `value` instead.',
      );
      errSpy.mockReset();
    });

    it('clear should trigger change', () => {
      const onChange = jest.fn();
      const { container } = render(
        <MomentRangePicker
          disabled={[false, true]}
          defaultValue={[getMoment('1990-01-01'), getMoment('2000-11-11')]}
          onChange={onChange}
          allowClear
        />,
      );

      openPicker(container);
      clearValue();
      expect(isOpen()).toBeFalsy();
      expect(onChange.mock.calls[0][1]).toEqual(['', '2000-11-11']);
    });

    // https://github.com/ant-design/ant-design/issues/23726
    it('not fill when all disabled and no value', () => {
      const { container } = render(<MomentRangePicker disabled />);
      expect(container.querySelectorAll('input')[0].value).toEqual('');
      expect(container.querySelectorAll('input')[1].value).toEqual('');
    });
  });

  describe('ranges', () => {
    it('work', () => {
      const onChange = jest.fn();
      const { container } = render(
        <MomentRangePicker
          ranges={{
            test: [getMoment('1989-11-28'), getMoment('1990-09-03')],
            func: () => [getMoment('2000-01-01'), getMoment('2010-11-11')],
          }}
          onChange={onChange}
        />,
      );

      let testNode: HTMLElement;

      // Basic
      openPicker(container);
      testNode = document.querySelector('.rc-picker-presets li');
      expect(testNode.textContent).toEqual('test');
      // testNode.simulate('click');
      fireEvent.click(testNode);
      expect(onChange).toHaveBeenCalledWith(
        [expect.anything(), expect.anything()],
        ['1989-11-28', '1990-09-03'],
      );
      expect(isOpen()).toBeFalsy();

      // Function
      openPicker(container);
      testNode = document.querySelector('.rc-picker-presets li:last-child');
      expect(testNode.textContent).toEqual('func');
      // testNode.simulate('click');
      fireEvent.click(testNode);
      expect(onChange).toHaveBeenCalledWith(
        [expect.anything(), expect.anything()],
        ['2000-01-01', '2010-11-11'],
      );
      expect(isOpen()).toBeFalsy();
    });

    it('hover className', () => {
      const { container } = render(
        <MomentRangePicker
          ranges={{
            now: [getMoment('1990-09-11'), getMoment('1990-09-13')],
          }}
        />,
      );

      openPicker(container);
      fireEvent.mouseEnter(document.querySelector('.rc-picker-presets li'));
      expect(findCell(11)).toHaveClass('rc-picker-cell-range-start');
      expect(findCell(12)).toHaveClass('rc-picker-cell-in-range');
      expect(findCell(13)).toHaveClass('rc-picker-cell-range-end');

      fireEvent.mouseLeave(document.querySelector('.rc-picker-presets li'));
      expect(findCell(11)).not.toHaveClass('rc-picker-cell-range-start');
      expect(findCell(12)).not.toHaveClass('rc-picker-cell-in-range');
      expect(findCell(13)).not.toHaveClass('rc-picker-cell-range-end');
    });
  });

  it('placeholder', () => {
    const { container } = render(<MomentRangePicker placeholder={['light', 'bamboo']} />);
    expect(container.querySelectorAll('input')[0].placeholder).toEqual('light');
    expect(container.querySelectorAll('input')[1].placeholder).toEqual('bamboo');
  });

  describe('defaultPickerValue', () => {
    it('defaultPickerValue works', () => {
      const { container } = render(
        <MomentRangePicker
          defaultPickerValue={[getMoment('1989-11-28'), getMoment('1990-09-03')]}
        />,
      );

      openPicker(container);
      expect(document.querySelectorAll('.rc-picker-header-view')[0].textContent).toEqual('Nov1989');
      closePicker(container);

      openPicker(container, 1);
      expect(document.querySelectorAll('.rc-picker-header-view')[1].textContent).toEqual('Oct1990');
      closePicker(container, 1);
    });

    it('defaultPickerValue with showTime', () => {
      const startDate = getMoment('1982-02-12');
      const endDate = getMoment('1982-02-12');

      const { container } = render(
        <MomentRangePicker defaultPickerValue={[startDate, endDate]} showTime />,
      );
      openPicker(container);
      expect(document.querySelector('.rc-picker-year-btn').textContent).toEqual(
        startDate.format('YYYY'),
      );
    });

    it('defaultPickerValue with showTime should works when open panel', () => {
      const startDate = getMoment('1982-02-12');
      const endDate = getMoment('1982-02-12');

      const { container } = render(
        <MomentRangePicker
          defaultValue={[startDate, endDate]}
          defaultPickerValue={[startDate, endDate]}
          showTime
        />,
      );
      expect(() => {
        openPicker(container);
      }).not.toThrow();
      expect(document.querySelector('.rc-picker-year-btn').textContent).toEqual(
        startDate.format('YYYY'),
      );
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
      const ref = React.createRef<MomentRangePicker>();
      render(
        <div>
          <MomentRangePicker ref={ref} />
        </div>,
      );

      ref.current!.rangePickerRef.current!.focus();
      expect(focused).toBeTruthy();

      ref.current!.rangePickerRef.current!.blur();
      expect(blurred).toBeTruthy();
    });

    it('not crash with showTime defaultValue', () => {
      const { container } = render(
        <MomentRangePicker
          showTime={{
            defaultValue: [getMoment('01:02:03'), getMoment('05:06:07')],
          }}
        />,
      );

      openPicker(container);
      selectCell(13);
      // document.querySelector('.rc-picker-ok button').simulate('click');
      fireEvent.click(document.querySelector('.rc-picker-ok button'));
      selectCell(23);

      matchValues(container, '1990-09-13 01:02:03', '1990-09-23 05:06:07');
    });
  });

  it('mode is array', () => {
    const { container } = render(<MomentRangePicker mode={['year', 'month']} />);
    openPicker(container);
    expect(document.querySelector('.rc-picker-year-panel')).toBeTruthy();

    openPicker(container, 1);
    expect(document.querySelector('.rc-picker-month-panel')).toBeTruthy();
  });

  describe('onPanelChange is array args', () => {
    it('mode', () => {
      const onPanelChange = jest.fn();
      const { container } = render(
        <MomentRangePicker mode={['month', 'year']} onPanelChange={onPanelChange} />,
      );

      openPicker(container);
      selectCell('Feb');
      expect(isSame(onPanelChange.mock.calls[0][0][0], '1990-02-03'));
      expect(onPanelChange.mock.calls[0][1]).toEqual(['date', 'year']);

      closePicker(container);
      onPanelChange.mockReset();

      openPicker(container, 1);
      selectCell(1993);
      expect(isSame(onPanelChange.mock.calls[0][0][1], '1993-02-03'));
      expect(onPanelChange.mock.calls[0][1]).toEqual(['month', 'month']);
    });

    it('picker', () => {
      const onPanelChange = jest.fn();
      const { container } = render(
        <MomentRangePicker picker="month" onPanelChange={onPanelChange} />,
      );

      // First go to year panel
      openPicker(container);
      // document.querySelector('.rc-picker-year-btn').first().simulate('click');
      fireEvent.click(document.querySelector('.rc-picker-year-btn'));
      expect(isSame(onPanelChange.mock.calls[0][0][0], '1990-09-03'));
      expect(onPanelChange.mock.calls[0][1]).toEqual(['year', 'month']);

      // First nack to month panel
      onPanelChange.mockReset();
      selectCell(1993);
      expect(onPanelChange).toHaveBeenCalled();
      expect(isSame(onPanelChange.mock.calls[0][0][0], '1993-09-03'));
      expect(onPanelChange.mock.calls[0][1]).toEqual(['month', 'month']);

      // Last go to year panel
      closePicker(container);
      openPicker(container, 1);
      // document.querySelector('.rc-picker-year-btn').first().simulate('click');
      fireEvent.click(document.querySelector('.rc-picker-year-btn'));
      onPanelChange.mockReset();

      // Last nack to month panel
      selectCell(1998);
      expect(isSame(onPanelChange.mock.calls[0][0][1], '1998-09-03'));
      expect(onPanelChange.mock.calls[0][1]).toEqual(['month', 'month']);
    });

    it('should render correctly in rtl', () => {
      const { container } = render(<MomentRangePicker direction="rtl" />);
      expect(container).toMatchSnapshot();
    });
  });

  it('type can not change before start time', () => {
    const onChange = jest.fn();
    const { container } = render(
      <MomentRangePicker
        defaultValue={[getMoment('2000-01-15'), getMoment('2000-01-16')]}
        onChange={onChange}
      />,
    );

    // wrapper
    //   .find('input')
    //   .last()
    //   .simulate('change', {
    //     target: {
    //       value: '2000-01-11',
    //     },
    //   });
    fireEvent.change(container.querySelectorAll('input')[1], {
      target: {
        value: '2000-01-11',
      },
    });
    // document.querySelector('input').last().simulate('keyDown', {
    //   which: KeyCode.ENTER,
    // });
    keyDown(container, 1, KeyCode.ENTER);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should open last when first selected', () => {
    jest.useFakeTimers();
    const onOpenChange = jest.fn();
    const { container, unmount } = render(<MomentRangePicker onOpenChange={onOpenChange} />);

    openPicker(container);
    expect(document.querySelectorAll('.rc-picker-input')[0]).toHaveClass('rc-picker-input-active');

    // Select to active next
    selectCell(11);
    jest.runAllTimers();
    expect(document.querySelectorAll('.rc-picker-input')[1]).toHaveClass('rc-picker-input-active');

    unmount();

    jest.useRealTimers();
  });

  describe('hover className', () => {
    [
      { picker: 'year', start: 1990, end: 1997, mid: 1991 },
      { picker: 'month', start: 'Feb', end: 'Oct', mid: 'May' },
      { picker: 'date', start: 11, end: 22, mid: 15 },
    ].forEach(({ picker, start, end, mid }) => {
      it('year', () => {
        const { container } = render(<MomentRangePicker picker={picker as any} />);
        openPicker(container);
        selectCell(start);

        // Hover it
        // findCell(end).simulate('mouseEnter');
        fireEvent.mouseEnter(findCell(end));

        expect(findCell(start)).toHaveClass('rc-picker-cell-range-hover-start');
        expect(findCell(mid)).toHaveClass('rc-picker-cell-range-hover');
        expect(findCell(end)).toHaveClass('rc-picker-cell-range-hover-end');

        // Leave
        // findCell(end).simulate('mouseLeave');
        fireEvent.mouseLeave(findCell(end));
        expect(findCell(start)).not.toHaveClass('rc-picker-cell-range-hover-start');
        expect(findCell(mid)).not.toHaveClass('rc-picker-cell-range-hover');
        expect(findCell(end)).not.toHaveClass('rc-picker-cell-range-hover-end');
      });
    });

    it('range edge className', () => {
      const { container } = render(
        <MomentRangePicker value={[getMoment('2019-12-20'), getMoment('2019-12-20')]} />,
      );

      // End edge
      openPicker(container);
      // findCell(10).simulate('mouseEnter');
      fireEvent.mouseEnter(findCell(10));
      expect(findCell(19)).toHaveClass('rc-picker-cell-range-hover-edge-end');
      expect(findCell(20)).toHaveClass('rc-picker-cell-range-start-near-hover');
      // findCell(10).simulate('mouseOut');
      fireEvent.mouseOut(findCell(10));

      // Start edge
      openPicker(container, 1);
      // findCell(28).simulate('mouseEnter');
      fireEvent.mouseEnter(findCell(28));
      expect(findCell(21)).toHaveClass('rc-picker-cell-range-hover-edge-start');
      expect(findCell(20)).toHaveClass('rc-picker-cell-range-end-near-hover');
      // findCell(28).simulate('mouseOut');
      fireEvent.mouseOut(findCell(28));
    });
  });

  it('should close when user focus out', () => {
    const { container } = render(<MomentRangePicker />);
    openPicker(container);
    selectCell(11);
    expect(isOpen()).toBeTruthy();

    // document.querySelector('input').last().simulate('blur');
    fireEvent.blur(container.querySelectorAll('input')[1]);
    expect(isOpen()).toBeFalsy();
  });

  it('icon', () => {
    const { container } = render(
      <MomentRangePicker
        defaultValue={[getMoment('1990-09-03'), getMoment('1990-09-03')]}
        suffixIcon={<span className="suffix-icon" />}
        clearIcon={<span className="suffix-icon" />}
        allowClear
      />,
    );

    expect(container).toMatchSnapshot();
  });

  it('block native mouseDown in panel to prevent focus changed', () => {
    const { container } = render(<MomentRangePicker />);
    openPicker(container);

    // const preventDefault = jest.fn();
    // document.querySelector('td').first().simulate('mouseDown', { preventDefault });
    const cell = document.querySelector('td');
    const mouseDownEvent = createEvent.mouseDown(cell);
    fireEvent(cell, mouseDownEvent);

    expect(mouseDownEvent.defaultPrevented).toBeTruthy();
  });

  describe('arrow position', () => {
    let domMock: ReturnType<typeof spyElementPrototypes>;

    beforeAll(() => {
      domMock = spyElementPrototypes(HTMLElement, {
        offsetWidth: {
          get: () => 100,
        },
      });
    });

    afterAll(() => {
      domMock.mockRestore();
    });

    it('end date arrow should move panel left', () => {
      const { container } = render(<MomentRangePicker />);
      openPicker(container, 1);

      // expect((document.querySelector('.rc-picker-panel-container').props() as any).style.marginLeft).toEqual(
      //   200,
      // );
      expect(document.querySelector('.rc-picker-panel-container')).toHaveStyle({
        marginLeft: 200,
      });
    });
  });

  it('focus to next input not to onOpenChange', () => {
    jest.useFakeTimers();

    const onOpenChange = jest.fn();
    const { container } = render(<MomentRangePicker onOpenChange={onOpenChange} />);
    openPicker(container);
    onOpenChange.mockReset();

    act(() => {
      fireEvent.mouseDown(container.querySelectorAll('input')[1]);
      fireEvent.blur(container.querySelectorAll('input')[0]);
      fireEvent.focus(container.querySelectorAll('input')[1]);
      jest.runAllTimers();
    });

    expect(onOpenChange).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('fixed open need repeat trigger onOpenChange', () => {
    jest.useFakeTimers();
    const onOpenChange = jest.fn();
    render(<MomentRangePicker onOpenChange={onOpenChange} open />);

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

  it('datetime display ok button', () => {
    const onCalendarChange = jest.fn();
    const onOk = jest.fn();
    const { container } = render(
      <MomentRangePicker showTime onCalendarChange={onCalendarChange} onOk={onOk} />,
    );
    openPicker(container);

    // Not trigger when not value
    expect(document.querySelector<HTMLButtonElement>('.rc-picker-ok button').disabled).toBeTruthy();
    expect(onCalendarChange).not.toHaveBeenCalled();

    // Trigger when start Ok'd
    onCalendarChange.mockReset();
    selectCell(11);
    expect(onCalendarChange).not.toHaveBeenCalled();
    fireEvent.click(document.querySelector('.rc-picker-ok button'));
    expect(onCalendarChange).toHaveBeenCalledWith(
      [expect.anything(), null],
      ['1990-09-11 00:00:00', ''],
      { range: 'start' },
    );
    expect(onOk).toHaveBeenCalled();

    // Trigger when end Ok'd
    onCalendarChange.mockReset();
    selectCell(23);
    expect(onCalendarChange).not.toHaveBeenCalled();
    fireEvent.click(document.querySelector('.rc-picker-ok button'));
    expect(onCalendarChange).toHaveBeenCalledWith(
      [expect.anything(), expect.anything()],
      ['1990-09-11 00:00:00', '1990-09-23 00:00:00'],
      { range: 'end' },
    );
    expect(onOk).toHaveBeenCalled();
  });

  it('datetime will reset by blur', () => {
    jest.useFakeTimers();

    const { container } = render(<MomentRangePicker showTime />);
    openPicker(container);
    selectCell(11);
    closePicker(container);
    act(() => {
      jest.runAllTimers();
    });

    expect(isOpen()).toBeFalsy();
    expect(document.querySelector('input').value).toEqual('');

    jest.useRealTimers();
  });

  describe('viewDate', () => {
    function matchTitle(title: string) {
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual(title);
    }

    [
      {
        picker: 'year',
        // Default picker value
        defaultPickerValue: [getMoment('1990-09-03'), getMoment('2000-11-28')],
        defaultPickerValueTitle: ['1990-1999', '2000-2009'],
        // Closing value
        closingValue: [getMoment('1989-09-03'), getMoment('1990-11-28')],
        closingValueTitle: '1980-1989',
        // Far away value
        farValue: [getMoment('1989-09-03'), getMoment('2090-11-28')],
        farValueTitle: ['1980-1989', '2080-2089'],
      },
      {
        picker: 'month',
        // Default picker value
        defaultPickerValue: [getMoment('1990-09-03'), getMoment('2000-11-28')],
        defaultPickerValueTitle: ['1990', '2000'],
        // Closing value
        closingValue: [getMoment('1989-09-03'), getMoment('1989-10-11')],
        closingValueTitle: '1989',
        // Far away value
        farValue: [getMoment('1989-09-03'), getMoment('2000-10-11')],
        farValueTitle: ['1989', '1999'],
      },
      {
        picker: 'date',
        // Default picker value
        defaultPickerValue: [getMoment('1990-09-03'), getMoment('2000-11-28')],
        defaultPickerValueTitle: ['Sep1990', 'Nov2000'],
        // Closing value
        closingValue: [getMoment('1989-09-03'), getMoment('1989-10-11')],
        closingValueTitle: 'Sep1989',
        // Far away value
        farValue: [getMoment('1989-09-03'), getMoment('2000-10-11')],
        farValueTitle: ['Sep1989', 'Sep2000'],
      },
    ].forEach(
      ({
        picker,
        defaultPickerValue,
        defaultPickerValueTitle,
        closingValue,
        closingValueTitle,
        farValue,
        farValueTitle,
      }) => {
        describe(picker, () => {
          it('defaultPickerValue', () => {
            const { container } = render(
              <MomentRangePicker
                picker={picker as any}
                defaultPickerValue={defaultPickerValue as any}
              />,
            );

            openPicker(container);
            matchTitle(defaultPickerValueTitle[0]);
            openPicker(container, 1);
            matchTitle(defaultPickerValueTitle[1]);
          });

          it('with closing value', () => {
            const { container } = render(
              <MomentRangePicker picker={picker as any} value={closingValue as any} />,
            );

            openPicker(container);
            matchTitle(closingValueTitle);
            openPicker(container, 1);
            matchTitle(closingValueTitle);
          });

          it('with far value', () => {
            const { container } = render(
              <MomentRangePicker picker={picker as any} value={farValue as any} />,
            );

            openPicker(container);
            matchTitle(farValueTitle[0]);
            openPicker(container, 1);
            matchTitle(farValueTitle[1]);
          });

          it('no end date', () => {
            const { container } = render(
              <MomentRangePicker picker={picker as any} value={[closingValue[0], null]} />,
            );

            openPicker(container);
            matchTitle(farValueTitle[0]);
            openPicker(container, 1);
            matchTitle(farValueTitle[0]);
          });
        });
      },
    );

    // https://github.com/ant-design/ant-design/issues/22991
    it('click switch 1 offset', () => {
      const { container } = render(<MomentRangePicker />);
      openPicker(container);
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('Sep1990');
      const nextBtns = document.querySelectorAll('.rc-picker-header-next-btn');
      fireEvent.click(nextBtns[nextBtns.length - 1]);
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('Oct1990');
    });
  });

  // https://github.com/ant-design/ant-design/issues/20868
  it('change picker should reset mode', () => {
    const { container, rerender } = render(<MomentRangePicker picker="date" />);
    openPicker(container);
    expect(document.querySelector('.rc-picker-date-panel')).toBeTruthy();

    rerender(<MomentRangePicker picker="month" />);

    expect(document.querySelector('.rc-picker-date-panel')).toBeFalsy();
    expect(document.querySelector('.rc-picker-month-panel')).toBeTruthy();
  });

  describe('reorder onChange logic', () => {
    it('datetime should reorder in onChange if start is after end in same date', () => {
      const onChange = jest.fn();

      const { container } = render(<MomentRangePicker onChange={onChange} showTime />);
      openPicker(container);
      selectCell(15);
      fireEvent.click(findLast(document.querySelector('ul'), 'li'));
      fireEvent.click(document.querySelector('.rc-picker-ok button'));

      selectCell(15);
      fireEvent.click(document.querySelector('ul').querySelector('li'));
      fireEvent.click(document.querySelector('.rc-picker-ok button'));

      expect(onChange).toHaveBeenCalledWith(expect.anything(), [
        '1990-09-15 00:00:00',
        '1990-09-15 23:00:00',
      ]);

      expect(isSame(onChange.mock.calls[0][0][0], '1990-09-15 00:00:00')).toBeTruthy();
      expect(isSame(onChange.mock.calls[0][0][1], '1990-09-15 23:00:00')).toBeTruthy();
    });

    function testOrderOnTime(order: boolean, start: string, end: string) {
      it(`order: ${String(order)} when picker is time`, () => {
        const onChange = jest.fn();

        const { container } = render(
          <MomentRangePicker onChange={onChange} picker="time" order={order} />,
        );
        openPicker(container);
        fireEvent.click(findLast(document.querySelector('ul'), 'li'));
        fireEvent.click(document.querySelector('.rc-picker-ok button'));

        fireEvent.click(document.querySelector('ul').querySelectorAll('li')[2]);
        fireEvent.click(document.querySelector('.rc-picker-ok button'));

        expect(onChange).toHaveBeenCalledWith(expect.anything(), [start, end]);

        expect(isSame(onChange.mock.calls[0][0][0], start)).toBeTruthy();
        expect(isSame(onChange.mock.calls[0][0][1], end)).toBeTruthy();
      });
    }

    testOrderOnTime(false, '23:00:00', '02:00:00');
    testOrderOnTime(true, '02:00:00', '23:00:00');
  });

  it('id', () => {
    const { container } = render(<MomentRangePicker id="bamboo" />);
    expect(container.querySelector('input').id).toEqual('bamboo');
  });

  it('dateRender', () => {
    let range = 'start';

    const { container } = render(
      <MomentRangePicker
        open
        dateRender={(date, _, info) => {
          expect(info.range).toEqual(range);
          return date.format('YYYY-MM-DD');
        }}
      />,
    );
    expect(findLast(document, 'tbody td').textContent).toEqual('1990-11-10');

    range = 'end';
    openPicker(container, 1);
  });

  // https://github.com/ant-design/ant-design/issues/21084
  it('should not jump back to current date after select', () => {
    const { container } = render(<MomentRangePicker />);
    openPicker(container);
    clickButton('super-prev');
    selectCell(3);
    selectCell(4);
    matchValues(container, '1989-09-03', '1989-09-04');
  });

  describe('can select endDate when in same level', () => {
    /**
     * Selection should support in same level.
     * Like `2020-12-31` ~ `2020-01-01` is validate in `year` picker.
     */
    const list: {
      picker: PickerMode;
      defaultValue: string[];
      targetCell: string;
      match: string[];
    }[] = [
      {
        picker: 'week',
        defaultValue: ['2020-06-13'],
        targetCell: '9',
        match: ['2020-24th'],
      },
      {
        picker: 'quarter',
        defaultValue: ['2020-03-30', '2020-05-20'],
        targetCell: 'Q1',
        match: ['2020-Q1'],
      },
    ];

    list.forEach(({ picker, defaultValue, match, targetCell }) => {
      it(picker, () => {
        const onChange = jest.fn();
        const { container } = render(
          <MomentRangePicker
            picker={picker}
            onChange={onChange}
            defaultValue={[
              getMoment(defaultValue[0]),
              getMoment(defaultValue[1] || defaultValue[0]),
            ]}
          />,
        );
        openPicker(container, 1);
        selectCell(targetCell);
        expect(onChange).toHaveBeenCalled();
        expect(onChange).toHaveBeenCalledWith(expect.anything(), [match[0], match[1] || match[0]]);
      });
    });
  });

  it('should not disabled when week picker in diff year', () => {
    const { container } = render(
      <MomentRangePicker
        picker="week"
        defaultValue={[getMoment('2000-12-15'), getMoment('2021-02-03')]}
      />,
    );

    openPicker(container, 1);
    expect(findCell('15')).not.toHaveClass('rc-picker-cell-disabled');
  });

  it('format', () => {
    const { container } = render(
      <MomentRangePicker
        format={['YYYYMMDD', 'YYYY-MM-DD']}
        defaultValue={[getMoment('2000-12-15'), getMoment('2021-02-03')]}
      />,
    );

    // Start date
    openPicker(container);

    fireEvent.change(container.querySelector('input'), {
      target: {
        value: '1989-09-03',
      },
    });
    closePicker(container);

    // end date
    openPicker(container, 1);
    act(() => {
      jest.runAllTimers();
    });
    fireEvent.change(container.querySelectorAll('input')[1], {
      target: {
        value: '1990-11-28',
      },
    });

    // Force blur since fireEvent blur will not change document.activeElement
    container.querySelectorAll('input')[1].blur();
    closePicker(container, 1);

    expect(document.querySelectorAll('input')[0].value).toEqual('19890903');
    expect(document.querySelectorAll('input')[1].value).toEqual('19901128');
  });

  it('custom format', () => {
    const { container } = render(
      <MomentRangePicker
        allowClear
        format={[(val: Moment) => `custom format:${val.format('YYYYMMDD')}`, 'YYYY-MM-DD']}
        defaultValue={[getMoment('2020-09-17'), getMoment('2020-10-17')]}
      />,
    );

    expect(document.querySelectorAll('input')[0]).toHaveAttribute('readOnly');
    expect(document.querySelectorAll('input')[1]).toHaveAttribute('readOnly');

    // Start date
    openPicker(container);
    selectCell(24);
    closePicker(container);

    // end date
    openPicker(container, 1);
    selectCell(24, 1);
    closePicker(container, 1);

    expect(document.querySelectorAll('input')[0].value).toEqual('custom format:20200924');
    expect(document.querySelectorAll('input')[1].value).toEqual('custom format:20201024');

    // clear
    const clearNode = document.querySelector('.rc-picker-clear');
    // expect(clearNode.simulate.bind(clearNode, 'mouseUp')).not.toThrow();
    fireEvent.mouseUp(clearNode);
    expect(document.querySelectorAll('input')[0].value).toEqual('');
    expect(document.querySelectorAll('input')[1].value).toEqual('');
  });

  describe('auto open', () => {
    it('empty: start -> end -> close', () => {
      const { container } = render(<MomentRangePicker />);

      openPicker(container, 0);
      inputValue('1990-11-28');
      closePicker(container, 0);
      expect(isOpen()).toBeTruthy();

      inputValue('1991-01-01');
      closePicker(container, 1);
      expect(isOpen()).toBeFalsy();
    });

    describe('valued: start -> end -> close', () => {
      it('in range', () => {
        const { container } = render(
          <MomentRangePicker defaultValue={[getMoment('1989-01-01'), getMoment('1990-01-01')]} />,
        );

        openPicker(container, 0);
        inputValue('1990-11-28');
        closePicker(container, 0);
        expect(isOpen()).toBeTruthy();

        inputValue('1990-12-23');
        closePicker(container, 1);
        expect(isOpen()).toBeFalsy();
      });

      it('new start is after end', () => {
        const { container } = render(
          <MomentRangePicker defaultValue={[getMoment('1989-01-10'), getMoment('1989-01-15')]} />,
        );

        openPicker(container, 0);
        inputValue('1989-01-20');
        closePicker(container, 0);
        expect(isOpen()).toBeTruthy();

        inputValue('1989-01-25');
        closePicker(container, 1);
        expect(isOpen()).toBeFalsy();
      });
    });

    it('empty: end -> start -> close', () => {
      const { container } = render(<MomentRangePicker />);

      openPicker(container, 1);
      inputValue('1990-11-28', 1);
      closePicker(container, 1);
      expect(isOpen()).toBeTruthy();

      inputValue('1989-01-01');
      closePicker(container, 0);
      expect(isOpen()).toBeFalsy();
    });

    describe('valued: end -> start -> close', () => {
      it('in range', () => {
        const { container } = render(
          <MomentRangePicker defaultValue={[getMoment('1989-01-01'), getMoment('1990-01-01')]} />,
        );

        openPicker(container, 1);
        inputValue('1990-11-28', 1);
        closePicker(container, 1);
        expect(isOpen()).toBeTruthy();

        inputValue('1989-01-01');
        closePicker(container, 0);
        expect(isOpen()).toBeFalsy();
      });

      it('new end is before start', () => {
        const { container } = render(
          <MomentRangePicker defaultValue={[getMoment('1989-01-10'), getMoment('1989-01-15')]} />,
        );

        openPicker(container, 1);
        inputValue('1989-01-07', 1);
        closePicker(container, 1);
        expect(isOpen()).toBeTruthy();

        inputValue('1989-01-01');
        closePicker(container, 0);
        expect(isOpen()).toBeFalsy();
      });
    });

    it('not change: start not to end', () => {
      const { container } = render(
        <MomentRangePicker defaultValue={[getMoment('1989-01-01'), getMoment('1990-01-01')]} />,
      );
      openPicker(container, 0);
      closePicker(container, 0);
      expect(isOpen()).toBeFalsy();
    });
  });

  describe('click at non-input elements', () => {
    it('should focus on the first element by default', () => {
      jest.useFakeTimers();
      const { container } = render(<MomentRangePicker />);
      fireEvent.click(container.querySelector('.rc-picker'));
      expect(document.querySelector('.rc-picker-dropdown')).toBeTruthy();
      jest.runAllTimers();
      expect(document.activeElement).toBe(container.querySelector('input'));
      jest.useRealTimers();
    });

    it('should focus on the second element if first is disabled', () => {
      jest.useFakeTimers();
      const { container } = render(<MomentRangePicker disabled={[true, false]} />);
      fireEvent.click(container.querySelector('.rc-picker'));
      expect(document.querySelector('.rc-picker-dropdown')).toBeTruthy();
      jest.runAllTimers();
      expect(document.activeElement).toBe(container.querySelectorAll('input')[1]);
      jest.useRealTimers();
    });
    it("shouldn't let mousedown blur the input", () => {
      jest.useFakeTimers();
      // const preventDefault = jest.fn();
      const { container } = render(<MomentRangePicker />);
      const node = container.querySelector('.rc-picker');
      // document.querySelector('.rc-picker').simulate('click');
      fireEvent.click(node);
      act(() => {
        jest.runAllTimers();
      });
      // document.querySelector('.rc-picker').simulate('mousedown', {
      //   preventDefault,
      // });
      const mouseDownEvent = createEvent.mouseDown(node);
      fireEvent(node, mouseDownEvent);
      expect(isOpen()).toBeTruthy();
      // expect(preventDefault).toHaveBeenCalled();
      expect(mouseDownEvent.defaultPrevented).toBeTruthy();
      jest.useRealTimers();
    });
  });

  it('panelRender', () => {
    render(<MomentRangePicker open panelRender={() => <h1>Light</h1>} />);
    expect(document.body).toMatchSnapshot();
  });

  describe('Selection callbacks', () => {
    it('selection provide info for onCalendarChange', () => {
      const onCalendarChange = jest.fn();

      const { container } = render(<MomentRangePicker onCalendarChange={onCalendarChange} />);

      openPicker(container);

      // Start date
      selectCell(11);
      expect(onCalendarChange).toHaveBeenCalledWith([expect.anything(), null], ['1990-09-11', ''], {
        range: 'start',
      });

      // End date
      selectCell(23);
      expect(onCalendarChange).toHaveBeenCalledWith(
        [expect.anything(), expect.anything()],
        ['1990-09-11', '1990-09-23'],
        { range: 'end' },
      );
    });
  });

  describe('hover placeholder', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    const defaultValue: [Moment, Moment] = [getMoment('2020-07-22'), getMoment('2020-08-22')];

    it('should restore when leave', () => {
      const { container } = render(<MomentRangePicker defaultValue={defaultValue} />);

      // left
      openPicker(container, 0);
      const leftCell = findCell(24);
      // leftCell.simulate('mouseEnter');
      fireEvent.mouseEnter(leftCell);
      jest.runAllTimers();

      expect(document.querySelectorAll('input')[0].value).toBe('2020-07-24');
      expect(document.querySelectorAll('input')[1].value).toBe('2020-08-22');
      expect(document.querySelectorAll('.rc-picker-input')[0]).toHaveClass(
        'rc-picker-input-placeholder',
      );
      expect(document.querySelectorAll('.rc-picker-input')[1]).not.toHaveClass(
        'rc-picker-input-placeholder',
      );

      // leftCell.simulate('mouseLeave');
      fireEvent.mouseLeave(leftCell);
      act(() => {
        jest.runAllTimers();
      });

      expect(document.querySelectorAll('input')[0].value).toBe('2020-07-22');
      expect(document.querySelectorAll('input')[1].value).toBe('2020-08-22');
      expect(document.querySelectorAll('.rc-picker-input')[0]).not.toHaveClass(
        'rc-picker-input-placeholder',
      );
      expect(document.querySelectorAll('.rc-picker-input')[1]).not.toHaveClass(
        'rc-picker-input-placeholder',
      );

      closePicker(container, 0);

      // right
      openPicker(container, 1);
      const rightCell = findCell(24, 1);
      fireEvent.mouseEnter(rightCell);
      act(() => {
        jest.runAllTimers();
      });

      expect(document.querySelectorAll('input')[0].value).toBe('2020-07-22');
      expect(document.querySelectorAll('input')[1].value).toBe('2020-08-24');
      expect(document.querySelectorAll('.rc-picker-input')[0]).not.toHaveClass(
        'rc-picker-input-placeholder',
      );
      expect(document.querySelectorAll('.rc-picker-input')[1]).toHaveClass(
        'rc-picker-input-placeholder',
      );

      fireEvent.mouseLeave(rightCell);
      act(() => {
        jest.runAllTimers();
      });

      expect(document.querySelectorAll('input')[0].value).toBe('2020-07-22');
      expect(document.querySelectorAll('input')[1].value).toBe('2020-08-22');
      expect(document.querySelectorAll('.rc-picker-input')[0]).not.toHaveClass(
        'rc-picker-input-placeholder',
      );
      expect(document.querySelectorAll('.rc-picker-input')[1]).not.toHaveClass(
        'rc-picker-input-placeholder',
      );

      closePicker(container, 1);
    });

    it('should restore after selecting cell', () => {
      const { container } = render(<MomentRangePicker defaultValue={defaultValue} />);
      // left
      openPicker(container, 0);
      const leftCell = findCell(24, 0);
      //     leftCell.simulate('mouseEnter');
      fireEvent.mouseEnter(leftCell);
      act(() => {
        jest.runAllTimers();
      });
      expect(document.querySelectorAll('input')[0].value).toBe('2020-07-24');
      expect(document.querySelectorAll('input')[1].value).toBe('2020-08-22');
      expect(document.querySelectorAll('.rc-picker-input')[0]).toHaveClass(
        'rc-picker-input-placeholder',
      );
      //     ).toBeTruthy();
      expect(document.querySelectorAll('.rc-picker-input')[1]).not.toHaveClass(
        'rc-picker-input-placeholder',
      );
      //     ).toBeFalsy();

      selectCell(24, 0);
      expect(document.querySelectorAll('input')[0].value).toBe('2020-07-24');
      expect(document.querySelectorAll('input')[1].value).toBe('2020-08-22');
      expect(document.querySelectorAll('.rc-picker-input')[0]).not.toHaveClass(
        'rc-picker-input-placeholder',
      );
      //     ).toBeFalsy();
      expect(document.querySelectorAll('.rc-picker-input')[1]).not.toHaveClass(
        'rc-picker-input-placeholder',
      );
      //     ).toBeFalsy();

      // right
      const rightCell = findCell(24, 1);
      //     rightCell.simulate('mouseEnter');
      fireEvent.mouseEnter(rightCell);
      act(() => {
        jest.runAllTimers();
      });

      expect(document.querySelectorAll('input')[0].value).toBe('2020-07-24');
      expect(document.querySelectorAll('input')[1].value).toBe('2020-08-24');
      expect(document.querySelectorAll('.rc-picker-input')[0]).not.toHaveClass(
        'rc-picker-input-placeholder',
      );
      //     ).toBeFalsy();
      expect(document.querySelectorAll('.rc-picker-input')[1]).toHaveClass(
        'rc-picker-input-placeholder',
      );
      //     ).toBeTruthy();

      selectCell(24, 1);
      expect(document.querySelectorAll('input')[0].value).toBe('2020-07-24');
      expect(document.querySelectorAll('input')[1].value).toBe('2020-08-24');
      expect(document.querySelectorAll('.rc-picker-input')[0]).not.toHaveClass(
        'rc-picker-input-placeholder',
      );
      //     ).toBeFalsy();
      expect(document.querySelectorAll('.rc-picker-input')[1]).not.toHaveClass(
        'rc-picker-input-placeholder',
      );
      //     ).toBeFalsy();
    });

    // https://github.com/ant-design/ant-design/issues/26544
    it('should clean hover style when selecting the same value with last value', () => {
      const { container } = render(
        <MomentRangePicker defaultValue={[getMoment('2020-07-24'), getMoment('2020-08-24')]} />,
      );

      openPicker(container);

      selectCell(24, 0);
      expect(document.querySelectorAll('input')[0].value).toBe('2020-07-24');
      expect(document.querySelectorAll('input')[0]).not.toHaveClass('rc-picker-input-placeholder');
      expect(isOpen()).toBeTruthy();
    });
  });

  // https://github.com/ant-design/ant-design/issues/25746
  it('ok button should be disabled when disabledDate is true', () => {
    const disabledDate = () => {
      // Can not select days before today and today
      return true;
    };
    const { container } = render(
      <MomentRangePicker
        showTime
        disabledDate={disabledDate}
        defaultValue={[getMoment('2020-07-24'), getMoment('2020-08-24')]}
      />,
    );

    openPicker(container);

    expect(document.querySelector<HTMLButtonElement>('.rc-picker-ok button').disabled).toBeTruthy();

    fireEvent.click(
      document.querySelector('.rc-picker-time-panel-column').querySelectorAll('li')[6],
    );

    expect(document.querySelectorAll('input')[0].value).toEqual('2020-07-24 06:00:00');
    expect(document.querySelector<HTMLButtonElement>('.rc-picker-ok button').disabled).toBeTruthy();
  });

  // https://github.com/ant-design/ant-design/issues/26024
  it('panel should keep open when nextValue is empty', () => {
    const { container } = render(<MomentRangePicker />);

    openPicker(container, 0);

    selectCell(7, 0);
    expect(document.querySelectorAll('input')[0].value).toBe('1990-09-07');

    // back to first panel and clear input value
    fireEvent.focus(document.querySelectorAll('input')[0]);
    inputValue('', 0);

    // reselect date
    selectCell(9, 0);
    expect(document.querySelectorAll('input')[0].value).toBe('1990-09-09');

    // end date
    selectCell(9, 1);

    matchValues(container, '1990-09-09', '1990-10-09');
  });

  it('right date panel switch to month should keep in the same year', () => {
    const { container } = render(<MomentRangePicker />);
    openPicker(container, 0);
    fireEvent.click(document.querySelectorAll('.rc-picker-month-btn')[1]);
    expect(document.querySelector('.rc-picker-year-btn').textContent).toEqual('1990');
  });

  // https://github.com/ant-design/ant-design/issues/26390
  it('month panel should be disabled', () => {
    const { container } = render(<MomentRangePicker />);
    openPicker(container);
    selectCell(15);

    fireEvent.click(document.querySelector('.rc-picker-month-btn'));
    expect(findCell('Jan')).toHaveClass('rc-picker-cell-disabled');
    expect(findCell('Dec')).not.toHaveClass('rc-picker-cell-disabled');
  });

  // https://github.com/ant-design/ant-design/issues/23167
  it('default endDate should be relative startDate', () => {
    const { container } = render(<MomentRangePicker showTime />);
    openPicker(container);

    selectCell(24);
    fireEvent.click(document.querySelector('.rc-picker-ok button'));

    fireEvent.click(document.querySelector('ul').querySelector('li'));
    fireEvent.click(document.querySelector('.rc-picker-ok button'));

    matchValues(container, '1990-09-24 00:00:00', '1990-09-24 00:00:00');
  });

  it('default startDate should be relative endDate', () => {
    const { container } = render(<MomentRangePicker showTime />);
    openPicker(container, 1);

    selectCell(24);
    fireEvent.click(document.querySelector('.rc-picker-ok button'));

    fireEvent.click(document.querySelector('ul').querySelector('li'));
    fireEvent.click(document.querySelector('.rc-picker-ok button'));

    matchValues(container, '1990-09-24 00:00:00', '1990-09-24 00:00:00');
  });

  // https://github.com/ant-design/ant-design/issues/30893
  it('range picker should have onMouseEnter and onMouseLeave event', () => {
    const handleMouseEnter = jest.fn();
    const handleMouseLeave = jest.fn();
    const { container } = render(
      <MomentRangePicker onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />,
    );
    // wrapper.simulate('mouseenter');
    fireEvent.mouseEnter(container.querySelector('.rc-picker'));
    expect(handleMouseEnter).toHaveBeenCalled();
    // wrapper.simulate('mouseleave');
    fireEvent.mouseLeave(container.querySelector('.rc-picker'));
    expect(handleMouseLeave).toHaveBeenCalled();
  });

  // https://github.com/ant-design/ant-design/issues/31334
  it('keyboard should not trigger on disabledDate', () => {
    const onCalendarChange = jest.fn();
    const now = moment();
    const disabledDate = (current: Moment) => {
      return current.diff(now, 'days') > 1 || current.diff(now, 'days') < -1;
    };
    const { container } = render(
      <MomentRangePicker onCalendarChange={onCalendarChange} disabledDate={disabledDate} />,
    );
    fireEvent.focus(document.querySelector('input'));

    function pickerKeyDown(keyCode: number) {
      fireEvent.keyDown(container.querySelector('.rc-picker'), {
        keyCode,
        which: keyCode,
        charCode: keyCode,
      });
    }

    pickerKeyDown(KeyCode.ENTER);
    pickerKeyDown(KeyCode.TAB);
    // Make sure the selected value is disabledDate. Because only a few values are disabledDate
    pickerKeyDown(KeyCode.DOWN);
    pickerKeyDown(KeyCode.DOWN);
    pickerKeyDown(KeyCode.DOWN);
    pickerKeyDown(KeyCode.DOWN);
    pickerKeyDown(KeyCode.DOWN);
    pickerKeyDown(KeyCode.DOWN);
    pickerKeyDown(KeyCode.ENTER);
    expect(onCalendarChange).not.toHaveBeenCalled();
  });

  // https://github.com/ant-design/ant-design/issues/33662
  it('range picker should have onClick event', () => {
    const handleClick = jest.fn();
    const { container } = render(<MomentRangePicker onClick={handleClick} />);
    // wrapper.simulate('click');
    fireEvent.click(container.querySelector('.rc-picker'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('range picker should have onMouseDown event', () => {
    const handleMouseDown = jest.fn();
    const { container } = render(<MomentRangePicker onMouseDown={handleMouseDown} />);
    // wrapper.simulate('mousedown');
    fireEvent.mouseDown(container.querySelector('.rc-picker'));
    expect(handleMouseDown).toHaveBeenCalled();
  });

  it('panel should be stable: left', () => {
    const mock = spyElementPrototypes(HTMLElement, {
      offsetWidth: {
        get() {
          if (this.className.includes('range-arrow')) {
            return 14;
          } else if (this.className.includes('panel-container')) {
            return 312;
          } else if (this.className.includes('input')) {
            return 236;
          } else if (this.className.includes('range-separator')) {
            return 10;
          }
        },
      },
      offsetLeft: {
        get() {
          if (this.className.includes('range-arrow')) {
            return 16;
          }
        },
      },
    });
    const { container } = render(
      <MomentRangePicker
        allowClear
        defaultValue={[moment('1990-09-03'), moment('1989-11-28')]}
        clearIcon={<span>X</span>}
        suffixIcon={<span>O</span>}
      />,
    );
    openPicker(container, 1);
    expect(document.querySelector('.rc-picker-panel-container')).toHaveStyle({ marginLeft: 0 });
    mock.mockRestore();
  });

  it('panel should be stable: arrow right and panel left', () => {
    const mock = spyElementPrototypes(HTMLElement, {
      offsetWidth: {
        get() {
          if (this.className.includes('range-arrow')) {
            return 14;
          } else if (this.className.includes('panel-container')) {
            return 312;
          } else if (this.className.includes('input')) {
            return 236;
          } else if (this.className.includes('range-separator')) {
            return 10;
          }
        },
      },
      offsetLeft: {
        get() {
          if (this.className.includes('range-arrow')) {
            return 262;
          }
        },
      },
    });
    const { container } = render(
      <MomentRangePicker
        allowClear
        defaultValue={[moment('1990-09-03'), moment('1989-11-28')]}
        clearIcon={<span>X</span>}
        suffixIcon={<span>O</span>}
      />,
    );
    openPicker(container, 1);
    expect(document.querySelector('.rc-picker-panel-container')).toHaveStyle({ marginLeft: 0 });
    mock.mockRestore();
  });

  it('panel should be stable: arrow right and panel right', () => {
    const mock = spyElementPrototypes(HTMLElement, {
      offsetWidth: {
        get() {
          if (this.className.includes('range-arrow')) {
            return 14;
          } else if (this.className.includes('panel-container')) {
            return 311;
          } else if (this.className.includes('input')) {
            return 285;
          } else if (this.className.includes('range-separator')) {
            return 10;
          }
        },
      },
      offsetLeft: {
        get() {
          if (this.className.includes('range-arrow')) {
            return 305;
          }
        },
      },
    });
    const { container } = render(
      <MomentRangePicker
        allowClear
        defaultValue={[moment('1990-09-03'), moment('1989-11-28')]}
        clearIcon={<span>X</span>}
        suffixIcon={<span>O</span>}
      />,
    );
    openPicker(container, 1);
    expect(document.querySelector('.rc-picker-panel-container')).toHaveStyle({
      marginLeft: '295px',
    });
    mock.mockRestore();
  });

  it('week range selection style', () => {
    const { container } = render(<MomentRangePicker picker="week" />);
    openPicker(container);

    function findWeekCell(val: string) {
      const list = document.querySelectorAll('.rc-picker-cell-week');
      return Array.from(list).find((cell) => cell.textContent == val);
    }

    // Start
    fireEvent.mouseEnter(findWeekCell('35'));
    fireEvent.click(findWeekCell('35'));
    fireEvent.mouseLeave(findWeekCell('35'));

    expect(findWeekCell('35').parentElement).toHaveClass('rc-picker-week-panel-row-range-start');

    // End Hover
    fireEvent.mouseEnter(findWeekCell('37'));
    expect(findWeekCell('36').parentElement).toHaveClass('rc-picker-week-panel-row-range-hover');

    // End Click
    fireEvent.click(findWeekCell('37'));
    fireEvent.mouseLeave(findWeekCell('37'));

    expect(findWeekCell('37').parentElement).toHaveClass('rc-picker-week-panel-row-range-end');

    // No selected cell
    expect(document.querySelector('.rc-picker-cell-selected')).toBeFalsy();
  });
});

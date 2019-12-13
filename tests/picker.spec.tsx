import React from 'react';
import MockDate from 'mockdate';
import { act } from 'react-dom/test-utils';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import KeyCode from 'rc-util/lib/KeyCode';
import { PanelMode, PickerMode } from '../src/interface';
import { mount, getMoment, isSame, MomentPicker } from './util/commonUtil';

describe('Picker.Basic', () => {
  beforeAll(() => {
    MockDate.set(getMoment('1990-09-03 00:00:00').toDate());
  });

  afterAll(() => {
    MockDate.reset();
  });

  describe('mode', () => {
    const modeList: { mode: PanelMode; componentNames: string[] }[] = [
      {
        mode: 'decade',
        componentNames: ['DecadePanel', 'DecadeHeader', 'DecadeBody'],
      },
      {
        mode: 'year',
        componentNames: ['YearPanel', 'YearHeader', 'YearBody'],
      },
      {
        mode: 'month',
        componentNames: ['MonthPanel', 'MonthHeader', 'MonthBody'],
      },
      {
        mode: 'week',
        componentNames: ['WeekPanel'],
      },
      {
        mode: 'date',
        componentNames: ['DatePanel', 'DateHeader', 'DateBody'],
      },
      {
        mode: 'time' as any,
        componentNames: ['TimePanel', 'TimeHeader', 'TimeBody'],
      },
    ];

    modeList.forEach(({ mode, componentNames }) => {
      it(mode, () => {
        const wrapper = mount(<MomentPicker mode={mode} open />);
        componentNames.forEach(componentName => {
          expect(wrapper.find(componentName).length).toBeTruthy();
        });
      });
    });
  });

  describe('picker', () => {
    const modeList: { picker: PickerMode; componentNames: string[] }[] = [
      {
        picker: 'year',
        componentNames: ['YearPanel', 'YearHeader', 'YearBody'],
      },
      {
        picker: 'month',
        componentNames: ['MonthPanel', 'MonthHeader', 'MonthBody'],
      },
      {
        picker: 'week',
        componentNames: ['WeekPanel'],
      },
      {
        picker: 'date',
        componentNames: ['DatePanel', 'DateHeader', 'DateBody'],
      },
      {
        picker: 'time',
        componentNames: ['TimePanel', 'TimeHeader', 'TimeBody'],
      },
    ];

    modeList.forEach(({ picker, componentNames }) => {
      it(picker, () => {
        const wrapper = mount(<MomentPicker picker={picker as any} open />);
        componentNames.forEach(componentName => {
          expect(wrapper.find(componentName).length).toBeTruthy();
        });
      });
    });
  });

  describe('open', () => {
    it('should work', () => {
      const onOpenChange = jest.fn();
      const wrapper = mount(<MomentPicker onOpenChange={onOpenChange} />);

      wrapper.openPicker();
      expect(wrapper.isOpen()).toBeTruthy();
      expect(onOpenChange).toHaveBeenCalledWith(true);
      onOpenChange.mockReset();

      wrapper.closePicker();
      expect(wrapper.isOpen()).toBeFalsy();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('controlled', () => {
      const wrapper = mount(<MomentPicker open />);
      expect(wrapper.isOpen()).toBeTruthy();

      wrapper.setProps({ open: false });
      expect(wrapper.isOpen()).toBeFalsy();
    });

    it('fixed open need repeat trigger onOpenChange', () => {
      jest.useFakeTimers();
      const onOpenChange = jest.fn();
      mount(<MomentPicker onOpenChange={onOpenChange} open />);

      for (let i = 0; i < 10; i += 1) {
        const clickEvent = new Event('mousedown');
        Object.defineProperty(clickEvent, 'target', {
          get: () => document.body,
        });
        act(() => {
          window.dispatchEvent(clickEvent);
        });
        expect(onOpenChange).toHaveBeenCalledTimes(i + 1);
      }
      act(() => {
        jest.runAllTimers();
      });
      jest.useRealTimers();
    });

    it('disabled should not open', () => {
      const wrapper = mount(<MomentPicker open disabled />);
      expect(wrapper.isOpen()).toBeFalsy();
    });
  });

  describe('value', () => {
    it('defaultValue', () => {
      const wrapper = mount(
        <MomentPicker defaultValue={getMoment('1989-11-28')} />,
      );
      expect(wrapper.find('input').prop('value')).toEqual('1989-11-28');
    });

    it('uncontrolled', () => {
      const onChange = jest.fn();
      const wrapper = mount(<MomentPicker onChange={onChange} />);
      wrapper.openPicker();
      wrapper.selectCell(11);
      wrapper.closePicker();

      expect(isSame(onChange.mock.calls[0][0], '1990-09-11')).toBeTruthy();
      expect(onChange.mock.calls[0][1]).toEqual('1990-09-11');
      expect(wrapper.find('input').prop('value')).toEqual('1990-09-11');
    });

    it('controlled', () => {
      const onChange = jest.fn();
      const wrapper = mount(
        <MomentPicker value={getMoment('2011-11-11')} onChange={onChange} />,
      );

      wrapper.openPicker();
      wrapper.selectCell(3);
      wrapper.closePicker();
      wrapper.update();

      expect(isSame(onChange.mock.calls[0][0], '2011-11-03')).toBeTruthy();
      expect(wrapper.find('input').prop('value')).toEqual('2011-11-11');

      wrapper.setProps({ value: onChange.mock.calls[0][0] });
      wrapper.update();
      expect(wrapper.find('input').prop('value')).toEqual('2011-11-03');

      // Raw change value
      wrapper.setProps({ value: getMoment('1999-09-09') });
      wrapper.update();
      expect(wrapper.find('input').prop('value')).toEqual('1999-09-09');
    });
  });

  describe('typing to change value', () => {
    [
      {
        name: 'basic',
        value: '2000-11-11',
        selected: '.rc-picker-cell-selected',
      },
      {
        name: 'week',
        picker: 'week',
        value: '2000-45th',
        selected: '.rc-picker-week-panel-row-selected',
      },
    ].forEach(({ name, picker, value, selected }) => {
      it(name, () => {
        const onChange = jest.fn();
        const wrapper = mount(
          <MomentPicker
            onChange={onChange}
            picker={picker as any}
            allowClear
          />,
        );
        wrapper.openPicker();
        wrapper.find('input').simulate('focus');

        // Invalidate value
        wrapper.find('input').simulate('change', {
          target: {
            value: 'abc',
          },
        });

        // Validate value
        wrapper.find('input').simulate('change', {
          target: {
            value,
          },
        });

        expect(wrapper.find('input').prop('value')).toEqual(value);
        expect(onChange).not.toHaveBeenCalled();
        wrapper.keyDown(KeyCode.ENTER);
        expect(
          isSame(onChange.mock.calls[0][0], '2000-11-11', picker as any),
        ).toBeTruthy();
        expect(wrapper.find(selected).length).toBeTruthy();
        onChange.mockReset();

        wrapper.clearValue();
        expect(onChange).toHaveBeenCalledWith(null, '');
        expect(wrapper.isOpen()).toBeFalsy();

        wrapper.openPicker();
        expect(wrapper.find(selected).length).toBeFalsy();
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
      mount(
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

      const wrapper = mount(
        <div>
          <MomentPicker onFocus={onFocus} onBlur={onBlur} />
        </div>,
      );

      wrapper.find('input').simulate('focus');
      expect(onFocus).toHaveBeenCalled();
      expect(wrapper.find('.rc-picker-focused').length).toBeTruthy();

      wrapper.find('input').simulate('blur');
      expect(onBlur).toHaveBeenCalled();
      expect(wrapper.find('.rc-picker-focused').length).toBeFalsy();
    });
  });

  it('block native mouseDown in panel to prevent focus changed', () => {
    const wrapper = mount(<MomentPicker />);
    wrapper.openPicker();

    const preventDefault = jest.fn();
    wrapper
      .find('td')
      .first()
      .simulate('mouseDown', { preventDefault });

    expect(preventDefault).toHaveBeenCalled();
  });

  describe('full steps', () => {
    [
      {
        name: 'date',
        yearBtn: '.rc-picker-year-btn',
        finalPanel: 'DatePanel',
        finalMode: 'date',
      },
      {
        name: 'datetime',
        yearBtn: '.rc-picker-year-btn',
        finalPanel: 'DatetimePanel',
        finalMode: 'date',
        showTime: true,
      },
      {
        name: 'week',
        yearBtn: '.rc-picker-year-btn',
        finalPanel: 'WeekPanel',
        finalMode: 'week',
        picker: 'week',
      },
    ].forEach(({ name, finalMode, yearBtn, finalPanel, picker, showTime }) => {
      it(name, () => {
        const onChange = jest.fn();
        const onPanelChange = jest.fn();
        const wrapper = mount(
          <MomentPicker
            picker={picker as any}
            showTime={showTime}
            onChange={onChange}
            onPanelChange={onPanelChange}
          />,
        );

        wrapper.openPicker();

        function expectPanelChange(dateStr: string, mode: PanelMode) {
          expect(isSame(onPanelChange.mock.calls[0][0], dateStr)).toBeTruthy();
          expect(onPanelChange.mock.calls[0][1]).toEqual(mode);
          onPanelChange.mockReset();
        }

        // Year
        onPanelChange.mockReset();
        wrapper.find(yearBtn).simulate('click');
        expectPanelChange('1990-09-03', 'year');

        // Decade
        onPanelChange.mockReset();
        wrapper.find('.rc-picker-decade-btn').simulate('click');
        expectPanelChange('1990-09-03', 'decade');

        // Next page
        wrapper.find('.rc-picker-header-super-next-btn').simulate('click');

        // Select decade
        wrapper.selectCell('2010-2019');
        expectPanelChange('2010-09-03', 'year');

        // Select year
        wrapper.selectCell('2019');
        expectPanelChange('2019-09-03', 'month');

        // Select month
        wrapper.selectCell('Aug');
        expectPanelChange('2019-08-03', finalMode as any);

        // Select date
        wrapper.selectCell('18');
        expect(onPanelChange).not.toHaveBeenCalled();

        expect(wrapper.find(finalPanel).length).toBeTruthy();

        if (showTime) {
          wrapper.confirmOK();
        }
        wrapper.closePicker();
        expect(isSame(onChange.mock.calls[0][0], '2019-08-18')).toBeTruthy();
      });
    });

    it('time', () => {
      const onChange = jest.fn();
      const onOk = jest.fn();
      const wrapper = mount(
        <MomentPicker picker="time" onChange={onChange} onOk={onOk} />,
      );
      wrapper.openPicker();

      function selectColumn(colIndex: number, rowIndex: number) {
        wrapper
          .find('ul')
          .at(colIndex)
          .find('li')
          .at(rowIndex)
          .simulate('click');
      }

      selectColumn(0, 13);
      selectColumn(1, 22);
      selectColumn(2, 33);

      expect(onOk).not.toHaveBeenCalled();
      wrapper.confirmOK();
      expect(onOk).toHaveBeenCalled();
      expect(
        isSame(onChange.mock.calls[0][0], '1990-09-03 13:22:33', 'second'),
      ).toBeTruthy();
    });
  });

  it('renderExtraFooter', () => {
    const renderExtraFooter = jest.fn(mode => <div>{mode}</div>);
    const wrapper = mount(
      <MomentPicker renderExtraFooter={renderExtraFooter} />,
    );

    function matchFooter(mode: string) {
      expect(wrapper.find('.rc-picker-footer').text()).toEqual(mode);
      expect(
        renderExtraFooter.mock.calls[
          renderExtraFooter.mock.calls.length - 1
        ][0],
      ).toEqual(mode);
    }

    // Date
    wrapper.openPicker();
    matchFooter('date');

    // Month
    wrapper.find('.rc-picker-month-btn').simulate('click');
    wrapper.update();
    matchFooter('month');

    // Year
    wrapper.find('.rc-picker-year-btn').simulate('click');
    wrapper.update();
    matchFooter('year');
  });

  describe('showToday', () => {
    it('only works on date', () => {
      const onSelect = jest.fn();
      const wrapper = mount(<MomentPicker onSelect={onSelect} showToday />);
      wrapper.openPicker();
      wrapper.find('.rc-picker-today-btn').simulate('click');
      expect(isSame(onSelect.mock.calls[0][0], '1990-09-03')).toBeTruthy();
    });

    ['decade', 'year', 'month', 'week'].forEach(name => {
      it(`not works on ${name}`, () => {
        const wrapper = mount(<MomentPicker picker={name as any} showToday />);
        wrapper.openPicker();
        expect(wrapper.find('.rc-picker-today-btn').length).toBeFalsy();
      });
    });
  });

  it('icon', () => {
    const wrapper = mount(
      <MomentPicker
        defaultValue={getMoment('1990-09-03')}
        suffixIcon={<span className="suffix-icon" />}
        clearIcon={<span className="suffix-icon" />}
        allowClear
      />,
    );

    expect(wrapper.find('.rc-picker-input').render()).toMatchSnapshot();
  });

  it('datetime should display now', () => {
    const onSelect = jest.fn();
    const wrapper = mount(<MomentPicker onSelect={onSelect} showTime />);
    wrapper.openPicker();
    wrapper.find('.rc-picker-now > a').simulate('click');

    expect(
      isSame(onSelect.mock.calls[0][0], '1990-09-03 00:00:00', 'second'),
    ).toBeTruthy();
  });

  it('pass data- & aria- & role', () => {
    const wrapper = mount(
      <MomentPicker data-test="233" aria-label="3334" role="search" />,
    );

    expect(wrapper.render()).toMatchSnapshot();
  });

  it('support name prop', () => {
    const wrapper = mount(<MomentPicker name="bamboo" />);

    expect(wrapper.find('input').props().name).toEqual('bamboo');
  });

  it('blur should reset invalidate text', () => {
    const wrapper = mount(<MomentPicker />);
    wrapper.openPicker();
    wrapper.find('input').simulate('change', {
      target: {
        value: 'Invalidate',
      },
    });
    wrapper.closePicker();
    expect(wrapper.find('input').props().value).toEqual('');
  });

  it('should render correctly in rtl', () => {
    const wrapper = mount(<MomentPicker direction="rtl" allowClear />);
    expect(wrapper.render()).toMatchSnapshot();
  });
});

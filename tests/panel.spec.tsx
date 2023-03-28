import { PickerMode } from '@/interface';
import { fireEvent, render } from '@testing-library/react';
import moment, { Moment } from 'moment';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import { resetWarned } from 'rc-util/lib/warning';
import React from 'react';
import enUS from '../src/locale/en_US';
import zhCN from '../src/locale/zh_CN';
import {
  clickButton,
  confirmOK,
  getMoment,
  isSame,
  MomentPickerPanel,
  selectCell,
} from './util/commonUtil';

jest.mock('../src/utils/uiUtil', () => {
  const origin = jest.requireActual('../src/utils/uiUtil');

  return {
    ...origin,
    scrollTo: (...args) => {
      global.scrollCalled = true;
      return origin.scrollTo(...args);
    },
  };
});

describe('Picker.Panel', () => {
  beforeEach(() => {
    global.scrollCalled = false;
    jest.useFakeTimers().setSystemTime(getMoment('1990-09-03 00:00:00').valueOf());
    document.body.innerHTML = '';
  });

  afterAll(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('value', () => {
    it('defaultValue', () => {
      render(<MomentPickerPanel defaultValue={getMoment('2000-01-01')} />);

      expect(document.querySelector('.rc-picker-cell-selected').textContent).toEqual('1');
    });

    it('controlled', () => {
      const onChange = jest.fn();
      const { rerender } = render(
        <MomentPickerPanel value={getMoment('2000-01-01')} onChange={onChange} />,
      );

      selectCell(23);
      expect(isSame(onChange.mock.calls[0][0], '2000-01-23')).toBeTruthy();
      onChange.mockReset();

      // Trigger again since value is controlled
      selectCell(23);
      expect(isSame(onChange.mock.calls[0][0], '2000-01-23')).toBeTruthy();
      onChange.mockReset();

      // Not trigger
      rerender(<MomentPickerPanel value={getMoment('2000-01-23')} onChange={onChange} />);
      selectCell(23);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('uncontrolled', () => {
      const onChange = jest.fn();
      render(<MomentPickerPanel onChange={onChange} />);

      selectCell(23);
      expect(isSame(onChange.mock.calls[0][0], '1990-09-23')).toBeTruthy();
      onChange.mockReset();

      // Not trigger
      selectCell(23);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Panel switch by picker', () => {
    it('year', () => {
      render(<MomentPickerPanel picker="year" />);
      fireEvent.click(document.querySelector('.rc-picker-decade-btn'));
      expect(document.querySelector('.rc-picker-decade-panel')).toBeTruthy();

      selectCell('1990-1999');
      expect(document.querySelector('.rc-picker-year-panel')).toBeTruthy();

      selectCell('1999');
      expect(document.querySelector('.rc-picker-year-panel')).toBeTruthy();
    });

    [
      ['month', 'Aug'],
      ['quarter', 'Q3'],
    ].forEach(([picker, cell]) => {
      it(picker, () => {
        const { container } = render(<MomentPickerPanel picker={picker as any} />);
        fireEvent.click(container.querySelector('.rc-picker-year-btn'));
        fireEvent.click(container.querySelector('.rc-picker-decade-btn'));
        expect(document.querySelector('.rc-picker-decade-panel')).toBeTruthy();

        selectCell('1990-1999');
        expect(document.querySelector('.rc-picker-year-panel')).toBeTruthy();

        selectCell('1999');
        expect(document.querySelector(`.rc-picker-${picker}-panel`)).toBeTruthy();

        selectCell(cell);
        expect(document.querySelector(`.rc-picker-${picker}-panel`)).toBeTruthy();
      });
    });
  });

  it('time click to scroll', () => {
    let scrollTop = 90;

    const domSpy = spyElementPrototypes(HTMLElement, {
      scrollTop: {
        get: () => scrollTop,
        set: ((_: Function, value: number) => {
          scrollTop = value;
        }) as any,
      },
    });

    jest.useFakeTimers();
    const { container } = render(<MomentPickerPanel picker="time" />);

    // Multiple times should only one work
    fireEvent.click(container.querySelector('ul').querySelectorAll('li')[3]);

    fireEvent.click(container.querySelector('ul').querySelectorAll('li')[11]);
    jest.runAllTimers();
    expect(global.scrollCalled).toBeTruthy();

    jest.useRealTimers();

    domSpy.mockRestore();
  });

  describe('click button to switch', () => {
    it('date', () => {
      render(<MomentPickerPanel defaultValue={getMoment('1990-09-03')} />);

      clickButton('prev');
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('Aug1990');

      clickButton('next');
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('Sep1990');

      clickButton('super-prev');
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('Sep1989');

      clickButton('super-next');
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('Sep1990');
    });

    ['month', 'quarter'].forEach((picker) => {
      it(picker, () => {
        render(<MomentPickerPanel defaultValue={getMoment('1990-09-03')} picker={picker as any} />);

        clickButton('super-prev');
        expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('1989');

        clickButton('super-next');
        expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('1990');
      });
    });

    it('year', () => {
      render(<MomentPickerPanel defaultValue={getMoment('1990-09-03')} picker="year" />);

      clickButton('super-prev');
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('1980-1989');

      clickButton('super-next');
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('1990-1999');
    });

    it('decade', () => {
      render(<MomentPickerPanel defaultValue={getMoment('1990-09-03')} mode="decade" />);

      clickButton('super-prev');
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('1800-1899');

      clickButton('super-next');
      expect(document.querySelector('.rc-picker-header-view').textContent).toEqual('1900-1999');
    });
  });

  // This test is safe to remove
  it('showtime', () => {
    const onSelect = jest.fn();
    render(
      <MomentPickerPanel
        showTime={{
          hideDisabledOptions: true,
          showSecond: false,
          defaultValue: getMoment('2001-01-02 01:03:07'),
          disabledHours: () => [0, 1, 2, 3],
        }}
        defaultValue={getMoment('2001-01-02 01:03:07')}
        value={null}
        onSelect={onSelect}
      />,
    );

    expect(document.querySelectorAll('.rc-picker-time-panel-column')).toHaveLength(2);
    expect(
      document.querySelector('.rc-picker-time-panel-column').querySelector('li').textContent,
    ).toEqual('04');

    // Click on date
    selectCell(5);
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-05 01:03:07')).toBeTruthy();

    // Click on time
    onSelect.mockReset();
    fireEvent.click(document.querySelector('ul').querySelectorAll('li')[11]);
    expect(isSame(onSelect.mock.calls[0][0], '2001-01-02 11:00:00')).toBeTruthy();
  });

  it('showTime.defaultValue only works at first render', () => {
    const onSelect = jest.fn();
    render(
      <MomentPickerPanel
        showTime={{
          defaultValue: getMoment('2001-01-02 01:03:07'),
        }}
        onSelect={onSelect}
      />,
    );

    selectCell(5);
    // use showTime.defaultValue
    expect(isSame(onSelect.mock.calls[0][0], '1990-09-05 01:03:07')).toBeTruthy();

    // set hour to 10
    fireEvent.click(document.querySelector('ul').querySelectorAll('li')[10]);

    // expect hour changed
    expect(isSame(onSelect.mock.calls[1][0], '1990-09-05 10:03:07')).toBeTruthy();

    selectCell(20);
    // expect using last selection time
    expect(isSame(onSelect.mock.calls[2][0], '1990-09-20 10:03:07')).toBeTruthy();
  });

  it('DatePicker has defaultValue and showTime.defaultValue ', () => {
    const onSelect = jest.fn();
    render(
      <MomentPickerPanel
        value={getMoment('2001-01-02 10:10:10')}
        showTime={{
          defaultValue: getMoment('2001-01-02 09:09:09'),
        }}
        onSelect={onSelect}
      />,
    );

    selectCell(5);
    // showTime.defaultValue not used
    expect(isSame(onSelect.mock.calls[0][0], '2001-01-05 10:10:10')).toBeTruthy();
  });

  describe('not trigger onSelect when cell disabled', () => {
    it('time', () => {
      const onSelect = jest.fn();
      const { container } = render(
        <MomentPickerPanel picker="time" onSelect={onSelect} disabledHours={() => [0]} />,
      );

      // Disabled
      fireEvent.click(container.querySelectorAll('li')[0]);
      expect(onSelect).not.toHaveBeenCalled();

      // Enabled
      fireEvent.click(container.querySelectorAll('li')[1]);
      expect(onSelect).toHaveBeenCalled();
    });

    it('month', () => {
      const onSelect = jest.fn();
      render(
        <MomentPickerPanel
          picker="month"
          onSelect={onSelect}
          disabledDate={(date) => date.month() === 0}
        />,
      );

      selectCell('Jan');
      expect(onSelect).not.toHaveBeenCalled();

      selectCell('Feb');
      expect(onSelect).toHaveBeenCalled();
    });

    it('year', () => {
      const onSelect = jest.fn();
      render(
        <MomentPickerPanel
          picker="year"
          onSelect={onSelect}
          disabledDate={(date) => date.year() === 1990}
        />,
      );

      selectCell(1990);
      expect(onSelect).not.toHaveBeenCalled();

      selectCell(1993);
      expect(onSelect).toHaveBeenCalled();
    });

    describe('decade', () => {
      it('mode', () => {
        const onPanelChange = jest.fn();
        render(
          <MomentPickerPanel
            mode="decade"
            onPanelChange={onPanelChange}
            disabledDate={(date) => date.year() === 1900}
          />,
        );

        // no picker is decade, it means alway can click
        selectCell('1900-1909');
        expect(onPanelChange).toHaveBeenCalled();

        onPanelChange.mockReset();
        selectCell('1910-1919');
        expect(onPanelChange).toHaveBeenCalled();
      });

      it('not trigger when same panel', () => {
        const onPanelChange = jest.fn();
        render(<MomentPickerPanel onPanelChange={onPanelChange} />);

        selectCell('23');
        expect(onPanelChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('time with use12Hours', () => {
    it('should work', () => {
      const onChange = jest.fn();
      render(
        <MomentPickerPanel
          picker="time"
          defaultValue={getMoment('2000-01-01 00:01:02')}
          use12Hours
          onChange={onChange}
        />,
      );

      const ulList = document.querySelectorAll('.rc-picker-time-panel-column');
      const liList = ulList[ulList.length - 1].querySelectorAll('li');
      fireEvent.click(liList[liList.length - 1]);
      expect(isSame(onChange.mock.calls[0][0], '2000-01-01 12:01:02', 'second')).toBeTruthy();
    });

    it('should display hour from 12 at AM', () => {
      render(
        <MomentPickerPanel
          picker="time"
          defaultValue={getMoment('2000-01-01 00:00:00')}
          use12Hours
        />,
      );

      const startHour = document
        .querySelector('.rc-picker-time-panel-column')
        .querySelectorAll('li')[0].textContent;
      expect(startHour).toEqual('12');
    });

    it('should display hour from 12 at AM', () => {
      render(
        <MomentPickerPanel
          picker="time"
          defaultValue={getMoment('2000-01-01 12:00:00')}
          use12Hours
        />,
      );

      const startHour = document
        .querySelector('.rc-picker-time-panel-column')
        .querySelectorAll('li')[0].textContent;

      expect(startHour).toEqual('12');
    });

    it('should disable AM when 00 ~ 11 is disabled', () => {
      render(
        <MomentPickerPanel
          picker="time"
          defaultValue={getMoment('2000-01-01 12:00:00')}
          use12Hours
          disabledHours={() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
        />,
      );

      expect(document.querySelector('.rc-picker-time-panel-cell-disabled').textContent).toEqual(
        'AM',
      );
    });

    it('should disable PM when 12 ~ 23 is disabled', () => {
      render(
        <MomentPickerPanel
          picker="time"
          defaultValue={getMoment('2000-01-01 12:00:00')}
          use12Hours
          disabledHours={() => [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]}
        />,
      );

      const disabledCells = document.querySelectorAll('.rc-picker-time-panel-cell-disabled');

      expect(disabledCells[disabledCells.length - 1].textContent).toEqual('PM');
    });
  });

  describe('time disabled columns', () => {
    it('basic', () => {
      const { container } = render(
        <MomentPickerPanel
          mode="time"
          disabledHours={() => [0, 1, 2, 3, 4, 5, 6, 7]}
          disabledMinutes={() => [2, 4, 6, 8, 10]}
          disabledSeconds={() => [10, 20, 30, 40, 50]}
        />,
      );

      expect(container).toMatchSnapshot();
    });

    it('use12Hour', () => {
      const disabledMinutes = jest.fn(() => []);
      const disabledSeconds = jest.fn(() => []);

      render(
        <MomentPickerPanel
          mode="time"
          use12Hours
          value={getMoment('2000-01-01 13:07:04')}
          disabledMinutes={disabledMinutes}
          disabledSeconds={disabledSeconds}
        />,
      );

      expect(disabledMinutes).toHaveBeenCalledWith(13);
      expect(disabledSeconds).toHaveBeenCalledWith(13, 7);
    });
  });

  it('warning with invalidate value', () => {
    resetWarned();
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const invalidateDate = moment('notValidate', 'YYYY', true);
    render(<MomentPickerPanel value={invalidateDate} />);
    expect(errSpy).toHaveBeenCalledWith('Warning: Invalidate date pass to `value`.');

    render(<MomentPickerPanel defaultValue={invalidateDate} />);
    expect(errSpy).toHaveBeenCalledWith('Warning: Invalidate date pass to `defaultValue`.');

    errSpy.mockRestore();
  });

  it('should render correctly in rtl', () => {
    const { container } = render(<MomentPickerPanel direction="rtl" />);
    expect(container).toMatchSnapshot();
  });

  describe('hideHeader', () => {
    ['decade', 'year', 'month', 'quarter', 'date', 'time'].forEach((mode) => {
      it(mode, () => {
        render(<MomentPickerPanel mode={mode as any} hideHeader />);
        expect(document.querySelector('.rc-picker-header')).toBeFalsy();
      });
    });
  });

  it('onOk to trigger', () => {
    const onOk = jest.fn();
    const { container } = render(<MomentPickerPanel picker="time" onOk={onOk} />);
    fireEvent.click(
      container.querySelector('.rc-picker-time-panel-column').querySelectorAll('li')[3],
    );

    expect(onOk).not.toHaveBeenCalled();
    confirmOK();
    expect(isSame(onOk.mock.calls[0][0], '1990-09-03 03:00:00')).toBeTruthy();
  });

  it('monthCellRender', () => {
    const { container } = render(
      <MomentPickerPanel picker="month" cellRender={(date) => date.format('YYYY-MM')} />,
    );

    expect(container.querySelector('tbody')).toMatchSnapshot();
  });

  describe('start weekday should be correct', () => {
    [
      { locale: zhCN, startDate: '30' },
      { locale: enUS, startDate: '29' },
    ].forEach(({ locale, startDate }) => {
      it(locale.locale, () => {
        const { container } = render(
          <MomentPickerPanel defaultValue={getMoment('2020-04-02')} locale={locale} />,
        );

        expect(container.querySelector('td').textContent).toEqual(startDate);
      });
    });

    [
      { locale: zhCN, startDate: '24' },
      { locale: enUS, startDate: '1' },
    ].forEach(({ locale, startDate }) => {
      it(`another align test of ${locale.locale}`, () => {
        const { container } = render(
          <MomentPickerPanel defaultValue={getMoment('2020-03-01')} locale={locale} />,
        );

        expect(container.querySelector('td').textContent).toEqual(startDate);
      });
    });

    it('update firstDayOfWeek', () => {
      const defaultFirstDay = moment(enUS.locale).localeData().firstDayOfWeek();
      moment.updateLocale(enUS.locale, {
        week: {
          dow: 5,
        } as any,
      });
      expect(defaultFirstDay).toEqual(0);

      const { container } = render(
        <MomentPickerPanel defaultValue={getMoment('2020-04-02')} locale={enUS} />,
      );

      expect(container.querySelector('td').textContent).toEqual('27');

      moment.updateLocale(enUS.locale, {
        week: {
          dow: defaultFirstDay,
        } as any,
      });
    });
  });

  const supportCellRenderPicker: PickerMode[] = [
    'year',
    'month',
    'date',
    'quarter',
    'week',
    'time',
  ];

  const getCurText = (picker: PickerMode, current: Moment | number) => {
    switch (picker) {
      case 'time':
        return current;
      case 'date':
      case 'year':
      case 'month':
      case 'quarter':
      case 'week':
        return (current as Moment).get(picker);
    }
  };
  supportCellRenderPicker.forEach((picker) => {
    it(`override cell with cellRender in ${picker}`, () => {
      const App = () => (
        <MomentPickerPanel
          picker={picker}
          cellRender={(current) => (
            <div className="customWrapper">{getCurText(picker, current)}</div>
          )}
        />
      );

      const { container } = render(<App />);

      expect(container.querySelector('.customWrapper')).toBeTruthy();
      expect(container.querySelector(`.rc-picker-${picker}-panel`)).toBeTruthy();
      expect(container).toMatchSnapshot();
    });
    it(`append cell with cellRender in ${picker}`, () => {
      const App = () => (
        <MomentPickerPanel
          picker={picker}
          cellRender={(current, info) =>
            React.cloneElement(
              info.originNode,
              {
                ...info.originNode.props,
                className: `${info.originNode.props.className} customInner`,
              },
              <div className="customWrapper">{getCurText(picker, current)}</div>,
            )
          }
        />
      );

      const { container } = render(<App />);

      expect(container.querySelector('.customWrapper')).toBeTruthy();
      expect(container.querySelector('.customInner')).toBeTruthy();
      expect(container.querySelector(`.rc-picker-${picker}-panel`)).toBeTruthy();
      expect(container).toMatchSnapshot();
    });
  });
});

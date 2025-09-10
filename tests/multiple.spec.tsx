/* eslint-disable @typescript-eslint/no-loop-func */
import { fireEvent, render } from '@testing-library/react';
import { resetWarned } from '@rc-component/util/lib/warning';
import React from 'react';
import { DayPicker, getDay, isOpen, openPicker, selectCell } from './util/commonUtil';

const fakeTime = getDay('1990-09-03 00:00:00').valueOf();

describe('Picker.Multiple', () => {
  // let errorSpy: ReturnType<typeof jest.spyOn>;

  beforeAll(() => {
    // errorSpy = jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(fakeTime);
    // errorSpy.mockReset();
    resetWarned();
  });
  afterAll(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('onChange', () => {
    const onChange = jest.fn();
    const onCalendarChange = jest.fn();
    const { container } = render(
      <DayPicker multiple onChange={onChange} onCalendarChange={onCalendarChange} needConfirm />,
    );

    expect(container.querySelector('.rc-picker-multiple')).toBeTruthy();

    openPicker(container);

    // Select 3, 1
    selectCell(3);
    selectCell(1);
    expect(onCalendarChange).toHaveBeenCalledWith(
      expect.anything(),
      ['1990-09-01', '1990-09-03'],
      expect.anything(),
    );

    // Select 5
    selectCell(5);
    expect(onChange).not.toHaveBeenCalled();
    expect(isOpen()).toBeTruthy();

    // Confirm
    fireEvent.click(document.querySelector('.rc-picker-ok button'));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), [
      '1990-09-01',
      '1990-09-03',
      '1990-09-05',
    ]);

    expect(onChange.mock.calls[0][0]).toHaveLength(3);
  });

  it('panel click to remove', () => {
    const onChange = jest.fn();
    const { container } = render(<DayPicker multiple onChange={onChange} needConfirm />);

    openPicker(container);
    selectCell(1);
    selectCell(3);
    selectCell(5);
    selectCell(3);

    // Confirm
    fireEvent.click(document.querySelector('.rc-picker-ok button'));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), ['1990-09-01', '1990-09-05']);
  });

  it('selector remove', () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayPicker
        multiple
        onChange={onChange}
        defaultValue={[getDay('2000-09-03'), getDay('2000-01-28')]}
      />,
    );

    // Click remove icon
    const removeEle = container.querySelector('.rc-picker-selection-item-remove');
    fireEvent.mouseDown(removeEle);
    fireEvent.click(removeEle);
    expect(onChange).toHaveBeenCalledWith(expect.anything(), ['2000-01-28']);
  });

  it('open to remove selector should not trigger onChange', () => {
    const onChange = jest.fn();
    const { container } = render(
      <DayPicker
        multiple
        needConfirm
        onChange={onChange}
        defaultValue={[getDay('2000-09-03'), getDay('2000-01-28')]}
      />,
    );

    openPicker(container);
    expect(container.querySelectorAll('.rc-picker-selection-item')).toHaveLength(2);

    fireEvent.click(container.querySelector('.rc-picker-selection-item-remove'));
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelectorAll('.rc-picker-selection-item')).toHaveLength(1);

    // Confirm
    fireEvent.click(document.querySelector('.rc-picker-ok button'));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), ['2000-01-28']);
  });

  it('hide clearIcon', () => {
    const renderDemo = (allowClear: boolean) => (
      <DayPicker multiple defaultValue={[getDay('2000-01-01')]} allowClear={allowClear} />
    );

    const { container, rerender } = render(renderDemo(true));
    expect(container.querySelector('.rc-picker-clear')).toBeTruthy();

    rerender(renderDemo(false));
    expect(container.querySelector('.rc-picker-clear')).toBeFalsy();
  });

  it('removeIcon', () => {
    const { container } = render(
      <DayPicker
        multiple
        defaultValue={[getDay('2000-01-01')]}
        removeIcon={<span className="custom-remove">Remove</span>}
      />,
    );

    expect(container.querySelector('.custom-remove')).toBeTruthy();
  });

  describe('placeholder', () => {
    it('show placeholder', () => {
      const { container } = render(<DayPicker multiple placeholder="bamboo" />);
      expect(
        container.querySelector<HTMLSpanElement>('.rc-picker-selection-placeholder').textContent,
      ).toBe('bamboo');
    });

    it('hide if has value', () => {
      const { container } = render(
        <DayPicker multiple defaultValue={[getDay('2000-01-01')]} placeholder="bamboo" />,
      );
      expect(
        container.querySelector<HTMLSpanElement>('.rc-picker-selection-placeholder'),
      ).toBeFalsy();
    });
  });
  describe('maxTagPlaceholder', () => {
    it('should not show maxTagPlaceholder when items count is within maxTagCount', () => {
      const maxTagPlaceholder = (omittedValues: any[]) => (
        <span className="custom-max-tag-placeholder">+{omittedValues.length} more</span>
      );

      const { container } = render(
        <DayPicker
          multiple
          maxTagCount={3}
          maxTagPlaceholder={maxTagPlaceholder}
          defaultValue={[getDay('2000-01-01'), getDay('2000-01-02')]}
        />,
      );

      // Should show all items, no placeholder
      expect(container.querySelectorAll('.rc-picker-selection-item')).toHaveLength(2);
      expect(container.querySelector('.custom-max-tag-placeholder')).toBeFalsy();
    });

    it('should show maxTagPlaceholder when items count exceeds maxTagCount', () => {
      const maxTagPlaceholder = (omittedValues: any[]) => (
        <span className="custom-max-tag-placeholder">+{omittedValues.length} items</span>
      );

      const { container } = render(
        <DayPicker
          multiple
          maxTagCount={2}
          maxTagPlaceholder={maxTagPlaceholder}
          defaultValue={[
            getDay('2000-01-01'),
            getDay('2000-01-02'),
            getDay('2000-01-03'),
            getDay('2000-01-04'),
          ]}
        />,
      );

      // Should show maxTagCount items + placeholder
      expect(container.querySelectorAll('.rc-picker-selection-item')).toHaveLength(3);
      expect(container.querySelector('.custom-max-tag-placeholder').textContent).toBe('+2 items');
    });

    it('should work with custom maxTagPlaceholder component', () => {
      const CustomPlaceholder = ({ omittedValues }: { omittedValues: any[] }) => (
        <div className="custom-placeholder-wrapper">
          <span className="omitted-count">{omittedValues.length}</span>
          <span className="omitted-text">hidden dates</span>
        </div>
      );

      const { container } = render(
        <DayPicker
          multiple
          maxTagCount={1}
          maxTagPlaceholder={(omittedValues) => <CustomPlaceholder omittedValues={omittedValues} />}
          defaultValue={[getDay('2000-01-01'), getDay('2000-01-02'), getDay('2000-01-03')]}
        />,
      );

      expect(container.querySelector('.custom-placeholder-wrapper')).toBeTruthy();
      expect(container.querySelector('.omitted-count').textContent).toBe('2');
      expect(container.querySelector('.omitted-text').textContent).toBe('hidden dates');
    });

    it('should handle maxTagCount edge cases1', () => {
      const maxTagPlaceholder = (omittedValues: any[]) => (
        <span className="edge-case-placeholder">+{omittedValues.length}</span>
      );

      // Test maxTagCount = 0
      const { container } = render(
        <DayPicker
          multiple
          maxTagCount={0}
          maxTagPlaceholder={maxTagPlaceholder}
          defaultValue={[getDay('2000-01-01')]}
        />,
      );
      expect(container.querySelectorAll('.rc-picker-selection-item')).toHaveLength(1);
      expect(container.querySelector('.edge-case-placeholder')).toBeTruthy();
      expect(container.querySelector('.edge-case-placeholder').textContent).toBe('+1');
    });

    it('should pass correct omittedValues to maxTagPlaceholder', () => {
      const maxTagPlaceholder = jest.fn((omittedValues) => (
        <span className="test-placeholder">+{omittedValues.length}</span>
      ));

      const values = [
        getDay('2000-01-01'),
        getDay('2000-01-02'),
        getDay('2000-01-03'),
        getDay('2000-01-04'),
      ];

      render(
        <DayPicker
          multiple
          maxTagCount={2}
          maxTagPlaceholder={maxTagPlaceholder}
          defaultValue={values}
        />,
      );

      expect(maxTagPlaceholder).toHaveBeenCalledWith([values[2], values[3]]);
    });
  });

  it('click year panel should not select', () => {
    const onChange = jest.fn();
    const onCalendarChange = jest.fn();
    const { container } = render(
      <DayPicker multiple onChange={onChange} onCalendarChange={onCalendarChange} needConfirm />,
    );

    expect(container.querySelector('.rc-picker-multiple')).toBeTruthy();

    openPicker(container);

    // Select year
    fireEvent.click(document.querySelector('.rc-picker-year-btn'));
    selectCell(1998);
    expect(onChange).not.toHaveBeenCalled();
    expect(onCalendarChange).not.toHaveBeenCalled();

    // Select Month
    selectCell('Oct');
    expect(onChange).not.toHaveBeenCalled();
    expect(onCalendarChange).not.toHaveBeenCalled();

    // Select Date
    selectCell(23);
    expect(onChange).not.toHaveBeenCalled();
    expect(onCalendarChange).toHaveBeenCalledWith(
      expect.anything(),
      ['1998-10-23'],
      expect.anything(),
    );

    // Confirm
    fireEvent.click(document.querySelector('.rc-picker-ok button'));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), ['1998-10-23']);
  });
});

import * as React from 'react';
import type { SharedPanelProps } from '../../interface';
import { formatValue, isSameQuarter } from '../../utils/dateUtil';
import { PanelContext, useInfo } from '../context';
import PanelBody from '../PanelBody';
import PanelHeader from '../PanelHeader';

export default function QuarterPanel<DateType extends object = any>(
  props: SharedPanelProps<DateType>,
) {
  const { prefixCls, locale, generateConfig, pickerValue, onPickerValueChange, onModeChange } =
    props;

  const panelPrefixCls = `${prefixCls}-quarter-panel`;

  // ========================== Base ==========================
  const [info] = useInfo(props, 'quarter');
  const baseDate = generateConfig.setMonth(pickerValue, 0);
  const yearLabel = formatValue(pickerValue, {
    locale,
    format: locale.yearFormat,
    generateConfig,
  });

  // ========================= Cells ==========================
  const getCellDate = (date: DateType, offset: number) => {
    return generateConfig.addMonth(date, offset * 3);
  };

  const getCellText = (date: DateType) => {
    return formatValue(date, {
      locale,
      format: locale.cellQuarterFormat,
      generateConfig,
    });
  };

  const getCellClassName = () => ({
    [`${prefixCls}-cell-in-view`]: true,
  });

  const getCellAttributes = (date: DateType): React.TdHTMLAttributes<HTMLTableCellElement> => {
    if (isSameQuarter(generateConfig, date, generateConfig.getNow())) {
      return { 'aria-current': 'date' };
    }
    return {};
  };

  // ========================= Header =========================
  const yearNode: React.ReactNode = (
    <button
      type="button"
      key="year"
      aria-label={locale.yearSelect}
      onClick={() => {
        onModeChange('year');
      }}
      className={`${prefixCls}-year-btn`}
    >
      {yearLabel}
    </button>
  );

  // ========================= Render =========================
  return (
    <PanelContext.Provider value={info}>
      <div className={panelPrefixCls}>
        {/* Header */}
        <PanelHeader
          superOffset={(distance) => generateConfig.addYear(pickerValue, distance)}
          onChange={onPickerValueChange}
          // Limitation
          getStart={(date) => generateConfig.setMonth(date, 0)}
          getEnd={(date) => generateConfig.setMonth(date, 11)}
          labels={{ superPrev: locale.previousYear, superNext: locale.nextYear }}
        >
          {yearNode}
        </PanelHeader>

        {/* Body */}
        <PanelBody
          {...props}
          titleFormat={locale.fieldQuarterFormat}
          colNum={4}
          rowNum={1}
          baseDate={baseDate}
          tableLabel={yearLabel}
          // Body
          getCellDate={getCellDate}
          getCellText={getCellText}
          getCellClassName={getCellClassName}
          getCellAttributes={getCellAttributes}
        />
      </div>
    </PanelContext.Provider>
  );
}

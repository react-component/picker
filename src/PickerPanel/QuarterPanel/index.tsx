import * as React from 'react';
import type { SharedPanelProps } from '../../interface';
import { formatValue } from '../../utils/dateUtil';
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

  // ========================= Header =========================
  const yearNode: React.ReactNode = (
    <button
      type="button"
      key="year"
      aria-label={locale.yearSelect}
      onClick={() => {
        onModeChange('year');
      }}
      tabIndex={-1}
      className={`${prefixCls}-year-btn`}
    >
      {formatValue(pickerValue, {
        locale,
        format: locale.yearFormat,
        generateConfig,
      })}
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
          // Body
          getCellDate={getCellDate}
          getCellText={getCellText}
          getCellClassName={getCellClassName}
        />
      </div>
    </PanelContext.Provider>
  );
}

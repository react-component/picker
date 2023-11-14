import * as React from 'react';
import { formatValue, isSameMonth } from '../../../utils/dateUtil';
import type { SharedPanelProps } from '../../interface';
import { PanelContext, useInfo } from '../context';
import PanelBody from '../PanelBody';
import PanelHeader from '../PanelHeader';

export default function MonthPanel<DateType = any>(props: SharedPanelProps<DateType>) {
  const {
    prefixCls,
    locale,
    generateConfig,
    pickerValue,
    value,
    onPickerValueChange,
    onModeChange,
    hoverValue,
  } = props;

  const panelPrefixCls = `${prefixCls}-month-panel`;

  // ========================== Base ==========================
  const [info, now] = useInfo(props);
  const baseDate = generateConfig.setMonth(pickerValue, 0);

  // ========================= Month ==========================
  const monthsLocale: string[] =
    locale.shortMonths ||
    (generateConfig.locale.getShortMonths
      ? generateConfig.locale.getShortMonths(locale.locale)
      : []);

  // ========================= Cells ==========================
  const getCellDate = (date: DateType, offset: number) => {
    return generateConfig.addMonth(date, offset);
  };

  const getCellText = (date: DateType) => {
    const month = generateConfig.getMonth(date);

    return locale.monthFormat
      ? formatValue(date, {
          locale,
          format: locale.monthFormat,
          generateConfig,
        })
      : monthsLocale[month];
  };

  const getCellClassName = (date: DateType) => ({
    [`${prefixCls}-cell-in-view`]: true,
    [`${prefixCls}-cell-today`]: isSameMonth(generateConfig, date, now),
    [`${prefixCls}-cell-selected`]: !hoverValue && isSameMonth(generateConfig, date, value),
  });

  // ========================= Header =========================
  const yearNode: React.ReactNode = (
    <button
      type="button"
      key="year"
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
    <PanelContext.Provider
      value={{
        type: 'month',
        ...info,
      }}
    >
      <div className={panelPrefixCls}>
        {/* Header */}
        <PanelHeader
          onOffset={(offset) => {
            onPickerValueChange(generateConfig.addYear(pickerValue, offset));
          }}
        >
          {yearNode}
        </PanelHeader>

        {/* Body */}
        <PanelBody
          {...props}
          mode="month"
          titleFormat={locale.fieldMonthFormat}
          colNum={4}
          rowNum={3}
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

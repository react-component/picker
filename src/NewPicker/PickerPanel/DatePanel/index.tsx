import * as React from 'react';
import { formatValue, getWeekStartDate, isSameDate, isSameMonth } from '../../../utils/dateUtil';
import type { SharedPanelProps } from '../../interface';
import { PanelContext, useInfo } from '../context';
import PanelBody from '../PanelBody';
import PanelHeader from '../PanelHeader';

export default function DatePanel<DateType = any>(props: SharedPanelProps<DateType>) {
  const {
    prefixCls,
    locale,
    generateConfig,
    pickerValue,
    value,
    onPickerValueChange,
    onModeChange,
  } = props;

  // ========================== Base ==========================
  const [info, now] = useInfo(props);
  const baseDate = getWeekStartDate(locale.locale, generateConfig, pickerValue);
  const month = generateConfig.getMonth(pickerValue);

  // ========================= Cells ==========================
  const getCellDate = (date: DateType, offset: number) => {
    return generateConfig.addDate(date, offset);
  };

  const getCellText = (date: DateType) => {
    return generateConfig.getDate(date);
  };

  const getCellClassName = (date: DateType) => ({
    [`${prefixCls}-cell-in-view`]: isSameMonth(generateConfig, date, pickerValue),
    [`${prefixCls}-cell-today`]: isSameDate(generateConfig, date, now),
    [`${prefixCls}-cell-selected`]: isSameDate(generateConfig, date, value),
  });

  // ========================= Header =========================
  const monthsLocale: string[] =
    locale.shortMonths ||
    (generateConfig.locale.getShortMonths
      ? generateConfig.locale.getShortMonths(locale.locale)
      : []);

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
  const monthNode: React.ReactNode = (
    <button
      type="button"
      key="month"
      onClick={() => {
        onModeChange('month');
      }}
      tabIndex={-1}
      className={`${prefixCls}-month-btn`}
    >
      {locale.monthFormat
        ? formatValue(pickerValue, {
            locale,
            format: locale.monthFormat,
            generateConfig,
          })
        : monthsLocale[month]}
    </button>
  );

  const monthYearNodes = locale.monthBeforeYear ? [monthNode, yearNode] : [yearNode, monthNode];

  // ========================= Render =========================
  return (
    <PanelContext.Provider
      value={{
        type: 'date',
        ...info,
      }}
    >
      {/* Header */}
      <PanelHeader
        onOffset={(offset) => {
          onPickerValueChange(generateConfig.addMonth(pickerValue, offset));
        }}
        onSuperOffset={(offset) => {
          onPickerValueChange(generateConfig.addYear(pickerValue, offset));
        }}
      >
        {monthYearNodes}
      </PanelHeader>

      {/* Body */}
      <PanelBody
        colNum={7}
        rowNum={6}
        baseDate={baseDate}
        // Cell
        getCellDate={getCellDate}
        getCellText={getCellText}
        getCellClassName={getCellClassName}
      />
    </PanelContext.Provider>
  );
}

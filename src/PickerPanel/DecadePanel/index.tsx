import * as React from 'react';
import type { DisabledDate, SharedPanelProps } from '../../interface';
import { formatValue } from '../../utils/dateUtil';
import { PanelContext, useInfo } from '../context';
import PanelBody from '../PanelBody';
import PanelHeader from '../PanelHeader';

export default function DecadePanel<DateType extends object = any>(
  props: SharedPanelProps<DateType>,
) {
  const { prefixCls, locale, generateConfig, pickerValue, disabledDate, onPickerValueChange } =
    props;

  const panelPrefixCls = `${prefixCls}-decade-panel`;

  // ========================== Base ==========================
  const [info] = useInfo(props, 'decade');
  const startYear = Math.floor(generateConfig.getYear(pickerValue) / 100) * 100;
  const endYear = startYear + 99;

  const baseDate = generateConfig.setYear(pickerValue, startYear - 10);

  const startYearDate = generateConfig.setYear(baseDate, startYear);
  const endYearDate = generateConfig.setYear(startYearDate, endYear);

  // ========================= Cells ==========================
  const getCellDate = (date: DateType, offset: number) => {
    return generateConfig.addYear(date, offset * 10);
  };

  const getCellText = (date: DateType) => {
    const cellYearFormat = locale.cellYearFormat;

    const startYearStr = formatValue(date, {
      locale,
      format: cellYearFormat,
      generateConfig,
    });
    const endYearStr = formatValue(generateConfig.addYear(date, 9), {
      locale,
      format: cellYearFormat,
      generateConfig,
    });

    return `${startYearStr}-${endYearStr}`;
  };

  const getCellClassName = (date: DateType) => {
    const dateYear = generateConfig.getYear(date);
    return {
      [`${prefixCls}-cell-in-view`]: startYear <= dateYear && dateYear <= endYear,
    };
  };

  // ======================== Disabled ========================
  const mergedDisabledDate: DisabledDate<DateType> = disabledDate
    ? (currentDate, disabledInfo) => {
        // Start
        const baseStartDate = generateConfig.setDate(currentDate, 1);
        const baseStartMonth = generateConfig.setMonth(baseStartDate, 0);
        const baseStartYear = generateConfig.setYear(
          baseStartMonth,
          Math.floor(generateConfig.getYear(baseStartMonth) / 10) * 10,
        );

        // End
        const baseEndYear = generateConfig.addYear(baseStartYear, 10);
        const baseEndDate = generateConfig.addDate(baseEndYear, -1);

        return disabledDate(baseStartYear, disabledInfo) && disabledDate(baseEndDate, disabledInfo);
      }
    : null;

  // ========================= Header =========================
  const yearNode = `${formatValue(startYearDate, {
    locale,
    format: locale.yearFormat,
    generateConfig,
  })}-${formatValue(endYearDate, {
    locale,
    format: locale.yearFormat,
    generateConfig,
  })}`;

  // ========================= Render =========================
  return (
    <PanelContext.Provider value={info}>
      <div className={panelPrefixCls}>
        {/* Header */}
        <PanelHeader
          superOffset={(distance) => generateConfig.addYear(pickerValue, distance * 100)}
          onChange={onPickerValueChange}
        >
          {yearNode}
        </PanelHeader>

        {/* Body */}
        <PanelBody
          {...props}
          disabledDate={mergedDisabledDate}
          colNum={3}
          rowNum={4}
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

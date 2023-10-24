import classNames from 'classnames';
import * as React from 'react';
import { formatValue, isSameDecade } from '../../../utils/dateUtil';
import type { SharedPanelProps } from '../../interface';
import { PanelContext, useInfo } from '../context';
import PanelBody from '../PanelBody';
import PanelHeader from '../PanelHeader';

export default function DecadePanel<DateType = any>(props: SharedPanelProps<DateType>) {
  const { prefixCls, locale, generateConfig, pickerValue, value, onPickerValueChange } = props;

  const panelPrefixCls = `${prefixCls}-decade-panel`;

  // ========================== Base ==========================
  const [info, now] = useInfo(props);
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
    const yearCellFormat = locale.yearCellFormat || 'YYYY';

    const startYearStr = formatValue(date, {
      locale,
      format: yearCellFormat,
      generateConfig,
    });
    const endYearStr = formatValue(generateConfig.addYear(date, 9), {
      locale,
      format: yearCellFormat,
      generateConfig,
    });

    return `${startYearStr} - ${endYearStr}`;
  };

  const getCellClassName = (date: DateType) => {
    const dateYear = generateConfig.getYear(date);
    return {
      [`${prefixCls}-cell-in-view`]: startYear <= dateYear && dateYear <= endYear,
      [`${prefixCls}-cell-today`]: isSameDecade(generateConfig, date, now),
      [`${prefixCls}-cell-selected`]: isSameDecade(generateConfig, date, value),
    };
  };

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
    <PanelContext.Provider
      value={{
        type: 'date',
        ...info,
      }}
    >
      <div
        className={classNames(panelPrefixCls, {
          // [`${panelPrefixCls}-active`]: active,
        })}
      >
        {/* Header */}
        <PanelHeader
          onOffset={(offset) => {
            onPickerValueChange(generateConfig.addYear(pickerValue, offset * 100));
          }}
        >
          {yearNode}
        </PanelHeader>

        {/* Body */}
        <PanelBody
          {...props}
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

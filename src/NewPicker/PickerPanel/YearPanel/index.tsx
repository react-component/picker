import classNames from 'classnames';
import * as React from 'react';
import { formatValue, isSameYear } from '../../../utils/dateUtil';
import type { SharedPanelProps } from '../../interface';
import { PanelContext, useInfo } from '../context';
import PanelBody from '../PanelBody';
import PanelHeader from '../PanelHeader';

export default function YearPanel<DateType = any>(props: SharedPanelProps<DateType>) {
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

  const panelPrefixCls = `${prefixCls}-year-panel`;

  // ========================== Base ==========================
  const [info, now] = useInfo(props);
  const startYear = Math.floor(generateConfig.getYear(pickerValue) / 10) * 10;
  const endYear = startYear + 9;

  const baseDate = generateConfig.setYear(pickerValue, startYear - 1);

  const startYearDate = generateConfig.setYear(baseDate, startYear);
  const endYearDate = generateConfig.setYear(startYearDate, endYear);

  // ========================= Cells ==========================
  const getCellDate = (date: DateType, offset: number) => {
    return generateConfig.addYear(date, offset);
  };

  const getCellText = (date: DateType) => {
    return formatValue(date, {
      locale,
      format: locale.yearCellFormat || 'YYYY',
      generateConfig,
    });
  };

  const getCellClassName = (date: DateType) => {
    const dateYear = generateConfig.getYear(date);
    return {
      [`${prefixCls}-cell-in-view`]: startYear <= dateYear && dateYear <= endYear,
      [`${prefixCls}-cell-today`]: isSameYear(generateConfig, date, now),
      [`${prefixCls}-cell-selected`]: !hoverValue && isSameYear(generateConfig, date, value),
    };
  };

  // ========================= Header =========================
  const yearNode: React.ReactNode = (
    <button
      type="button"
      key="year"
      onClick={() => {
        onModeChange('decade');
      }}
      tabIndex={-1}
      className={`${prefixCls}-decade-btn`}
    >
      {formatValue(startYearDate, {
        locale,
        format: locale.yearFormat,
        generateConfig,
      })}
      -
      {formatValue(endYearDate, {
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
            onPickerValueChange(generateConfig.addYear(pickerValue, offset * 10));
          }}
        >
          {yearNode}
        </PanelHeader>

        {/* Body */}
        <PanelBody
          {...props}
          mode="year"
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

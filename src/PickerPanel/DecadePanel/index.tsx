import * as React from 'react';
import type { SharedPanelProps } from '../../interface';
import { formatValue, isSameDecade } from '../../utils/dateUtil';
import { PanelContext, useInfo } from '../../PickerPanel/context';
import PanelBody from '../../PickerPanel/PanelBody';
import PanelHeader from '../../PickerPanel/PanelHeader';

export default function DecadePanel<DateType extends object = any>(
  props: SharedPanelProps<DateType>,
) {
  const { prefixCls, locale, generateConfig, pickerValue, onPickerValueChange } = props;

  const panelPrefixCls = `${prefixCls}-decade-panel`;

  // ========================== Base ==========================
  const [info, now] = useInfo(props, 'decade');
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
      [`${prefixCls}-cell-today`]: isSameDecade(generateConfig, date, now),
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
    <PanelContext.Provider value={info}>
      <div className={panelPrefixCls}>
        {/* Header */}
        <PanelHeader
          onSuperOffset={(offset) => {
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

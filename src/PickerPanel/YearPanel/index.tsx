import * as React from 'react';
import type { DisabledDate, SharedPanelProps } from '../../interface';
import { formatValue, isSameYear } from '../../utils/dateUtil';
import { PanelContext, useInfo } from '../context';
import PanelBody from '../PanelBody';
import PanelHeader from '../PanelHeader';

export default function YearPanel<DateType extends object = any>(
  props: SharedPanelProps<DateType>,
) {
  const {
    prefixCls,
    locale,
    generateConfig,
    pickerValue,
    disabledDate,
    onPickerValueChange,
    onModeChange,
  } = props;

  const panelPrefixCls = `${prefixCls}-year-panel`;

  // ========================== Base ==========================
  const [info, now] = useInfo(props, 'year');
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
      format: locale.cellYearFormat,
      generateConfig,
    });
  };

  const getCellClassName = (date: DateType) => {
    const dateYear = generateConfig.getYear(date);
    return {
      [`${prefixCls}-cell-in-view`]: startYear <= dateYear && dateYear <= endYear,
      [`${prefixCls}-cell-today`]: isSameYear(generateConfig, date, now),
    };
  };

  // ======================== Disabled ========================
  const mergedDisabledDate: DisabledDate<DateType> = disabledDate
    ? (currentDate, disabledInfo) => {
        // Start
        const startMonth = generateConfig.setMonth(currentDate, 0);
        const startDate = generateConfig.setDate(startMonth, 1);

        // End
        const endMonth = generateConfig.setMonth(
          currentDate,
          generateConfig.getMonth(currentDate) + 1,
        );
        const enDate = generateConfig.addDate(endMonth, -1);

        return disabledDate(startDate, disabledInfo) && disabledDate(enDate, disabledInfo);
      }
    : null;

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
    <PanelContext.Provider value={info}>
      <div className={panelPrefixCls}>
        {/* Header */}
        <PanelHeader
          onSuperOffset={(offset) => {
            onPickerValueChange(generateConfig.addYear(pickerValue, offset * 10));
          }}
        >
          {yearNode}
        </PanelHeader>

        {/* Body */}
        <PanelBody
          {...props}
          disabledDate={mergedDisabledDate}
          titleFormat={locale.fieldYearFormat}
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

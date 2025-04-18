import cls from 'classnames';
import * as React from 'react';
import type { DisabledDate } from '../interface';
import { formatValue, isInRange, isSame } from '../utils/dateUtil';
import { PickerHackContext, usePanelContext } from './context';

export interface PanelBodyProps<DateType = any> {
  rowNum: number;
  colNum: number;
  baseDate: DateType;

  titleFormat?: string;

  // Render
  getCellDate: (date: DateType, offset: number) => DateType;
  getCellText: (date: DateType) => React.ReactNode;
  getCellClassName: (date: DateType) => Record<string, any>;

  disabledDate?: DisabledDate<DateType>;

  // Used for date panel
  headerCells?: React.ReactNode[];

  // Used for week panel
  prefixColumn?: (date: DateType) => React.ReactNode;
  rowClassName?: (date: DateType) => string;
  cellSelection?: boolean;
}

export default function PanelBody<DateType extends object = any>(props: PanelBodyProps<DateType>) {
  const {
    rowNum,
    colNum,
    baseDate,
    getCellDate,
    prefixColumn,
    rowClassName,
    titleFormat,
    getCellText,
    getCellClassName,
    headerCells,
    cellSelection = true,
    disabledDate,
  } = props;

  const {
    prefixCls,
    classNames,
    styles,
    panelType: type,
    now,
    disabledDate: contextDisabledDate,
    cellRender,
    onHover,
    hoverValue,
    hoverRangeValue,
    generateConfig,
    values,
    locale,
    onSelect,
  } = usePanelContext<DateType>();

  const mergedDisabledDate = disabledDate || contextDisabledDate;

  const cellPrefixCls = `${prefixCls}-cell`;

  // ============================= Context ==============================
  const { onCellDblClick } = React.useContext(PickerHackContext);

  // ============================== Value ===============================
  const matchValues = (date: DateType) =>
    values.some(
      (singleValue) => singleValue && isSame(generateConfig, locale, date, singleValue, type),
    );

  // =============================== Body ===============================
  const rows: React.ReactNode[] = [];

  for (let row = 0; row < rowNum; row += 1) {
    const rowNode: React.ReactNode[] = [];
    let rowStartDate: DateType;

    for (let col = 0; col < colNum; col += 1) {
      const offset = row * colNum + col;
      const currentDate = getCellDate(baseDate, offset);

      const disabled = mergedDisabledDate?.(currentDate, {
        type: type,
      });

      // Row Start Cell
      if (col === 0) {
        rowStartDate = currentDate;

        if (prefixColumn) {
          rowNode.push(prefixColumn(rowStartDate));
        }
      }

      // Range
      let inRange = false;
      let rangeStart = false;
      let rangeEnd = false;

      if (cellSelection && hoverRangeValue) {
        const [hoverStart, hoverEnd] = hoverRangeValue;
        inRange = isInRange(generateConfig, hoverStart, hoverEnd, currentDate);
        rangeStart = isSame(generateConfig, locale, currentDate, hoverStart, type);
        rangeEnd = isSame(generateConfig, locale, currentDate, hoverEnd, type);
      }

      // Title
      const title = titleFormat
        ? formatValue(currentDate, {
            locale,
            format: titleFormat,
            generateConfig,
          })
        : undefined;

      // Render
      const inner = <div className={`${cellPrefixCls}-inner`}>{getCellText(currentDate)}</div>;

      rowNode.push(
        <td
          key={col}
          title={title}
          className={cls(cellPrefixCls, classNames.item, {
            [`${cellPrefixCls}-disabled`]: disabled,
            [`${cellPrefixCls}-hover`]: (hoverValue || []).some((date) =>
              isSame(generateConfig, locale, currentDate, date, type),
            ),
            [`${cellPrefixCls}-in-range`]: inRange && !rangeStart && !rangeEnd,
            [`${cellPrefixCls}-range-start`]: rangeStart,
            [`${cellPrefixCls}-range-end`]: rangeEnd,
            [`${prefixCls}-cell-selected`]:
              !hoverRangeValue &&
              // WeekPicker use row instead
              type !== 'week' &&
              matchValues(currentDate),
            ...getCellClassName(currentDate),
          })}
          style={styles.item}
          onClick={() => {
            if (!disabled) {
              onSelect(currentDate);
            }
          }}
          onDoubleClick={() => {
            if (!disabled && onCellDblClick) {
              onCellDblClick();
            }
          }}
          onMouseEnter={() => {
            if (!disabled) {
              onHover?.(currentDate);
            }
          }}
          onMouseLeave={() => {
            if (!disabled) {
              onHover?.(null);
            }
          }}
        >
          {cellRender
            ? cellRender(currentDate, {
                prefixCls,
                originNode: inner,
                today: now,
                type: type,
                locale,
              })
            : inner}
        </td>,
      );
    }

    rows.push(
      <tr key={row} className={rowClassName?.(rowStartDate!)}>
        {rowNode}
      </tr>,
    );
  }

  // ============================== Render ==============================
  return (
    <div className={cls(`${prefixCls}-body`, classNames.body)} style={styles.body}>
      <table className={cls(`${prefixCls}-content`, classNames.content)} style={styles.content}>
        {headerCells && (
          <thead>
            <tr>{headerCells}</tr>
          </thead>
        )}
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

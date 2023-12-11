import classNames from 'classnames';
import * as React from 'react';
import { formatValue, isInRange, isSame } from '../../utils/dateUtil';
import { PanelContext, PickerHackContext } from './context';

export interface PanelBodyProps<DateType = any> {
  rowNum: number;
  colNum: number;
  baseDate: DateType;

  titleFormat?: string;

  // Render
  getCellDate: (date: DateType, offset: number) => DateType;
  getCellText: (date: DateType) => React.ReactNode;
  getCellClassName: (date: DateType) => Record<string, any>;

  // Used for date panel
  headerCells?: React.ReactNode[];

  // Used for week panel
  prefixColumn?: (date: DateType) => React.ReactNode;
  rowClassName?: (date: DateType) => string;
}

export default function PanelBody<DateType = any>(props: PanelBodyProps<DateType>) {
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
  } = props;

  const {
    prefixCls,
    panelType: type,
    now,
    disabledDate,
    cellRender,
    onHover,
    hoverValue,
    generateConfig,
    values,
    locale,
    onSelect,
  } = React.useContext(PanelContext);

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

      const disabled = disabledDate?.(currentDate, {
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

      if (hoverValue) {
        const [hoverStart, hoverEnd] = hoverValue;
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
          className={classNames(cellPrefixCls, {
            [`${cellPrefixCls}-disabled`]: disabled,
            [`${cellPrefixCls}-in-range`]: inRange && !rangeStart && !rangeEnd,
            [`${cellPrefixCls}-range-start`]: rangeStart,
            [`${cellPrefixCls}-range-end`]: rangeEnd,
            [`${prefixCls}-cell-selected`]:
              !hoverValue &&
              // WeekPicker use row instead
              type !== 'week' &&
              matchValues(currentDate),
            ...getCellClassName(currentDate),
          })}
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
    <div className={`${prefixCls}-body`}>
      <table className={`${prefixCls}-content`}>
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

import classNames from 'classnames';
import * as React from 'react';
import { isInRange, isSame } from '../../utils/dateUtil';
import type { PanelMode } from '../interface';
import { PanelContext } from './context';

export interface PanelBodyProps<DateType = any> {
  rowNum: number;
  colNum: number;
  baseDate: DateType;

  titleCell?: (date: DateType) => string;

  // Render
  getCellDate: (date: DateType, offset: number) => DateType;
  getCellText: (date: DateType) => React.ReactNode;
  getCellClassName: (date: DateType) => Record<string, any>;

  // Used for date panel
  headerCells?: React.ReactNode[];

  // Used for week panel
  prefixColumn?: (date: DateType) => React.ReactNode;
  rowClassName?: (date: DateType) => string;

  // Mode
  mode: PanelMode;
}

export default function PanelBody<DateType = any>(props: PanelBodyProps<DateType>) {
  const {
    mode,
    rowNum,
    colNum,
    baseDate,
    getCellDate,
    prefixColumn,
    rowClassName,
    titleCell,
    getCellText,
    getCellClassName,
    headerCells,
  } = props;

  const {
    prefixCls,
    type,
    now,
    disabledDate,
    cellRender,
    onChange,
    onHover,
    hoverValue,
    generateConfig,
    locale,
  } = React.useContext(PanelContext);

  const cellPrefixCls = `${prefixCls}-cell`;

  // =============================== Body ===============================
  const rows: React.ReactNode[] = [];

  for (let row = 0; row < rowNum; row += 1) {
    const rowNode: React.ReactNode[] = [];
    let rowStartDate: DateType;

    for (let col = 0; col < colNum; col += 1) {
      const offset = row * colNum + col;
      const currentDate = getCellDate(baseDate, offset);

      const disabled = disabledDate?.(currentDate, {
        type,
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
        rangeStart = isSame(generateConfig, locale, currentDate, hoverStart, mode);
        rangeEnd = isSame(generateConfig, locale, currentDate, hoverEnd, mode);
      }

      // Render
      const inner = <div className={`${cellPrefixCls}-inner`}>{getCellText(currentDate)}</div>;

      rowNode.push(
        <td
          key={col}
          title={titleCell?.(currentDate)}
          className={classNames(cellPrefixCls, {
            [`${cellPrefixCls}-disabled`]: disabled,
            [`${cellPrefixCls}-in-range`]: inRange && !rangeStart && !rangeEnd,
            [`${cellPrefixCls}-range-start`]: rangeStart,
            [`${cellPrefixCls}-range-end`]: rangeEnd,
            ...getCellClassName(currentDate),
          })}
          onClick={() => {
            if (!disabled) {
              onChange(currentDate);
            }
          }}
          onMouseEnter={() => {
            if (!disabled) {
              onHover(currentDate);
            }
          }}
          onMouseLeave={() => {
            if (!disabled) {
              onHover(null);
            }
          }}
        >
          {cellRender
            ? cellRender(currentDate, {
                prefixCls,
                originNode: inner,
                today: now,
                type,
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

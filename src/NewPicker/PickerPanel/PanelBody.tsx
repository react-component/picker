import classNames from 'classnames';
import * as React from 'react';
import { PrefixClsContext } from '../PickerInput/context';
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
    titleCell,
    getCellText,
    getCellClassName,
  } = props;

  const prefixCls = React.useContext(PrefixClsContext);
  const { type, now, disabledDate, cellRender, onChange } = React.useContext(PanelContext);

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

      if (col === 0) {
        rowStartDate = currentDate;

        if (prefixColumn) {
          rowNode.push(prefixColumn(rowStartDate));
        }
      }

      const inner = <div className={`${cellPrefixCls}-inner`}>{getCellText(currentDate)}</div>;

      rowNode.push(
        <td
          key={col}
          title={titleCell?.(currentDate)}
          className={classNames(cellPrefixCls, {
            [`${cellPrefixCls}-disabled`]: disabled,
            ...getCellClassName(currentDate),
          })}
          onClick={() => {
            if (!disabled) {
              onChange(currentDate);
            }
          }}
          // onMouseEnter={() => {
          //   if (!disabled && onDateMouseEnter) {
          //     onDateMouseEnter(currentDate);
          //   }
          // }}
          // onMouseLeave={() => {
          //   if (!disabled && onDateMouseLeave) {
          //     onDateMouseLeave(currentDate);
          //   }
          // }}
        >
          {cellRender
            ? cellRender(currentDate, {
                originNode: inner,
                today: now,
                // range?: 'start' | 'end';
                type,
                // locale?: Locale;
                // subType?: 'hour' | 'minute' | 'second' | 'meridiem';
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
        {/* {headerCells && (
          <thead>
            <tr>{headerCells}</tr>
          </thead>
        )} */}
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

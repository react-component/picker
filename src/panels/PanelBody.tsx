import * as React from 'react';
import classNames from 'classnames';
import PanelContext from '../PanelContext';

export interface PanelBodyProps<DateType> {
  prefixCls: string;
  disabledDate?: (date: DateType) => boolean;
  onSelect: (value: DateType) => void;

  // By panel
  headerCells?: React.ReactNode;
  rowNum: number;
  colNum: number;
  baseDate: DateType;
  getCellClassName: (date: DateType) => Record<string, boolean | undefined>;
  getCellDate: (date: DateType, offset: number) => DateType;
  getCellText: (date: DateType) => React.ReactNode;
  getCellNode?: (date: DateType) => React.ReactNode;
  titleCell?: (date: DateType) => string;

  // Used for week panel
  prefixColumn?: (date: DateType) => React.ReactNode;
  rowClassName?: (date: DateType) => string;
}

export default function PanelBody<DateType>({
  prefixCls,
  disabledDate,
  onSelect,
  rowNum,
  colNum,
  prefixColumn,
  rowClassName,
  baseDate,
  getCellClassName,
  getCellText,
  getCellNode,
  getCellDate,
  titleCell,
  headerCells,
}: PanelBodyProps<DateType>) {
  const { onDateMouseEnter, onDateMouseLeave } = React.useContext(PanelContext);

  const cellPrefixCls = `${prefixCls}-cell`;

  // =============================== Body ===============================
  const rows: React.ReactNode[] = [];

  for (let i = 0; i < rowNum; i += 1) {
    const row: React.ReactNode[] = [];
    let rowStartDate: DateType;

    for (let j = 0; j < colNum; j += 1) {
      const offset = i * colNum + j;
      const currentDate = getCellDate(baseDate, offset);
      const disabled = disabledDate && disabledDate(currentDate);

      if (j === 0) {
        rowStartDate = currentDate;

        if (prefixColumn) {
          row.push(prefixColumn(rowStartDate));
        }
      }

      row.push(
        <td
          key={j}
          title={titleCell && titleCell(currentDate)}
          className={classNames(cellPrefixCls, {
            [`${cellPrefixCls}-disabled`]: disabled,
            ...getCellClassName(currentDate),
          })}
          onClick={() => {
            if (!disabled) {
              onSelect(currentDate);
            }
          }}
          onMouseEnter={() => {
            if (!disabled && onDateMouseEnter) {
              onDateMouseEnter(currentDate);
            }
          }}
          onMouseLeave={() => {
            if (!disabled && onDateMouseLeave) {
              onDateMouseLeave(currentDate);
            }
          }}
        >
          {getCellNode ? (
            getCellNode(currentDate)
          ) : (
            <div className={`${cellPrefixCls}-inner`}>{getCellText(currentDate)}</div>
          )}
        </td>,
      );
    }

    rows.push(
      <tr key={i} className={rowClassName && rowClassName(rowStartDate!)}>
        {row}
      </tr>,
    );
  }

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

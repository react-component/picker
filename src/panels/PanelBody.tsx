import * as React from 'react';
import classNames from 'classnames';
import PanelContext from '../PanelContext';

export interface PanelBodyProps<DateType> {
  prefixCls: string;
  disabledDate?: (date: DateType) => boolean;
  onSelect: (value: DateType) => void;

  // By panel
  rowCount: number;
  colCount: number;
  baseDate: DateType;
  getCellClassName: (date: DateType) => Record<string, boolean>;
  getCellText: (date: DateType) => React.ReactNode;
  getCellDate: (date: DateType, offset: number) => DateType;
  formatCell: (date: DateType) => string;
}

export default function PanelBody<DateType>({
  prefixCls,
  disabledDate,
  onSelect,
  rowCount,
  colCount,
  baseDate,
  getCellClassName,
  getCellText,
  getCellDate,
  formatCell,
}: PanelBodyProps<DateType>) {
  const { onDateMouseEnter, onDateMouseLeave } = React.useContext(PanelContext);

  const cellPrefixCls = `${prefixCls}-cell`;

  // =============================== Body ===============================
  const rows: React.ReactNode[] = [];

  for (let i = 0; i < rowCount; i += 1) {
    const row: React.ReactNode[] = [];

    for (let j = 0; j < colCount; j += 1) {
      const offset = i * colCount + j;
      const currentDate = getCellDate(baseDate, offset);
      const disabled = disabledDate && disabledDate(currentDate);

      row.push(
        <td
          key={j}
          title={formatCell(currentDate)}
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
          <div className={`${cellPrefixCls}-inner`}>{getCellText(currentDate)}</div>
        </td>,
      );
    }

    rows.push(<tr key={i}>{row}</tr>);
  }

  return (
    <div className={`${prefixCls}-body`}>
      <table className={`${prefixCls}-content`}>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

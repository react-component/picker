import classNames from 'classnames';
import * as React from 'react';
import type { GenerateConfig } from '../generate';
import type { PanelMode } from '../interface';
import PanelContext from '../PanelContext';
import { getCellDateDisabled } from '../utils/dateUtil';
import { getLastDay } from '../utils/timeUtil';

export type PanelBodyProps<DateType> = {
  prefixCls: string;
  disabledDate?: (date: DateType) => boolean;
  onSelect: (value: DateType) => void;
  picker?: PanelMode;

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
  generateConfig: GenerateConfig<DateType>;

  // Used for week panel
  prefixColumn?: (date: DateType) => React.ReactNode;
  rowClassName?: (date: DateType) => string;
};

export default function PanelBody<DateType>({
  prefixCls,
  disabledDate,
  onSelect,
  picker,
  rowNum,
  colNum,
  prefixColumn,
  rowClassName,
  baseDate,
  getCellClassName,
  getCellText,
  getCellNode,
  getCellDate,
  generateConfig,
  titleCell,
  headerCells,
}: PanelBodyProps<DateType>) {
  const { onDateMouseEnter, onDateMouseLeave, mode } = React.useContext(PanelContext);

  const cellPrefixCls = `${prefixCls}-cell`;

  // =============================== Body ===============================
  const rows: React.ReactNode[] = [];

  for (let i = 0; i < rowNum; i += 1) {
    const row: React.ReactNode[] = [];
    let rowStartDate: DateType;

    for (let j = 0; j < colNum; j += 1) {
      const offset = i * colNum + j;
      const currentDate = getCellDate(baseDate, offset);
      const disabled = getCellDateDisabled({
        cellDate: currentDate,
        mode,
        disabledDate,
        generateConfig,
      });

      if (j === 0) {
        rowStartDate = currentDate;

        if (prefixColumn) {
          row.push(prefixColumn(rowStartDate));
        }
      }

      const title = titleCell && titleCell(currentDate);

      row.push(
        <td
          key={j}
          title={title}
          className={classNames(cellPrefixCls, {
            [`${cellPrefixCls}-disabled`]: disabled,
            [`${cellPrefixCls}-start`]:
              getCellText(currentDate) === 1 || (picker === 'year' && Number(title) % 10 === 0),
            [`${cellPrefixCls}-end`]:
              title === getLastDay(generateConfig, currentDate) ||
              (picker === 'year' && Number(title) % 10 === 9),
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

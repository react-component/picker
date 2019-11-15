import * as React from 'react';
import { GenerateConfig } from '../generate';

const DATE_COL_COUNT = 7;
const DATE_ROW_COUNT = 7;

export interface DatePanelProps {
  generateConfig: GenerateConfig;
}

const DatePanel: React.FC<DatePanelProps> = ({ generateConfig }) => {
  const locale = 'zh-cn';
  const weekFirstDay = generateConfig.locale.getWeekFirstDay(locale);

  // Day header
  const headerCells: React.ReactNode[] = [];
  const weekDaysLocale: string[] = generateConfig.locale.getWeekDays(locale);

  for (let i = 0; i < DATE_COL_COUNT; i += 1) {
    headerCells.push(
      <th key={i}>{weekDaysLocale[(i + weekFirstDay) % DATE_COL_COUNT]}</th>,
    );
  }

  // Date content
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < DATE_ROW_COUNT; i += 1) {
    const row: React.ReactNode[] = [];

    for (let j = 0; j < DATE_COL_COUNT; j += 1) {
      row.push(
        <td>
          {i}-{j}
        </td>,
      );
    }

    rows.push(<tr key={i}>{row}</tr>);
  }

  return (
    <table>
      <thead>
        <tr>{headerCells}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};

export default DatePanel;

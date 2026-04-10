import { clsx } from 'clsx';
import * as React from 'react';
import type { DisabledDate } from '../interface';
import { formatValue, isInRange, isSame, isSameMonth } from '../utils/dateUtil';
import { PickerHackContext, usePanelContext } from './context';
import { offsetPanelDate } from '@/PickerInput/hooks/useRangePickerValue';
import { useEvent } from '@rc-component/util';

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
  onChange?: (date: DateType) => void;
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
    onChange,
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

  const [focusDateTime, setFocusDateTime] = React.useState(values?.[values.length - 1] ?? now);

  const cellRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  // ============================= Context ==============================
  const { onCellDblClick } = React.useContext(PickerHackContext);

  // ============================== Value ===============================
  const matchValues = (date: DateType) =>
    values.some(
      (singleValue) => singleValue && isSame(generateConfig, locale, date, singleValue, type),
    );

  // ============================== Event Handlers ===============================

  const moveFocus = (offset: number) => {
    const nextDate = generateConfig.addDate(focusDateTime, offset);
    setFocusDateTime(nextDate);

    const focusElement =
      cellRefs.current[
        formatValue(nextDate, {
          locale,
          format: 'YYYY-MM-DD',
          generateConfig,
        })
      ];
    if (focusElement) {
      requestAnimationFrame(() => {
        focusElement.focus();
      });
    }

    if (type && !isSame(generateConfig, locale, focusDateTime, nextDate, type)) {
      return onChange?.(nextDate);
    }
  };

  const onKeyDown = useEvent((event) => {
    switch (event.key) {
      case 'ArrowRight':
        moveFocus(1);
        break;
      case 'ArrowLeft':
        moveFocus(-1);
        break;
      case 'ArrowDown':
        moveFocus(7);
        break;
      case 'ArrowUp':
        moveFocus(-7);
        break;
      case 'Enter':
        onSelect(focusDateTime);
        break;
      case 'Tab':
        onChange?.(focusDateTime);

      default:
        return;
    }
  });

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

      const isCurrentDateFocused = isSame(generateConfig, locale, currentDate, focusDateTime, type);

      // Render
      const inner = (
        <div
          tabIndex={isCurrentDateFocused ? 0 : -1}
          onKeyDown={onKeyDown}
          className={`${cellPrefixCls}-inner`}
          ref={(element) => {
            cellRefs.current[
              formatValue(currentDate, {
                locale,
                format: 'YYYY-MM-DD',
                generateConfig,
              })
            ] = element;
          }}
        >
          {getCellText(currentDate)}
        </div>
      );

      rowNode.push(
        <td
          key={col}
          title={title}
          className={clsx(cellPrefixCls, classNames.item, {
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
    <div className={clsx(`${prefixCls}-body`, classNames.body)} style={styles.body}>
      <table className={clsx(`${prefixCls}-content`, classNames.content)} style={styles.content}>
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

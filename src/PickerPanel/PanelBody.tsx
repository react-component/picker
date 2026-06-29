import { clsx } from 'clsx';
import * as React from 'react';
import type { DisabledDate } from '../interface';
import { formatValue, isInRange, isSame, isSameDate } from '../utils/dateUtil';
import { PanelFocusContext, PickerHackContext, usePanelContext } from './context';

export interface PanelBodyProps<DateType = any> {
  rowNum: number;
  colNum: number;
  baseDate: DateType;

  titleFormat?: string;

  // Render
  getCellDate: (date: DateType, offset: number) => DateType;
  getCellText: (date: DateType) => React.ReactNode;
  getCellClassName: (date: DateType) => Record<string, any>;
  getCellAttributes: (date: DateType) => React.TdHTMLAttributes<HTMLTableCellElement>;

  disabledDate?: DisabledDate<DateType>;

  // Used for date panel
  headerCells?: React.ReactNode[];

  // Used for week panel
  prefixColumn?: (date: DateType) => React.ReactNode;
  rowClassName?: (date: DateType) => string;
  cellSelection?: boolean;
  tableLabel?: string;
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
    getCellAttributes,
    headerCells,
    cellSelection = true,
    disabledDate,
    tableLabel,
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
  const { focusedDate, onCellFocusedDateChange, focusTrigger } =
    React.useContext(PanelFocusContext);

  // ============================== Focus ===============================
  // Roving tabindex: the active cell carries `tabIndex=0`. We move DOM focus to
  // it imperatively after arrow-key navigation, and when a mode change requests
  // focus via `focusTrigger`. The active cell registers its node via a callback
  // ref, so the effect never needs to query the DOM — and it stays correct even
  // when navigation re-bases the grid to a new month and the active date lands
  // on the same cell position.
  const focusedCellNodeRef = React.useRef<HTMLElement | null>(null);
  const pendingFocusRef = React.useRef(false);

  // A mode change bumps `focusTrigger` (after this panel has mounted). Detect it
  // during render so focus is requested deterministically, regardless of how the
  // mount and the trigger update interleave.
  const lastFocusTriggerRef = React.useRef(focusTrigger);
  if (focusTrigger !== lastFocusTriggerRef.current) {
    lastFocusTriggerRef.current = focusTrigger;
    pendingFocusRef.current = true;
  }

  const registerFocusedCell = React.useCallback((node: HTMLElement | null) => {
    focusedCellNodeRef.current = node;
  }, []);

  React.useEffect(() => {
    if (pendingFocusRef.current) {
      pendingFocusRef.current = false;
      focusedCellNodeRef.current?.focus();
    }
  }, [focusedDate, focusTrigger]);

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

      // Week panel uses isSameWeek which matches all 7 days in a row — use isSameDate
      // so only the specific navigated cell gets tabIndex=0.
      const isFocused =
        !!focusedDate &&
        (type === 'week'
          ? isSameDate(generateConfig, currentDate, focusedDate)
          : isSame(generateConfig, locale, currentDate, focusedDate, type));
      const isSelected =
        !hoverRangeValue &&
        // WeekPicker use row instead
        type !== 'week' &&
        matchValues(currentDate);

      rowNode.push(
        <td
          key={col}
          ref={isFocused ? registerFocusedCell : undefined}
          title={title}
          role="gridcell"
          aria-label={title}
          aria-selected={isSelected}
          aria-disabled={disabled}
          {...getCellAttributes(currentDate)}
          tabIndex={isFocused ? 0 : -1}
          className={clsx(cellPrefixCls, classNames.item, {
            [`${cellPrefixCls}-disabled`]: disabled,
            [`${cellPrefixCls}-hover`]: (hoverValue || []).some((date) =>
              isSame(generateConfig, locale, currentDate, date, type),
            ),
            [`${cellPrefixCls}-in-range`]: inRange && !rangeStart && !rangeEnd,
            [`${cellPrefixCls}-range-start`]: rangeStart,
            [`${cellPrefixCls}-range-end`]: rangeEnd,
            [`${prefixCls}-cell-selected`]: isSelected,
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
          onKeyDown={(e) => {
            switch (e.key) {
              case 'ArrowLeft':
                e.preventDefault();
                pendingFocusRef.current = true;
                onCellFocusedDateChange(getCellDate(currentDate, -1));
                break;
              case 'ArrowRight':
                e.preventDefault();
                pendingFocusRef.current = true;
                onCellFocusedDateChange(getCellDate(currentDate, 1));
                break;
              case 'ArrowUp':
                e.preventDefault();
                pendingFocusRef.current = true;
                onCellFocusedDateChange(getCellDate(currentDate, -colNum));
                break;
              case 'ArrowDown':
                e.preventDefault();
                pendingFocusRef.current = true;
                onCellFocusedDateChange(getCellDate(currentDate, colNum));
                break;
              case 'Enter':
              case ' ':
                e.preventDefault();
                if (!disabled) {
                  onSelect(currentDate);
                }
                break;
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
      <tr key={row} role="row" className={rowClassName?.(rowStartDate!)}>
        {rowNode}
      </tr>,
    );
  }

  // ============================== Render ==============================
  return (
    <div className={clsx(`${prefixCls}-body`, classNames.body)} style={styles.body}>
      <table
        role="grid"
        aria-label={tableLabel}
        className={clsx(`${prefixCls}-content`, classNames.content)}
        style={styles.content}
      >
        {headerCells && (
          <thead aria-hidden="true">
            <tr>{headerCells}</tr>
          </thead>
        )}
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

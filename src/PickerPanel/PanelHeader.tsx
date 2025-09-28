import { clsx } from 'clsx';
import * as React from 'react';
import { isSameOrAfter } from '../utils/dateUtil';
import { PickerHackContext, usePanelContext } from './context';

const HIDDEN_STYLE: React.CSSProperties = {
  visibility: 'hidden',
};

export interface HeaderProps<DateType extends object> {
  offset?: (distance: number, date: DateType) => DateType;
  superOffset?: (distance: number, date: DateType) => DateType;
  onChange?: (date: DateType) => void;

  // Limitation
  getStart?: (date: DateType) => DateType;
  getEnd?: (date: DateType) => DateType;

  children?: React.ReactNode;
}

function PanelHeader<DateType extends object>(props: HeaderProps<DateType>) {
  const {
    offset,
    superOffset,
    onChange,

    getStart,
    getEnd,

    children,
  } = props;

  const {
    prefixCls,
    classNames,
    styles,

    // Icons
    prevIcon = '\u2039',
    nextIcon = '\u203A',
    superPrevIcon = '\u00AB',
    superNextIcon = '\u00BB',

    // Limitation
    minDate,
    maxDate,
    generateConfig,
    locale,
    pickerValue,
    panelType: type,
  } = usePanelContext<DateType>();

  const headerPrefixCls = `${prefixCls}-header`;

  const { hidePrev, hideNext, hideHeader } = React.useContext(PickerHackContext);

  // ======================= Limitation =======================
  const disabledOffsetPrev = React.useMemo(() => {
    if (!minDate || !offset || !getEnd) {
      return false;
    }

    const prevPanelLimitDate = getEnd(offset(-1, pickerValue));

    return !isSameOrAfter(generateConfig, locale, prevPanelLimitDate, minDate, type);
  }, [minDate, offset, pickerValue, getEnd, generateConfig, locale, type]);

  const disabledSuperOffsetPrev = React.useMemo(() => {
    if (!minDate || !superOffset || !getEnd) {
      return false;
    }

    const prevPanelLimitDate = getEnd(superOffset(-1, pickerValue));

    return !isSameOrAfter(generateConfig, locale, prevPanelLimitDate, minDate, type);
  }, [minDate, superOffset, pickerValue, getEnd, generateConfig, locale, type]);

  const disabledOffsetNext = React.useMemo(() => {
    if (!maxDate || !offset || !getStart) {
      return false;
    }

    const nextPanelLimitDate = getStart(offset(1, pickerValue));

    return !isSameOrAfter(generateConfig, locale, maxDate, nextPanelLimitDate, type);
  }, [maxDate, offset, pickerValue, getStart, generateConfig, locale, type]);

  const disabledSuperOffsetNext = React.useMemo(() => {
    if (!maxDate || !superOffset || !getStart) {
      return false;
    }

    const nextPanelLimitDate = getStart(superOffset(1, pickerValue));

    return !isSameOrAfter(generateConfig, locale, maxDate, nextPanelLimitDate, type);
  }, [maxDate, superOffset, pickerValue, getStart, generateConfig, locale, type]);

  // ========================= Offset =========================
  const onOffset = (distance: number) => {
    if (offset) {
      onChange(offset(distance, pickerValue));
    }
  };

  const onSuperOffset = (distance: number) => {
    if (superOffset) {
      onChange(superOffset(distance, pickerValue));
    }
  };

  // ========================= Render =========================
  if (hideHeader) {
    return null;
  }

  const prevBtnCls = `${headerPrefixCls}-prev-btn`;
  const nextBtnCls = `${headerPrefixCls}-next-btn`;
  const superPrevBtnCls = `${headerPrefixCls}-super-prev-btn`;
  const superNextBtnCls = `${headerPrefixCls}-super-next-btn`;

  return (
    <div className={clsx(headerPrefixCls, classNames.header)} style={styles.header}>
      {superOffset && (
        <button
          type="button"
          aria-label={locale.previousYear}
          onClick={() => onSuperOffset(-1)}
          tabIndex={-1}
          className={clsx(
            superPrevBtnCls,
            disabledSuperOffsetPrev && `${superPrevBtnCls}-disabled`,
          )}
          disabled={disabledSuperOffsetPrev}
          style={hidePrev ? HIDDEN_STYLE : {}}
        >
          {superPrevIcon}
        </button>
      )}
      {offset && (
        <button
          type="button"
          aria-label={locale.previousMonth}
          onClick={() => onOffset(-1)}
          tabIndex={-1}
          className={clsx(prevBtnCls, disabledOffsetPrev && `${prevBtnCls}-disabled`)}
          disabled={disabledOffsetPrev}
          style={hidePrev ? HIDDEN_STYLE : {}}
        >
          {prevIcon}
        </button>
      )}
      <div className={`${headerPrefixCls}-view`}>{children}</div>
      {offset && (
        <button
          type="button"
          aria-label={locale.nextMonth}
          onClick={() => onOffset(1)}
          tabIndex={-1}
          className={clsx(nextBtnCls, disabledOffsetNext && `${nextBtnCls}-disabled`)}
          disabled={disabledOffsetNext}
          style={hideNext ? HIDDEN_STYLE : {}}
        >
          {nextIcon}
        </button>
      )}
      {superOffset && (
        <button
          type="button"
          aria-label={locale.nextYear}
          onClick={() => onSuperOffset(1)}
          tabIndex={-1}
          className={clsx(
            superNextBtnCls,
            disabledSuperOffsetNext && `${superNextBtnCls}-disabled`,
          )}
          disabled={disabledSuperOffsetNext}
          style={hideNext ? HIDDEN_STYLE : {}}
        >
          {superNextIcon}
        </button>
      )}
    </div>
  );
}

export default PanelHeader;

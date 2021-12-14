import * as React from 'react';
import classNames from 'classnames';
import KeyCode from 'rc-util/lib/KeyCode';
import type { DatePanelProps } from '../DatePanel';
import DatePanel from '../DatePanel';
import type { WeekPanelProps } from '../WeekPanel';
import WeekPanel from '../WeekPanel';
import { tuple } from '../../utils/miscUtil';
import type { PanelRefProps } from '../../interface';

export type DateweekPanelProps<DateType> = {
  //disabledTime?: DisabledTime<DateType>;
  showWeek?: boolean | WeekPanelProps<DateType>; //SharedTimeProps??
  defaultValue?: DateType;
} & DatePanelProps<DateType>;

const ACTIVE_PANEL = tuple('date', 'week');
type ActivePanelType = typeof ACTIVE_PANEL[number];

function DateweekPanel<DateType>(props: DateweekPanelProps<DateType>) {
  const {
    prefixCls,
    operationRef,
    generateConfig,
    value,
    defaultValue,
    showWeek,
    onSelect,
  } = props;
  const panelPrefixCls = `${prefixCls}-dateweek-panel`;
  const [activePanel, setActivePanel] = React.useState<ActivePanelType | null>(null);

  const dateOperationRef = React.useRef<PanelRefProps>({});
  const weekOperationRef = React.useRef<PanelRefProps>({});

  const weekProps = typeof showWeek === 'object' ? { ...showWeek } : {};

  // ======================= Keyboard =======================
  function getNextActive(offset: number) {
    const activeIndex = ACTIVE_PANEL.indexOf(activePanel!) + offset;
    const nextActivePanel = ACTIVE_PANEL[activeIndex] || null;
    return nextActivePanel;
  }

  const onBlur = (e?: React.FocusEvent<HTMLElement>) => {
    if (weekOperationRef.current.onBlur) {
      weekOperationRef.current.onBlur(e!);
    }
    setActivePanel(null);
  };

  operationRef.current = {
    onKeyDown: (event) => {
      // Switch active panel
      if (event.which === KeyCode.TAB) {
        const nextActivePanel = getNextActive(event.shiftKey ? -1 : 1);
        setActivePanel(nextActivePanel);

        if (nextActivePanel) {
          event.preventDefault();
        }

        return true;
      }

      // Operate on current active panel
      if (activePanel) {
        const ref = activePanel === 'date' ? dateOperationRef : weekOperationRef;

        if (ref.current && ref.current.onKeyDown) {
          ref.current.onKeyDown(event);
        }

        return true;
      }

      // Switch first active panel if operate without panel
      if ([KeyCode.LEFT, KeyCode.RIGHT, KeyCode.UP, KeyCode.DOWN].includes(event.which)) {
        setActivePanel('date');
        return true;
      }

      return false;
    },
    onBlur,
    onClose: onBlur,
  };

  // ======================== Events ========================
  const onInternalSelect = (date: DateType, source: 'date' | 'week') => {
    const selectedDate = date;

    // if (source === 'date' && !value && weekProps.defaultValue) {
    //     // Date with time defaultValue
    //     selectedDate = generateConfig.setHour(
    //         selectedDate,
    //         generateConfig.getHour(weekProps.defaultValue),
    //     );
    //     selectedDate = generateConfig.setMinute(
    //         selectedDate,
    //         generateConfig.getMinute(weekProps.defaultValue),
    //     );
    //     selectedDate = generateConfig.setSecond(
    //         selectedDate,
    //         generateConfig.getSecond(weekProps.defaultValue),
    //     );
    // } else if (source === 'week' && !value && defaultValue) {
    //     selectedDate = generateConfig.setYear(
    //         selectedDate,
    //         generateConfig.getYear(defaultValue),
    //     );
    //     selectedDate = generateConfig.setMonth(
    //         selectedDate,
    //         generateConfig.getMonth(defaultValue),
    //     );
    //     selectedDate = generateConfig.setDate(
    //         selectedDate,
    //         generateConfig.getDate(defaultValue),
    //     );
    // }

    if (onSelect) {
      onSelect(selectedDate, 'mouse');
    }
  };

  // ======================== Render ========================

  return (
    <div
      className={classNames(panelPrefixCls, {
        [`${panelPrefixCls}-active`]: activePanel,
      })}
    >
      <DatePanel
        {...props}
        operationRef={dateOperationRef}
        active={activePanel === 'date'}
        onSelect={(date) => {
          onInternalSelect(date, 'date');
        }}
      />
      <WeekPanel
        {...props}
        {...weekProps}
        //defaultValue={undefined}
        operationRef={weekOperationRef}
        onSelect={(date) => {
          onInternalSelect(date, 'week');
        }}
      />
    </div>
  );
}

export default DateweekPanel;

import * as React from 'react';
import classNames from 'classnames';
import KeyCode from 'rc-util/lib/KeyCode';
import DatePanel, { DatePanelProps } from '../DatePanel';
import TimePanel, { TimePanelProps } from '../TimePanel';
import { tuple } from '../../utils/miscUtil';
import { PanelRefProps, DisabledTime } from '../../interface';

export interface DatetimePanelProps<DateType>
  extends Omit<
    DatePanelProps<DateType> & TimePanelProps<DateType>,
    'disabledHours' | 'disabledMinutes' | 'disabledSeconds'
  > {
  disabledTime?: DisabledTime<DateType>;
}

const ACTIVE_PANEL = tuple('date', 'time');
type ActivePanelType = typeof ACTIVE_PANEL[number];

function DatetimePanel<DateType>(props: DatetimePanelProps<DateType>) {
  const { prefixCls, operationRef, value, disabledTime } = props;
  const panelPrefixCls = `${prefixCls}-datetime-panel`;
  const [activePanel, setActivePanel] = React.useState<ActivePanelType | null>(
    null,
  );

  const dateOperationRef = React.useRef<PanelRefProps>({});
  const timeOperationRef = React.useRef<PanelRefProps>({});

  // ======================= Keyboard =======================
  function getNextActive(offset: number) {
    const activeIndex = ACTIVE_PANEL.indexOf(activePanel!) + offset;
    const nextActivePanel = ACTIVE_PANEL[activeIndex] || null;
    return nextActivePanel;
  }

  const onBlur = (e?: React.FocusEvent<HTMLElement>) => {
    if (timeOperationRef.current.onBlur) {
      timeOperationRef.current.onBlur(e!);
    }
    setActivePanel(null);
  };

  operationRef.current = {
    onKeyDown: event => {
      if (event.which === KeyCode.TAB) {
        const nextActivePanel = getNextActive(event.shiftKey ? -1 : 1);
        setActivePanel(nextActivePanel);

        if (nextActivePanel) {
          event.preventDefault();
        }

        return true;
      }
      if (activePanel) {
        const ref =
          activePanel === 'date' ? dateOperationRef : timeOperationRef;

        if (ref.current && ref.current.onKeyDown) {
          ref.current.onKeyDown(event);
        }

        return true;
      }
      if (
        [KeyCode.LEFT, KeyCode.RIGHT, KeyCode.UP, KeyCode.DOWN].includes(
          event.which,
        )
      ) {
        setActivePanel('date');
        return true;
      }

      return false;
    },
    onBlur,
    onClose: onBlur,
  };

  // ========================= Time =========================
  const disabledTimes = disabledTime ? disabledTime(value || null) : {};

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
      />
      <TimePanel
        {...props}
        {...disabledTimes}
        operationRef={timeOperationRef}
        active={activePanel === 'time'}
      />
    </div>
  );
}

export default DatetimePanel;

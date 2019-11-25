import * as React from 'react';
import classNames from 'classnames';
import TimeHeader from './TimeHeader';
import TimeBody, { BodyOperationRef } from './TimeBody';
import { PanelSharedProps } from '../../interface';
import { createKeyDownHandler } from '../../utils/uiUtil';

export interface DisabledTimes {
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
}

export interface SharedTimeProps extends DisabledTimes {
  format?: string;
  showHour?: boolean;
  showMinute?: boolean;
  showSecond?: boolean;
  use12Hours?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
}

export interface TimePanelProps<DateType>
  extends PanelSharedProps<DateType>,
    SharedTimeProps {
  format?: string;
  active?: boolean;
}

const countBoolean = (boolList: (boolean | undefined)[]) =>
  boolList.filter(bool => bool !== false).length;

function TimePanel<DateType>(props: TimePanelProps<DateType>) {
  const {
    generateConfig,
    format = 'HH:mm:ss',
    prefixCls,
    active,
    operationRef,
    showHour,
    showMinute,
    showSecond,
    use12Hours = false,
    onSelect,
    value,
  } = props;
  const panelPrefixCls = `${prefixCls}-time-panel`;
  const bodyOperationRef = React.useRef<BodyOperationRef>();

  // ======================= Keyboard =======================
  const [activeColumnIndex, setActiveColumnIndex] = React.useState(-1);
  const columnsCount = countBoolean([
    showHour,
    showMinute,
    showSecond,
    use12Hours,
  ]);

  operationRef.current = {
    onKeyDown: event =>
      createKeyDownHandler(event, {
        onLeftRight: diff => {
          setActiveColumnIndex(
            (activeColumnIndex + diff + columnsCount) % columnsCount,
          );
        },
        onUpDown: diff => {
          if (activeColumnIndex === -1) {
            setActiveColumnIndex(0);
          } else if (bodyOperationRef.current) {
            bodyOperationRef.current.onUpDown(diff);
          }
        },
        onEnter: () => {
          onSelect(value || generateConfig.getNow());
          setActiveColumnIndex(-1);
        },
      }),

    onBlur: () => {
      setActiveColumnIndex(-1);
    },
  };

  return (
    <div
      className={classNames(panelPrefixCls, {
        [`${panelPrefixCls}-active`]: active,
      })}
    >
      <TimeHeader {...props} format={format} prefixCls={panelPrefixCls} />
      <TimeBody
        {...props}
        prefixCls={panelPrefixCls}
        activeColumnIndex={activeColumnIndex}
        operationRef={bodyOperationRef}
      />
    </div>
  );
}

export default TimePanel;

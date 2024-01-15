import * as React from 'react';
import PickerPanel, { type PickerPanelProps } from '../../PickerPanel';
import { PickerHackContext, type PickerHackContextProps } from '../../PickerPanel/context';
import PickerContext from '../context';
import { offsetPanelDate } from '../hooks/useRangePickerValue';
import { type FooterProps } from './Footer';

export type MustProp<DateType extends object> = Required<
  Pick<PickerPanelProps<DateType>, 'mode' | 'onPanelChange'>
>;

export type PopupPanelProps<DateType extends object = any> = MustProp<DateType> &
  Omit<PickerPanelProps<DateType>, 'onPickerValueChange' | 'showTime'> &
  FooterProps<DateType> & {
    multiplePanel?: boolean;
    minDate?: DateType;
    maxDate?: DateType;
    range?: boolean;

    onPickerValueChange: (date: DateType) => void;
  };

export default function PopupPanel<DateType extends object = any>(
  props: PopupPanelProps<DateType>,
) {
  const {
    picker,
    multiplePanel,
    pickerValue,
    onPickerValueChange,
    onSubmit,
    minDate,
    maxDate,
    range,
    hoverValue,
  } = props;
  const { prefixCls, generateConfig } = React.useContext(PickerContext);

  // ======================== Offset ========================
  const internalOffsetDate = React.useCallback(
    (date: DateType, offset: number) => {
      return offsetPanelDate(generateConfig, picker, date, offset);
    },
    [generateConfig, picker],
  );

  const nextPickerValue = React.useMemo(
    () => internalOffsetDate(pickerValue, 1),
    [pickerValue, internalOffsetDate],
  );

  // Outside
  const onSecondPickerValueChange = (nextDate: DateType) => {
    onPickerValueChange(internalOffsetDate(nextDate, -1));
  };

  // ======================= Context ========================
  const sharedContext: PickerHackContextProps = {
    onCellDblClick: () => {
      onSubmit();
    },
  };

  const hideHeader = picker === 'time';

  // ====================== Limitation ======================
  const needLimit = React.useCallback(
    (currentPickerValue: DateType) => {
      let hidePrev = false;
      let hideNext = false;

      const dateBeforePickerValue = internalOffsetDate(currentPickerValue, -1);
      if (minDate && generateConfig.isAfter(minDate, dateBeforePickerValue)) {
        hidePrev = true;
      }

      const dateAfterPickerValue = internalOffsetDate(currentPickerValue, 1);
      if (maxDate && generateConfig.isAfter(dateAfterPickerValue, maxDate)) {
        hideNext = true;
      }

      return {
        hidePrev,
        hideNext,
      };
    },
    [minDate, maxDate, internalOffsetDate, generateConfig],
  );

  const firstPanelNeedLimit = React.useMemo(() => needLimit(pickerValue), [pickerValue, needLimit]);
  const secondPanelNeedLimit = React.useMemo(
    () => needLimit(nextPickerValue),
    [nextPickerValue, needLimit],
  );

  // ======================== Props =========================
  const pickerProps = {
    ...props,
    hoverValue: null,
    hoverRangeValue: null,
    hideHeader,
  };

  if (range) {
    pickerProps.hoverRangeValue = hoverValue;
  } else {
    pickerProps.hoverValue = hoverValue;
  }

  // ======================== Render ========================
  // Multiple
  if (multiplePanel) {
    return (
      <div className={`${prefixCls}-panels`}>
        <PickerHackContext.Provider
          value={{ ...sharedContext, hideNext: true, hidePrev: firstPanelNeedLimit.hidePrev }}
        >
          <PickerPanel<DateType> {...pickerProps} />
        </PickerHackContext.Provider>
        <PickerHackContext.Provider
          value={{ ...sharedContext, hidePrev: true, hideNext: secondPanelNeedLimit.hideNext }}
        >
          <PickerPanel<DateType>
            {...pickerProps}
            pickerValue={nextPickerValue}
            onPickerValueChange={onSecondPickerValueChange}
          />
        </PickerHackContext.Provider>
      </div>
    );
  }

  // Single
  return (
    <PickerHackContext.Provider
      value={{
        ...sharedContext,
        ...firstPanelNeedLimit,
      }}
    >
      <PickerPanel {...pickerProps} />
    </PickerHackContext.Provider>
  );
}

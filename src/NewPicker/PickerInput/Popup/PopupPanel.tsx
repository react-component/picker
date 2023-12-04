import * as React from 'react';
import PickerPanel, { type PickerPanelProps } from '../../PickerPanel';
import { PickerHackContext, type PickerHackContextProps } from '../../PickerPanel/context';
import PickerContext from '../context';
import { offsetPanelDate } from '../hooks/useRangePickerValue';
import { type FooterProps } from './Footer';

export type MustProp = Required<Pick<PickerPanelProps, 'mode' | 'onPanelChange'>>;

export type PopupPanelProps<DateType = any> = MustProp &
  PickerPanelProps<DateType> &
  FooterProps<DateType> & {
    multiple?: boolean;
    minDate?: DateType;
    maxDate?: DateType;
  };

export default function PopupPanel<DateType = any>(props: PopupPanelProps<DateType>) {
  const { picker, multiple, pickerValue, onPickerValueChange, onSubmit, minDate, maxDate } = props;
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

  const onNextPickerValueChange = (nextDate: DateType) => {
    onPickerValueChange(internalOffsetDate(nextDate, -1));
  };

  // ======================= Context ========================
  const sharedContext: PickerHackContextProps = {
    onCellDblClick: () => {
      onSubmit();
    },
  };

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

  // ======================== Render ========================
  // Multiple
  if (multiple) {
    return (
      <div className={`${prefixCls}-panels`}>
        <PickerHackContext.Provider
          value={{ ...sharedContext, hideNext: true, hidePrev: firstPanelNeedLimit.hidePrev }}
        >
          <PickerPanel {...props} />
        </PickerHackContext.Provider>
        <PickerHackContext.Provider
          value={{ ...sharedContext, hidePrev: true, hideNext: secondPanelNeedLimit.hideNext }}
        >
          <PickerPanel
            {...props}
            pickerValue={nextPickerValue}
            onPickerValueChange={onNextPickerValueChange}
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
      <PickerPanel {...props} />
    </PickerHackContext.Provider>
  );
}

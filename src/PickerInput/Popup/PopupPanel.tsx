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
    range?: boolean;

    onPickerValueChange: (date: DateType) => void;
  };

export function getPopupPanelSharedContext(
  needConfirm: boolean,
  onSubmit: VoidFunction,
): PickerHackContextProps {
  return {
    onCellDblClick: () => {
      if (needConfirm) {
        onSubmit();
      }
    },
  };
}

export function getPopupPanelPickerProps<DateType extends object = any>(
  props: PopupPanelProps<DateType>,
): PickerPanelProps<DateType> {
  const { picker, hoverValue, range } = props;

  const pickerProps = {
    ...props,
    hoverValue: null,
    hoverRangeValue: null,
    hideHeader: picker === 'time',
  } as PickerPanelProps<DateType>;

  if (range) {
    pickerProps.hoverRangeValue = hoverValue as PickerPanelProps<DateType>['hoverRangeValue'];
  } else {
    pickerProps.hoverValue = hoverValue as PickerPanelProps<DateType>['hoverValue'];
  }

  return pickerProps;
}

export default function PopupPanel<DateType extends object = any>(
  props: PopupPanelProps<DateType>,
) {
  const { picker, multiplePanel, pickerValue, onPickerValueChange, needConfirm, onSubmit } = props;
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
  const sharedContext = getPopupPanelSharedContext(needConfirm, onSubmit);

  // ======================== Props =========================
  const pickerProps = getPopupPanelPickerProps(props);

  // ======================== Render ========================
  // Multiple
  if (multiplePanel) {
    return (
      <div className={`${prefixCls}-panels`}>
        <PickerHackContext.Provider
          value={{
            ...sharedContext,
            hideNext: true,
          }}
        >
          <PickerPanel<DateType> {...pickerProps} />
        </PickerHackContext.Provider>
        <PickerHackContext.Provider
          value={{
            ...sharedContext,
            hidePrev: true,
          }}
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
      }}
    >
      <PickerPanel {...pickerProps} />
    </PickerHackContext.Provider>
  );
}

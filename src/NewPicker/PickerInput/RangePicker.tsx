import { useMergedState } from 'rc-util';
import * as React from 'react';
import { isSameTimestamp } from '../../utils/dateUtil';
import type { OnOpenChange, SharedPickerProps } from '../interface';
import PickerPanel from '../PickerPanel';
import PickerTrigger from '../PickerTrigger';
import { PrefixClsContext } from './context';
import { useFieldFormat } from './hooks/useFieldFormat';
import RangeSelector from './Selector/RangeSelector';

function separateConfig<T>(config: T | [T, T] | null | undefined, defaultConfig: T): [T, T] {
  const singleConfig = config ?? defaultConfig;

  if (Array.isArray(singleConfig)) {
    return singleConfig;
  }

  return [singleConfig, singleConfig];
}

export type RangeValueType<DateType> = [start?: DateType, end?: DateType];

export interface RangePickerProps<DateType> extends SharedPickerProps<DateType> {
  // Value
  value?: RangeValueType<DateType>;
  defaultValue?: RangeValueType<DateType>;
  onChange?: (dates: RangeValueType<DateType>, dateStrings: [string, string]) => void;

  order?: boolean;

  disabled?: boolean | [boolean, boolean];
  allowEmpty?: [boolean, boolean];
}

export default function Picker<DateType = any>(props: RangePickerProps<DateType>) {
  const {
    // Style
    prefixCls = 'rc-picker',
    className,
    style,
    styles = {},
    classNames = {},

    // Value
    value,
    defaultValue,
    onChange,

    order = true,

    disabled,
    allowEmpty,

    // Open
    defaultOpen,
    open,
    onOpenChange,
    popupAlign,
    getPopupContainer,

    // Picker
    locale,
    generateConfig,
    picker = 'date',
    showTime,

    // Format
    format,

    // Motion
    transitionName,

    suffixIcon,
    direction,
  } = props;

  // ======================== Format ========================
  const [formatList, maskFormat] = useFieldFormat(
    picker === 'date' && showTime ? 'datetime' : picker,
    locale,
    format,
  );

  // ======================== Active ========================
  const [activeIndex, setActiveIndex] = React.useState<number>(null);

  // ========================= Open =========================
  const popupPlacement = direction === 'rtl' ? 'bottomRight' : 'bottomLeft';

  const [mergedOpen, setMergeOpen] = useMergedState(defaultOpen || false, {
    value: open,
    onChange: onOpenChange,
  });

  const onSelectorOpenChange: OnOpenChange = (nextOpen, index) => {
    console.log('Open!!!', nextOpen, index, activeIndex);
    setMergeOpen(nextOpen);
  };

  // =================== Disabled & Empty ===================
  const mergedDisabled = separateConfig(disabled, false);
  const mergedAllowEmpty = separateConfig(allowEmpty, true);

  // ======================== Value =========================
  const [mergedValue, setMergedValue] = useMergedState(defaultValue, {
    value,
    postState: (valList): RangeValueType<DateType> => valList || [null, null],
    onChange: (nextValue) => {
      if (onChange) {
        const startEmpty = !nextValue[0];
        const endEmpty = !nextValue[1];

        if (
          // Validate start
          (!startEmpty || mergedAllowEmpty[0]) &&
          // Validate end
          (!endEmpty || mergedAllowEmpty[1])
        ) {
          const nextValueTexts = nextValue.map((date) =>
            date ? generateConfig.locale.format(locale.locale, date, formatList[0]) : '',
          );

          onChange(nextValue, nextValueTexts as [string, string]);
        }
      }
    },
  });

  const onInternalChange = (date: DateType, index: number) => {
    // Trigger change only when date changed
    const [prevStart, prevEnd] = mergedValue;

    const clone: RangeValueType<DateType> = [prevStart, prevEnd];
    clone[index] = date;

    const isSameStart = isSameTimestamp(generateConfig, prevStart, clone[0]);
    const isSameEnd = isSameTimestamp(generateConfig, prevEnd, clone[1]);

    if (!isSameStart || !isSameEnd) {
      setMergedValue(clone);
    }
  };

  // ======================== Panels ========================
  const panel = <PickerPanel {...props} />;

  // ======================== Render ========================
  return (
    <PrefixClsContext.Provider value={prefixCls}>
      <PickerTrigger
        visible={mergedOpen}
        popupElement={panel}
        popupStyle={styles.popup}
        popupClassName={classNames.popup}
        popupAlign={popupAlign}
        getPopupContainer={getPopupContainer}
        transitionName={transitionName}
        popupPlacement={popupPlacement}
        direction={direction}
      >
        <RangeSelector
          // Shared
          {...props}
          // Icon
          suffixIcon={suffixIcon}
          // Active
          focusIndex={activeIndex}
          onFocus={(_, index) => {
            setActiveIndex(index);
          }}
          onBlur={() => {
            setActiveIndex(null);
          }}
          // Change
          value={mergedValue}
          format={formatList}
          maskFormat={maskFormat}
          onChange={onInternalChange}
          // Open
          open={mergedOpen ? activeIndex : null}
          onOpenChange={onSelectorOpenChange}
        />
      </PickerTrigger>
    </PrefixClsContext.Provider>
  );
}

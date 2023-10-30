import { useMergedState } from 'rc-util';
import * as React from 'react';
import { isSameTimestamp } from '../../utils/dateUtil';
import type { OnOpenChange, OpenConfig, SelectorProps, SharedPickerProps } from '../interface';
import PickerPanel from '../PickerPanel';
import PickerTrigger from '../PickerTrigger';
import { PrefixClsContext } from './context';
import { useFieldFormat } from './hooks/useFieldFormat';
import useOpen from './hooks/useOpen';
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

  const [mergedOpen, setMergeOpen] = useOpen(open, defaultOpen, onOpenChange);

  const onSelectorOpenChange: OnOpenChange = (nextOpen, index, config?: OpenConfig) => {
    setMergeOpen(nextOpen, config);
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

  // ======================== Change ========================
  const triggerChange = ([start, end]: RangeValueType<DateType>, source?: 'submit') => {
    const clone: RangeValueType<DateType> = [start, end];

    // Only when exist value to sort
    if (order && source === 'submit' && clone[0] && clone[1]) {
      clone.sort((a, b) => (generateConfig.isAfter(a, b) ? 1 : -1));
    }

    const [prevStart, prevEnd] = mergedValue;
    const isSameStart = isSameTimestamp(generateConfig, prevStart, clone[0]);
    const isSameEnd = isSameTimestamp(generateConfig, prevEnd, clone[1]);

    if (!isSameStart || !isSameEnd) {
      setMergedValue(clone);
    }
  };

  const onSelectorChange = (date: DateType, index: number) => {
    // Trigger change only when date changed
    const [prevStart, prevEnd] = mergedValue;

    const clone: RangeValueType<DateType> = [prevStart, prevEnd];
    clone[index] = date;

    triggerChange(clone);
  };

  // ====================== Focus Blur ======================
  const onSubmit: SelectorProps['onSubmit'] = () => {
    triggerChange(mergedValue, 'submit');
  };

  const onFocus: SelectorProps['onFocus'] = (_, index) => {
    setActiveIndex(index);
  };

  const onBlur: SelectorProps['onBlur'] = () => {
    setActiveIndex(null);
    onSubmit();
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
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmit={onSubmit}
          // Change
          value={mergedValue}
          format={formatList}
          maskFormat={maskFormat}
          onChange={onSelectorChange}
          // Open
          open={mergedOpen ? activeIndex : null}
          onOpenChange={onSelectorOpenChange}
        />
      </PickerTrigger>
    </PrefixClsContext.Provider>
  );
}

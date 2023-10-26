import { useMergedState } from 'rc-util';
import * as React from 'react';
import type { SharedPickerProps } from '../interface';
import PickerPanel from '../PickerPanel';
import PickerTrigger from '../PickerTrigger';
import { PrefixClsContext } from './context';
import { useFieldFormat } from './hooks/useFieldFormat';
import RangeSelector from './Selector/RangeSelector';

export type RangePickerProps = SharedPickerProps;

export default function Picker(props: RangePickerProps) {
  const {
    // Style
    prefixCls = 'rc-picker',
    className,
    style,
    styles = {},
    classNames = {},

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

  // ========================= Open =========================
  const [mergedOpen, setMergeOpen] = useMergedState(defaultOpen || false, {
    value: open,
    onChange: onOpenChange,
  });

  const popupPlacement = direction === 'rtl' ? 'bottomRight' : 'bottomLeft';

  // ========================= Mode =========================
  const [formatList, maskFormat] = useFieldFormat(
    picker === 'date' && showTime ? 'datetime' : picker,
    locale,
    format,
  );

  // ======================== Active ========================
  const [focusIndex, setFocusIndex] = React.useState<number>(null);

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
          locale={locale}
          generateConfig={generateConfig}
          format={maskFormat}
          focusIndex={focusIndex}
          suffixIcon={suffixIcon}
          onFocus={(_, index) => {
            setFocusIndex(index);
          }}
          onBlur={() => {
            setFocusIndex(null);
          }}
        />
      </PickerTrigger>
    </PrefixClsContext.Provider>
  );
}

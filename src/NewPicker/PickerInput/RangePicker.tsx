import { useMergedState } from 'rc-util';
import * as React from 'react';
import type { OnOpenChange, SharedPickerProps } from '../interface';
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

  // ======================== Active ========================
  const [activeIndex, setActiveIndex] = React.useState<number>(null);

  // ========================= Open =========================
  const popupPlacement = direction === 'rtl' ? 'bottomRight' : 'bottomLeft';

  const [mergedOpen, setMergeOpen] = useMergedState(defaultOpen || false, {
    value: open,
    onChange: onOpenChange,
  });

  const onSelectorOpenChange: OnOpenChange = (nextOpen, index) => {
    setMergeOpen(nextOpen);
  };

  // ========================= Mode =========================
  const [formatList, maskFormat] = useFieldFormat(
    picker === 'date' && showTime ? 'datetime' : picker,
    locale,
    format,
  );

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
          focusIndex={activeIndex}
          suffixIcon={suffixIcon}
          onFocus={(_, index) => {
            setActiveIndex(index);
          }}
          onBlur={() => {
            setActiveIndex(null);
          }}
          // Open
          open={mergedOpen ? activeIndex : null}
          onOpenChange={onSelectorOpenChange}
        />
      </PickerTrigger>
    </PrefixClsContext.Provider>
  );
}

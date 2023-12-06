import * as React from 'react';
import { fillLocale } from '../../hooks/useLocale';
import { getTimeConfig } from '../../hooks/useTimeConfig';
import type { InternalMode } from '../../interface';
import type { RangePickerProps } from '../RangePicker';
import { fillClearIcon } from '../Selector/hooks/useClearIcon';

type PickedProps<DateType extends object = any> = Pick<
  RangePickerProps<DateType>,
  | 'locale'
  | 'picker'
  | 'prefixCls'
  | 'styles'
  | 'classNames'
  | 'order'
  | 'components'
  | 'clearIcon'
  | 'allowClear'
  | 'needConfirm'
> & {
  // RangePicker showTime definition is different with Picker
  showTime?: any;
};

type ExcludeBooleanType<T> = T extends boolean ? never : T;

/**
 * Align the outer props with unique typed and fill undefined props.
 * This is shared with both RangePicker and Picker.
 * This will auto handle the legacy props fill like `clearIcon` + `allowClear` = `clearIcon`
 */
export default function useFilledProps<
  DateType extends object,
  InProps extends PickedProps<DateType>,
  UpdaterProps extends object,
>(
  props: InProps,
  updater?: () => UpdaterProps,
): [
  filledProps: Omit<InProps, keyof UpdaterProps | 'showTime'> &
    UpdaterProps & {
      showTime?: ExcludeBooleanType<InProps['showTime']>;
    },
  internalPicker: InternalMode,
  complexPicker: boolean,
] {
  const {
    locale,
    picker = 'date',
    prefixCls = 'rc-picker',
    styles = {},
    classNames = {},
    order = true,
    components = {},
    allowClear,
    clearIcon,
    needConfirm,
  } = props;

  const filledProps = React.useMemo(
    () => ({
      ...props,
      prefixCls,
      locale: fillLocale(locale),
      picker,
      styles,
      classNames,
      order,
      components,
      clearIcon: fillClearIcon(prefixCls, allowClear, clearIcon),
      showTime: getTimeConfig(props),
      ...updater?.(),
    }),
    [props],
  );

  // ======================== Picker ========================
  /** Almost same as `picker`, but add `datetime` for `date` with `showTime` */
  const internalPicker: InternalMode =
    picker === 'date' && filledProps.showTime ? 'datetime' : picker;

  /** The picker is `datetime` or `time` */
  const complexPicker = internalPicker === 'time' || internalPicker === 'datetime';
  const mergedNeedConfirm = needConfirm ?? complexPicker;

  // ======================== Merged ========================
  const mergedProps = React.useMemo(
    () => ({
      ...filledProps,
      needConfirm: mergedNeedConfirm,
    }),
    [filledProps, mergedNeedConfirm],
  );

  return [mergedProps, internalPicker, complexPicker];
}

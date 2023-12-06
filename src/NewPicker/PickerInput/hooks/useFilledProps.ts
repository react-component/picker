import * as React from 'react';
import { fillLocale } from '../../hooks/useLocale';
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
>;

/** Align the outer props with unique typed and fill undefined props */
/**
 * Align the outer props with unique typed and fill undefined props.
 * This will auto handle the legacy props fill like `clearIcon` + `allowClear` = `clearIcon`
 */
export default function useFilledProps<
  DateType extends object = any,
  InProps extends PickedProps<DateType> = PickedProps<DateType>,
  UpdaterProps = any,
>(props: InProps, updater?: () => UpdaterProps): Omit<InProps, keyof UpdaterProps> & UpdaterProps {
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
      ...updater?.(),
    }),
    [props],
  );

  return filledProps;
}

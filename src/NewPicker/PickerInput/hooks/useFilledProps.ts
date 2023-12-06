import * as React from 'react';
import useLocale from '../../hooks/useLocale';
import type { RangePickerProps } from '../RangePicker';

type PickedProps<DateType extends object = any> = Pick<
  RangePickerProps<DateType>,
  'locale' | 'picker' | 'prefixCls' | 'styles' | 'classNames' | 'order' | 'components'
>;

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
  } = props;

  const filledLocale = useLocale(locale);

  const filledProps = React.useMemo(
    () => ({
      ...props,
      prefixCls,
      locale: filledLocale,
      picker,
      styles,
      classNames,
      order,
      components,
      ...updater?.(),
    }),
    [props],
  );

  return filledProps;
}

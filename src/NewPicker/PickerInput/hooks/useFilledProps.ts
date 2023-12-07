import * as React from 'react';
import { toArray } from '../../../utils/miscUtil';
import { fillLocale } from '../../hooks/useLocale';
import { getTimeConfig } from '../../hooks/useTimeConfig';
import type { FormatType, InternalMode } from '../../interface';
import type { RangePickerProps } from '../RangePicker';
import { fillClearIcon } from '../Selector/hooks/useClearIcon';
import useDisabledBoundary from './useDisabledBoundary';
import { useFieldFormat } from './useFieldFormat';
import useInputReadOnly from './useInputReadOnly';
import useInvalidate from './useInvalidate';

type UseInvalidate<DateType extends object = any> = typeof useInvalidate<DateType>;

type PickedProps<DateType extends object = any> = Pick<
  RangePickerProps<DateType>,
  | 'generateConfig'
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
  | 'format'
  | 'inputReadOnly'
  | 'disabledDate'
  | 'minDate'
  | 'maxDate'
> & {
  multiple?: boolean;
  // RangePicker showTime definition is different with Picker
  showTime?: any;
  value?: any;
  defaultValue?: any;
  pickerValue?: any;
  defaultPickerValue?: any;
};

type ExcludeBooleanType<T> = T extends boolean ? never : T;

type GetGeneric<T> = T extends PickedProps<infer U> ? U : never;

type ToArrayType<T, DateType> = T extends any[] ? T : DateType[];

function useArrayIfNeeded<T>(value: T | T[]) {
  const values = React.useMemo(() => (value ? toArray(value) : value), [value]);
  return values;
}

/**
 * Align the outer props with unique typed and fill undefined props.
 * This is shared with both RangePicker and Picker. This will do:
 * - Convert `value` & `defaultValue` to array
 * - handle the legacy props fill like `clearIcon` + `allowClear` = `clearIcon`
 */
export default function useFilledProps<
  InProps extends PickedProps,
  DateType extends GetGeneric<InProps>,
  UpdaterProps extends object,
>(
  props: InProps,
  updater?: () => UpdaterProps,
): [
  filledProps: Omit<InProps, keyof UpdaterProps | 'showTime' | 'value' | 'defaultValue'> &
    UpdaterProps & {
      showTime?: ExcludeBooleanType<InProps['showTime']>;
      value?: ToArrayType<InProps['value'], DateType>;
      defaultValue?: ToArrayType<InProps['value'], DateType>;
      pickerValue?: ToArrayType<InProps['value'], DateType>;
      defaultPickerValue?: ToArrayType<InProps['value'], DateType>;
    },
  internalPicker: InternalMode,
  complexPicker: boolean,
  formatList: FormatType<DateType>[],
  maskFormat: string,
  isInvalidateDate: ReturnType<UseInvalidate<DateType>>,
] {
  const {
    generateConfig,
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
    multiple,
    format,
    inputReadOnly,
    disabledDate,
    minDate,
    maxDate,

    value,
    defaultValue,
    pickerValue,
    defaultPickerValue,
  } = props;

  const values = useArrayIfNeeded(value);
  const defaultValues = useArrayIfNeeded(defaultValue);
  const pickerValues = useArrayIfNeeded(pickerValue);
  const defaultPickerValues = useArrayIfNeeded(defaultPickerValue);

  const mergedLocale = fillLocale(locale);
  const mergedShowTime = getTimeConfig(props);

  const filledProps = React.useMemo(
    () => ({
      ...props,
      prefixCls,
      locale: mergedLocale,
      picker,
      styles,
      classNames,
      order,
      components,
      clearIcon: fillClearIcon(prefixCls, allowClear, clearIcon),
      showTime: mergedShowTime,
      value: values,
      defaultValue: defaultValues,
      pickerValue: pickerValues,
      defaultPickerValue: defaultPickerValues,
      ...updater?.(),
    }),
    [props],
  );

  // ======================== Picker ========================
  /** Almost same as `picker`, but add `datetime` for `date` with `showTime` */
  const internalPicker: InternalMode =
    picker === 'date' && filledProps.showTime ? 'datetime' : picker;

  /** The picker is `datetime` or `time` */
  const complexPicker = internalPicker === 'time' || internalPicker === 'datetime' || multiple;
  const mergedNeedConfirm = needConfirm ?? complexPicker;

  // ======================== Format ========================
  const [formatList, maskFormat] = useFieldFormat<DateType>(internalPicker, mergedLocale, format);

  // ======================= ReadOnly =======================
  const mergedInputReadOnly = useInputReadOnly(formatList, inputReadOnly);

  // ======================= Boundary =======================
  const disabledBoundaryDate = useDisabledBoundary(
    generateConfig,
    locale,
    disabledDate,
    minDate,
    maxDate,
  );

  // ====================== Invalidate ======================
  const isInvalidateDate = useInvalidate(generateConfig, picker, disabledDate, mergedShowTime);

  // ======================== Merged ========================
  const mergedProps = React.useMemo(
    () => ({
      ...filledProps,
      needConfirm: mergedNeedConfirm,
      inputReadOnly: mergedInputReadOnly,
      disabledDate: disabledBoundaryDate,
    }),
    [filledProps, mergedNeedConfirm, mergedInputReadOnly, disabledBoundaryDate],
  );

  return [mergedProps, internalPicker, complexPicker, formatList, maskFormat, isInvalidateDate];
}

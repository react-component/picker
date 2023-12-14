import pickAttrs from 'rc-util/lib/pickAttrs';
import * as React from 'react';
import { formatValue } from '../../../../utils/dateUtil';
import type { SelectorProps } from '../../../interface';
import type { InputProps } from '../Input';

export default function useInputProps<DateType extends object = any>(
  props: Pick<
    SelectorProps,
    | 'maskFormat'
    | 'format'
    | 'generateConfig'
    | 'locale'
    | 'changeOnBlur'
    | 'inputReadOnly'
    | 'required'
    | 'aria-required'
    | 'onSubmit'
    | 'onFocus'
    | 'onBlur'
    | 'onInputChange'
    | 'onInvalid'
    | 'onOpenChange'
    | 'onKeyDown'
    | 'onChange'
    | 'activeHelp'
    | 'name'
    | 'autoComplete'
  > & {
    id?: string | string[];
    value?: DateType[];
    invalid?: boolean | [boolean, boolean];
    placeholder?: string | [string, string];
    disabled?: boolean | [boolean, boolean];

    // RangePicker only
    allHelp: boolean;
    activeIndex?: number | null;
  },
  /** Used for SinglePicker */
  postProps?: (info: { valueTexts: string[] }) => Partial<InputProps>,
) {
  const {
    format,
    maskFormat,
    generateConfig,
    locale,
    changeOnBlur,
    inputReadOnly,
    required,
    'aria-required': ariaRequired,
    onSubmit,
    onFocus,
    onBlur,
    onInputChange,
    onInvalid,
    onOpenChange,
    onKeyDown,
    onChange,
    activeHelp,
    name,
    autoComplete,

    id,
    value,
    invalid,
    placeholder,
    disabled,
    activeIndex,
    allHelp,
  } = props;

  // ======================== Parser ========================
  const parseDate = (str: string, formatStr: string) => {
    const parsed = generateConfig.locale.parse(locale.locale, str, [formatStr]);
    return parsed && generateConfig.isValidate(parsed) ? parsed : null;
  };

  // ========================= Text =========================
  const firstFormat = format[0];

  const getText = React.useCallback(
    (date: DateType) =>
      formatValue(date, {
        locale,
        format: firstFormat,
        generateConfig,
      }),
    [locale, generateConfig, firstFormat],
  );

  const valueTexts = React.useMemo(() => value.map(getText), [value, getText]);

  // ======================= Validate =======================
  const validateFormat = (text: string) => {
    for (let i = 0; i < format.length; i += 1) {
      const singleFormat = format[i];

      // Only support string type
      if (typeof singleFormat === 'string') {
        const parsed = parseDate(text, singleFormat);

        if (parsed) {
          return parsed;
        }
      }
    }

    return false;
  };

  // ======================== Input =========================
  const getInputProps = (index?: number): InputProps => {
    function getProp<T>(propValue: T | T[]): T {
      return index !== undefined ? propValue[index] : propValue;
    }

    const pickedAttrs = pickAttrs(props, {
      aria: true,
      data: true,
    });

    const inputProps = {
      ...pickedAttrs,

      // ============== Shared ==============
      format: maskFormat,
      validateFormat: (text) => !!validateFormat(text),
      changeOnBlur,

      readOnly: inputReadOnly,

      required,
      'aria-required': ariaRequired,

      name,

      autoComplete,

      // ============= By Index =============
      id: getProp(id),

      value: getProp(valueTexts) || '',

      invalid: getProp(invalid),

      placeholder: getProp(placeholder),

      active: activeIndex === index,

      helped: allHelp || (activeHelp && activeIndex === index),

      disabled: getProp(disabled),

      onFocus: (event) => {
        onFocus(event, index);
      },
      onBlur: (event) => {
        // Blur do not trigger close
        // Since it may focus to the popup panel
        onBlur(event, index);
      },

      onSubmit,

      // Get validate text value
      onChange: (text) => {
        onInputChange();

        const parsed = validateFormat(text);

        if (parsed) {
          onInvalid(false, index);
          onChange(parsed, index);
          return;
        }

        // Tell outer that the value typed is invalid.
        // If text is empty, it means valid.
        onInvalid(!!text, index);
      },
      onHelp: () => {
        onOpenChange(true, {
          index,
        });
      },
      onKeyDown: (event) => {
        switch (event.key) {
          case 'Escape':
            onOpenChange(false, {
              index,
            });
            break;
        }

        onKeyDown?.(event);
      },

      // ============ Post Props ============
      ...postProps?.({
        valueTexts,
      }),
    };

    // ============= CleanEmpty =============
    const cleanProps = { ...inputProps };

    Object.keys(cleanProps).forEach((key) => {
      if (cleanProps[key] === undefined) {
        delete cleanProps[key];
      }
    });

    return cleanProps;
  };

  return getInputProps;
}

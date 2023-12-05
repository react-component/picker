import type { SelectorProps } from '../../../interface';
import type { InputProps } from '../Input';

export default function useInputProps(
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
  >,
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
  } = props;

  // ======================== Parser ========================
  const parseDate = (str: string, formatStr: string) => {
    const parsed = generateConfig.locale.parse(locale.locale, str, [formatStr]);
    return parsed && generateConfig.isValidate(parsed) ? parsed : null;
  };

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
  const getInputProps = (index: number): InputProps => {
    return {
      // ============== Shared ==============
      format: maskFormat,
      validateFormat: (text) => !!validateFormat(text),
      changeOnBlur,

      readOnly: inputReadOnly,

      required,
      'aria-required': ariaRequired,

      // ============= By Index =============
      id: ids[index],

      value: valueTexts[index],

      invalid: invalid[index],

      placeholder: (placeholder || [])[index],

      active: activeIndex === index,

      helped: allHelp || (activeHelp && activeIndex === index),

      disabled: disabled[index],

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
          onInvalid(index, false);
          onChange(parsed, index);
          return;
        }

        // Tell outer that the value typed is invalid.
        // If text is empty, it means valid.
        onInvalid(index, !!text);
      },
      onHelp: () => {
        onOpenChange(true);
      },
      onKeyDown: (event) => {
        switch (event.key) {
          case 'Escape':
            onOpenChange(false);
            break;
        }

        onKeyDown?.(event);
      },
    };
  };

  return getInputProps;
}

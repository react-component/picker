import classNames from 'classnames';
import * as React from 'react';
import type { SelectorProps, SelectorRef } from '../../interface';
import { PrefixClsContext } from '../context';
import Icon from './Icon';
import Input from './Input';

export interface RangeSelectorProps extends SelectorProps {
  separator?: React.ReactNode;
}

const RangeSelector = React.forwardRef<SelectorRef, RangeSelectorProps>((props, ref) => {
  const {
    suffixIcon,
    separator = '~',
    focusIndex,
    onFocus,
    onBlur,
    format,
    locale,
    generateConfig,
  } = props;

  // ======================== Prefix ========================
  const prefixCls = React.useContext(PrefixClsContext);

  // ========================= Refs =========================
  const rootRef = React.useRef<HTMLDivElement>();
  const inputRef = React.useRef<HTMLInputElement>();

  React.useImperativeHandle(ref, () => ({
    nativeElement: rootRef.current,
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }));

  // ======================== Render ========================
  const sharedInputProps = {
    format,
    validateFormat: (str: string, formatStr: string) => {
      const parsed = generateConfig.locale.parse(locale.locale, str, [formatStr]);
      return parsed && generateConfig.isValidate(parsed);
    },
  };

  return (
    <div
      className={classNames(prefixCls, `${prefixCls}-range`, {
        [`${prefixCls}-focused`]: focusIndex !== null,
      })}
      ref={rootRef}
    >
      <Input
        ref={inputRef}
        {...sharedInputProps}
        active={focusIndex === 0}
        onFocus={(event) => {
          onFocus(event, 0);
        }}
        onBlur={(event) => {
          onBlur(event, 0);
        }}
      />
      <div className={`${prefixCls}-range-separator`}>{separator}</div>
      <Input
        {...sharedInputProps}
        active={focusIndex === 1}
        onFocus={(event) => {
          onFocus(event, 1);
        }}
        onBlur={(event) => {
          onBlur(event, 1);
        }}
      />
      <Icon type="suffix" icon={suffixIcon} />
    </div>
  );
});

if (process.env.NODE_ENV !== 'production') {
  RangeSelector.displayName = 'RangeSelector';
}

export default RangeSelector;

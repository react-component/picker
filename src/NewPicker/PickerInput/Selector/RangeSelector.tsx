import classNames from 'classnames';
import * as React from 'react';
import type { SelectorProps, SelectorRef } from '../../interface';
import { PrefixClsContext } from '../context';
import Icon from './Icon';
import Input, { InputProps } from './Input';

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

    // Open
    open,
    onOpenChange,
  } = props;

  // ======================== Prefix ========================
  const prefixCls = React.useContext(PrefixClsContext);

  // ========================= Refs =========================
  const rootRef = React.useRef<HTMLDivElement>();
  const inputStartRef = React.useRef<HTMLInputElement>();
  const inputEndRef = React.useRef<HTMLInputElement>();

  React.useImperativeHandle(ref, () => ({
    nativeElement: rootRef.current,
    focus: () => inputStartRef.current?.focus(),
    blur: () => inputStartRef.current?.blur(),
  }));

  // ========================= Open =========================
  const triggerOpen = (nextOpen: boolean, index: number) => {
    if (open === index) {
      onOpenChange(nextOpen, index);
    }
  };

  // ======================== Render ========================
  const sharedInputProps = {};

  const getInputProps = (index: number): InputProps => ({
    // Shared
    format,
    validateFormat: (str: string, formatStr: string) => {
      const parsed = generateConfig.locale.parse(locale.locale, str, [formatStr]);
      return parsed && generateConfig.isValidate(parsed);
    },

    // By index
    active: focusIndex === index,
    onFocus: (event) => {
      onFocus(event, index);
    },
    onBlur: (event) => {
      onBlur(event, index);
      triggerOpen(false, index);
    },
    onChange: (value) => {
      console.log(index, 'Change >', value);
    },
    onHelp: () => {
      onOpenChange(true, index);
    },
    onKeyDown: (event) => {
      switch (event.key) {
        case 'Escape':
          triggerOpen(false, index);
          break;
      }
      // onKeyDown(event, 0);
    },
  });

  return (
    <div
      className={classNames(prefixCls, `${prefixCls}-range`, {
        [`${prefixCls}-focused`]: focusIndex !== null,
      })}
      ref={rootRef}
    >
      <Input ref={inputStartRef} {...getInputProps(0)} />
      <div className={`${prefixCls}-range-separator`}>{separator}</div>
      <Input ref={inputEndRef} {...getInputProps(1)} />
      <Icon type="suffix" icon={suffixIcon} />
    </div>
  );
});

if (process.env.NODE_ENV !== 'production') {
  RangeSelector.displayName = 'RangeSelector';
}

export default RangeSelector;

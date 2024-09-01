import classNames from 'classnames';
import Overflow from 'rc-overflow';
import * as React from 'react';
import type { PickerProps } from '../../SinglePicker';

export interface MultipleDatesProps<DateType extends object = any>
  extends Pick<PickerProps, 'maxTagCount'> {
  prefixCls: string;
  value: DateType[];
  onRemove: (value: DateType) => void;
  removeIcon?: React.ReactNode;
  formatDate: (date: DateType) => string;
  disabled?: boolean;
  placeholder?: React.ReactNode;
}

export default function MultipleDates<DateType extends object = any>(
  props: MultipleDatesProps<DateType>,
) {
  const {
    prefixCls,
    value,
    onRemove,
    removeIcon = '×',
    formatDate,
    disabled,
    maxTagCount,
    placeholder,
  } = props;

  const selectorCls = `${prefixCls}-selector`;
  const selectionCls = `${prefixCls}-selection`;
  const overflowCls = `${selectionCls}-overflow`;

  // ========================= Item =========================
  function renderSelector(content: React.ReactNode, onClose?: React.MouseEventHandler) {
    return (
      <span
        className={classNames(`${selectionCls}-item`)}
        title={typeof content === 'string' ? content : null}
      >
        <span className={`${selectionCls}-item-content`}>{content}</span>
        {!disabled && onClose && (
          <span
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={onClose}
            className={`${selectionCls}-item-remove`}
          >
            {removeIcon}
          </span>
        )}
      </span>
    );
  }

  function renderItem(date: DateType) {
    const displayLabel: React.ReactNode = formatDate(date);

    const onClose = (event?: React.MouseEvent) => {
      if (event) event.stopPropagation();
      onRemove(date);
    };

    return renderSelector(displayLabel, onClose);
  }

  // ========================= Rest =========================
  function renderRest(omittedValues: DateType[]) {
    const content = `+ ${omittedValues.length} ...`;

    return renderSelector(content);
  }

  // ======================== Render ========================

  return (
    <div className={selectorCls}>
      <Overflow
        prefixCls={overflowCls}
        data={value}
        renderItem={renderItem}
        renderRest={renderRest}
        // suffix={inputNode}
        itemKey={(date) => formatDate(date)}
        maxCount={maxTagCount}
      />
      {!value.length && <span className={`${prefixCls}-selection-placeholder`}>{placeholder}</span>}
    </div>
  );
}

import * as React from 'react';
import type { Components, RangeList, Locale } from '../interface';

export type RangesProps = {
  prefixCls: string;
  rangeList?: RangeList;
  components?: Components;
  needConfirmButton: boolean;
  onNow?: null | (() => void) | false;
  onOk?: null | (() => void) | false;
  okDisabled?: boolean;
  showNow?: boolean;
  locale: Locale;
};

export default function getRanges({
  prefixCls,
  rangeList = [],
  components = {},
  needConfirmButton,
  onNow,
  onOk,
  okDisabled,
  showNow,
  locale,
}: RangesProps) {
  let presetNode: React.ReactNode;
  let okNode: React.ReactNode;

  if (rangeList.length) {
    const Item = (components.rangeItem || 'span') as any;

    presetNode = (
      <>
        {rangeList.map(({ label, onClick, onMouseEnter, onMouseLeave }) => (
          <li key={label} className={`${prefixCls}-preset`}>
            <Item onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
              {label}
            </Item>
          </li>
        ))}
      </>
    );
  }

  if (needConfirmButton) {
    const Button = (components.button || 'button') as any;

    if (onNow && !presetNode && showNow !== false) {
      presetNode = (
        <li className={`${prefixCls}-now`}>
          <a className={`${prefixCls}-now-btn`} onClick={onNow}>
            {locale.now}
          </a>
        </li>
      );
    }

    okNode = needConfirmButton && (
      <li className={`${prefixCls}-ok`}>
        <Button disabled={okDisabled} onClick={onOk}>
          {locale.ok}
        </Button>
      </li>
    );
  }

  if (!presetNode && !okNode) {
    return null;
  }

  return (
    <ul className={`${prefixCls}-ranges`}>
      {presetNode}
      {okNode}
    </ul>
  );
}

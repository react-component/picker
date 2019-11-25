import * as React from 'react';
import Trigger from 'rc-trigger';
import { AlignType } from 'rc-trigger/lib/interface';

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
};

export interface PickerTriggerProps {
  prefixCls: string;
  visible: boolean;
  popupElement: React.ReactElement;
  popupStyle?: React.CSSProperties;
  children: React.ReactElement;
  dropdownClassName?: string;
  transitionName?: string;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  dropdownAlign?: AlignType;
}

function PickerTrigger({
  prefixCls,
  popupElement,
  popupStyle,
  visible,
  dropdownClassName,
  dropdownAlign,
  transitionName,
  getPopupContainer,
  children,
}: PickerTriggerProps) {
  const dropdownPrefixCls = `${prefixCls}-dropdown`;

  return (
    <Trigger
      showAction={[]}
      hideAction={[]}
      popupPlacement="bottomLeft"
      builtinPlacements={BUILT_IN_PLACEMENTS}
      prefixCls={dropdownPrefixCls}
      popupTransitionName={transitionName}
      popup={popupElement}
      popupAlign={dropdownAlign}
      popupVisible={visible}
      popupClassName={dropdownClassName}
      popupStyle={popupStyle}
      getPopupContainer={getPopupContainer}
    >
      {children}
    </Trigger>
  );
}

export default PickerTrigger;

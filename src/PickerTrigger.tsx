import * as React from 'react';
import classNames from 'classnames';
import Trigger from 'rc-trigger';
import { AlignType } from 'rc-trigger/lib/interface';

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
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
  topRight: {
    points: ['br', 'tr'],
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
  range?: boolean;
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
  range,
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
      popupClassName={classNames(dropdownClassName, {
        [`${dropdownPrefixCls}-range`]: range,
      })}
      popupStyle={popupStyle}
      getPopupContainer={getPopupContainer}
    >
      {children}
    </Trigger>
  );
}

export default PickerTrigger;

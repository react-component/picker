import Trigger from '@rc-component/trigger';
import type { AlignType } from '@rc-component/trigger/lib/interface';
import classNames from 'classnames';
import * as React from 'react';
import { PrefixClsContext } from '../PickerInput/context';

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

type Placement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

export type PickerTriggerProps = {
  visible: boolean;
  popupElement: React.ReactElement;
  popupStyle?: React.CSSProperties;
  children: React.ReactElement;
  popupClassName?: string;
  transitionName?: string;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  popupAlign?: AlignType;
  range?: boolean;
  popupPlacement?: Placement;
  direction?: 'ltr' | 'rtl';
};

function PickerTrigger({
  popupElement,
  popupStyle,
  visible,
  popupClassName,
  popupAlign,
  transitionName,
  getPopupContainer,
  children,
  range,
  popupPlacement,
  direction,
}: PickerTriggerProps) {
  const prefixCls = React.useContext(PrefixClsContext);
  const dropdownPrefixCls = `${prefixCls}-dropdown`;

  const getPopupPlacement = () => {
    if (popupPlacement !== undefined) {
      return popupPlacement;
    }
    return direction === 'rtl' ? 'bottomRight' : 'bottomLeft';
  };

  return (
    <Trigger
      showAction={[]}
      hideAction={[]}
      popupPlacement={getPopupPlacement()}
      builtinPlacements={BUILT_IN_PLACEMENTS}
      prefixCls={dropdownPrefixCls}
      popupTransitionName={transitionName}
      popup={popupElement}
      popupAlign={popupAlign}
      popupVisible={visible}
      popupClassName={classNames(popupClassName, {
        [`${dropdownPrefixCls}-range`]: range,
        [`${dropdownPrefixCls}-rtl`]: direction === 'rtl',
      })}
      popupStyle={popupStyle}
      getPopupContainer={getPopupContainer}
    >
      {children}
    </Trigger>
  );
}

export default PickerTrigger;

import classNames from 'classnames';
import pickAttrs from 'rc-util/lib/pickAttrs';
import * as React from 'react';
import type { SharedPickerProps } from '../../interface';
import PickerContext from '../context';
import Footer, { type FooterProps } from './Footer';
import PopupPanel, { type PopupPanelProps } from './PopupPanel';

export interface PopupProps<DateType = any>
  extends Pick<React.HTMLAttributes<HTMLDivElement>, 'onFocus' | 'onBlur'>,
    FooterProps<DateType>,
    PopupPanelProps<DateType> {
  panelRender?: SharedPickerProps['panelRender'];
}

export default function Popup(props: PopupProps) {
  const { panelRender, internalMode, picker, showNow, multiple, ...restProps } = props;

  const { prefixCls } = React.useContext(PickerContext);
  const panelPrefixCls = `${prefixCls}-panel`;

  // ======================== Custom ========================
  let mergedNodes: React.ReactNode = (
    <div className={`${prefixCls}-panel-layout`}>
      {/* <PresetPanel
        prefixCls={prefixCls}
        presets={presetList}
        onClick={(nextValue) => {
          triggerChange(nextValue, null);
          triggerOpen(false, mergedActivePickerIndex, 'preset');
        }}
        onHover={(hoverValue) => {
          setRangeHoverValue(hoverValue);
        }}
      /> */}
      <div>
        <PopupPanel {...props} />
        <Footer {...props} showNow={multiple ? false : showNow} />
      </div>
    </div>
  );

  if (panelRender) {
    mergedNodes = panelRender(mergedNodes);
  }

  // ======================== Render ========================
  const divProps = pickAttrs(restProps, {
    attr: true,
  });

  const containerPrefixCls = `${panelPrefixCls}-container`;

  return (
    <div
      tabIndex={-1}
      className={classNames(
        containerPrefixCls,
        // Used for Today Button style, safe to remove if no need
        `${prefixCls}-${internalMode}-panel-container`,
      )}
      {...divProps}
    >
      {mergedNodes}
    </div>
  );
}

import classNames from 'classnames';
import pickAttrs from 'rc-util/lib/pickAttrs';
import * as React from 'react';
import type { SharedPickerProps, ValueDate } from '../../interface';
import PickerContext from '../context';
import Footer, { type FooterProps } from './Footer';
import PopupPanel, { type PopupPanelProps } from './PopupPanel';
import PresetPanel from './PresetPanel';

export interface PopupProps<DateType = any, PresetValue = DateType>
  extends Pick<React.HTMLAttributes<HTMLDivElement>, 'onFocus' | 'onBlur'>,
    FooterProps<DateType>,
    PopupPanelProps<DateType> {
  panelRender?: SharedPickerProps['panelRender'];
  presets: ValueDate<DateType>[];
  onPresetHover: (presetValue: PresetValue) => void;
}

export default function Popup(props: PopupProps) {
  const {
    panelRender,
    internalMode,
    picker,
    showNow,
    multiple,
    presets,
    onPresetHover,
    ...restProps
  } = props;

  const { prefixCls } = React.useContext(PickerContext);
  const panelPrefixCls = `${prefixCls}-panel`;

  // ======================== Custom ========================
  let mergedNodes: React.ReactNode = (
    <div className={`${prefixCls}-panel-layout`}>
      <PresetPanel
        prefixCls={prefixCls}
        presets={presets}
        // onClick={(nextValue) => {
        //   triggerChange(nextValue, null);
        //   triggerOpen(false, mergedActivePickerIndex, 'preset');
        // }}
        onHover={onPresetHover}
      />
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

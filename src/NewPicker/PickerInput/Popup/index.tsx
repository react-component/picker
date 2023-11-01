import classNames from 'classnames';
import pickAttrs from 'rc-util/lib/pickAttrs';
import * as React from 'react';
import type { InternalMode, PanelMode, SharedPickerProps } from '../../interface';
import PickerContext from '../context';
import Footer from './Footer';

export interface PopupProps<DateType = any>
  extends Pick<React.HTMLAttributes<HTMLDivElement>, 'onFocus' | 'onBlur'> {
  children?: React.ReactElement | React.ReactElement[];
  panelRender?: SharedPickerProps['panelRender'];
  mode: PanelMode;
  internalMode: InternalMode;
  renderExtraFooter?: SharedPickerProps['renderExtraFooter'];
  showNow: boolean;
  onSubmit: (date?: DateType) => void;

  // Value
  value?: DateType;
}

export default function Popup(props: PopupProps) {
  const { panelRender, children, internalMode, ...restProps } = props;

  const { prefixCls } = React.useContext(PickerContext);
  const panelPrefixCls = `${prefixCls}-panel`;

  // ======================== Focus =========================
  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
  };

  // ======================== Custom ========================
  const panelNode = Array.isArray(children) ? (
    <div className={`${prefixCls}-panels`}>{children}</div>
  ) : (
    children
  );

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
        {panelNode}
        <Footer {...props} />
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
      onMouseDown={onMouseDown}
      {...divProps}
    >
      {mergedNodes}
    </div>
  );
}

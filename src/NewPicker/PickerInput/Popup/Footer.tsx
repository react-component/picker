import * as React from 'react';
import type { InternalMode, PanelMode, SharedPickerProps } from '../../interface';
import PickerContext from '../context';

export interface FooterProps<DateType = any> {
  mode: PanelMode;
  internalMode: InternalMode;
  renderExtraFooter?: SharedPickerProps['renderExtraFooter'];
  showNow: boolean;
  onSubmit: (date?: DateType) => void;
}

export default function Footer(props: FooterProps) {
  const { mode, internalMode, renderExtraFooter, showNow, onSubmit } = props;

  const {
    prefixCls,
    locale,
    generateConfig,
    button: Button = 'button',
  } = React.useContext(PickerContext);

  // <div className={`${prefixCls}-footer-extra`}>{renderExtraFooter(mode)}</div>

  {
    /* {(extraNode || rangesNode) && (
          <div className={`${prefixCls}-footer`}>
            {extraNode}
            {rangesNode}
          </div>
        )} */
  }

  // ======================== Event =========================
  const onNow = () => {
    const now = generateConfig.getNow();
    onSubmit(now);
  };

  // ======================== Extra =========================
  const extraNode = renderExtraFooter?.(mode);

  // ======================== Ranges ========================
  const presetNode = showNow && (
    <li className={`${prefixCls}-now`}>
      <a className={`${prefixCls}-now-btn`} onClick={onNow}>
        {internalMode === 'date' ? locale.today : locale.now}
      </a>
    </li>
  );

  const okNode = (internalMode === 'time' || internalMode === 'datetime') && (
    <li className={`${prefixCls}-ok`}>
      <Button
        // disabled={okDisabled}
        onClick={() => {
          onSubmit();
        }}
      >
        {locale.ok}
      </Button>
    </li>
  );

  const rangeNode = (
    <ul className={`${prefixCls}-ranges`}>
      {presetNode}
      {okNode}
    </ul>
  );

  // ======================== Render ========================
  return (
    <div className={`${prefixCls}-footer`}>
      {extraNode}
      {rangeNode}
    </div>
  );
}

import { clsx } from 'clsx';
import { isReactRenderable } from '@rc-component/util';
import * as React from 'react';
import type { GenerateConfig } from '../../generate';
import useTimeInfo from '../../hooks/useTimeInfo';
import type { DisabledDate, InternalMode, PanelMode, SharedPickerProps } from '../../interface';
import PickerContext from '../context';
import type { PopupShowTimeConfig } from '.';

export interface FooterProps<DateType extends object = any> {
  mode: PanelMode;
  internalMode: InternalMode;
  renderExtraFooter?: SharedPickerProps['renderExtraFooter'];
  showNow: boolean;
  generateConfig: GenerateConfig<DateType>;
  disabledDate: DisabledDate<DateType>;
  showTime?: PopupShowTimeConfig<DateType>;

  // Invalid
  /** From Footer component used only. Check if can OK button click */
  invalid?: boolean;

  // Submit
  onSubmit: (date?: DateType) => void;
  needConfirm: boolean;

  // Now
  onNow: (now: DateType) => void;
}

/**
 * `type` is a native `button` attribute. Custom components (e.g. `antd` Button) use `type`
 * as their own variant prop, so only pass it when the intrinsic element is rendered.
 */
function getNativeTypeProps(Component: React.ComponentType<any> | string) {
  return Component === 'button' ? ({ type: 'button' } as const) : null;
}

export default function Footer(props: FooterProps) {
  const {
    mode,
    internalMode,
    renderExtraFooter,
    showNow,
    showTime,
    onSubmit,
    onNow,
    invalid,
    needConfirm,
    generateConfig,
    disabledDate,
  } = props;

  const {
    prefixCls,
    locale,
    button = 'button',
    nowButton,
    okButton,
    classNames,
    styles,
  } = React.useContext(PickerContext);

  // >>> Now
  const now = generateConfig.getNow();

  const [getValidTime] = useTimeInfo(generateConfig, showTime, now);

  // ======================== Extra =========================
  const extraNode = renderExtraFooter?.(mode);

  // ======================== Ranges ========================
  const nowDisabled = disabledDate(now, {
    type: mode,
  });

  const onInternalNow = () => {
    if (!nowDisabled) {
      const validateNow = getValidTime(now);
      onNow(validateNow);
    }
  };

  const NowButton = nowButton || button;
  const OkButton = okButton || button;

  const presetNode = showNow && (
    <NowButton
      {...getNativeTypeProps(NowButton)}
      className={`${prefixCls}-now`}
      disabled={nowDisabled}
      onClick={onInternalNow}
    >
      {internalMode === 'date' ? locale.today : locale.now}
    </NowButton>
  );

  // >>> OK
  const okNode = needConfirm && (
    <OkButton
      {...getNativeTypeProps(OkButton)}
      disabled={invalid}
      className={`${prefixCls}-ok`}
      onClick={onSubmit}
    >
      {locale.ok}
    </OkButton>
  );

  const rangeNode = (presetNode || okNode) && (
    <div className={`${prefixCls}-ranges`}>
      {presetNode}
      {okNode}
    </div>
  );

  // ======================== Render ========================
  if (!isReactRenderable(extraNode) && !isReactRenderable(rangeNode)) {
    return null;
  }

  return (
    <div
      className={clsx(`${prefixCls}-footer`, classNames.popup.footer)}
      style={styles.popup.footer}
    >
      {isReactRenderable(extraNode) && (
        <div className={`${prefixCls}-footer-extra`}>{extraNode}</div>
      )}
      {rangeNode}
    </div>
  );
}

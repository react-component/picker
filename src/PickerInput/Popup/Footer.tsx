import classNames from 'classnames';
import * as React from 'react';
import type { GenerateConfig } from '../../generate';
import useTimeInfo from '../../hooks/useTimeInfo';
import type {
  DisabledDate,
  InternalMode,
  PanelMode,
  RangeTimeProps,
  SharedPickerProps,
} from '../../interface';
import PickerContext from '../context';

export interface FooterProps<DateType extends object = any> {
  mode: PanelMode;
  internalMode: InternalMode;
  renderExtraFooter?: SharedPickerProps['renderExtraFooter'];
  showNow: boolean;
  generateConfig: GenerateConfig<DateType>;
  disabledDate: DisabledDate<DateType>;
  showTime?: Omit<RangeTimeProps<DateType>, 'defaultValue' | 'defaultOpenValue'>;

  // Invalid
  /** From Footer component used only. Check if can OK button click */
  invalid?: boolean;

  // Submit
  onSubmit: (date?: DateType) => void;
  needConfirm: boolean;

  // Now
  onNow: (now: DateType) => void;
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

  const { prefixCls, locale, button: Button = 'button' } = React.useContext(PickerContext);

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

  const nowPrefixCls = `${prefixCls}-now`;
  const nowBtnPrefixCls = `${nowPrefixCls}-btn`;

  const presetNode = showNow && (
    <li className={nowPrefixCls}>
      <a
        className={classNames(nowBtnPrefixCls, nowDisabled && `${nowBtnPrefixCls}-disabled`)}
        aria-disabled={nowDisabled}
        onClick={onInternalNow}
      >
        {internalMode === 'date' ? locale.today : locale.now}
      </a>
    </li>
  );

  // >>> OK
  const okNode = needConfirm && (
    <li className={`${prefixCls}-ok`}>
      <Button disabled={invalid} onClick={onSubmit}>
        {locale.ok}
      </Button>
    </li>
  );

  const rangeNode = (presetNode || okNode) && (
    <ul className={`${prefixCls}-ranges`}>
      {presetNode}
      {okNode}
    </ul>
  );

  // ======================== Render ========================
  if (!extraNode && !rangeNode) {
    return null;
  }

  return (
    <div className={`${prefixCls}-footer`}>
      {extraNode && <div className={`${prefixCls}-footer-extra`}>{extraNode}</div>}
      {rangeNode}
    </div>
  );
}

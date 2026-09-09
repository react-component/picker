import * as React from 'react';
import type { GenerateConfig } from '../generate';
import type { Components, Locale } from '../interface';
import type { FilledClassNames, FilledStyles } from '../hooks/useSemantic';

export interface PickerContextProps<DateType = any> {
  prefixCls: string;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  /**
   * Customize button component.
   * @deprecated Please use `nowButton` and `okButton` instead.
   */
  button?: Components['button'];
  /** Customize the `now` / `today` button component */
  nowButton?: Components['nowButton'];
  /** Customize the `ok` button component */
  okButton?: Components['okButton'];
  input?: Components['input'];
  classNames: FilledClassNames;
  styles: FilledStyles;
}

const PickerContext = React.createContext<PickerContextProps>(null!);

export default PickerContext;

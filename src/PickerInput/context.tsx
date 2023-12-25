import * as React from 'react';
import type { GenerateConfig } from '../generate';
import type { Components, Locale } from '../interface';

export interface PickerContextProps<DateType = any> {
  prefixCls: string;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  /** Customize button component */
  button?: Components['button'];
  input?: Components['input'];

}

const PickerContext = React.createContext<PickerContextProps>(null!);

export default PickerContext;

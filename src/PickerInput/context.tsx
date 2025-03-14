import * as React from 'react';
import type { GenerateConfig } from '../generate';
import type { Components, Locale, SemanticStructure } from '../interface';

export interface PickerContextProps<DateType = any> {
  prefixCls: string;
  locale: Locale;
  generateConfig: GenerateConfig<DateType>;
  /** Customize button component */
  button?: Components['button'];
  input?: Components['input'];
  styles?: Partial<Record<SemanticStructure, React.CSSProperties>>;
  classNames?: Partial<Record<SemanticStructure, string>>;
}

const PickerContext = React.createContext<PickerContextProps>(null!);

export default PickerContext;

import * as React from 'react';
import { NullableDateType } from './interface';

interface RangeContextProps {
  extraFooterSelections?: {
    label: string;
    onClick: React.MouseEventHandler<HTMLElement>;
  }[];
  /**
   * Set displayed range value style.
   * Panel only has one value, this is only style effect.
   */
  rangedValue?: [NullableDateType<any>, NullableDateType<any>];
}

const RangeContext = React.createContext<RangeContextProps>({});

export default RangeContext;

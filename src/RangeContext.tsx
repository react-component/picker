import * as React from 'react';
import { NullableDateType } from './interface';

export interface FooterSelection {
  label: string;
  onClick: React.MouseEventHandler<HTMLElement>;
}

interface RangeContextProps {
  extraFooterSelections?: FooterSelection[];
  /**
   * Set displayed range value style.
   * Panel only has one value, this is only style effect.
   */
  rangedValue?: [NullableDateType<any>, NullableDateType<any>];
  inRange?: boolean;
  startPanel?: boolean;
}

const RangeContext = React.createContext<RangeContextProps>({});

export default RangeContext;

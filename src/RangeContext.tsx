import * as React from 'react';

interface RangeContextProps {
  extraFooterSelections?: {
    label: string;
    onClick: React.MouseEventHandler<HTMLElement>;
  }[];
}

const RangeContext = React.createContext<RangeContextProps>({});

export default RangeContext;

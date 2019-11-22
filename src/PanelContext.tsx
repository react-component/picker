import * as React from 'react';

export type ContextOperationRefProps = {
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => boolean;
};

export interface PanelContextProps {
  operationRef?: React.MutableRefObject<ContextOperationRefProps | null>;
}

const PanelContext = React.createContext<PanelContextProps>({});

export default PanelContext;

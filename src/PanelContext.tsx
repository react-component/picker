import * as React from 'react';

export type ContextOperationRefProps = {
  onKeyDown: React.KeyboardEventHandler<HTMLElement>;
};

export interface PanelContextProps {
  operationRef?: React.MutableRefObject<ContextOperationRefProps | null>;
}

const PanelContext = React.createContext<PanelContextProps>({});

export default PanelContext;

import * as React from 'react';

export type ContextOperationRefProps = {
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => boolean;
  onClose?: () => void;
};

export interface PanelContextProps {
  operationRef?: React.MutableRefObject<ContextOperationRefProps | null>;
  /** Only work with time panel */
  hideHeader?: boolean;
  panelRef?: React.Ref<HTMLDivElement>;
  hidePrevBtn?: boolean;
  hideNextBtn?: boolean;
  onDateMouseEnter?: (date: any) => void;
  onDateMouseLeave?: (date: any) => void;
}

const PanelContext = React.createContext<PanelContextProps>({});

export default PanelContext;

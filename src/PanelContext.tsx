import * as React from 'react';
import { OnSelect } from './interface';

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
  onSelect?: OnSelect<any>;
  hideRanges?: boolean;
  open?: boolean;

  /** Only used for TimePicker and this is a deprecated prop */
  defaultOpenValue?: any;
}

const PanelContext = React.createContext<PanelContextProps>({});

export default PanelContext;

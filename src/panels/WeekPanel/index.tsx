import * as React from 'react';
import DatePanel from '../DatePanel';
import { PanelSharedProps } from '../../interface';

export type WeekPanelProps<DateType> = PanelSharedProps<DateType>;

function WeekPanel<DateType>(props: WeekPanelProps<DateType>) {
  return <DatePanel {...props} panelName="week" />;
}

export default WeekPanel;

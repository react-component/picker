import * as React from 'react';
import Picker, { PickerProps } from './Picker';

// TODO: 'before - 2010-11-11' or '2011-11-11 - forever'

export interface RangePickerProps<DateType>
  extends Omit<PickerProps<DateType>, 'value'> {
  value?: [DateType | null, DateType | null] | null;
}

function RangePicker<DateType>(props: RangePickerProps<DateType>) {
  const { value, generateConfig } = props;

  const [innerValue] = React.useState<[DateType | null, DateType | null]>(
    () => value || [generateConfig.getNow(), generateConfig.getNow()],
  );

  return (
    <div>
      <Picker {...props} value={innerValue[0]} />
      <Picker {...props} value={innerValue[1]} />
    </div>
  );
}

export default RangePicker;

import * as React from 'react';
import { RangeValue } from '../interface';
import { getValue } from '../utils/miscUtil';
import { GenerateConfig } from '../generate';

export default function useRangeDisabled<DateType>(
  selectedValues: RangeValue<DateType>,
  disabledDate: (date: DateType) => boolean,
  generateConfig: GenerateConfig<DateType>,
) {
  const startDate = getValue(selectedValues, 0);
  const endDate = getValue(selectedValues, 1);

  function disableEndDate(date: DateType) {
    if (disabledDate && disabledDate(date)) {
      return true;
    }

    if (startDate) {}
  }
}

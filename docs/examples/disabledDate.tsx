import React from 'react';
import type { Moment } from 'moment';
import moment from 'moment';
import Picker from '../../src';
import momentGenerateConfig from '../../src/generate/moment';
import enUS from '../../src/locale/en_US';
import '../../assets/index.less';

export default () => {
  const [value, setValue] = React.useState<Moment | null>(undefined);

  const onSelect = (newValue: Moment) => {
    console.log('Select:', newValue);
  };

  const onChange = (newValue: Moment | null, formatString?: string) => {
    console.log('Change:', newValue, formatString);
    setValue(newValue);
  };

  function disabledDateBeforeToday(current: Moment) {
    return current <= moment().endOf('day');
  }

  function disabledDateAfterToday(current: Moment) {
    return current >= moment().endOf('day');
  }

  function disabledDateAfterTodayAndBeforeLastYear(current) {
    return current >= moment().startOf('day') || current < moment().subtract(1, 'years');
  }

  const sharedProps = {
    generateConfig: momentGenerateConfig,
    value,
    onSelect,
    onChange,
  };

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h1>Value: {value ? value.format('YYYY-MM-DD HH:mm:ss') : 'null'}</h1>
      <h2>Date Mode</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ margin: '0 8px' }}>
          <h3>Before Today</h3>
          <Picker<Moment> {...sharedProps} disabledDate={disabledDateBeforeToday} locale={enUS} />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>After Today</h3>
          <Picker<Moment> {...sharedProps} disabledDate={disabledDateAfterToday} locale={enUS} />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>After Today or Before last year</h3>
          <Picker<Moment>
            {...sharedProps}
            disabledDate={disabledDateAfterTodayAndBeforeLastYear}
            locale={enUS}
          />
        </div>
      </div>
    </div>
  );
};

import type { Moment } from 'moment';
import React, { useState } from 'react';
import '../../assets/index.less';
import Picker from '../../src';
import momentGenerateConfig from '../../src/generate/moment';
import zhCN from '../../src/locale/zh_CN';

const sharedProps = {
  generateConfig: momentGenerateConfig,
};

function PickerWithType({ type, onChange }) {
  if (type === 'date') return <Picker<Moment> {...sharedProps} onChange={onChange} locale={zhCN} />;
  return <Picker<Moment> {...sharedProps} picker={type} onChange={onChange} locale={zhCN} />;
}

export default function SwitchablePicker() {
  const [type, setType] = useState('date');
  return (
    <>
      <select
        value={type}
        onChange={(event) => {
          setType(event.target.value);
        }}
      >
        <option value="date">Date</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="quarter">Quarter</option>
        <option value="year">Year</option>
      </select>
      <PickerWithType type={type} onChange={(value) => console.log(value)} />
    </>
  );
}

import React, { useLayoutEffect, useRef, useState } from 'react';
import '../../assets/index.less';
import { Picker, RangePicker, type PickerRef } from '../../src';
import momentGenerateConfig from '../../src/generate/moment';
import zhCN from '../../src/locale/zh_CN';
import type { RangePickerRef } from '../../src/interface';

const MyPicker = () => {
  const ref = useRef<PickerRef>(null);
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.focus({ preventScroll: true });
    }
  }, []);

  return (
    <div>
      <Picker open locale={zhCN} generateConfig={momentGenerateConfig} ref={ref} />
    </div>
  );
};

const MyRangePicker = () => {
  const ref = useRef<RangePickerRef>(null);
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.focus({ preventScroll: true, index: 1 });
    }
  }, []);

  return (
    <div>
      <RangePicker open locale={zhCN} generateConfig={momentGenerateConfig} ref={ref} />
    </div>
  );
};

const Demo = () => {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  return (
    <div>
      <div style={{ height: '50vh' }} />
      <a onClick={() => setOpen(!open)}>picker {`${open}`}</a>
      <br />
      <a onClick={() => setOpen2(!open2)}>rangePicker {`${open2}`}</a>
      <div style={{ height: '80vh' }} />
      {open && <MyPicker />}
      {open2 && <MyRangePicker />}
      <div style={{ height: '30vh' }} />
    </div>
  );
};

export default Demo;

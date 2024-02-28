import React, { useLayoutEffect, useRef, useState } from 'react';
import '../../assets/index.less';
import { Picker, type PickerRef } from '../../src';
import momentGenerateConfig from '../../src/generate/moment';
import zhCN from '../../src/locale/zh_CN';

const MySelect = () => {
  const ref = useRef<PickerRef>(null);
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.focus({ preventScroll: true });
    }
  }, []);

  return (
    <div>
      <Picker locale={zhCN} generateConfig={momentGenerateConfig} ref={ref} />
    </div>
  );
};

const Demo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div style={{ height: '50vh' }} />
      <a onClick={() => setOpen(!open)}>{`${open}`}</a>
      <div style={{ height: '80vh' }} />
      {open && <MySelect />}
      <div style={{ height: '30vh' }} />
    </div>
  );
};

export default Demo;

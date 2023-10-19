import * as React from 'react';
import '../../assets/index.less';
import type { PickerRef } from '../../src/PickerInput/interface';
import RangePicker from '../../src/PickerInput/RangePicker';
import SinglePicker from '../../src/PickerInput/SinglePicker';

export default () => {
  const singleRef = React.useRef<PickerRef>(null);

  return (
    <div>
      <SinglePicker ref={singleRef} suffixIcon="🧶" />
      <br />
      <RangePicker suffixIcon="🧶" />
      <br />

      <button
        onClick={() => {
          singleRef.current?.focus();
        }}
      >
        Focus
      </button>
    </div>
  );
};

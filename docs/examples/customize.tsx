import moment, { type Moment } from 'moment';
import * as React from 'react';
import '../../assets/index.less';
import Picker, { PickerPanel } from '../../src';
import momentGenerateConfig from '../../src/generate/moment';
import zhCN from '../../src/locale/zh_CN';
import './slide.less';

interface DateRangeState {
  startValue: Moment | null;
  endValue: Moment | null;
  endOpen: boolean;
  initValue: Moment;
}

const now = moment();

class Customize extends React.Component<{}, DateRangeState> {
  poupContainerRef: React.RefObject<HTMLDivElement>;

  constructor(props: {}) {
    super(props);
    this.poupContainerRef = React.createRef();
  }

  state: DateRangeState = {
    initValue: now,
    startValue: null,
    endValue: null,
    endOpen: false,
  };

  disabledStartDate = (startValue: Moment) => {
    const { endValue } = this.state;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue!.valueOf();
  };

  disabledEndDate = (endValue: Moment) => {
    const { startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  onChange = (field: string, value: Moment) => {
    this.setState({
      [field]: value,
    } as any);
  };

  onStartChange = (value: Moment | null) => {
    this.onChange('startValue', value!);
  };

  onEndChange = (value: Moment | null) => {
    this.onChange('endValue', value!);
  };

  handleStartOpenChange = (open: boolean) => {
    if (!open) {
      console.error('Start Trigger end open:', open);
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = (open: boolean) => {
    console.error('End Trigger end open:', open);
    this.setState({ endOpen: open });
  };

  handleSelect = (value: Moment) => {
    console.log('selected:', value);
    this.setState({
      initValue: value,
    });
  };

  handleSelectMonth = (value: Moment) => {
    console.log('month-calendar select', value && value.format('YYYY/MM'));
  };

  getPopupContainer = (node: HTMLElement) => {
    console.log(node, 2333);
    return this.poupContainerRef.current;
  };

  monthCellRender = (date: Moment) => (
    <div
      style={{
        width: 60,
        height: 40,
        borderTop: '3px solid #CCC',
      }}
    >
      {date.month() + 1}
    </div>
  );

  render() {
    const { startValue, endValue, endOpen } = this.state;
    console.log('->', endOpen);
    return (
      <div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3>custom icon</h3>
            <Picker
              generateConfig={momentGenerateConfig}
              locale={zhCN}
              getPopupContainer={this.getPopupContainer}
              // format="YYYY/MM/DD"
              format={['YYYY-MM-DD', 'YYYY/MM/DD']}
              allowClear
              prefix="Foobar"
              clearIcon={<span>X</span>}
              suffixIcon={<span>O</span>}
              prevIcon={<span>&lt;</span>}
              nextIcon={<span>&gt;</span>}
              superPrevIcon={<span>&lt;&lt;</span>}
              superNextIcon={<span>&gt;&gt;</span>}
              placeholder="please select"
              // inputReadOnly
              style={{ width: 200, height: 28 }}
            />
            <div ref={this.poupContainerRef} />
          </div>
          <div>
            <h3>monthCellRender</h3>
            <PickerPanel
              generateConfig={momentGenerateConfig}
              locale={zhCN}
              picker="month"
              monthCellRender={this.monthCellRender}
            />
          </div>
        </div>
        <Picker
          generateConfig={momentGenerateConfig}
          locale={zhCN}
          defaultValue={now}
          disabledDate={this.disabledStartDate}
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          value={startValue}
          placeholder="Start"
          onChange={this.onStartChange}
          onOpenChange={this.handleStartOpenChange}
          transitionName="slide-up"
        />
        <Picker
          generateConfig={momentGenerateConfig}
          disabledDate={this.disabledEndDate}
          locale={zhCN}
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          value={endValue}
          placeholder="End"
          onChange={this.onEndChange}
          open={endOpen}
          onOpenChange={this.handleEndOpenChange}
          transitionName="slide-up"
        />
      </div>
    );
  }
}

export default Customize;

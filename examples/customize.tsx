import * as React from 'react';
import { Moment } from 'moment';
import Picker from '../src';
import momentGenerateConfig from '../src/generate/moment';
import zhCN from '../src/locale/zh_CN';
import '../assets/index.less';
import './slide.less';

interface DateRangeState {
  startValue: Moment | null;
  endValue: Moment | null;
  endOpen: boolean;
}

class DateRange extends React.Component<{}, DateRangeState> {
  state: DateRangeState = {
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

  render() {
    const { startValue, endValue, endOpen } = this.state;
    console.log('->', endOpen);
    return (
      <div>
        <Picker
          generateConfig={momentGenerateConfig}
          locale={zhCN}
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

export default DateRange;

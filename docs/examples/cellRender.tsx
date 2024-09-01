import type { Moment } from 'moment';
import moment from 'moment';
import React from 'react';
import '../../assets/index.less';
import { Picker, RangePicker } from '../../src';
import momentGenerateConfig from '../../src/generate/moment';
import zhCN from '../../src/locale/zh_CN';

const defaultValue = moment('2019-11-28 01:02:03');

const defaultStartValue = moment('2019-09-03 05:02:03');
const defaultEndValue = moment('2019-11-28 01:02:03');

function formatDate(date: Moment | null) {
  return date ? date.format('YYYY-MM-DD HH:mm:ss') : 'null';
}

export default () => {
  const [value, setValue] = React.useState<Moment | null>(defaultValue);
  const [rangeValue, setRangeValue] = React.useState<[Moment | null, Moment | null] | null>([
    defaultStartValue,
    defaultEndValue,
  ]);

  const onSelect = (newValue: Moment) => {
    console.log('Select:', newValue);
  };

  const onChange = (newValue: Moment | null, formatString?: string) => {
    console.log('Change:', newValue, formatString);
    setValue(newValue);
  };

  const sharedProps = {
    generateConfig: momentGenerateConfig,
    value,
    onSelect,
    onChange,
    presets: [
      {
        label: 'Hello World!',
        value: moment(),
      },
    ],
  };

  const onRangeChange = (
    newValue: [Moment | null, Moment | null] | null,
    formatStrings?: string[],
  ) => {
    console.log('Change:', newValue, formatStrings);
    setRangeValue(newValue);
  };

  const rangeSharedProps = {
    generateConfig: momentGenerateConfig,
    value: rangeValue,
    onChange: onRangeChange,
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ margin: '0 8px' }}>
          <h3>Basic</h3>
          <h4>Value: {value ? value.format('YYYY-MM-DD HH:mm:ss') : 'null'}</h4>
          <Picker<Moment>
            {...sharedProps}
            locale={zhCN}
            cellRender={(current: Moment, info) =>
              React.cloneElement(
                info.originNode,
                {
                  ...info.originNode.props,
                },
                <div style={{ background: 'orange' }}>{current.get('date')}</div>,
              )
            }
          />
          <Picker<Moment>
            {...sharedProps}
            locale={zhCN}
            cellRender={(current: Moment, info) =>
              React.cloneElement(
                info.originNode,
                {
                  className: `${info.originNode.props.className} testWrapper`,
                },
                <div style={{ background: 'orange' }}>{current.get('date')}</div>,
              )
            }
          />
          <Picker<Moment>
            {...sharedProps}
            locale={zhCN}
            picker="week"
            cellRender={(current: Moment, info) =>
              React.cloneElement(
                info.originNode,
                {
                  ...info.originNode.props,
                },
                <div style={{ background: 'orange' }}>{current.get('week')}</div>,
              )
            }
          />
          <Picker<Moment>
            {...sharedProps}
            locale={zhCN}
            picker="year"
            cellRender={(current: Moment, info) =>
              React.cloneElement(
                info.originNode,
                {
                  ...info.originNode.props,
                },
                <div style={{ background: 'orange' }}>{current.get('year')}</div>,
              )
            }
          />
          <Picker<Moment>
            {...sharedProps}
            locale={zhCN}
            picker="month"
            cellRender={(current: Moment, info) =>
              React.cloneElement(
                info.originNode,
                {
                  ...info.originNode.props,
                },
                <div style={{ background: 'orange' }}>{current.get('month') + 1}</div>,
              )
            }
          />
          <Picker<Moment>
            {...sharedProps}
            locale={zhCN}
            picker="quarter"
            cellRender={(current: Moment, info) =>
              React.cloneElement(
                info.originNode,
                {
                  ...info.originNode.props,
                },
                <div style={{ background: 'orange' }}>Q{current.get('quarter')}</div>,
              )
            }
          />
          <Picker<Moment>
            {...sharedProps}
            locale={zhCN}
            picker="time"
            cellRender={(current: number | string, info) =>
              React.cloneElement(
                info.originNode,
                {
                  ...info.originNode.props,
                },
                <div style={{ background: 'orange' }}>{current}</div>,
              )
            }
          />
        </div>
        <div style={{ margin: '0 8px' }}>
          <h3>Range</h3>
          <h4>
            RangeValue:{' '}
            {rangeValue ? `${formatDate(rangeValue[0])} ~ ${formatDate(rangeValue[1])}` : 'null'}
          </h4>
          <RangePicker<Moment>
            {...rangeSharedProps}
            locale={zhCN}
            allowClear
            showTime
            style={{ width: 580 }}
            cellRender={(current, info) => {
              return (
                <div
                  title={info.type}
                  style={{ background: info.type === 'time' ? 'green' : 'yellow' }}
                >
                  {info.type === 'time' ? (current as number) : (current as Moment).get('date')}
                </div>
              );
            }}
            ranges={{
              ranges: [moment(), moment().add(10, 'day')],
            }}
            onOk={(dates) => {
              console.log('OK!!!', dates);
            }}
          />
        </div>
      </div>
    </div>
  );
};

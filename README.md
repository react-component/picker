<div align="center">
  <h1>@rc-component/picker</h1>
  <p><sub><img alt="Ant Design" height="14" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" style="vertical-align: -0.125em;" /> Part of the Ant Design ecosystem.</sub></p>
  <p>📅 React date, time, range, and panel picker primitives with pluggable date-library generate configs.</p>

  <p>
    <a href="https://npmjs.org/package/@rc-component/picker"><img alt="NPM version" src="https://img.shields.io/npm/v/@rc-component/picker.svg?style=flat-square"></a>
    <a href="https://npmjs.org/package/@rc-component/picker"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@rc-component/picker.svg?style=flat-square"></a>
    <a href="https://github.com/react-component/picker/actions/workflows/react-component-ci.yml"><img alt="build status" src="https://github.com/react-component/picker/actions/workflows/react-component-ci.yml/badge.svg"></a>
    <a href="https://app.codecov.io/gh/react-component/picker"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/react-component/picker/master.svg?style=flat-square"></a>
    <a href="https://bundlephobia.com/package/@rc-component/picker"><img alt="bundle size" src="https://badgen.net/bundlephobia/minzip/@rc-component/picker"></a>
    <a href="https://github.com/umijs/dumi"><img alt="dumi" src="https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square"></a>
  </p>
</div>

<p align="center">English | <a href="./README.zh-CN.md">简体中文</a></p>

## Highlights

- Single picker, range picker, and panel-only picker exports.
- Date, time, week, month, quarter, and year modes.
- Pluggable `generateConfig` adapters for date-fns, dayjs, luxon, and moment.
- Locale packages exposed from `@rc-component/picker/locale/*`.
- Controlled value, popup state, panel value, presets, disabled dates, semantic class names, and custom cell rendering.
- TypeScript definitions for picker props, range values, locale, date-library adapters, and refs.
- Used by Ant Design as the shared date and time picker foundation.

## Install

```bash
npm install @rc-component/picker
```

Install the date library you plan to use if it is not already in your project:

```bash
npm install dayjs
```

## Usage

```tsx | pure
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import Picker from '@rc-component/picker';
import dayjsGenerateConfig from '@rc-component/picker/generate/dayjs';
import enUS from '@rc-component/picker/locale/en_US';
import '@rc-component/picker/assets/index.css';
export default () => (
  <Picker<Dayjs> generateConfig={dayjsGenerateConfig} locale={enUS} defaultValue={dayjs()} />
);
```

```tsx | pure
import type { Dayjs } from 'dayjs';
import { RangePicker } from '@rc-component/picker';
import dayjsGenerateConfig from '@rc-component/picker/generate/dayjs';
import enUS from '@rc-component/picker/locale/en_US';
export default () => (
  <RangePicker<Dayjs>
    generateConfig={dayjsGenerateConfig}
    locale={enUS}
    showTime
    presets={[
      {
        label: 'Today',
        value: () => [dayjsGenerateConfig.getNow(), dayjsGenerateConfig.getNow()],
      },
    ]}
  />
);
```

## Examples

Run the local dumi site:

```bash
npm install
npm start
```

Then open `http://localhost:8000`.

## API

### Exports

| Export        | Description                                                   |
| ------------- | ------------------------------------------------------------- |
| `Picker`      | Input picker for one date/time value or multiple values.      |
| `RangePicker` | Input picker for start and end date/time values.              |
| `PickerPanel` | Panel-only picker without the input trigger.                  |
| `generate/*`  | Date-library adapters for date-fns, dayjs, luxon, and moment. |
| `locale/*`    | Locale objects for picker UI text and formats.                |
| `interface`   | Shared TypeScript types.                                      |

### Shared Picker Props

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| allowClear | `boolean \| { clearIcon?: ReactNode }` | `false` | Show the clear button or customize it. |
| cellRender | `CellRender<DateType>` | - | Customize date, time, and range cells. |
| changeOnBlur | `boolean` | - | Commit typed values on blur when valid. |
| className | `string` | - | Class name for the picker root. |
| classNames | `SemanticClassNames` | - | Semantic class names for root and popup slots. |
| components | `Components<DateType>` | - | Component overrides. |
| defaultOpen | `boolean` | - | Initial popup open state. |
| disabledDate | `DisabledDate<DateType>` | - | Disable selectable dates. |
| format | `string \| string[] \| FormatType<DateType>[]` | locale dependent | Format and parse input values. |
| generateConfig | `GenerateConfig<DateType>` | required | Date-library adapter. |
| getPopupContainer | `(node: HTMLElement) => HTMLElement` | - | Popup container. |
| inputReadOnly | `boolean` | - | Make input read-only. |
| locale | `Locale` | required | Locale text and formats. |
| maxDate | `DateType` | - | Latest selectable date. |
| minDate | `DateType` | - | Earliest selectable date. |
| needConfirm | `boolean` | - | Require OK confirmation before change. |
| open | `boolean` | - | Controlled popup open state. |
| picker | `'time' \| 'date' \| 'week' \| 'month' \| 'quarter' \| 'year'` | `date` | Picker mode. |
| pickerValue | `DateType \| [DateType, DateType] \| null` | - | Controlled panel date. |
| placeholder | `string \| [string, string]` | - | Input placeholder. |
| popupClassName | `string` | - | Class name for popup. |
| presets | `ValueDate<DateType>[]` | - | Preset values. |
| previewValue | `false \| 'hover'` | `hover` | Preview hovered values in input. |
| showNow | `boolean` | - | Show the "now" button. |
| showTime | `boolean \| SharedTimeProps` | `false` | Enable time selection. |
| showToday | `boolean` | - | Show the "today" button. |
| styles | `SemanticStyles` | - | Semantic styles for root and popup slots. |
| suffixIcon | `ReactNode` | - | Custom suffix icon. |
| onOpenChange | `(open: boolean) => void` | - | Triggered when popup open state changes. |
| onPanelChange | `(value, mode) => void` | - | Triggered when panel mode changes. |

### Picker Props

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| defaultPickerValue | `DateType \| null` | - | Initial panel date whenever the popup opens. |
| defaultValue | `DateType \| DateType[]` | - | Initial selected value. |
| multiple | `boolean` | `false` | Enable multiple selection for supported modes. |
| tagRender | `(props: CustomTagProps<DateType>) => ReactNode` | - | Customize multiple value tags. |
| value | `DateType \| DateType[] \| null` | - | Controlled selected value. |
| onCalendarChange | `(date, dateString, info) => void` | - | Triggered while calendar selection changes. |
| onChange | `(date, dateString) => void` | - | Triggered when selected value changes. |
| onOk | `(value) => void` | - | Triggered when OK is clicked. |

### RangePicker Props

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| allowEmpty | `boolean \| [boolean, boolean]` | `false` | Allow empty start or end values. |
| defaultPickerValue | `[DateType, DateType] \| DateType \| null` | - | Initial panel date whenever the popup opens. |
| defaultValue | `[DateType \| null \| undefined, DateType \| null \| undefined]` | - | Initial selected range. |
| disabled | `boolean \| [boolean, boolean]` | `false` | Disable the whole range or one side. |
| order | `boolean` | `true` | Keep selected range ordered. |
| ranges | `Record<string, RangeValue \| () => RangeValue>` | - | Deprecated preset API. Use `presets`. |
| separator | `ReactNode` | - | Separator between range inputs. |
| value | `[DateType \| null \| undefined, DateType \| null \| undefined] \| null` | - | Controlled selected range. |
| onCalendarChange | `(dates, dateStrings, info) => void` | - | Triggered while range selection changes. |
| onChange | `(dates, dateStrings) => void` | - | Triggered when selected range changes. |
| onOk | `(values) => void` | - | Triggered when OK is clicked. |

### Time Options

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| changeOnScroll | `boolean` | `false` | Change time values on scroll. |
| defaultOpenValue | `DateType \| DateType[]` | - | Default time template when selection is empty. |
| disabledTime | `(date, range?, info?) => DisabledTimes` | - | Disable hours, minutes, seconds, or milliseconds. |
| format | `string` | - | Time format. |
| hideDisabledOptions | `boolean` | `false` | Hide disabled time options. |
| hourStep | `number` | `1` | Hour interval. |
| millisecondStep | `number` | `1` | Millisecond interval. |
| minuteStep | `number` | `1` | Minute interval. |
| secondStep | `number` | `1` | Second interval. |
| showHour | `boolean` | `true` | Show hour column. |
| showMillisecond | `boolean` | `false` | Show millisecond column. |
| showMinute | `boolean` | `true` | Show minute column. |
| showNow | `boolean` | - | Show now shortcut. |
| showSecond | `boolean` | `true` | Show second column. |
| use12Hours | `boolean` | `false` | Use 12-hour display. |

## Development

```bash
npm install
npm start
npm test
npm run tsc
npm run coverage
npm run compile
npm run build
```

The dumi site runs at `http://localhost:8000` by default.

## Release

```bash
npm run prepublishOnly
```

The release flow is handled by `@rc-component/np` through the `rc-np` command after the package build.

## License

@rc-component/picker is released under the [MIT](./LICENSE) license.

<div align="center">
  <h1>@rc-component/picker</h1>
  <p><sub><a href="https://ant.design"><img alt="Ant Design" height="14" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" style="vertical-align: -0.125em;" /></a> Ant Design 生态的一部分。</sub></p>
  <p>📅 React 日期与时间选择基础组件。</p>

  <p>
    <a href="https://npmjs.org/package/@rc-component/picker"><img alt="NPM version" src="https://img.shields.io/npm/v/@rc-component/picker.svg?style=flat-square"></a>
    <a href="https://npmjs.org/package/@rc-component/picker"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@rc-component/picker.svg?style=flat-square"></a>
    <a href="https://github.com/react-component/picker/actions/workflows/react-component-ci.yml"><img alt="build status" src="https://github.com/react-component/picker/actions/workflows/react-component-ci.yml/badge.svg"></a>
    <a href="https://app.codecov.io/gh/react-component/picker"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/react-component/picker/master.svg?style=flat-square"></a>
    <a href="https://bundlephobia.com/package/@rc-component/picker"><img alt="bundle size" src="https://img.shields.io/bundlephobia/minzip/@rc-component/picker?style=flat-square"></a>
    <a href="https://github.com/umijs/dumi"><img alt="dumi" src="https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square"></a>
  </p>
</div>

<p align="center"><a href="./README.md">English</a> | 简体中文</p>

## 特性

- 单一拾取器、范围拾取器和仅面板拾取器导出。
- 日期、时间、周、月、季度和年模式。
- 适用于 date-fns、dayjs、luxon 和 moment 的可插拔 `generateConfig` 适配器。
- 从 `@rc-component/picker/locale/*` 公开的语言环境包。
- 受控值、弹层状态、面板值、预设、禁用日期、语义 className 和自定义单元格渲染。
- 选择器属性、范围值、区域设置、日期库适配器和引用的 TypeScript 定义。
- 被 Ant Design 共享的日期和时间选择器基础能力。

## 安装

```bash
npm install @rc-component/picker
```

如果项目尚未安装日期库，请先安装计划使用的日期库：

```bash
npm install dayjs
```

## 使用

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

## 示例

运行本地 dumi 站点：

```bash
ut install
npm start
```

然后打开 `http://localhost:8000`。

## API

### Exports

| Export        | 说明                                                     |
| ------------- | -------------------------------------------------------- |
| `Picker`      | 用于单个或多个日期/时间值的输入型选择器。                |
| `RangePicker` | 用于开始和结束日期/时间值的输入型范围选择器。            |
| `PickerPanel` | 仅面板选择器，没有输入触发器。                           |
| `generate/*`  | 适用于 date-fns、dayjs、luxon 和 moment 的日期库适配器。 |
| `locale/*`    | 选择器 UI 文本和格式的区域设置对象。                     |
| `interface`   | 共享 TypeScript 类型。                                   |

### Shared Picker Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| allowClear | `boolean \| { clearIcon?: ReactNode }` | `false` | 显示清除按钮或自定义它。 |
| cellRender | `CellRender<DateType>` | - | 自定义日期、时间和范围单元格。 |
| changeOnBlur | `boolean` | - | 当有效时，提交关于模糊的键入值。 |
| className | `string` | - | 选择器根的 className。 |
| classNames | `SemanticClassNames` | - | 根槽和弹层槽的语义 className。 |
| components | `Components<DateType>` | - | 组件覆盖配置。 |
| defaultOpen | `boolean` | - | 初始弹层打开状态。 |
| disabledDate | `DisabledDate<DateType>` | - | 禁用可选择的日期。 |
| format | `string \| string[] \| FormatType<DateType>[]` | 依赖于语言环境 | 格式化并解析输入值。 |
| generateConfig | `GenerateConfig<DateType>` | 必需的 | 日期库适配器。 |
| getPopupContainer | `(node: HTMLElement) => HTMLElement` | - | 弹层容器。 |
| inputReadOnly | `boolean` | - | 使输入只读。 |
| locale | `Locale` | 必需的 | 区域设置文本和格式。 |
| maxDate | `DateType` | - | 最晚可选日期。 |
| minDate | `DateType` | - | 最早可选日期。 |
| needConfirm | `boolean` | - | 更改前需要确定确认。 |
| open | `boolean` | - | 受控弹层打开状态。 |
| picker | `'time' \| 'date' \| 'week' \| 'month' \| 'quarter' \| 'year'` | `date` | 选择器模式。 |
| pickerValue | `DateType \| [DateType, DateType] \| null` | - | 受控面板日期。 |
| placeholder | `string \| [string, string]` | - | 输入框占位文本。 |
| popupClassName | `string` | - | 弹层窗口的 className。 |
| presets | `ValueDate<DateType>[]` | - | 预设值。 |
| previewValue | `false \| 'hover'` | `hover` | 预览输入中的悬停值。 |
| showNow | `boolean` | - | 显示“现在”按钮。 |
| showTime | `boolean \| SharedTimeProps` | `false` | 启用时间选择。 |
| showToday | `boolean` | - | 显示“今天”按钮。 |
| styles | `SemanticStyles` | - | 根槽和弹层槽的语义样式。 |
| suffixIcon | `ReactNode` | - | 自定义后缀图标。 |
| onOpenChange | `(open: boolean) => void` | - | 当弹层窗口打开状态改变时触发。 |
| onPanelChange | `(value, mode) => void` | - | 当面板模式改变时触发。 |

### Picker Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| defaultPickerValue | `DateType \| null` | - | 弹层窗口打开时的初始面板日期。 |
| defaultValue | `DateType \| DateType[]` | - | 初始选中值。 |
| multiple | `boolean` | `false` | 为支持的模式启用多重选择。 |
| tagRender | `(props: CustomTagProps<DateType>) => ReactNode` | - | 自定义多个值标签。 |
| value | `DateType \| DateType[] \| null` | - | 受控选中值。 |
| onCalendarChange | `(date, dateString, info) => void` | - | 日历选择更改时触发。 |
| onChange | `(date, dateString) => void` | - | 当所选值更改时触发。 |
| onOk | `(value) => void` | - | 单击“确定”时触发。 |

### RangePicker Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| allowEmpty | `boolean \| [boolean, boolean]` | `false` | 允许空的开始值或结束值。 |
| defaultPickerValue | `[DateType, DateType] \| DateType \| null` | - | 弹层窗口打开时的初始面板日期。 |
| defaultValue | `[DateType \| null \| undefined, DateType \| null \| undefined]` | - | 初始选定范围。 |
| disabled | `boolean \| [boolean, boolean]` | `false` | 禁用整个范围或一侧。 |
| order | `boolean` | `true` | 保持选定范围的顺序。 |
| ranges | `Record<string, RangeValue \| () => RangeValue>` | - | 已弃用预设 API。使用 `presets`。 |
| separator | `ReactNode` | - | 范围输入之间的分隔符。 |
| value | `[DateType \| null \| undefined, DateType \| null \| undefined] \| null` | - | 受控选定范围。 |
| onCalendarChange | `(dates, dateStrings, info) => void` | - | 当范围选择更改时触发。 |
| onChange | `(dates, dateStrings) => void` | - | 当选定范围更改时触发。 |
| onOk | `(values) => void` | - | 单击“确定”时触发。 |

### Time Options

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| changeOnScroll | `boolean` | `false` | 更改滚动上的时间值。 |
| defaultOpenValue | `DateType \| DateType[]` | - | 选择为空时的默认时间模板。 |
| disabledTime | `(date, range?, info?) => DisabledTimes` | - | 禁用小时、分钟、秒或毫秒。 |
| format | `string` | - | Time format. |
| hideDisabledOptions | `boolean` | `false` | 隐藏禁用的时间选项。 |
| hourStep | `number` | `1` | 小时间隔。 |
| millisecondStep | `number` | `1` | 毫秒间隔。 |
| minuteStep | `number` | `1` | 分钟间隔。 |
| secondStep | `number` | `1` | 秒间隔。 |
| showHour | `boolean` | `true` | 显示小时列。 |
| showMillisecond | `boolean` | `false` | 显示毫秒列。 |
| showMinute | `boolean` | `true` | 显示分钟栏。 |
| showNow | `boolean` | - | 现在显示快捷方式。 |
| showSecond | `boolean` | `true` | 显示第二列。 |
| use12Hours | `boolean` | `false` | 使用 12 小时制显示。 |

## 本地开发

```bash
ut install
npm start
npm test
npm run tsc
npm run coverage
npm run compile
npm run build
```

dumi 站点默认运行在 `http://localhost:8000`。

## 发布

```bash
npm run prepublishOnly
```

包构建完成后，发布流程由 `@rc-component/np` 通过 `rc-np` 命令处理。

## 许可证

@rc-component/picker 基于 [MIT](./LICENSE) 许可证发布。

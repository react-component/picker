/**
 * What's new?
 * - Common
 *  - [Break] Support special year format, all the year will follow the locale config.
 *  - Blur all of field will trigger `onChange` if validate
 *  - Support `preserveInvalidOnBlur` to not to clean input if invalid
 *  - `pickerValue` is now full controlled
 *    - `defaultPickerValue` will take effect on every field active with popup opening.
 * 
 * - Picker
 *  - TimePicker support `changeOnScroll`
 *  - TimePicker support `showTitle`
 *  - TimePicker support `millisecond`
 *  - Support meridiemFormat for AM/PM
 *  - Get correct `disabledHours` when set `use12Hours`
 *  - Support `showWeek`
 * 
 * - RangePicker
 *  - [Break] RangePicker is now not limit the range of clicked field.
 *  - Trigger `onCalendarChange` when type correct
 *  - [Break] Not order `value` if given `value` is wrong order.
 *  - Hover `presets` will show date in input field.
 */
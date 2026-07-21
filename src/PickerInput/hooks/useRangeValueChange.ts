import { useEvent, useSyncState } from '@rc-component/util';
import * as React from 'react';

// ============================= Types =============================

/** Change source of a field. / Field 的变更来源。 */
export type RangeValueChangeSource =
  | 'input'
  | 'keyboard-submit'
  | 'esc'
  | 'panel-intermediate'
  | 'panel-final'
  | 'blur'
  | 'field-switch'
  | 'confirm';

/** Resolved operation for one field interaction. / 一次 field 交互最终执行的操作。 */
export type RangeValueChangeAction =
  'modify' | 'switchNext' | 'abort' | 'resetCurrent' | 'resetCurrentAndSwitchNext' | 'resetAll';

/** Receive a field interaction and its optional value. / 接收 field 交互及可选变更值。 */
export type TriggerChange<FieldValue> = (
  index: number,
  source: RangeValueChangeSource,
  value?: FieldValue,
) => void;

/** Read the latest temporary CalendarValue. / 读取最新的临时 CalendarValue。 */
export type GetCalendarValue<FieldValue> = () => readonly (FieldValue | null | undefined)[];

/** Update one field in CalendarValue. / 更新 CalendarValue 中的一个 field。 */
export type TriggerCalendarChange<FieldValue> = (index: number, value: FieldValue) => void;

/**
 * Flush one field and optionally emit the final change.
 * 提交一个 field，并按需触发最终 change。
 */
export type FlushSubmit = (index: number, needTriggerChange: boolean) => void;

/**
 * Reset one field, or all fields when index is omitted.
 * 重置指定 field；未传 index 时重置全部 field。
 */
export type ResetValue = (index?: number) => void;

export type UseRangeValueChangeReturn<FieldValue> = [
  currentIndex: number | null,
  activeIndex: number,
  triggeredFields: number[],
  triggerChange: TriggerChange<FieldValue>,
];

// ============================== Hook ==============================

/**
 * Coordinate CalendarValue updates, part submits and final submits for any
 * number of fields.
 * 统一管理任意数量 field 的 CalendarValue 更新、局部提交与最终提交。
 *
 * Flow / 流程：
 * First resolve `source`, `needConfirm`, `allowEmpty` and the field indexes to
 * one action, then execute that action in a single switch statement.
 * 先根据 `source`、`needConfirm`、`allowEmpty` 与 field index 得到唯一 action，
 * 再通过统一的 switch 执行 action。
 *
 * - `modify`: update or record the current CalendarValue.
 *   更新或记录当前 CalendarValue。
 * - `switchNext`: submit the current field and advance to the next field.
 *   提交当前 field 并推进到下一个 field。
 * - `abort`: stop without changing any state.
 *   直接短路，不改变任何状态。
 * - `resetCurrent`: discard only the current field.
 *   仅撤销当前 field。
 * - `resetCurrentAndSwitchNext`: discard the current temporary value, mark the
 *   field as handled, then advance. / 撤销当前临时值，将 field 标记为已处理后推进。
 * - `resetAll`: discard all temporary values and end the interaction.
 *   撤销全部临时值并结束本轮交互。
 */
export default function useRangeValueChange<FieldValue = unknown>(
  fieldCount: number,
  needConfirm: boolean,
  allowEmpty: readonly boolean[],
  getCalendarValue: GetCalendarValue<FieldValue>,
  triggerCalendarChange: TriggerCalendarChange<FieldValue>,
  flushSubmit: FlushSubmit,
  resetValue: ResetValue,
): UseRangeValueChangeReturn<FieldValue> {
  // ============================= State =============================

  // Record fields involved in the current interaction.
  // 记录当前一轮交互中触发过的 field。
  const triggeredFieldsRef = React.useRef<number[]>([]);

  // Keep a render value and a synchronous getter for event handlers.
  // 同时保存渲染值，以及供事件处理函数同步读取的 getter。
  const [getCurrentIndex, setCurrentIndex] = useSyncState<number | null>(null);

  // Keep the latest accepted field for panel and selector rendering.
  // 保留最后一个被业务接受的 field，供 panel 和 selector 渲染使用；
  const lastValidIndexRef = React.useRef<number | undefined>(undefined);

  // ============================= Record ============================

  // Keep fields unique while preserving their first-triggered order. The
  // current field is tracked separately by `currentIndex`.
  // field 保持唯一，同时保留首次触发顺序；当前 field 由 `currentIndex`
  // 单独记录。
  const recordTriggeredField = (index: number) => {
    if (!triggeredFieldsRef.current.includes(index)) {
      triggeredFieldsRef.current = [...triggeredFieldsRef.current, index];
    }
  };

  // ============================= Submit ============================

  // Flush the current field, then finish the round or advance to the next one.
  // 提交当前 field，随后结束本轮或推进到下一个 field。
  const submitField = (index: number) => {
    recordTriggeredField(index);

    // Trigger final change after every field has participated once.
    // 所有 field 都参与过一次后，触发最终 change。
    const allFieldsTriggered = triggeredFieldsRef.current.length >= fieldCount;
    flushSubmit(index, allFieldsTriggered);

    if (allFieldsTriggered) {
      triggeredFieldsRef.current = [];
      setCurrentIndex(null);
    } else {
      const nextIndex = (index + 1) % fieldCount;
      setCurrentIndex(nextIndex);
    }

    return allFieldsTriggered;
  };

  // ============================= Resolve ===========================

  // Resolve an interaction to one action without changing any state.
  // 仅根据当前状态解析 action，不在判断过程中修改任何状态。
  const resolveAction = (
    currentIndex: number | null,
    index: number,
    source: RangeValueChangeSource,
    value?: FieldValue,
  ): RangeValueChangeAction => {
    if (source === 'esc') {
      return 'resetAll';
    }

    if (currentIndex === null) {
      return 'abort';
    }

    const currentValue = value === undefined ? getCalendarValue()[currentIndex] : value;
    const currentEmpty = currentValue === null || currentValue === undefined;
    const canSwitch = !currentEmpty || allowEmpty[currentIndex];

    if (source === 'field-switch') {
      if (index === currentIndex) {
        return 'abort';
      }

      const nextIndex = (currentIndex + 1) % fieldCount;
      if (index !== nextIndex) {
        return 'abort';
      }

      if (needConfirm) {
        return currentEmpty && allowEmpty[currentIndex] ? 'resetCurrentAndSwitchNext' : 'abort';
      }

      return canSwitch ? 'switchNext' : 'resetCurrent';
    }

    if (index !== currentIndex) {
      return 'abort';
    }

    if (source === 'blur') {
      if (needConfirm || !canSwitch) {
        return 'resetAll';
      }

      return 'switchNext';
    }

    if (source === 'input' || source === 'panel-intermediate') {
      return 'modify';
    }

    if (source === 'panel-final') {
      return needConfirm ? 'modify' : 'switchNext';
    }

    if (source === 'keyboard-submit' || source === 'confirm') {
      return canSwitch ? 'switchNext' : 'abort';
    }

    return 'abort';
  };

  // ============================= Trigger ===========================

  // Route every interaction through action resolution, then execute the
  // resolved action in one place.
  // 所有交互先统一解析 action，再在一个位置执行对应操作。
  const triggerChange = useEvent(
    (index: number, source: RangeValueChangeSource, value?: FieldValue) => {
      let currentIndex = getCurrentIndex();

      // Start a new interaction from the first non-blur event. A standalone
      // blur has no active field to finish and must not create one.
      // 第一条非 blur 事件用于建立新一轮交互；单独的 blur 没有可结束的 field，
      // 也不应因此创建 currentIndex。
      if (currentIndex === null && source !== 'blur' && source !== 'esc') {
        currentIndex = index;
        setCurrentIndex(index);
        recordTriggeredField(index);
      }

      const action = resolveAction(currentIndex, index, source, value);
      const actionIndex = currentIndex ?? index;

      switch (action) {
        case 'modify':
          recordTriggeredField(actionIndex);
          if (value !== undefined) {
            triggerCalendarChange(actionIndex, value);
          }
          break;

        case 'switchNext':
          if (value !== undefined) {
            triggerCalendarChange(actionIndex, value);
          }
          if (!submitField(actionIndex) && source === 'field-switch') {
            recordTriggeredField(index);
          }
          break;

        case 'resetCurrent':
          resetValue(actionIndex);
          triggeredFieldsRef.current = triggeredFieldsRef.current.filter(
            (fieldIndex) => fieldIndex !== actionIndex,
          );
          break;

        case 'resetCurrentAndSwitchNext':
          resetValue(actionIndex);
          if (!submitField(actionIndex) && source === 'field-switch') {
            recordTriggeredField(index);
          }
          break;

        case 'resetAll':
          resetValue();
          triggeredFieldsRef.current = [];
          setCurrentIndex(null);
          break;

        case 'abort':
          if (source === 'field-switch' && index === actionIndex) {
            recordTriggeredField(index);
          }
          break;
      }
    },
  );

  const currentIndex = getCurrentIndex();
  lastValidIndexRef.current = currentIndex ?? lastValidIndexRef.current ?? 0;

  return [currentIndex, lastValidIndexRef.current, triggeredFieldsRef.current, triggerChange];
}

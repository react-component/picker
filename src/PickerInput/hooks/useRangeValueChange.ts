import { useEvent, useSyncState } from '@rc-component/util';
import * as React from 'react';

/** Change source of a field. / Field 的变更来源。 */
export type RangeValueChangeSource =
  | 'input'
  | 'keyboard-submit'
  | 'panel-intermediate'
  | 'panel-final'
  | 'blur'
  | 'field-switch'
  | 'confirm';

/** Receive a field interaction and its optional value. / 接收 field 交互及可选变更值。 */
export type TriggerChange<DateType> = (
  index: number,
  source: RangeValueChangeSource,
  date?: DateType,
) => void;

/** Read the latest temporary CalendarValue. / 读取最新的临时 CalendarValue。 */
export type GetCalendarValue<DateType> = () => readonly (DateType | null | undefined)[];

/** Update one field in CalendarValue. / 更新 CalendarValue 中的一个 field。 */
export type TriggerCalendarChange<DateType> = (index: number, date: DateType) => void;

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

export type UseRangeValueChangeReturn<DateType> = [
  currentIndex: number | null,
  triggerChange: TriggerChange<DateType>,
];

/**
 * Coordinate CalendarValue updates, part submits and final submits for any
 * number of fields.
 * 统一管理任意数量 field 的 CalendarValue 更新、局部提交与最终提交。
 *
 * Flow / 流程：
 * 📝 update / 更新 · ✅ submit / 提交 · ↩️ reset / 回滚 · ⏸️ stay / 保持
 *
 * triggerChange(index, source, date)
 *                 |
 *                 +-- currentIndex is null / currentIndex 为空
 *                 |      |-- blur / 失焦
 *                 |      |      `-- ⏸️ ignore / 忽略
 *                 |      `-- other sources / 其他来源
 *                 |             `-- set currentIndex = index, continue
 *                 |                 建立 currentIndex，继续处理
 *                 |
 *                 +-- field-switch / 切换 field
 *                 |      |-- target is current / 目标就是当前 field
 *                 |      |      `-- ⏸️ stay / 保持
 *                 |      |-- no needConfirm and value is valid
 *                 |      |   无需确认且值有效
 *                 |      |      `-- ✅ submit current, switch / 提交并切换
 *                 |      |-- needConfirm and empty is allowed
 *                 |      |   需要确认且允许空值
 *                 |      |      `-- ↩️ reset, submit, switch / 重置、提交并切换
 *                 |      `-- otherwise / 其他情况
 *                 |             `-- ⏸️ keep current index / 保持当前 index
 *                 |
 *                 +-- index differs from current / 与当前 index 不一致
 *                 |      `-- ⏸️ ignore until current field completes
 *                 |          等待当前 field 完成，忽略本次操作
 *                 |
 *                 +-- blur / 失焦
 *                 |      |-- no needConfirm and current field was not changed
 *                 |      |   无需确认且当前 field 未发生变更
 *                 |      |      `-- ⏸️ end round / 结束本轮
 *                 |      |-- needConfirm or invalid empty value
 *                 |      |   需要确认或空值无效
 *                 |      |      `-- ↩️ reset all, end round / 全部重置并结束
 *                 |      `-- otherwise / 其他情况
 *                 |             `-- ✅ submit current field / 提交当前 field
 *                 |
 *                 +-- 📝 date exists / 存在 date
 *                 |      `-- update CalendarValue[index]
 *                 |
 *                 +-- input or panel-intermediate / 输入或面板中间操作
 *                 |      `-- ⏸️ update only / 仅更新 CalendarValue
 *                 |
 *                 +-- panel-final / 面板最终操作
 *                 |      |-- needConfirm / 需要确认
 *                 |      |      `-- ⏸️ update only / 仅更新 CalendarValue
 *                 |      `-- no needConfirm / 无需确认
 *                 |             `-- ✅ submit current field / 提交当前 field
 *                 |
 *                 +-- keyboard-submit or confirm / 键盘提交或确认按钮
 *                 |      `-- ✅ submit current field / 提交当前 field
 *                 |
 *                 `-- after submit / 提交后
 *                        |-- all fields completed / 所有 field 已完成
 *                        |      `-- final submit, clear round / 最终提交并结束本轮
 *                        `-- fields remain / 仍有 field 未完成
 *                               `-- move to next index / 推进到下一个 index
 *
 * Explicit submit sources are `keyboard-submit` and `confirm`. A
 * `panel-final` operation submits only when `needConfirm` is false.
 * 显式提交来源为 `keyboard-submit` 和 `confirm`；仅在无需确认时，
 * `panel-final` 操作才会提交。
 */
export default function useRangeValueChange<DateType = unknown>(
  fieldCount: number,
  needConfirm: boolean,
  allowEmpty: readonly boolean[],
  getCalendarValue: GetCalendarValue<DateType>,
  triggerCalendarChange: TriggerCalendarChange<DateType>,
  flushSubmit: FlushSubmit,
  resetValue: ResetValue,
): UseRangeValueChangeReturn<DateType> {
  // Record fields involved in the current interaction.
  // 记录当前一轮交互中触发过的 field。
  const triggeredFieldsRef = React.useRef<number[]>([]);

  // Keep a render value and a synchronous getter for event handlers.
  // 同时保存渲染值，以及供事件处理函数同步读取的 getter。
  const [getCurrentIndex, setCurrentIndex] = useSyncState<number | null>(null);

  // Keep fields unique and move the latest field to the end, so the same list
  // records both completed fields and the most recently changed field.
  // field 保持唯一，并将最近触发的 field 移到末尾；同一份列表即可同时记录
  // 已处理的 field 和最近发生变更的 field。
  const recordTriggeredField = (index: number) => {
    triggeredFieldsRef.current = [
      ...triggeredFieldsRef.current.filter((fieldIndex) => fieldIndex !== index),
      index,
    ];
  };

  // Flush the current field, then finish the round or advance to the next one.
  // 提交当前 field，随后结束本轮或推进到下一个 field。
  const submitField = (index: number, nextIndex?: number) => {
    recordTriggeredField(index);

    // Trigger final change after every field has participated once.
    // 所有 field 都参与过一次后，触发最终 change。
    const allFieldsTriggered = triggeredFieldsRef.current.length >= fieldCount;
    flushSubmit(index, allFieldsTriggered);

    if (allFieldsTriggered) {
      triggeredFieldsRef.current = [];
      setCurrentIndex(nextIndex ?? null);
    } else {
      setCurrentIndex(nextIndex ?? (index + 1) % fieldCount);
    }
  };

  // Route every interaction through the same event entry and decide whether
  // to update, reset, stay on the current field, or submit it.
  // 将所有交互统一收口，并判断应更新、重置、停留还是提交当前 field。
  const triggerChange = useEvent(
    (index: number, source: RangeValueChangeSource, date?: DateType) => {
      let currentIndex = getCurrentIndex();

      // Start a new interaction from the first non-blur event. A standalone
      // blur has no active field to finish and must not create one.
      // 第一条非 blur 事件用于建立新一轮交互；单独的 blur 没有可结束的 field，
      // 也不应因此创建 currentIndex。
      if (currentIndex === null) {
        if (source === 'blur') {
          return;
        }

        currentIndex = index;
        setCurrentIndex(index);
      }

      // For field switch, `index` is the target field. The previous field must
      // pass the switch check before focus can move.
      // field-switch 的 `index` 表示目标 field；前一个 field 通过检查后才能移动焦点。
      if (source === 'field-switch') {
        if (currentIndex === index) {
          return;
        }

        const previousIndex = currentIndex;
        const previousValue = getCalendarValue()[previousIndex];
        const previousEmpty = previousValue === null || previousValue === undefined;

        if (!needConfirm && (!previousEmpty || allowEmpty[previousIndex])) {
          submitField(previousIndex, index);
        } else if (needConfirm && previousEmpty && allowEmpty[previousIndex]) {
          resetValue(previousIndex);
          submitField(previousIndex, index);
        } else if (!needConfirm) {
          resetValue(previousIndex);
        }

        return;
      }

      // Only the current field may receive changes. A different field becomes
      // valid only after submitField completes the previous one and advances
      // currentIndex.
      // 只有当前 field 可以接收变更。必须由 submitField 完成前一个 field 并推进
      // currentIndex 后，另一个 field 的事件才会生效。
      if (currentIndex !== index) {
        return;
      }

      // Blur can end only the current field. A stale blur from another field
      // has already been ignored by the index guard above.
      // blur 只能结束当前 field；其他 field 的过期 blur 已由上方 index 门禁忽略。
      if (source === 'blur') {
        const blurIndex = currentIndex;

        const blurValue = getCalendarValue()[blurIndex];
        const blurEmpty = blurValue === null || blurValue === undefined;
        const triggeredFields = triggeredFieldsRef.current;
        const lastTriggeredIndex = triggeredFields[triggeredFields.length - 1];

        if (!needConfirm && lastTriggeredIndex !== blurIndex) {
          triggeredFieldsRef.current = [];
          setCurrentIndex(null);
        } else if (needConfirm || (blurEmpty && !allowEmpty[blurIndex])) {
          resetValue();
          triggeredFieldsRef.current = [];
          setCurrentIndex(null);
        } else {
          submitField(blurIndex);
        }

        return;
      }

      if (source === 'input' || source === 'panel-intermediate' || source === 'panel-final') {
        recordTriggeredField(index);
      }

      // A provided date updates the temporary CalendarValue.
      // 传入 date 时更新临时 CalendarValue。
      if (date !== undefined) {
        triggerCalendarChange(index, date);
      }

      // Explicit operations always submit. Final panel operations submit
      // automatically only when explicit confirmation is not required.
      // 显式操作始终提交；无需确认时，panel-final 也会自动提交。
      const isExplicitSubmit = source === 'keyboard-submit' || source === 'confirm';
      const isAutoSubmit = !needConfirm && source === 'panel-final';

      if (isExplicitSubmit || isAutoSubmit) {
        submitField(index);
      }
    },
  );

  return [getCurrentIndex(), triggerChange];
}

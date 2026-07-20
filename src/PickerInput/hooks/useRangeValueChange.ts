import { useEvent } from '@rc-component/util';
import * as React from 'react';

/** Change source of a field. / Field 的变更来源。 */
export type RangeValueChangeSource =
  'input' | 'keyboard-submit' | 'panel' | 'blur' | 'field-switch' | 'confirm';

export type TriggerChange<DateType> = (
  index: number,
  source: RangeValueChangeSource,
  date?: DateType,
) => boolean;

export type GetCalendarValue<DateType> = () => readonly (DateType | null | undefined)[];

export type TriggerCalendarChange<DateType> = (index: number, date: DateType) => void;

export type FlushSubmit = (index: number, needTriggerChange: boolean) => void;

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
 *                 +-- 📝 date exists / 存在 date
 *                 |      `-- update CalendarValue[index]
 *                 |
 *                 +-- field-switch / 切换 field
 *                 |      |-- needConfirm, or empty and not allowEmpty
 *                 |      |   需要确认，或值为空且不允许为空
 *                 |      |      `-- ↩️ reset current field, reject switch
 *                 |      |          回滚当前 field，拒绝切换
 *                 |      `-- has value or allowEmpty / 有值或允许为空
 *                 |             `-- ✅ allow switch and submit / 允许切换并提交
 *                 |
 *                 +-- ✅ other sources can submit / 其他来源可以提交
 *                 |      |-- flush current field / 提交当前 field
 *                 |      |-- all fields completed / 所有 field 已完成
 *                 |      |      `-- final submit, clear round / 最终提交并结束本轮
 *                 |      `-- fields remain / 仍有 field 未完成
 *                 |             `-- move to next index / 推进到下一个 index
 *                 |
 *                 +-- ↩️ blur without submit / 失焦但不能提交
 *                 |      `-- reset all CalendarValue, end round
 *                 |          回滚全部 CalendarValue，结束本轮
 *                 |
 *                 `-- ⏸️ other sources / 其他来源
 *                        `-- keep current field / 停留在当前 field
 *
 * Explicit submit sources are `keyboard-submit` and `confirm`. When
 * `needConfirm` is false, `panel`, `blur` and `field-switch` also submit.
 * 显式提交来源为 `keyboard-submit` 和 `confirm`；无需确认时，`panel`、`blur`
 * 与 `field-switch` 也会提交。
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
  const [currentIndex, setCurrentIndex] = React.useState<number | null>(null);

  const triggerChange = useEvent(
    (index: number, source: RangeValueChangeSource, date?: DateType) => {
      // The first operation starts from its field. Other operations do not
      // change currentIndex until the source completes the current field.
      // 第一次操作从对应 field 开始；后续操作只有完成当前 field 时才推进 currentIndex。
      setCurrentIndex((current) => current ?? index);

      // A provided date updates the temporary CalendarValue.
      // 传入 date 时更新临时 CalendarValue。
      if (date !== undefined) {
        triggerCalendarChange(index, date);
      }

      // A field switch is rejected when explicit confirmation is required, or
      // when the current field is empty and cannot be empty.
      // 需要显式确认，或当前 field 为空且不允许为空时，拒绝切换 field。
      if (source === 'field-switch') {
        const currentValue = getCalendarValue()[index];
        const canSwitch =
          !needConfirm &&
          ((currentValue !== null && currentValue !== undefined) || allowEmpty[index]);

        if (!canSwitch) {
          resetValue(index);
          return false;
        }
      }

      // Explicit operations always submit. Panel, blur and field switch submit
      // automatically only when explicit confirmation is not required.
      // 显式操作始终提交；无需确认时，panel、blur 和 field switch 也会自动提交。
      const isExplicitSubmit = source === 'keyboard-submit' || source === 'confirm';
      const isAutoSubmit =
        !needConfirm && (source === 'panel' || source === 'blur' || source === 'field-switch');

      if (isExplicitSubmit || isAutoSubmit) {
        // Record a field only after it completes part submit.
        // 仅在 field 完成 part submit 后记录。
        if (!triggeredFieldsRef.current.includes(index)) {
          triggeredFieldsRef.current.push(index);
        }

        // Trigger final change after every field has participated once.
        // 所有 field 都参与过一次后，触发最终 change。
        const allFieldsTriggered = triggeredFieldsRef.current.length >= fieldCount;
        flushSubmit(index, allFieldsTriggered);

        if (allFieldsTriggered) {
          triggeredFieldsRef.current = [];
          setCurrentIndex(null);
        } else {
          setCurrentIndex((index + 1) % fieldCount);
        }
      } else if (source === 'blur') {
        // Outside blur without submit ends and clears the current interaction.
        // 外侧 blur 未触发提交时，结束并清理当前一轮交互。
        resetValue();
        triggeredFieldsRef.current = [];
        setCurrentIndex(null);
      }

      return true;
    },
  );

  return [currentIndex, triggerChange];
}

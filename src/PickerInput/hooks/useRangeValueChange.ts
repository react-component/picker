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
  | 'modify'
  | 'switchNext'
  | 'switchPrevious'
  | 'finish'
  | 'abort'
  | 'resetCurrent'
  | 'resetCurrentAndSwitchNext'
  | 'resetAll';

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

interface TriggeredField {
  index: number;
  modified: boolean;
}

// ============================== Hook ==============================

/**
 * Coordinate CalendarValue updates, part submits and final submits for any
 * number of fields.
 * 统一管理任意数量 field 的 CalendarValue 更新、局部提交与最终提交。
 *
 * Flow / 流程：
 * Every event is first resolved from `source`, `needConfirm`, `allowEmpty` and
 * the field indexes to one action. State changes only happen while executing
 * that action, so event sources never submit or reset values on their own.
 * 每个事件先根据 `source`、`needConfirm`、`allowEmpty` 与 field index 得到唯一
 * action。状态只在执行 action 时改变，事件来源本身不直接提交或重置值。
 *
 * Source resolution / 事件解析：
 *
 * - `esc` always resolves to `resetAll`.
 *   `esc` 始终解析为 `resetAll`。
 * - With no current field, a standalone `blur` resolves to `resetAll`; any
 *   other non-cancel event starts a new interaction from its field.
 *   没有当前 field 时，独立的 `blur` 解析为 `resetAll`；其余非撤销事件从
 *   对应 field 开始新一轮交互。
 * - `field-switch` may return to an already visited previous field or advance
 *   exactly one field. `needConfirm` locks an unconfirmed non-empty field unless
 *   it allows empty; an allow-empty field is reset before advancing.
 *   `field-switch` 只允许返回已访问的上一个 field，或向后推进一个 field。
 *   `needConfirm` 会锁定未确认且非空的 field；允许空值时先重置再推进。
 * - Other sources must target the current field. `input` and
 *   `panel-intermediate` modify it; `panel-final` advances only without
 *   confirmation; `keyboard-submit` and `confirm` advance only when the field
 *   has a value or allows empty.
 *   其余来源必须指向当前 field。`input` 与 `panel-intermediate` 只修改；
 *   `panel-final` 仅在无需确认时推进；`keyboard-submit` 与 `confirm` 仅在有值
 *   或允许空值时推进。
 * - `blur` finishes an untouched interaction. Without confirmation it submits
 *   a valid field; with confirmation it submits only after every field has
 *   participated, otherwise it resets all temporary values. A modified
 *   allow-empty field is reset before the final submit.
 *   `blur` 会直接结束未修改的交互。无需确认时提交有效 field；需要确认时仅在
 *   所有 field 都参与过后提交，否则重置全部临时值。当前 field 已修改且允许
 *   为空时，会先重置当前值再完成提交。
 *
 * Action execution / Action 执行：
 *
 * - `modify`: update or record the current CalendarValue.
 *   更新或记录当前 CalendarValue。
 * - `switchNext`: submit the current field and advance to the next field.
 *   提交当前 field 并推进到下一个 field。
 * - `switchPrevious`: settle the current field and return to the previously
 *   handled field without a final submit. / 处理当前 field 后返回上一个已处理
 *   field，且不触发最终提交。
 * - `finish`: end an interaction in which no field was modified without
 *   resetting values. / 结束所有 field 均未修改的交互，不重置任何值。
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

  // Record fields involved in the current interaction and whether each field
  // has been modified since it became active.
  // 记录当前一轮交互中触发过的 field，以及它从本次激活后是否发生过修改。
  const triggeredFieldsRef = React.useRef<TriggeredField[]>([]);

  // Track the last explicitly confirmed field. `triggeredFields` also records
  // focus, so it cannot tell confirmed and unconfirmed values apart.
  // 记录最后一个明确确认过的 field。`triggeredFields` 同时记录 focus，
  // 因此无法单独区分已确认值与未确认值。
  const confirmedIndexRef = React.useRef<number | null>(null);

  // Keep a render value and a synchronous getter for event handlers.
  // 同时保存渲染值，以及供事件处理函数同步读取的 getter。
  const [getCurrentIndex, setCurrentIndex] = useSyncState<number | null>(null);

  // Keep the latest accepted field for panel and selector rendering.
  // 保留最后一个被业务接受的 field，供 panel 和 selector 渲染使用；
  const lastValidIndexRef = React.useRef(0);

  // ============================= Record ============================

  // Keep fields unique while preserving their first-triggered order. Omit
  // `modified` to keep the existing state, or pass it to start a new field
  // visit and record a modification.
  // field 保持唯一并保留首次触发顺序。省略 `modified` 时保留原状态；传入时
  // 用于开始一次新的 field 访问，或记录本次修改。
  const recordTriggeredField = (index: number, modified?: boolean) => {
    const field = triggeredFieldsRef.current.find((item) => item.index === index);

    if (field) {
      if (modified !== undefined) {
        field.modified = modified;
      }
    } else {
      triggeredFieldsRef.current = [
        ...triggeredFieldsRef.current,
        { index, modified: modified ?? false },
      ];
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
      confirmedIndexRef.current = null;
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
      // A blur after the interaction has completed still needs to discard any
      // temporary CalendarValue left by a controlled value.
      // 一轮交互结束后的 blur 仍需清理受控值留下的临时 CalendarValue。
      return source === 'blur' ? 'resetAll' : 'abort';
    }

    const currentValue = value === undefined ? getCalendarValue()[currentIndex] : value;
    const currentEmpty = currentValue === null || currentValue === undefined;
    const canSwitch = !currentEmpty || allowEmpty[currentIndex];

    if (source === 'field-switch') {
      if (index === currentIndex) {
        return 'abort';
      }

      const previousIndex = (currentIndex - 1 + fieldCount) % fieldCount;
      const isPreviousField =
        index === previousIndex &&
        triggeredFieldsRef.current.some((field) => field.index === index);

      if (isPreviousField) {
        const currentUnconfirmed = !currentEmpty && confirmedIndexRef.current !== currentIndex;

        // Keep the legacy needConfirm behavior: only an unconfirmed value locks
        // the current field. Empty, confirmed or allowEmpty fields may go back.
        // 保持旧版 needConfirm 行为：仅未确认值会锁定当前 field；当前为空、
        // 已确认或允许空值时，都可以返回上一个 field。
        if (needConfirm && currentUnconfirmed && !allowEmpty[currentIndex]) {
          return 'abort';
        }

        return 'switchPrevious';
      }

      const nextIndex = (currentIndex + 1) % fieldCount;
      if (index !== nextIndex) {
        return 'abort';
      }

      if (needConfirm) {
        if (confirmedIndexRef.current === currentIndex) {
          return 'switchNext';
        }

        // An allowEmpty field may be left without confirmation. Discard any
        // unconfirmed CalendarValue before moving to the next field.
        // allowEmpty field 可以在未确认时离开；切换前需要丢弃未确认的
        // CalendarValue，再进入下一个 field。
        return allowEmpty[currentIndex] ? 'resetCurrentAndSwitchNext' : 'abort';
      }

      return canSwitch ? 'switchNext' : 'resetCurrent';
    }

    if (index !== currentIndex) {
      return 'abort';
    }

    if (source === 'blur') {
      const interactionModified = triggeredFieldsRef.current.some((field) => field.modified);

      if (!interactionModified) {
        return 'finish';
      }

      if (needConfirm) {
        const currentModified =
          triggeredFieldsRef.current.find((field) => field.index === currentIndex)?.modified ??
          false;
        const allFieldsTriggered = triggeredFieldsRef.current.length >= fieldCount;

        // Blur ends the interaction instead of advancing to an unvisited field.
        // When the current field allows empty, discard its unconfirmed value
        // before finishing the round.
        // blur 用于结束交互，不应继续推进到尚未访问的 field。当前 field
        // 允许为空时，先丢弃未确认值，再结束本轮。
        if (!allFieldsTriggered || !canSwitch) {
          return 'resetAll';
        }

        if (currentModified) {
          return allowEmpty[currentIndex] ? 'resetCurrentAndSwitchNext' : 'resetAll';
        }

        return 'switchNext';
      }

      if (!canSwitch) {
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
      // blur may clean temporary values but must not create an active field.
      // 第一条非 blur 事件用于建立新一轮交互；单独的 blur 可以清理临时值，
      // 但不应因此创建 currentIndex。
      if (currentIndex === null && source !== 'blur' && source !== 'esc') {
        currentIndex = index;
        setCurrentIndex(index);
        recordTriggeredField(index, false);
      }

      const action = resolveAction(currentIndex, index, source, value);
      const actionIndex = currentIndex ?? index;

      switch (action) {
        case 'modify':
          recordTriggeredField(actionIndex, true);
          if (confirmedIndexRef.current === actionIndex) {
            confirmedIndexRef.current = null;
          }
          if (value !== undefined) {
            triggerCalendarChange(actionIndex, value);
          }
          break;

        case 'switchNext':
          if (source === 'panel-final' || value !== undefined) {
            recordTriggeredField(actionIndex, true);
          }
          if (value !== undefined) {
            triggerCalendarChange(actionIndex, value);
          }
          if (needConfirm && (source === 'keyboard-submit' || source === 'confirm')) {
            confirmedIndexRef.current = actionIndex;
          }
          if (submitField(actionIndex) && source === 'field-switch') {
            // The focus switch finishes the previous round and also starts a
            // new round from its target field.
            // 本次 focus 切换既结束上一轮，也以目标 field 开始新一轮。
            setCurrentIndex(index);
          }
          if (source === 'field-switch') {
            recordTriggeredField(index, false);
          }
          break;

        case 'switchPrevious': {
          if (!needConfirm) {
            const currentValue = getCalendarValue()[actionIndex];
            const currentEmpty = currentValue === null || currentValue === undefined;

            if (!currentEmpty || allowEmpty[actionIndex]) {
              // Going back may part-submit the current field, but must never
              // finish the whole round before the previous field is edited.
              // 返回上一个 field 时可以局部提交当前 field，但不能在用户修改
              // 上一个 field 前结束整轮提交。
              flushSubmit(actionIndex, false);
            } else {
              resetValue(actionIndex);
            }
          }

          const previousPosition = triggeredFieldsRef.current.findIndex(
            (field) => field.index === index,
          );
          triggeredFieldsRef.current = triggeredFieldsRef.current.slice(0, previousPosition + 1);
          recordTriggeredField(index, false);
          setCurrentIndex(index);
          break;
        }

        case 'finish':
          triggeredFieldsRef.current = [];
          confirmedIndexRef.current = null;
          setCurrentIndex(null);
          break;

        case 'resetCurrent':
          resetValue(actionIndex);
          if (confirmedIndexRef.current === actionIndex) {
            confirmedIndexRef.current = null;
          }
          triggeredFieldsRef.current = triggeredFieldsRef.current.filter(
            (field) => field.index !== actionIndex,
          );
          break;

        case 'resetCurrentAndSwitchNext':
          resetValue(actionIndex);
          if (confirmedIndexRef.current === actionIndex) {
            confirmedIndexRef.current = null;
          }
          if (submitField(actionIndex) && source === 'field-switch') {
            // The target field belongs to the next round after the previous
            // round is completed.
            // 上一轮结束后，切换目标 field 应归入新一轮。
            setCurrentIndex(index);
          }
          if (source === 'field-switch') {
            recordTriggeredField(index, false);
          }
          break;

        case 'resetAll':
          resetValue();
          triggeredFieldsRef.current = [];
          confirmedIndexRef.current = null;
          setCurrentIndex(null);
          break;

        case 'abort':
          if (source === 'field-switch' && index === actionIndex) {
            recordTriggeredField(index);
          }
          break;
      }

      // Remember the accepted field after the event has finished. Updating the
      // ref here keeps render pure while preserving the last index after the
      // interaction resets `currentIndex` to null.
      // 事件处理完成后记录已接受的 field。这样既能保持 render 纯净，也能在
      // 本轮交互将 `currentIndex` 重置为 null 后继续保留最后一个 index。
      const nextCurrentIndex = getCurrentIndex();
      if (nextCurrentIndex !== null) {
        lastValidIndexRef.current = nextCurrentIndex;
      }
    },
  );

  const currentIndex = getCurrentIndex();

  const triggeredFields = triggeredFieldsRef.current.map((field) => field.index);

  return [currentIndex, lastValidIndexRef.current, triggeredFields, triggerChange];
}

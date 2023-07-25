import type { ReactNode } from 'react';
import React from 'react';
import type { SourceType } from './useRangeOpen';
import type { RangeValue } from '../interface';
import { getValue, updateValues } from '../utils/miscUtil';

export function useAllowClear<DateType>(
    isRange: boolean,
    prefixCls,
    triggerChange: (date: DateType | RangeValue<DateType> | null, sourceIndex?: 0 | 1) => void,
    triggerOpen: (open: boolean, activeIndex?: false | 0 | 1, source?: SourceType) => void,
    allowClear?: boolean | { clearIcon?: ReactNode },
    clearIcon?: ReactNode,
    mergedValue?: DateType | RangeValue<DateType>,
    mergedDisabled?: boolean | [boolean, boolean],
    mergedActivePickerIndex?: 0 | 1
) {
    const mergedClearIcon = React.useMemo(() => {
        if (typeof allowClear === "object") {
            return allowClear.clearIcon;
        }
        if (!!clearIcon) return clearIcon;
    }, [allowClear, clearIcon]);


    const mergedAllowClear = React.useMemo(() => {
        if (
            !!allowClear
        ) {
            if (isRange) {
                return (
                    (getValue(mergedValue as RangeValue<DateType>, 0) && !mergedDisabled[0]) ||
                    (getValue(mergedValue as RangeValue<DateType>, 1) && !mergedDisabled[1])
                )

            }
            return mergedValue && !mergedDisabled;
        }
        return false;
    }, [allowClear, mergedDisabled, mergedValue, isRange]);

    return {
        allowClear: mergedAllowClear,
        clearIcon: (
            <span
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isRange) {
                        e.preventDefault();
                        e.stopPropagation();
                        let values = mergedValue as RangeValue<DateType>;

                        if (!mergedDisabled[0]) {
                            values = updateValues(values, null, 0);
                        }
                        if (!mergedDisabled[1]) {
                            values = updateValues(values, null, 1);
                        }

                        triggerChange(values, null);
                        triggerOpen(false, mergedActivePickerIndex, 'clear');
                    } else {
                        triggerChange(null);
                        triggerOpen(false);
                    }
                }}
                className={`${prefixCls}-clear`}
                role="button"
            >
                {mergedClearIcon || <span className={`${prefixCls}-clear-btn`} />}
            </span>
        )
    };
}

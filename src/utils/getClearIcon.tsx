import type { ReactNode } from "react";
import React from "react";

export function getClearIcon(
    prefixCls: string,
    allowClear?: boolean | { clearIcon?: ReactNode },
    clearIcon?: ReactNode,
) {

    const mergedClearIcon = typeof allowClear === "object" ? allowClear.clearIcon : clearIcon;

    return (
        mergedClearIcon || <span className={`${prefixCls}-clear-btn`} />
    );
}

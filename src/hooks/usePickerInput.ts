import raf from 'rc-util/lib/raf';
import type * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { addGlobalMouseDownEvent, getTargetFromEvent } from '../utils/uiUtil';

export default function usePickerInput({
  open,
  value,
  isClickOutside,
  triggerOpen,
  forwardKeyDown,
  onKeyDown,
  blurToCancel,
  changeOnBlur,
  onSubmit,
  onCancel,
  onFocus,
  onBlur,
}: {
  open: boolean;
  value: string;
  isClickOutside: (clickElement: EventTarget | null) => boolean;
  triggerOpen: (open: boolean) => void;
  forwardKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, preventDefault: () => void) => void;
  blurToCancel?: boolean;
  changeOnBlur?: boolean;
  onSubmit: () => void | boolean;
  onCancel: () => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}): [React.DOMAttributes<HTMLInputElement>, { focused: boolean; typing: boolean }] {
  const [typing, setTyping] = useState(false);
  const [focused, setFocused] = useState(false);

  /**
   * We will prevent blur to handle open event when user click outside,
   * since this will repeat trigger `onOpenChange` event.
   */
  const preventBlurRef = useRef<boolean>(false);

  const valueChangedRef = useRef<boolean>(false);

  const preventDefaultRef = useRef<boolean>(false);

  const inputProps: React.DOMAttributes<HTMLInputElement> = {
    onMouseDown: () => {
      setTyping(true);
      triggerOpen(true);
    },
    onKeyDown: (e) => {
      const preventDefault = (): void => {
        preventDefaultRef.current = true;
      };

      onKeyDown(e, preventDefault);

      if (preventDefaultRef.current) return;

      switch (e.key) {
        case 'Enter': {
          if (!open) {
            triggerOpen(true);
          } else if (onSubmit() !== false) {
            setTyping(true);
          }

          e.preventDefault();
          return;
        }

        case 'Tab': {
          if (typing && open && !e.shiftKey) {
            setTyping(false);
            e.preventDefault();
          } else if (!typing && open) {
            if (!forwardKeyDown(e) && e.shiftKey) {
              setTyping(true);
              e.preventDefault();
            }
          }
          return;
        }

        case 'Escape': {
          setTyping(true);
          onCancel();
          return;
        }
      }

      if (!open && !['Shift'].includes(e.key)) {
        triggerOpen(true);
      } else if (!typing) {
        // Let popup panel handle keyboard
        forwardKeyDown(e);
      }
    },

    onFocus: (e) => {
      setTyping(true);
      setFocused(true);

      if (onFocus) {
        onFocus(e);
      }
    },

    onBlur: (e) => {
      if (preventBlurRef.current || !isClickOutside(document.activeElement)) {
        preventBlurRef.current = false;
        return;
      }

      if (blurToCancel) {
        setTimeout(() => {
          let { activeElement } = document;
          while (activeElement && activeElement.shadowRoot) {
            activeElement = activeElement.shadowRoot.activeElement;
          }

          if (isClickOutside(activeElement)) {
            onCancel();
          }
        }, 0);
      } else if (open) {
        triggerOpen(false);

        if (valueChangedRef.current) {
          onSubmit();
        }
      }
      setFocused(false);

      onBlur?.(e);
    },
  };

  // check if value changed
  useEffect(() => {
    valueChangedRef.current = false;
  }, [open]);

  useEffect(() => {
    valueChangedRef.current = true;
  }, [value]);

  // Global click handler
  useEffect(() =>
    addGlobalMouseDownEvent((e: MouseEvent) => {
      const target = getTargetFromEvent(e);
      const clickedOutside = isClickOutside(target);

      if (open) {
        if (!clickedOutside) {
          preventBlurRef.current = true;

          // Always set back in case `onBlur` prevented by user
          raf(() => {
            preventBlurRef.current = false;
          });
        } else if (!changeOnBlur && !blurToCancel && (!focused || clickedOutside)) {
          triggerOpen(false);
        }
      }
    }),
  );

  return [inputProps, { focused, typing }];
}

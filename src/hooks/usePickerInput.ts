import * as React from 'react';
import KeyCode from 'rc-util/lib/KeyCode';
import { addGlobalMouseDownEvent } from '../utils/uiUtil';

export default function usePickerInput({
  open,
  isClickOutside,
  triggerOpen,
  forwardKeyDown,
  blurToCancel,
  onSubmit,
  onCancel,
  onFocus,
  onBlur,
}: {
  open: boolean;
  isClickOutside: (clickElement: EventTarget | null) => boolean;
  triggerOpen: (open: boolean) => void;
  forwardKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => boolean;
  blurToCancel?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}): [
  React.DOMAttributes<HTMLInputElement>,
  { focused: boolean; typing: boolean },
] {
  const [typing, setTyping] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  /**
   * We will prevent blur to handle open event when user click outside,
   * since this will repeat trigger `onOpenChange` event.
   */
  const preventBlurRef = React.useRef<boolean>(false);

  const inputProps: React.DOMAttributes<HTMLInputElement> = {
    onMouseDown: () => {
      setTyping(true);
      triggerOpen(true);
    },
    onKeyDown: e => {
      switch (e.which) {
        case KeyCode.ENTER: {
          if (!open) {
            triggerOpen(true);
          } else {
            onSubmit();
            setTyping(true);
          }

          e.preventDefault();
          return;
        }

        case KeyCode.TAB: {
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

        case KeyCode.ESC: {
          setTyping(true);
          onCancel();
          return;
        }
      }

      if (!open && ![KeyCode.SHIFT].includes(e.which)) {
        triggerOpen(true);
      } else if (!typing) {
        // Let popup panel handle keyboard
        forwardKeyDown(e);
      }
    },

    onFocus: e => {
      setTyping(true);
      setFocused(true);

      if (onFocus) {
        onFocus(e);
      }
    },

    onBlur: e => {
      if (preventBlurRef.current || !isClickOutside(document.activeElement)) {
        preventBlurRef.current = false;
        return;
      }

      if (blurToCancel) {
        setTimeout(() => {
          if (isClickOutside(document.activeElement)) {
            onCancel();
          }
        }, 0);
      } else {
        triggerOpen(false);
      }
      setFocused(false);

      if (onBlur) {
        onBlur(e);
      }
    },
  };

  // Global click handler
  React.useEffect(() =>
    addGlobalMouseDownEvent(({ target }: MouseEvent) => {
      if (open) {
        if (!isClickOutside(target)) {
          preventBlurRef.current = true;

          // Always set back in case `onBlur` prevented by user
          window.setTimeout(() => {
            preventBlurRef.current = false;
          }, 0);
        } else if (!focused) {
          triggerOpen(false);
        }
      }
    }),
  );

  return [inputProps, { focused, typing }];
}

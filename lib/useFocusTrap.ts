"use client";

import { useEffect, type RefObject } from "react";

type FocusTrapOptions = {
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  onEscape?: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  lockScroll?: boolean;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useFocusTrap({
  active,
  containerRef,
  onEscape,
  returnFocusRef,
  lockScroll = true,
}: FocusTrapOptions) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement as HTMLElement | null;
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    );
    const firstFocusable = focusableElements[0] ?? container;
    const fallbackFocusTarget =
      returnFocusRef?.current ?? previousActiveElement ?? null;

    container.tabIndex = -1;
    firstFocusable.focus();

    if (lockScroll) {
      document.body.style.overflow = "hidden";
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const currentFocusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector)
      );
      const currentFirst = currentFocusableElements[0] ?? container;
      const currentLast =
        currentFocusableElements[currentFocusableElements.length - 1] ??
        container;

      if (event.shiftKey && document.activeElement === currentFirst) {
        event.preventDefault();
        currentLast.focus();
      } else if (!event.shiftKey && document.activeElement === currentLast) {
        event.preventDefault();
        currentFirst.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      fallbackFocusTarget?.focus();
    };
  }, [active, containerRef, lockScroll, onEscape, returnFocusRef]);
}

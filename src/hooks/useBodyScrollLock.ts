import { useEffect } from 'react';

let activeLocks = 0;
let originalBodyOverflow = '';
let originalBodyPaddingRight = '';
let originalBodyOverscrollBehavior = '';
let originalDocumentOverflow = '';
let originalDocumentOverscrollBehavior = '';

const lockPageScroll = () => {
  if (activeLocks === 0) {
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const bodyPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    originalBodyOverflow = body.style.overflow;
    originalBodyPaddingRight = body.style.paddingRight;
    originalBodyOverscrollBehavior = body.style.overscrollBehavior;
    originalDocumentOverflow = documentElement.style.overflow;
    originalDocumentOverscrollBehavior = documentElement.style.overscrollBehavior;

    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    documentElement.style.overflow = 'hidden';
    documentElement.style.overscrollBehavior = 'none';

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;
    }
  }

  activeLocks += 1;
};

const unlockPageScroll = () => {
  activeLocks = Math.max(0, activeLocks - 1);
  if (activeLocks !== 0) return;

  const { body, documentElement } = document;
  body.style.overflow = originalBodyOverflow;
  body.style.paddingRight = originalBodyPaddingRight;
  body.style.overscrollBehavior = originalBodyOverscrollBehavior;
  documentElement.style.overflow = originalDocumentOverflow;
  documentElement.style.overscrollBehavior = originalDocumentOverscrollBehavior;
};

export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    lockPageScroll();
    return unlockPageScroll;
  }, [isLocked]);
};

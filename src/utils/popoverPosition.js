const WIDTH = 380; // Desktop width for popover
const MARGIN = 16;

export function computePopoverPosition(rect, popoverElement) {
  if (typeof window === 'undefined' || !rect) {
    return { left: MARGIN, top: MARGIN };
  }

  const popoverHeight = popoverElement ? popoverElement.offsetHeight : 320;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const left = Math.max(MARGIN, Math.min(rect.left, viewportWidth - WIDTH - MARGIN));

  let top = rect.bottom + 10;

  if (top + popoverHeight > viewportHeight - MARGIN) {
    const topAbove = rect.top - popoverHeight - 10;
    if (topAbove >= MARGIN) {
      top = topAbove;
    } else {
      top = Math.max(MARGIN, viewportHeight - popoverHeight - MARGIN);
    }
  }

  return {
    left: Math.max(MARGIN, Math.min(left, viewportWidth - WIDTH - MARGIN)),
    top: Math.max(MARGIN, Math.min(top, viewportHeight - popoverHeight - MARGIN)),
  };
}

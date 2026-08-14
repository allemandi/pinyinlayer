import { useEffect } from 'react';

/**
 * Reusable hook that listens for the 'Escape' key and triggers a callback.
 *
 * @param {Function} onClose - Callback function to invoke when Escape is pressed.
 * @param {boolean} active - Whether the event listener should be active.
 */
export function useEscapeKey(onClose, active = true) {
  useEffect(() => {
    if (!active || !onClose) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, active]);
}

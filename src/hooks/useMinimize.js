/**
 * useMinimize Hook
 *
 * Manages the minimize / maximize state of the widget.
 * Remembers the widget position before minimizing so it can be restored.
 *
 * Returns: { isMinimized, minimize, maximize, toggleMinimize, savedPosition }
 */

import { useState, useCallback } from 'react';

function useMinimize() {
  // Task 14
  var [isMinimized,   setIsMinimized]   = useState(false);
  var [savedPosition, setSavedPosition] = useState(null);

  /** Minimize the widget, optionally saving current position */
  var minimize = useCallback(function (currentPosition) {
    if (currentPosition) setSavedPosition(currentPosition);
    setIsMinimized(true);
  }, []);

  /** Restore the widget to full size */
  var maximize = useCallback(function () {
    setIsMinimized(false);
  }, []);

  /** Toggle between minimized and maximized */
  var toggleMinimize = useCallback(function (currentPosition) {
    setIsMinimized(function (prev) {
      if (!prev && currentPosition) setSavedPosition(currentPosition);
      return !prev;
    });
  }, []);

  return { isMinimized, minimize, maximize, toggleMinimize, savedPosition };
}

export default useMinimize;

/**
 * Header Component
 *
 * Displays the widget title and three toolbar controls:
 *   ‹  Back (enabled only when viewing the form)
 *   ✛  Move — toggles drag mode; while active, mouse-down starts dragging
 *   −  Minimize
 *   ×  Close
 */

import React from 'react';
import Button from '../Button/Button';
import styles from './Header.module.css';

function Header({
  title      = 'Action Recorder',
  onMove,
  onMinimize,
  onClose,
  isMoveMode = false,
  onDragStart,
  canGoBack  = false,
  onBack
}) {
  // Task 10a — move-button handlers
  var handleMoveMouseDown = function (e) {
    if (isMoveMode && onDragStart) onDragStart(e);
  };

  var handleMoveClick = function (e) {
    e.stopPropagation();
    if (onMove) onMove();
  };

  // Task 10b — render
  return (
    <div className={styles.header}>
      {/* Back navigation */}
      <div className={styles.navigation}>
        <Button
          variant="icon"
          className={styles.navButton}
          onClick={onBack}
          disabled={!canGoBack}
          title="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </Button>
      </div>

      {/* Title */}
      <div className={styles.titleSection}>
        <span className={styles.logo}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
          </svg>
        </span>
        <span className={styles.title}>{title}</span>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <Button
          variant="icon"
          className={isMoveMode ? 'active' : ''}
          onClick={handleMoveClick}
          onMouseDown={handleMoveMouseDown}
          title={isMoveMode ? 'Stop moving' : 'Move widget'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2">
            <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>
          </svg>
        </Button>

        <Button variant="icon" onClick={onMinimize} title="Minimize">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14"/>
          </svg>
        </Button>

        <Button variant="icon" onClick={onClose} title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </Button>
      </div>
    </div>
  );
}

export default Header;

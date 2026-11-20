/**
 * Button Component
 *
 * Reusable button supporting three visual variants:
 *   'primary'   — teal filled (default action)
 *   'secondary' — outlined / muted
 *   'icon'      — square icon-only button for the header toolbar
 *
 * Extra props are forwarded to the underlying <button> element.
 */

import React from 'react';
import styles from './Button.module.css';

function Button({
  variant   = 'primary',
  onClick,
  onMouseDown,
  disabled  = false,
  icon,
  children,
  title,
  className = '',
  ...rest
}) {
  // Task 11 — build class list from variant + disabled state
  var classes = [styles.button];
  if (styles[variant])   classes.push(styles[variant]);
  if (disabled)          classes.push(styles.disabled);
  if (className)         classes.push(className);

  return (
    <button
      className={classes.join(' ')}
      onClick={onClick}
      onMouseDown={onMouseDown}
      disabled={disabled}
      title={title}
      {...rest}
    >
      {icon     && <span className={styles.icon}>{icon}</span>}
      {children && <span className={styles.content}>{children}</span>}
    </button>
  );
}

export default Button;

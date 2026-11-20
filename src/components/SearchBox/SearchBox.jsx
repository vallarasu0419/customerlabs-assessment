/**
 * SearchBox Component
 *
 * Controlled search input with a search icon and an inline clear button.
 * Calls onChange(value) on every keystroke; calls onChange('') when cleared.
 */

import React from 'react';
import styles from './SearchBox.module.css';

function SearchBox({ value = '', onChange, placeholder = 'Search for Actions' }) {
  // Task 12
  var handleChange = function (e) {
    if (onChange) onChange(e.target.value);
  };

  var handleClear = function () {
    if (onChange) onChange('');
  };

  return (
    <div className={styles.searchBox}>
      <span className={styles.searchIcon}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </span>

      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />

      {value && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          title="Clear search"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchBox;

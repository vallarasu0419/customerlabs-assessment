/**
 * Pagination Component
 *
 * Renders Previous / Next controls and a "Page X of Y" indicator.
 * Renders nothing when there is only one page.
 */

import React from 'react';
import Button from '../Button/Button';
import styles from './Pagination.module.css';

function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  // Task 13
  var handlePrevious = function () {
    if (currentPage > 1 && onPageChange) onPageChange(currentPage - 1);
  };

  var handleNext = function () {
    if (currentPage < totalPages && onPageChange) onPageChange(currentPage + 1);
  };

  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <Button
        variant="secondary"
        className={styles.navButton}
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        ← Previous
      </Button>

      <span className={styles.pageInfo}>
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>

      <Button
        variant="secondary"
        className={styles.navButton}
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Next →
      </Button>
    </div>
  );
}

export default Pagination;

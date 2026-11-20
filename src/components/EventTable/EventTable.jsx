/**
 * EventTable Component
 *
 * Renders the list of recorded events.
 * States: loading skeleton → empty state → populated table.
 * Event names are clickable buttons; each row has a delete icon.
 */

import React from 'react';
import styles from './EventTable.module.css';

var ACTION_TYPE_LABELS = {
  button_click: 'Button Click',
  form_submit:  'Form Submit',
  on_change:    'On Change',
  form_change:  'Form Change',
  pageview:     'Pageview',
  scroll:       'Scroll'
};

function EventTable({ events = [], onEventClick, onEventDelete, loading = false }) {
  // Task 9a — click handlers
  var handleEventClick = function (event) {
    if (onEventClick) onEventClick(event);
  };

  var handleDelete = function (e, event) {
    e.stopPropagation();
    if (onEventDelete) onEventDelete(event);
  };

  // Task 9b — loading state
  if (loading) {
    return <div className={styles.loading}>Loading events…</div>;
  }

  // Task 11 (HTML) — empty state with icon
  if (events.length === 0) {
    return (
      <div className={styles.empty}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
        </svg>
        <p>No actions recorded yet</p>
      </div>
    );
  }

  // Task 9c — table
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Action Type</th>
            <th className={styles.actionColumn}></th>
          </tr>
        </thead>
        <tbody>
          {events.map(function (event) {
            return (
              <tr key={event.id}>
                <td>
                  <button
                    className={styles.eventName}
                    onClick={function () { handleEventClick(event); }}
                  >
                    {event.eventName}
                  </button>
                </td>
                <td className={styles.actionType}>
                  {ACTION_TYPE_LABELS[event.actionType] || event.actionType}
                </td>
                <td className={styles.actionColumn}>
                  <button
                    className={styles.deleteBtn}
                    onClick={function (e) { handleDelete(e, event); }}
                    title="Delete event"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default EventTable;

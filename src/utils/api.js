/**
 * API Utilities
 *
 * All backend communication goes through this module.
 * Backend format  →  { id, name, selector, event_type, elements, created_at, updated_at }
 * Frontend format →  { id, eventName, selector, actionType, elements, createdAt, updatedAt }
 */

var API_BASE_URL =
  (typeof window !== 'undefined' && window.API_BASE_URL) ||
  'http://localhost:3000/api';

/* ── Shared helpers ─────────────────────────────────────────────────── */

/** Convert backend event object → frontend shape */
function toFrontend(e) {
  return {
    id:         String(e.id),
    eventName:  e.name,
    actionType: e.event_type,
    selector:   e.selector   || '',
    elements:   e.elements   || [],
    createdAt:  e.created_at,
    updatedAt:  e.updated_at
  };
}

/** Convert frontend payload → backend body */
function toBackend(data) {
  return {
    name:       data.eventName,
    selector:   data.selector  || '',
    event_type: data.actionType,
    elements:   data.elements  || []
  };
}

/* ── Task 23: fetch wrapper ─────────────────────────────────────────── */
async function apiFetch(endpoint, options) {
  options = options || {};
  var url    = API_BASE_URL + endpoint;
  var config = Object.assign(
    { headers: { 'Content-Type': 'application/json' } },
    options
  );

  // Serialize body objects to JSON
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  var response = await fetch(url, config);
  var data     = await response.json();

  // Task 17: error handling
  if (!response.ok) {
    throw new Error((data && data.error) || 'API request failed (' + response.status + ')');
  }

  return data;
}

/* ── Task 16a: fetchEvents ──────────────────────────────────────────── */
export async function fetchEvents() {
  var result = await apiFetch('/events');
  return (result.data || []).map(toFrontend);
}

/* ── Task 16b: saveEvent ────────────────────────────────────────────── */
export async function saveEvent(eventData) {
  var result = await apiFetch('/events', {
    method: 'POST',
    body:   toBackend(eventData)
  });
  return toFrontend(result.data);
}

/* ── Task 16c: updateEvent ──────────────────────────────────────────── */
export async function updateEvent(eventId, eventData) {
  var result = await apiFetch('/events/' + eventId, {
    method: 'PUT',
    body:   toBackend(eventData)
  });
  return toFrontend(result.data);
}

/* ── Task 17: deleteEvent ───────────────────────────────────────────── */
export async function deleteEvent(eventId) {
  return apiFetch('/events/' + eventId, { method: 'DELETE' });
}

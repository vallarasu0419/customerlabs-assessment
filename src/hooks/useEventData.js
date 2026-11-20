/**
 * useEventData Hook
 *
 * Centralises all event data state and CRUD operations.
 * Components just call addEvent / updateEvent / deleteEvent and
 * the local state updates optimistically.
 *
 * Returns:
 *   { events, loading, error, refreshEvents,
 *     addEvent, updateEvent, deleteEvent }
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchEvents,
  saveEvent    as apiSaveEvent,
  updateEvent  as apiUpdateEvent,
  deleteEvent  as apiDeleteEvent
} from '../utils/api';

function useEventData() {
  // Task 15a — state
  var [events,  setEvents]  = useState([]);
  var [loading, setLoading] = useState(true);
  var [error,   setError]   = useState(null);

  // Task 15b — load events
  var loadEvents = useCallback(function () {
    setLoading(true);
    setError(null);
    fetchEvents()
      .then(function (data) {
        setEvents(data);
        setLoading(false);
      })
      .catch(function (err) {
        setError(err.message || 'Failed to load events');
        setLoading(false);
      });
  }, []);

  var refreshEvents = useCallback(function () { loadEvents(); }, [loadEvents]);

  // Task 15c — CRUD
  var addEvent = useCallback(function (eventData) {
    return apiSaveEvent(eventData).then(function (created) {
      setEvents(function (prev) { return [created].concat(prev); });
      return created;
    });
  }, []);

  var updateEvent = useCallback(function (eventId, eventData) {
    return apiUpdateEvent(eventId, eventData).then(function (updated) {
      setEvents(function (prev) {
        return prev.map(function (e) { return e.id === eventId ? updated : e; });
      });
      return updated;
    });
  }, []);

  var deleteEvent = useCallback(function (eventId) {
    return apiDeleteEvent(eventId).then(function () {
      setEvents(function (prev) {
        return prev.filter(function (e) { return e.id !== eventId; });
      });
    });
  }, []);

  // Task 15d — load on mount
  useEffect(function () { loadEvents(); }, [loadEvents]);

  return {
    events,
    loading,
    error,
    refreshEvents,
    addEvent,
    updateEvent,
    deleteEvent
  };
}

export default useEventData;

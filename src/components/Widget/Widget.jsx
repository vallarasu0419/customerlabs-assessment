/**
 * Widget Component
 *
 * KEY FIX: startElementPicker is called here (Widget never unmounts),
 * so the picker result is never lost during minimize/maximize.
 * pickedElements state lives here and is passed down to EventForm as props.
 */

import React, { useState, useRef, useMemo, useCallback } from "react";
import Header from "../Header/Header";
import SearchBox from "../SearchBox/SearchBox";
import EventTable from "../EventTable/EventTable";
import Pagination from "../Pagination/Pagination";
import EventForm from "../EventForm/EventForm";
import Button from "../Button/Button";
import { startElementPicker } from "../../utils/elementPicker";
import useDraggable from "../../hooks/useDraggable";
import useMinimize from "../../hooks/useMinimize";
import useEventData from "../../hooks/useEventData";
import styles from "./Widget.module.css";

var VIEW_LIST = "list";
var VIEW_FORM = "form";
var ITEMS_PER_PAGE = 3;

function generateElementId() {
  return "el_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

function Widget({ initialPosition, onClose }) {
  initialPosition = initialPosition || { x: 20, y: 80 };

  var widgetRef = useRef(null);

  /* ── State ─────────────────────────────────────────────────────── */
  var [isMoveMode, setIsMoveMode] = useState(false);
  var [searchQuery, setSearchQuery] = useState("");
  var [currentPage, setCurrentPage] = useState(1);
  var [currentView, setCurrentView] = useState(VIEW_LIST);
  var [selectedEvent, setSelectedEvent] = useState(null);

  /* Picker state — MUST live in Widget so it survives EventForm unmount */
  var [pickedElements, setPickedElements] = useState([]);
  var [isPickerActive, setIsPickerActive] = useState(false);

  /* ── Custom hooks ───────────────────────────────────────────────── */
  var drag = useDraggable(isMoveMode, initialPosition);
  var position = drag.position;
  var isDragging = drag.isDragging;
  var handleMouseDown = drag.handleMouseDown;

  var minHook = useMinimize();
  var isMinimized = minHook.isMinimized;
  var doMinimize = minHook.minimize;
  var doMaximize = minHook.maximize;

  var ed = useEventData();
  var events = ed.events;
  var loading = ed.loading;
  var error = ed.error;
  var addEvent = ed.addEvent;
  var updateEvent = ed.updateEvent;
  var deleteEvent = ed.deleteEvent;

  /* ── Navigation handlers ────────────────────────────────────────── */
  var handleToggleMoveMode = useCallback(function () {
    setIsMoveMode(function (p) {
      return !p;
    });
  }, []);

  var handleMinimize = useCallback(
    function () {
      doMinimize(position);
    },
    [doMinimize, position],
  );

  var handleMaximize = useCallback(
    function () {
      doMaximize();
      setIsMoveMode(false);
    },
    [doMaximize],
  );

  var handleNewEvent = useCallback(function () {
    setSelectedEvent(null);
    setPickedElements([]); // clear elements for new form
    setCurrentView(VIEW_FORM);
  }, []);

  var handleEventClick = useCallback(function (event) {
    setSelectedEvent(event);
    setPickedElements(event.elements || []); // pre-fill elements for edit
    setCurrentView(VIEW_FORM);
  }, []);

  var handleEventDelete = useCallback(
    function (event) {
      if (window.confirm('Delete "' + event.eventName + '"?')) {
        deleteEvent(event.id);
      }
    },
    [deleteEvent],
  );

  /* ── Form save → API → list ─────────────────────────────────────── */
  var handleFormSave = useCallback(
    function (eventData) {
      var op = selectedEvent
        ? updateEvent(selectedEvent.id, eventData)
        : addEvent(eventData);

      op.then(function () {
        setCurrentView(VIEW_LIST);
        setSelectedEvent(null);
        setPickedElements([]);
      }).catch(function (err) {
        console.error("[Widget] Save failed:", err);
      });
    },
    [selectedEvent, addEvent, updateEvent],
  );

  var handleFormCancel = useCallback(function () {
    setCurrentView(VIEW_LIST);
    setSelectedEvent(null);
    setPickedElements([]);
  }, []);

  /* ── Element picker — runs HERE so Promise survives minimize ────── */
  var handlePickElement = useCallback(
    function () {
      if (isPickerActive) return;
      setIsPickerActive(true);
      doMinimize(position); // minimize widget

      startElementPicker({}).then(function (result) {
        doMaximize(); // restore widget
        setIsPickerActive(false);

        if (result) {
          setPickedElements(function (prev) {
            return prev.concat([
              {
                id: generateElementId(),
                selector: result.selector,
                textContent: result.textContent || result.selector,
                elementType: result.elementType || "element",
                isVisible: true,
              },
            ]);
          });
        }
      });
    },
    [isPickerActive, doMinimize, doMaximize, position],
  );

  var handleRemoveElement = useCallback(function (elementId) {
    setPickedElements(function (prev) {
      return prev.filter(function (el) {
        return el.id !== elementId;
      });
    });
  }, []);

  var handleSearchChange = useCallback(function (value) {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  /* ── Search filter (memoised) ───────────────────────────────────── */
  var filteredEvents = useMemo(
    function () {
      if (!searchQuery.trim()) return events;
      var q = searchQuery.toLowerCase();
      return events.filter(function (e) {
        return (
          (e.eventName && e.eventName.toLowerCase().indexOf(q) !== -1) ||
          (e.actionType && e.actionType.toLowerCase().indexOf(q) !== -1)
        );
      });
    },
    [events, searchQuery],
  );

  /* ── Pagination ─────────────────────────────────────────────────── */
  var totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / ITEMS_PER_PAGE),
  );
  var safePage = Math.min(currentPage, totalPages);
  var currentEvents = filteredEvents.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  /* ── Widget position style ──────────────────────────────────────── */
  var widgetStyle = {
    left: position.x + "px",
    top: position.y + "px",
    cursor: isMoveMode ? (isDragging ? "grabbing" : "grab") : "default",
  };

  /* ── Minimized view ─────────────────────────────────────────────── */
  if (isMinimized) {
    return (
      <div
        className={styles.widget + " " + styles.minimized + " ar-widget"}
        style={widgetStyle}
      >
        <button
          className={
            styles.minimizedIcon +
            (isPickerActive ? " " + styles.pickerActive : "")
          }
          onClick={handleMaximize}
          title="Restore widget"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        {isPickerActive && (
          <div className={styles.pickerTooltip}>
            Click an element on the page
          </div>
        )}
      </div>
    );
  }

  /* ── Full widget view ───────────────────────────────────────────── */
  return (
    <div
      ref={widgetRef}
      className={styles.widget + " ar-widget"}
      style={widgetStyle}
    >
      <Header
        title="Action Recorder"
        onMove={handleToggleMoveMode}
        onMinimize={handleMinimize}
        onClose={onClose}
        isMoveMode={isMoveMode}
        onDragStart={handleMouseDown}
        canGoBack={currentView === VIEW_FORM}
        onBack={handleFormCancel}
      />

      <div className={styles.body}>
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {/* LIST VIEW */}
        {currentView === VIEW_LIST && (
          <React.Fragment>
            <div className={styles.toolbar}>
              <SearchBox value={searchQuery} onChange={handleSearchChange} />
            </div>

            <EventTable
              events={currentEvents}
              onEventClick={handleEventClick}
              onEventDelete={handleEventDelete}
              loading={loading}
            />

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />

            <div className={styles.footer}>
              <Button
                variant="primary"
                onClick={handleNewEvent}
                style={{ minWidth: 160 }}
              >
                + Record Action
              </Button>
            </div>
          </React.Fragment>
        )}

        {/* FORM VIEW — receives picker state as props */}
        {currentView === VIEW_FORM && (
          <EventForm
            event={selectedEvent}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
            pickedElements={pickedElements}
            onPickElement={handlePickElement}
            onRemoveElement={handleRemoveElement}
            isPicking={isPickerActive}
          />
        )}
      </div>
    </div>
  );
}

export default Widget;

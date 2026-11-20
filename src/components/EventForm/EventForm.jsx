/**
 * EventForm Component — Tasks 7 & 8
 *
 * pickedElements / onPickElement / onRemoveElement / isPicking
 * come from Widget.jsx which never unmounts, so element state
 * is never lost during the minimize/maximize cycle.
 */

import React, { useState, useEffect } from "react";
import { highlightElement } from "../../utils/elementPicker";
import styles from "./EventForm.module.css";

var ACTION_TYPES = [
  { value: "button_click", label: "On Click" },
  { value: "form_submit", label: "Form Submit" },
  { value: "on_change", label: "On Change" },
  { value: "form_change", label: "Form Change" },
  { value: "pageview", label: "Page View" },
  { value: "scroll", label: "Scroll" },
];

var SCROLL_POSITIONS = [
  { value: "25", label: "25%" },
  { value: "50", label: "50%" },
  { value: "75", label: "75%" },
  { value: "100", label: "100%" },
];

var ELEMENT_BASED = ["button_click", "form_submit", "on_change", "form_change"];

function EventForm({
  event,
  onSave,
  onCancel,
  pickedElements, // managed by Widget — survives minimize
  onPickElement, // triggers picker in Widget
  onRemoveElement, // removes element in Widget state
  isPicking, // true while picker is active
}) {
  pickedElements = pickedElements || [];

  /* ── local form state only (no element state here) ── */
  var [actionName, setActionName] = useState("");
  var [actionType, setActionType] = useState("button_click");
  var [scrollPosition, setScrollPosition] = useState("50");
  var [errors, setErrors] = useState({});

  /* ── pre-fill for edit mode ── */
  useEffect(
    function () {
      if (event) {
        setActionName(event.eventName || "");
        setActionType(event.actionType || "button_click");
        if (event.actionType === "scroll" && event.selector) {
          setScrollPosition(event.selector);
        }
      }
    },
    [event],
  );

  var requiresElement = function () {
    return ELEMENT_BASED.indexOf(actionType) !== -1;
  };

  /* ── form handlers ── */
  var handleNameChange = function (e) {
    setActionName(e.target.value);
    if (errors.actionName) {
      setErrors(function (p) {
        return Object.assign({}, p, { actionName: null });
      });
    }
  };

  var handleClearName = function () {
    setActionName("");
  };

  var handleTypeChange = function (e) {
    setActionType(e.target.value);
    setErrors({});
  };

  /* ── trigger picker (Widget does the real work) ── */
  var handlePickElement = function () {
    if (isPicking) return;
    setErrors(function (p) {
      return Object.assign({}, p, { elements: null });
    });
    if (onPickElement) onPickElement();
  };

  /* ── highlight element on page ── */
  var handleHighlight = function (selector) {
    highlightElement(selector, 2000);
  };

  /* ── validation ── */
  var validateForm = function () {
    var newErrors = {};
    if (!actionName.trim()) {
      newErrors.actionName = "Action name is required";
    }
    if (requiresElement() && pickedElements.length === 0) {
      newErrors.elements = "Please select at least one element";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── save → triggers API via Widget → updates list ── */
  var handleSave = function () {
    if (!validateForm()) return;

    var selector = "";
    if (actionType === "scroll") selector = scrollPosition;
    else if (actionType === "pageview") selector = window.location.pathname;
    else if (pickedElements.length > 0) selector = pickedElements[0].selector;

    onSave({
      eventName: actionName.trim(),
      actionType: actionType,
      selector: selector,
      elements: pickedElements,
    });
  };

  /* ── render element / scroll / pageview sub-section ── */
  var renderElementSelector = function () {
    if (actionType === "pageview") {
      return (
        <div className={styles.formGroup}>
          <label className={styles.label}>URL Path:</label>
          <input
            className={styles.input}
            type="text"
            value={window.location.pathname}
            readOnly
          />
        </div>
      );
    }

    if (actionType === "scroll") {
      return (
        <div className={styles.formGroup}>
          <label className={styles.label}>Scroll Position:</label>
          <select
            className={styles.select}
            value={scrollPosition}
            onChange={function (e) {
              setScrollPosition(e.target.value);
            }}
          >
            {SCROLL_POSITIONS.map(function (opt) {
              return (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              );
            })}
          </select>
        </div>
      );
    }

    if (requiresElement()) {
      var lastEl = pickedElements[pickedElements.length - 1];
      return (
        <div className={styles.elementSelector}>
          <label className={styles.label}>
            Select the <span className={styles.highlight}>Element</span>{" "}
            (text/link)
          </label>
          <div className={styles.elementPickerRow}>
            <input
              className={styles.elementInput}
              type="text"
              readOnly
              placeholder="No element selected"
              value={lastEl ? lastEl.textContent || lastEl.selector : ""}
            />
            <button
              type="button"
              className={styles.elementPickerBtn}
              onClick={handlePickElement}
              disabled={isPicking}
            >
              {isPicking ? "Picking…" : "Element Picker"}
            </button>
          </div>
          {errors.elements && (
            <span className={styles.error}>{errors.elements}</span>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.eventForm}>
      {/* ── Left: form fields ── */}
      <div className={styles.formSection}>
        <h3 className={styles.title}>Record action:</h3>

        {/* Action Name */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Action Name:</label>
          <div className={styles.inputWrapper}>
            <input
              className={
                styles.input +
                (errors.actionName ? " " + styles.inputError : "")
              }
              type="text"
              value={actionName}
              onChange={handleNameChange}
              placeholder="Enter action name"
            />
            {actionName && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={handleClearName}
                title="Clear"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {errors.actionName && (
            <span className={styles.error}>{errors.actionName}</span>
          )}
        </div>

        {/* Action Type */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Action Type:</label>
          <select
            className={styles.select}
            value={actionType}
            onChange={handleTypeChange}
          >
            {ACTION_TYPES.map(function (opt) {
              return (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              );
            })}
          </select>
        </div>

        {renderElementSelector()}

        {/* Info */}
        <div className={styles.infoLink}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle
              cx="8"
              cy="8"
              r="7"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M8 7V11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="5" r="0.75" fill="currentColor" />
          </svg>
          <span>Learn about Action and Action Type</span>
        </div>

        {/* Buttons */}
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={styles.saveBtn} onClick={handleSave}>
            Save Action
          </button>
        </div>
      </div>

      {/* ── Right: selected elements panel (matches screenshot) ── */}
      {requiresElement() && (
        <div className={styles.elementsSection}>
          <h4 className={styles.elementsTitle}>Selected elements</h4>

          {pickedElements.length === 0 ? (
            /* Empty state — show picker button */
            <button
              type="button"
              className={styles.elementPickerBtn}
              onClick={handlePickElement}
              disabled={isPicking}
            >
              {isPicking ? "Picking…" : "Element Picker"}
            </button>
          ) : (
            /* List of picked elements */
            <ul className={styles.elementsList}>
              {pickedElements.map(function (el) {
                return (
                  <li key={el.id} className={styles.elementItem}>
                    {/* ① X — remove element */}
                    <button
                      type="button"
                      className={styles.elementAction}
                      onClick={function () {
                        if (onRemoveElement) onRemoveElement(el.id);
                      }}
                      title="Remove"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>

                    {/* ② External-link icon — highlight on page */}
                    <button
                      type="button"
                      className={styles.elementAction}
                      onClick={function () {
                        handleHighlight(el.selector);
                      }}
                      title="Highlight on page"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </button>

                    {/* ③ Eye icon — visibility */}
                    <button
                      type="button"
                      className={styles.elementAction}
                      title="Visible"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>

                    {/* Element label */}
                    <span className={styles.elementText} title={el.selector}>
                      {el.textContent || el.selector}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default EventForm;

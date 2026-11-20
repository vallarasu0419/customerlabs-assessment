/**
 * Widget Loader Script
 *
 * Included on the host page via build/index.js.
 * Controls widget visibility through URL query parameters:
 *
 *   ?cl_widget=define  →  load & show the widget
 *   ?cl_widget=track   →  hide / remove the widget
 *
 * Widget state is persisted in localStorage so the decision survives
 * page navigations that don't carry the query parameter.
 */

(function () {
  var WIDGET_NAMESPACE = '__action_recorder_widget__';
  var STORAGE_KEY      = 'cl_widget_state';
  var QUERY_PARAM      = 'cl_widget';
  var STYLES_ID        = WIDGET_NAMESPACE + '_styles';
  var SCRIPT_ID        = WIDGET_NAMESPACE + '_script';

  /* ── Task 18a: Query-parameter helper ──────────────────────────── */
  function getQueryParam(name) {
    var search = window.location.search;
    if (!search) return null;

    // URLSearchParams is available in all modern browsers
    if (typeof URLSearchParams !== 'undefined') {
      return new URLSearchParams(search).get(name);
    }

    // ES5 fallback for legacy browsers
    var pairs = search.slice(1).split('&');
    for (var i = 0; i < pairs.length; i++) {
      var kv = pairs[i].split('=');
      if (decodeURIComponent(kv[0]) === name) {
        return kv.length > 1 ? decodeURIComponent(kv[1]) : '';
      }
    }
    return null;
  }

  /* ── Task 19a: localStorage persistence ────────────────────────── */
  function saveWidgetState(state) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ state: state, ts: Date.now() })
      );
    } catch (e) {
      // Silently ignore — private browsing / quota exceeded
    }
  }

  function loadWidgetState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed.state || null;
    } catch (e) {
      return null;
    }
  }

  /* ── Task 18b: Asset loaders ────────────────────────────────────── */

  /** Resolve base URL from this script's own src attribute */
  var BASE_URL = (function () {
    var scripts = document.querySelectorAll('script[src]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || '';
      if (src.indexOf('index.js') !== -1) {
        return src.substring(0, src.lastIndexOf('/'));
      }
    }
    return '/build'; // fallback for dev server
  })();

  function loadWidgetStyles() {
    if (document.getElementById(STYLES_ID)) return; // already injected
    var link  = document.createElement('link');
    link.id   = STYLES_ID;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = BASE_URL + '/action_recorder.min.css';
    document.head.appendChild(link);
  }

  function loadWidgetScript() {
    return new Promise(function (resolve, reject) {
      if (document.getElementById(SCRIPT_ID)) { resolve(); return; }
      var script     = document.createElement('script');
      script.id      = SCRIPT_ID;
      script.src     = BASE_URL + '/action_recorder.min.js';
      script.async   = true;
      script.onload  = function () { resolve(); };
      script.onerror = function (err) {
        console.error('[ActionRecorder] Failed to load widget script.', err);
        reject(err);
      };
      document.head.appendChild(script);
    });
  }

  /* ── Task 18c: Widget lifecycle ─────────────────────────────────── */
  function initWidget() {
    loadWidgetStyles();
    loadWidgetScript()
      .then(function () {
        var AR = window.ActionRecorder;
        if (AR && AR.default && typeof AR.default.init === 'function') {
          AR.default.init();
        } else if (AR && typeof AR.init === 'function') {
          AR.init();
        }
      })
      .catch(function (err) {
        console.error('[ActionRecorder] Widget init failed.', err);
      });
  }

  function removeWidget() {
    var AR = window.ActionRecorder;
    if (AR && AR.default && typeof AR.default.destroy === 'function') {
      AR.default.destroy();
    } else if (AR && typeof AR.destroy === 'function') {
      AR.destroy();
    }
  }

  /* ── Task 19b: Main initialization ─────────────────────────────── */
  function initialize() {
    var param = getQueryParam(QUERY_PARAM);

    if (param === 'define') {
      saveWidgetState('define');
      initWidget();
    } else if (param === 'track') {
      saveWidgetState('track');
      removeWidget();
    } else {
      // No query param — restore last known state
      if (loadWidgetState() === 'define') {
        initWidget();
      }
    }
  }

  // Wait for DOM before running
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();

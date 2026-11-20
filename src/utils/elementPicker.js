/**
 * Element Picker Utility
 * 
 * A standalone helper for picking elements from the page.
 * Returns a Promise that resolves with the selected element's CSS selector and text content.
 * 
 * Features:
 * - Highlights elements on hover with overlay
 * - Generates unique CSS selectors
 * - Ignores widget elements (inside #action-recorder-widget-root)
 * - Supports cancel via Escape key
 * - Cleanup function to remove all event listeners
 * 
 * Usage:
 * var result = await startElementPicker({
 *   onMinimize: function() { },
 *   onRestore: function() { }
 * });
 * // result = { selector: 'button.cta-btn', textContent: 'Start my Journey' }
 */

// Widget root ID to ignore during element picking
var WIDGET_ROOT_ID = 'action-recorder-widget-root';

// Highlight overlay styles - Elegant teal design
var HIGHLIGHT_STYLES = {
  position: 'absolute',
  background: 'rgba(13, 148, 136, 0.12)',
  border: '2px solid #0d9488',
  borderRadius: '6px',
  pointerEvents: 'none',
  zIndex: '999998',
  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 0 0 4px rgba(13, 148, 136, 0.08)'
};

/**
 * Create the highlight overlay element
 * @returns {HTMLElement} The overlay element
 */
function createHighlightOverlay() {
  var overlay = document.createElement('div');
  overlay.id = 'ar-element-picker-overlay';
  
  // Apply styles
  Object.keys(HIGHLIGHT_STYLES).forEach(function(key) {
    overlay.style[key] = HIGHLIGHT_STYLES[key];
  });
  
  // Initially hidden
  overlay.style.display = 'none';
  
  document.body.appendChild(overlay);
  return overlay;
}

/**
 * Position the overlay over a target element
 * @param {HTMLElement} overlay - The overlay element
 * @param {HTMLElement} target - The target element to highlight
 */
function positionOverlay(overlay, target) {
  var rect = target.getBoundingClientRect();
  var scrollX = window.scrollX || window.pageXOffset;
  var scrollY = window.scrollY || window.pageYOffset;
  
  overlay.style.display = 'block';
  overlay.style.left = (rect.left + scrollX) + 'px';
  overlay.style.top = (rect.top + scrollY) + 'px';
  overlay.style.width = rect.width + 'px';
  overlay.style.height = rect.height + 'px';
}

/**
 * Hide the overlay
 * @param {HTMLElement} overlay - The overlay element
 */
function hideOverlay(overlay) {
  if (overlay) {
    overlay.style.display = 'none';
  }
}

/**
 * Check if an element is part of the widget
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if element is inside widget
 */
function isWidgetElement(element) {
  var widgetRoot = document.getElementById(WIDGET_ROOT_ID);
  if (!widgetRoot) {
    return false;
  }
  return widgetRoot.contains(element);
}

/**
 * Check if an element is the overlay itself
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if element is the overlay
 */
function isOverlayElement(element) {
  return element && element.id === 'ar-element-picker-overlay';
}

/**
 * Get the nth-child index of an element among its siblings
 * @param {HTMLElement} element - The element
 * @returns {number} The 1-based index
 */
function getNthChildIndex(element) {
  var parent = element.parentElement;
  if (!parent) {
    return 1;
  }
  
  var children = Array.prototype.slice.call(parent.children);
  var sameTagChildren = children.filter(function(child) {
    return child.tagName === element.tagName;
  });
  
  var index = sameTagChildren.indexOf(element);
  return index + 1;
}

/**
 * Check if a selector is unique on the page
 * @param {string} selector - The CSS selector to test
 * @returns {boolean} True if selector matches exactly one element
 */
function isSelectorUnique(selector) {
  try {
    var matches = document.querySelectorAll(selector);
    return matches.length === 1;
  } catch (e) {
    return false;
  }
}

/**
 * Escape special characters in CSS selector
 * @param {string} str - The string to escape
 * @returns {string} Escaped string
 */
function escapeSelector(str) {
  return str.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}

/**
 * Generate a unique CSS selector for an element
 * @param {HTMLElement} element - The target element
 * @returns {string} A unique CSS selector
 */
function generateSelector(element) {
  // Strategy 1: Check for unique ID
  if (element.id) {
    var idSelector = '#' + escapeSelector(element.id);
    if (isSelectorUnique(idSelector)) {
      return idSelector;
    }
  }
  
  // Strategy 2: Check for unique data attributes
  var dataAttrs = Array.prototype.slice.call(element.attributes).filter(function(attr) {
    return attr.name.indexOf('data-') === 0;
  });
  
  for (var i = 0; i < dataAttrs.length; i++) {
    var attr = dataAttrs[i];
    var dataSelector = '[' + attr.name + '="' + escapeSelector(attr.value) + '"]';
    if (isSelectorUnique(dataSelector)) {
      return dataSelector;
    }
  }
  
  // Strategy 3: Check for unique class combinations
  if (element.className && typeof element.className === 'string') {
    var classes = element.className.trim().split(/\s+/).filter(function(cls) {
      // Filter out dynamic/generated class names (usually contain random strings)
      return cls && cls.length < 30 && !/^[a-z]+_[a-zA-Z0-9]+$/.test(cls);
    });
    
    if (classes.length > 0) {
      // Try with tag name and classes
      var classSelector = element.tagName.toLowerCase() + '.' + classes.map(escapeSelector).join('.');
      if (isSelectorUnique(classSelector)) {
        return classSelector;
      }
      
      // Try just classes
      classSelector = '.' + classes.map(escapeSelector).join('.');
      if (isSelectorUnique(classSelector)) {
        return classSelector;
      }
    }
  }
  
  // Strategy 4: Build path with parent elements
  var path = [];
  var current = element;
  
  while (current && current !== document.body && path.length < 5) {
    var part = current.tagName.toLowerCase();
    
    // Add ID if available
    if (current.id) {
      part = '#' + escapeSelector(current.id);
      path.unshift(part);
      break;
    }
    
    // Add classes if available
    if (current.className && typeof current.className === 'string') {
      var cls = current.className.trim().split(/\s+/).filter(function(c) {
        return c && c.length < 30;
      }).slice(0, 2);
      
      if (cls.length > 0) {
        part += '.' + cls.map(escapeSelector).join('.');
      }
    }
    
    // Add nth-child if needed for uniqueness
    var siblings = current.parentElement ? 
      Array.prototype.slice.call(current.parentElement.children).filter(function(s) {
        return s.tagName === current.tagName;
      }) : [];
    
    if (siblings.length > 1) {
      var nthIndex = getNthChildIndex(current);
      part += ':nth-of-type(' + nthIndex + ')';
    }
    
    path.unshift(part);
    current = current.parentElement;
  }
  
  var pathSelector = path.join(' > ');
  
  // If still not unique, add body prefix
  if (!isSelectorUnique(pathSelector)) {
    pathSelector = 'body ' + pathSelector;
  }
  
  return pathSelector;
}

/**
 * Get the text content of an element (truncated)
 * @param {HTMLElement} element - The target element
 * @returns {string} The text content
 */
function getElementText(element) {
  var text = element.textContent || element.innerText || '';
  text = text.trim().replace(/\s+/g, ' ');
  
  // Truncate if too long
  if (text.length > 50) {
    text = text.substring(0, 47) + '...';
  }
  
  return text;
}

/**
 * Get element tag description
 * @param {HTMLElement} element - The target element
 * @returns {string} Description like "button", "link", "input"
 */
function getElementType(element) {
  var tag = element.tagName.toLowerCase();
  
  if (tag === 'a') {
    return 'link';
  }
  if (tag === 'button' || (tag === 'input' && element.type === 'submit')) {
    return 'button';
  }
  if (tag === 'input') {
    return 'input (' + (element.type || 'text') + ')';
  }
  if (tag === 'select') {
    return 'dropdown';
  }
  if (tag === 'textarea') {
    return 'textarea';
  }
  if (tag === 'form') {
    return 'form';
  }
  
  return tag;
}

/**
 * Start the element picker
 * 
 * @param {object} options - Configuration options
 * @param {function} options.onMinimize - Called when picker starts (minimize widget)
 * @param {function} options.onRestore - Called when picker ends (restore widget)
 * @param {function} options.onHover - Called when hovering over an element (optional)
 * @returns {Promise<object>} Resolves with { selector, textContent, elementType } or null if cancelled
 */
function startElementPicker(options) {
  options = options || {};
  
  return new Promise(function(resolve) {
    var overlay = createHighlightOverlay();
    var currentTarget = null;
    var isActive = true;
    
    // Call onMinimize callback
    if (typeof options.onMinimize === 'function') {
      options.onMinimize();
    }
    
    /**
     * Cleanup function to remove all listeners and overlay
     * Note: onRestore is NOT called here - the caller should handle restoration
     * after processing the result to ensure proper state update order
     */
    function cleanup() {
      isActive = false;
      
      // Remove overlay
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      
      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      
      // Reset cursor
      document.body.style.cursor = '';
    }
    
    /**
     * Handle mouse move - highlight element under cursor
     */
    function handleMouseMove(e) {
      if (!isActive) return;
      
      var target = e.target;
      
      // Ignore widget elements and overlay
      if (isWidgetElement(target) || isOverlayElement(target)) {
        hideOverlay(overlay);
        currentTarget = null;
        return;
      }
      
      // Update highlight
      if (target !== currentTarget) {
        currentTarget = target;
        positionOverlay(overlay, target);
        
        // Call onHover callback if provided
        if (typeof options.onHover === 'function') {
          options.onHover({
            element: target,
            selector: generateSelector(target),
            textContent: getElementText(target)
          });
        }
      }
    }
    
    /**
     * Handle click - select the element
     */
    function handleClick(e) {
      if (!isActive) return;
      
      var target = e.target;
      
      // Ignore widget elements and overlay
      if (isWidgetElement(target) || isOverlayElement(target)) {
        return;
      }
      
      // Prevent default action
      e.preventDefault();
      e.stopPropagation();
      
      // Generate result
      var result = {
        selector: generateSelector(target),
        textContent: getElementText(target),
        elementType: getElementType(target)
      };
      
      // Cleanup and resolve
      cleanup();
      resolve(result);
    }
    
    /**
     * Handle keydown - cancel on Escape
     */
    function handleKeyDown(e) {
      if (!isActive) return;
      
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        cleanup();
        resolve(null);
      }
    }
    
    // Set cursor to crosshair
    document.body.style.cursor = 'crosshair';
    
    // Add event listeners (use capture phase to intercept before page handlers)
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);
  });
}

/**
 * Highlight an element on the page temporarily
 * @param {string} selector - CSS selector of the element to highlight
 * @param {number} duration - Duration in milliseconds (default: 2000)
 */
function highlightElement(selector, duration) {
  duration = duration || 2000;
  
  try {
    var element = document.querySelector(selector);
    if (!element) {
      console.warn('Element not found for selector:', selector);
      return;
    }
    
    var overlay = createHighlightOverlay();
    positionOverlay(overlay, element);
    
    // Scroll element into view
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    
    // Remove after duration
    setTimeout(function() {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, duration);
  } catch (e) {
    console.error('Error highlighting element:', e);
  }
}

// Export functions
export { startElementPicker, highlightElement, generateSelector };


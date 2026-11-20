/**
 * Action Recorder Widget - Main Entry Point
 * 
 * This file exports the widget initialization and destruction methods.
 * It mounts the React application to the host page's DOM.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Global state
let root = null;
let containerElement = null;

/**
 * Initialize and mount the widget to the page
 */
function init() {
  // Prevent multiple initializations
  if (containerElement) {
    console.warn('ActionRecorder: Widget already initialized');
    return;
  }
  
  // Create container element for the widget
  containerElement = document.createElement('div');
  containerElement.id = 'action-recorder-widget-root';
  containerElement.style.position = 'fixed';
  containerElement.style.zIndex = '999999';
  containerElement.style.pointerEvents = 'none'; // Let clicks pass through to container
  
  // Append to body
  document.body.appendChild(containerElement);
  
  // Create React root and render
  root = createRoot(containerElement);
  root.render(<App />);
  
  console.log('ActionRecorder: Widget initialized');
}

/**
 * Destroy and unmount the widget from the page
 */
function destroy() {
  if (root) {
    root.unmount();
    root = null;
  }
  
  if (containerElement && containerElement.parentNode) {
    containerElement.parentNode.removeChild(containerElement);
    containerElement = null;
  }
  
  console.log('ActionRecorder: Widget destroyed');
}

// Export as UMD module
export default {
  init,
  destroy
};


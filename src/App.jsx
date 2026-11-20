/**
 * App Component
 * 
 * Root component of the Action Recorder Widget.
 * Manages the overall widget state and renders the main Widget component.
 */

import React, { useState, useCallback } from 'react';
import Widget from './components/Widget/Widget';

/**
 * Main application component
 */
function App() {
  // Widget visibility state
  const [isVisible, setIsVisible] = useState(true);
  
  /**
   * Handle widget close
   * Updates URL to add ?cl_widget=track and reloads
   */
  const handleClose = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('cl_widget', 'track');
    window.location.href = url.toString();
  }, []);
  
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }
  
  return (
    <Widget 
      initialPosition={{ x: 20, y: 80 }}
      onClose={handleClose}
    />
  );
}

export default App;


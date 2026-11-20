/**
 * useDraggable Hook
 * 
 * Makes an element draggable using mouse events.
 * Returns position state and handlers for drag functionality.
 * 
 * @param {boolean} enabled - Whether dragging is enabled
 * @param {object} initialPosition - Initial position { x, y }
 * @returns {object} { position, isDragging, handleMouseDown }
 */

import { useState, useCallback, useEffect } from 'react';

function useDraggable(enabled = false, initialPosition = { x: 0, y: 0 }) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  /**
   * Handle mouse down - start dragging
   */
  const handleMouseDown = useCallback((e) => {
    if (!enabled) return;
    
    // Only allow dragging with left mouse button
    if (e.button !== 0) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    // Prevent text selection while dragging
    e.preventDefault();
  }, [enabled, position.x, position.y]);
  
  /**
   * Handle mouse move - update position while dragging
   */
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep widget within viewport bounds
    const maxX = window.innerWidth - 400; // Approximate widget width
    const maxY = window.innerHeight - 100; // Approximate minimum height
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragStart.x, dragStart.y]);
  
  /**
   * Handle mouse up - stop dragging
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Add/remove global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Change cursor to grabbing
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  return {
    position,
    isDragging,
    handleMouseDown
  };
}

export default useDraggable;


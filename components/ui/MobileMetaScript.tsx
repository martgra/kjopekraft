'use client';

import { useEffect } from 'react';

export default function MobileMetaScript() {
  useEffect(() => {
    // This script helps prevent unwanted zooming on mobile inputs
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);
    
    // Prevent double-tap zoom on mobile
    document.addEventListener('touchstart', function(event) {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });
    
    // Prevent pinch zoom
    document.addEventListener('touchmove', function(event) {
      // Check if this is a gesture event with scale property (could be from older browsers)
      const gestureEvent = event as unknown as { scale?: number };
      if (gestureEvent.scale !== undefined && gestureEvent.scale !== 1) {
        event.preventDefault();
      }
    }, { passive: false });
    
    return () => {
      document.getElementsByTagName('head')[0].removeChild(meta);
    };
  }, []);
  
  return null;
}

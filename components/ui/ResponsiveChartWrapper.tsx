'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ResponsiveChartWrapperProps {
  children: ReactNode;
  mobileView?: ReactNode;
  className?: string;
  mobileBreakpoint?: number;
}

export default function ResponsiveChartWrapper({ 
  children, 
  mobileView,
  className = '',
  mobileBreakpoint = 640
}: ResponsiveChartWrapperProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Function to check screen size and set the mobile flag
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };
    
    // Check on mount
    checkMobile();
    
    // Listen for window resize events
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  // During SSR and initial render, we'll show the default children
  // After client-side hydration, we'll show the appropriate view
  if (!isClient) {
    return (
      <div className={`chart-container w-full h-full ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`chart-container w-full h-full ${isMobile ? 'overflow-x-auto chart-mobile' : ''} ${className}`}>
      {isMobile && mobileView ? mobileView : children}
    </div>
  );
}

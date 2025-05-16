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
  mobileBreakpoint = 640,
}: ResponsiveChartWrapperProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < mobileBreakpoint);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  // Before hydration: just render without any forced height/overflow
  if (!isClient) {
    return <div className={`chart-container w-full ${className}`}>{children}</div>;
  }

  // After hydration: pick mobile or desktop view, container autosizes to content
  return (
    <div className={`chart-container w-full h-full overflow-visible ${className}`}>  
      {isMobile && mobileView ? mobileView : children}
    </div>
  );
}
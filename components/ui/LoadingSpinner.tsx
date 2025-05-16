'use client';

import React from 'react';
import { TEXT } from '@/lib/constants/text';

type LoadingSpinnerProps = {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  text = TEXT.common.loading 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-5 w-5 border-2',
    medium: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        className={`${sizeClasses[size]} border-t-blue-500 border-r-blue-300 border-b-blue-200 border-l-blue-400 rounded-full animate-spin`} 
      />
      {text && (
        <p className="mt-3 text-gray-600">{text}</p>
      )}
    </div>
  );
}

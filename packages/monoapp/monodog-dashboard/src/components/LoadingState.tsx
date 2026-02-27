/**
 * Loading State Component
 */

import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-primary-500 animate-spin mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

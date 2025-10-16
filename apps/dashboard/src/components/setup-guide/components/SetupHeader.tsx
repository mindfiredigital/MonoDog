import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SetupHeaderProps {
  onClose: () => void;
}

export default function SetupHeader({ onClose }: SetupHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Setup Guide</h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure your monorepo dashboard for optimal performance
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
    </div>
  );
}

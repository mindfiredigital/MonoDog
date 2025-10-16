import React from 'react';
import { CogIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ConfigurationHeaderProps {
  onSave: () => void;
  onClose: () => void;
}

export default function ConfigurationHeader({
  onSave,
  onClose,
}: ConfigurationHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <CogIcon className="w-6 h-6 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Dashboard Configuration
        </h2>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <CheckIcon className="w-5 h-5" />
          <span>Save</span>
        </button>
        <button
          onClick={onClose}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center space-x-2"
        >
          <XMarkIcon className="w-5 h-5" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}

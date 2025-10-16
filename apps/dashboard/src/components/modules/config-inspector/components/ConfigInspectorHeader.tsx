import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface ConfigInspectorHeaderProps {
  onRefresh?: () => void;
  loading?: boolean;
}

export default function ConfigInspectorHeader({
  onRefresh,
  loading = false,
}: ConfigInspectorHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Configuration Inspector
        </h1>
        <p className="text-gray-600 mt-1">
          View and manage configuration files across your monorepo
        </p>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
        >
          <ArrowPathIcon
            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
          />
          <span>Refresh</span>
        </button>
      )}
    </div>
  );
}

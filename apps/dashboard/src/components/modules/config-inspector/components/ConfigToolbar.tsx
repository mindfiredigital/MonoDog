import React from 'react';
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { ConfigToolbarProps } from '../types/config.types';

export default function ConfigToolbar({
  isEditing,
  canEdit,
  hasSecrets,
  showSecrets,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleSecrets,
  onRefresh,
}: ConfigToolbarProps) {
  const copyToClipboard = () => {
    // In a real implementation, this would copy the config content
    navigator.clipboard.writeText('Config content copied');
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        {/* Edit Controls */}
        {isEditing ? (
          <>
            <button
              onClick={onSaveEdit}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckIcon className="w-4 h-4 mr-1" />
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Cancel
            </button>
          </>
        ) : (
          canEdit && (
            <button
              onClick={onStartEdit}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </button>
          )
        )}

        {/* Secret Toggle */}
        {hasSecrets && (
          <button
            onClick={onToggleSecrets}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              showSecrets
                ? 'text-red-700 bg-red-100 hover:bg-red-200'
                : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
            }`}
          >
            {showSecrets ? (
              <>
                <EyeSlashIcon className="w-4 h-4 mr-1" />
                Hide Secrets
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4 mr-1" />
                Show Secrets
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
          Copy
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4 mr-1" />
          Refresh
        </button>
      </div>
    </div>
  );
}
